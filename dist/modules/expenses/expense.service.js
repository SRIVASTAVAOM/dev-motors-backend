"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpenseTimeline = exports.editExpenseAmount = exports.createExpense = exports.getExpenses = exports.getExpenseCategories = void 0;
const prisma_js_1 = require("../../lib/prisma.js");
const getExpenseCategories = async () => {
    return prisma_js_1.prisma.expenseCategory.findMany({
        where: {
            isActive: true,
        },
        select: {
            id: true,
            name: true,
            description: true,
        },
        orderBy: {
            name: "asc",
        },
    });
};
exports.getExpenseCategories = getExpenseCategories;
const getExpenses = async (userId) => {
    const user = await prisma_js_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            role: true,
            locationId: true,
            managerId: true,
            status: true,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    if (user.status !== "ACTIVE") {
        throw new Error("User account is inactive");
    }
    const where = user.role === "OWNER"
        ? {}
        : user.role === "MANAGER" || user.role === "CASHIER"
            ? {
                locationId: user.locationId ?? undefined,
            }
            : {
                employeeId: user.id,
            };
    return prisma_js_1.prisma.expense.findMany({
        where,
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
            location: {
                select: {
                    id: true,
                    locationCode: true,
                    name: true,
                    city: true,
                    state: true,
                },
            },
            employee: {
                select: {
                    id: true,
                    employeeId: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
        orderBy: {
            expenseDate: "desc",
        },
    });
};
exports.getExpenses = getExpenses;
const createExpense = async (data) => {
    const actor = await prisma_js_1.prisma.user.findUnique({
        where: { id: data.employeeId },
        select: {
            id: true,
            role: true,
            locationId: true,
            managerId: true,
            status: true,
        },
    });
    if (!actor) {
        throw new Error("User not found");
    }
    if (actor.status !== "ACTIVE") {
        throw new Error("User account is inactive");
    }
    // Only employees submit normal expenses.
    if (actor.role !== "EMPLOYEE") {
        throw new Error("Only employees can create expenses");
    }
    // Employee can only submit for their own assigned location.
    if (!actor.locationId || actor.locationId !== data.locationId) {
        throw new Error("You can only create expenses for your assigned location");
    }
    // The employee must already belong to a manager.
    if (!actor.managerId) {
        throw new Error("No manager is assigned to this employee");
    }
    const location = await prisma_js_1.prisma.location.findFirst({
        where: {
            id: data.locationId,
            isActive: true,
        },
    });
    if (!location) {
        throw new Error("Invalid or inactive location");
    }
    const result = await prisma_js_1.prisma.$transaction(async (tx) => {
        const expense = await tx.expense.create({
            data: {
                employeeId: data.employeeId,
                locationId: data.locationId,
                categoryId: data.categoryId,
                amount: data.amount,
                description: data.description || "Expense Claim",
                expenseDate: data.expenseDate,
                receiptUrl: data.receiptUrl,
                receiptFileName: data.receiptFileName,
                receiptMimeType: data.receiptMimeType,
                receiptSize: data.receiptSize,
                status: "PENDING_MANAGER",
            },
        });
        // Assign approval to the employee's assigned manager.
        const manager = await tx.user.findUnique({
            where: {
                id: actor.managerId,
            },
            select: {
                id: true,
                role: true,
                locationId: true,
                status: true,
            },
        });
        if (!manager ||
            manager.role !== "MANAGER" ||
            manager.status !== "ACTIVE" ||
            manager.locationId !== data.locationId) {
            throw new Error("No valid manager is assigned to this employee's location");
        }
        await tx.expenseApproval.create({
            data: {
                expenseId: expense.id,
                approverId: manager.id,
                status: "PENDING",
            },
        });
        // Immutable creation audit.
        await tx.expenseAudit.create({
            data: {
                expenseId: expense.id,
                actorId: data.employeeId,
                action: "RECEIPT_SUBMITTED",
                newAmount: data.amount,
            },
        });
        // Notify everyone belonging to the expense location
        // plus every OWNER.
        const locationUsers = await tx.user.findMany({
            where: {
                status: "ACTIVE",
                OR: [
                    { locationId: data.locationId },
                    { role: "OWNER" },
                ],
            },
            select: {
                id: true,
            },
        });
        const recipientIds = [
            ...new Set([
                ...locationUsers.map((user) => user.id),
                manager.id,
            ]),
        ];
        await tx.notification.createMany({
            data: recipientIds.map((userId) => ({
                userId,
                title: "New Expense Submitted",
                message: `A new expense of ₹${data.amount} has been submitted for approval.`,
                type: "EXPENSE_SUBMITTED",
                isRead: false,
            })),
        });
        return expense;
    });
    return result;
};
exports.createExpense = createExpense;
const editExpenseAmount = async (expenseId, ownerId, newAmount, remarks) => {
    const owner = await prisma_js_1.prisma.user.findUnique({
        where: { id: ownerId },
        select: {
            role: true,
            status: true,
        },
    });
    if (!owner || owner.role !== "OWNER") {
        throw new Error("Only the owner can edit expense amount");
    }
    if (owner.status !== "ACTIVE") {
        throw new Error("Owner account is inactive");
    }
    if (!Number.isFinite(newAmount) || newAmount < 0) {
        throw new Error("Invalid amount");
    }
    return prisma_js_1.prisma.$transaction(async (tx) => {
        const expense = await tx.expense.findUnique({
            where: { id: expenseId },
        });
        if (!expense) {
            throw new Error("Expense not found");
        }
        const updated = await tx.expense.update({
            where: { id: expenseId },
            data: {
                amount: newAmount,
            },
        });
        await tx.expenseAudit.create({
            data: {
                expenseId,
                actorId: ownerId,
                action: "AMOUNT_EDITED",
                oldAmount: expense.amount,
                newAmount,
                remarks,
            },
        });
        // Notify everyone at the expense location and every OWNER.
        const users = await tx.user.findMany({
            where: {
                status: "ACTIVE",
                OR: [
                    { locationId: expense.locationId },
                    { role: "OWNER" },
                ],
            },
            select: {
                id: true,
            },
        });
        await tx.notification.createMany({
            data: users.map((user) => ({
                userId: user.id,
                title: "Expense Amount Updated",
                message: `Expense amount was changed from ₹${expense.amount} to ₹${newAmount}.`,
                type: "SYSTEM",
                isRead: false,
            })),
        });
        return updated;
    });
};
exports.editExpenseAmount = editExpenseAmount;
const getExpenseTimeline = async (expenseId) => {
    return prisma_js_1.prisma.expenseAudit.findMany({
        where: {
            expenseId,
        },
        include: {
            actor: {
                select: {
                    id: true,
                    name: true,
                    role: true,
                },
            },
        },
        orderBy: {
            createdAt: "asc",
        },
    });
};
exports.getExpenseTimeline = getExpenseTimeline;
