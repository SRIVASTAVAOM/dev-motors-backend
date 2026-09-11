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
exports.resetEmployeePasswordByOwner = exports.changePassword = void 0;
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
// 1. Logged-in user changes own password
const changePassword = async (req, res) => {
    try {
        const authUser = req.user;
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Old and new passwords are required.' });
        }
        const user = await prisma.user.findUnique({ where: { id: authUser.id } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Incorrect old password.' });
        }
        const newHash = await bcrypt.hash(newPassword.trim(), 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newHash },
        });
        return res.status(200).json({ success: true, message: 'Password updated successfully!' });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
exports.changePassword = changePassword;
// 2. Owner resets an employee's password directly
const resetEmployeePasswordByOwner = async (req, res) => {
    try {
        const authUser = req.user;
        if (authUser?.role?.toUpperCase() !== 'OWNER') {
            return res.status(403).json({ success: false, message: 'Only OWNER can reset staff passwords.' });
        }
        const { employeeId, newPassword } = req.body;
        if (!employeeId || !newPassword) {
            return res.status(400).json({ success: false, message: 'Employee ID and new password are required.' });
        }
        const newHash = await bcrypt.hash(newPassword.trim(), 10);
        await prisma.user.update({
            where: { employeeId: employeeId.trim() },
            data: { passwordHash: newHash },
        });
        return res.status(200).json({ success: true, message: `Password for ${employeeId} reset successfully!` });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
exports.resetEmployeePasswordByOwner = resetEmployeePasswordByOwner;
