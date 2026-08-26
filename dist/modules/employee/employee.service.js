"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyExpenses = exports.getEmployeeProfile = void 0;
const prisma_js_1 = require("../../lib/prisma.js");
const getEmployeeProfile = async (userId) => {
    return prisma_js_1.prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            employeeId: true,
            email: true,
            name: true,
            phone: true,
            profileImage: true,
            joiningDate: true,
            role: true,
            managerId: true,
            createdAt: true,
        },
    });
};
exports.getEmployeeProfile = getEmployeeProfile;
const getMyExpenses = async (userId) => {
    return prisma_js_1.prisma.expense.findMany({
        where: {
            employeeId: userId,
        },
        include: {
            location: true,
            category: true,
            approvals: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
exports.getMyExpenses = getMyExpenses;
