"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpense = exports.getExpenseTimeline = exports.getTimeline = exports.approveExpense = exports.processApproval = exports.getCategories = exports.getExpenses = exports.getMyExpenses = exports.createExpense = exports.addExpense = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const addExpense = async (req, res) => {
    try {
        let authUser = req.user;
        if (!authUser && req.headers.authorization) {
            try {
                const parts = req.headers.authorization.split(' ');
                const token = parts.length === 2 ? parts[1] : parts[0];
                const jwtSecret = process.env.JWT_SECRET || 'dev_motors_jwt_secret_key_2026';
                authUser = jsonwebtoken_1.default.verify(token, jwtSecret);
            }
            catch (_) { }
        }
        const { amount, description, categoryId, receiptFileName, receiptUrl, expenseDate, location, locationId, employeeId } = req.body;
        if (!amount || !description) {
            return res.status(400).json({ success: false, message: 'Amount and description are required' });
        }
        // 1. Fetch exact user from DB
        let dbUser = null;
        const searchId = authUser?.userId || authUser?.id || employeeId;
        const searchEmpCode = authUser?.employeeId || employeeId;
        if (searchId) {
            dbUser = await prisma.user.findUnique({ where: { id: searchId } });
        }
        if (!dbUser && searchEmpCode) {
            dbUser = await prisma.user.findUnique({ where: { employeeId: searchEmpCode } });
        }
        if (!dbUser && req.body.employeeName) {
            dbUser = await prisma.user.findFirst({
                where: { name: { contains: req.body.employeeName, mode: 'insensitive' } },
            });
        }
        if (!dbUser) {
            dbUser = await prisma.user.findFirst({ where: { role: 'EMPLOYEE' } });
        }
        if (!dbUser) {
            return res.status(400).json({ success: false, message: 'Valid employee account not found in database' });
        }
        // 2. Resolve Category
        let dbCategory = null;
        if (categoryId) {
            dbCategory = await prisma.expenseCategory.findFirst({
                where: {
                    OR: [
                        { id: categoryId },
                        { name: { equals: categoryId, mode: 'insensitive' } },
                    ],
                },
            });
        }
        if (!dbCategory) {
            dbCategory = await prisma.expenseCategory.findFirst();
        }
        if (!dbCategory) {
            dbCategory = await prisma.expenseCategory.create({
                data: {
                    name: 'General Expenses',
                },
            });
        }
        // 3. Resolve Location
        let targetLocationId = locationId || dbUser.locationId;
        if (!targetLocationId && location) {
            const foundLoc = await prisma.location.findFirst({
                where: { name: { contains: location, mode: 'insensitive' } },
            });
            if (foundLoc)
                targetLocationId = foundLoc.id;
        }
        if (!targetLocationId) {
            const firstLoc = await prisma.location.findFirst();
            targetLocationId = firstLoc?.id ?? null;
        }
        // Determine initial status based on creator role:
        // Manager or Cashier claims bypass manager and go directly to OWNER!
        let initialStatus = 'PENDING_MANAGER';
        if (dbUser.role === 'MANAGER' || dbUser.role === 'CASHIER' || dbUser.role === 'OWNER') {
            initialStatus = 'PENDING_OWNER';
        }
        // 4. Create Expense Record
        const newExpense = await prisma.expense.create({
            data: {
                amount: parseFloat(amount),
                description,
                status: initialStatus,
                expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
                receiptFileName: receiptFileName || 'receipt.jpg',
                receiptUrl: receiptUrl || 'https://devmotors-assets.s3.amazonaws.com/receipts/bill.png',
                employeeId: dbUser.id,
                locationId: targetLocationId,
                categoryId: dbCategory.id,
            },
            include: {
                category: true,
                location: true,
                employee: {
                    select: { id: true, name: true, employeeId: true, role: true },
                },
            },
        });
        return res.status(201).json({
            success: true,
            message: 'Expense claim created successfully',
            data: newExpense,
        });
    }
    catch (error) {
        console.error('Create Expense Error:', error);
        return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
    }
};
exports.addExpense = addExpense;
exports.createExpense = exports.addExpense;
const getMyExpenses = async (req, res) => {
    try {
        const authUser = req.user;
        const searchId = authUser?.userId || authUser?.id;
        const role = (authUser?.role || '').toUpperCase();
        let whereClause = {};
        if (role === 'EMPLOYEE' && searchId) {
            const dbUser = await prisma.user.findFirst({
                where: { OR: [{ id: searchId }, { employeeId: authUser?.employeeId }] },
            });
            if (dbUser) {
                whereClause.employeeId = dbUser.id;
            }
        }
        else if (role === 'MANAGER' && authUser?.locationId) {
            whereClause.locationId = authUser.locationId;
        }
        const expenses = await prisma.expense.findMany({
            where: whereClause,
            include: {
                category: true,
                location: true,
                employee: {
                    select: { id: true, name: true, employeeId: true, role: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json({ success: true, data: expenses });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMyExpenses = getMyExpenses;
exports.getExpenses = exports.getMyExpenses;
const getCategories = async (_req, res) => {
    try {
        const categories = await prisma.expenseCategory.findMany({
            orderBy: { name: 'asc' },
        });
        return res.status(200).json({ success: true, data: categories });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCategories = getCategories;
const processApproval = async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { action, amount } = req.body;
        let newStatus = 'APPROVED';
        if (action === 'REJECT')
            newStatus = 'REJECTED';
        else if (action === 'PAY')
            newStatus = 'PAID';
        const updated = await prisma.expense.update({
            where: { id },
            data: {
                status: newStatus,
                ...(amount ? { amount: parseFloat(amount) } : {}),
            },
        });
        return res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
exports.processApproval = processApproval;
exports.approveExpense = exports.processApproval;
const getTimeline = async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const expense = await prisma.expense.findUnique({
            where: { id },
            include: {
                employee: true,
            },
        });
        const timeline = [
            {
                title: 'Expense Claim Submitted',
                description: `Submitted by ${expense?.employee?.name ?? 'Employee'}`,
                timestamp: expense?.createdAt ?? new Date(),
                status: 'SUBMITTED',
            },
        ];
        return res.status(200).json({ success: true, data: timeline });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
exports.getTimeline = getTimeline;
exports.getExpenseTimeline = exports.getTimeline;
const deleteExpense = async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await prisma.expense.delete({ where: { id } });
        return res.status(200).json({ success: true, message: 'Expense deleted successfully' });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteExpense = deleteExpense;
