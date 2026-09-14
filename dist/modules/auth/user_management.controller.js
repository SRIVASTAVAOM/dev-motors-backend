"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAllStaff = exports.createUserByOwner = void 0;
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const createUserByOwner = async (req, res) => {
    try {
        const authUser = req.user;
        if (authUser?.role?.toUpperCase() !== 'OWNER') {
            return res.status(403).json({ success: false, message: 'Only OWNER can create staff accounts.' });
        }
        const { employeeId, name, email, password, role, phone, locationId } = req.body;
        if (!employeeId || !name || !password || !role) {
            return res.status(400).json({ success: false, message: 'Employee ID, Name, Password, and Role are required.' });
        }
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { employeeId: employeeId.trim() },
                    { email: email ? email.trim() : `${employeeId.trim().toLowerCase()}@devmotors.com` },
                ],
            },
        });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Employee ID or Email already exists.' });
        }
        let targetLocationId = locationId;
        if (!targetLocationId && (req.body.branch || req.body.locationName)) {
            const branchQuery = (req.body.branch || req.body.locationName).trim();
            const found = await prisma.location.findFirst({
                where: {
                    OR: [
                        { name: { contains: branchQuery, mode: 'insensitive' } },
                        { city: { contains: branchQuery, mode: 'insensitive' } },
                        { locationCode: { equals: branchQuery, mode: 'insensitive' } },
                    ],
                },
            });
            if (found) {
                targetLocationId = found.id;
            }
        }
        if (!targetLocationId) {
            const defaultLoc = await prisma.location.findFirst();
            targetLocationId = defaultLoc?.id;
        }
        const passwordHash = await bcrypt.hash(password.trim(), 10);
        const userRole = role.toUpperCase();
        const newUser = await prisma.user.create({
            data: {
                employeeId: employeeId.trim(),
                name: name.trim(),
                email: email ? email.trim() : `${employeeId.trim().toLowerCase()}@devmotors.com`,
                phone: phone?.trim() || null,
                role: userRole,
                status: client_1.UserStatus.ACTIVE,
                passwordHash,
                locationId: targetLocationId,
            },
            select: {
                id: true,
                employeeId: true,
                name: true,
                email: true,
                role: true,
                locationId: true,
                createdAt: true,
            },
        });
        return res.status(201).json({
            success: true,
            message: `Staff member ${newUser.name} (${newUser.role}) created successfully.`,
            data: newUser,
        });
    }
    catch (error) {
        console.error('Create User Error:', error);
        return res.status(500).json({ success: false, message: error.message || 'Failed to create user.' });
    }
};
exports.createUserByOwner = createUserByOwner;
const listAllStaff = async (req, res) => {
    try {
        const authUser = req.user;
        if (authUser?.role?.toUpperCase() !== 'OWNER') {
            return res.status(403).json({ success: false, message: 'Only OWNER can view full staff list.' });
        }
        const staff = await prisma.user.findMany({
            select: {
                id: true,
                employeeId: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                location: { select: { name: true, city: true } },
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json({ success: true, data: staff });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
exports.listAllStaff = listAllStaff;
