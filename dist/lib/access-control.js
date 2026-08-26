"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canAccessExpense = exports.canAccessLocation = exports.getUserAccessContext = void 0;
const prisma_js_1 = require("./prisma.js");
const getUserAccessContext = async (userId) => {
    const user = await prisma_js_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            employeeId: true,
            name: true,
            role: true,
            locationId: true,
            managerId: true,
            status: true,
            location: true,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    if (user.status !== "ACTIVE") {
        throw new Error("User account is inactive");
    }
    return user;
};
exports.getUserAccessContext = getUserAccessContext;
/**
 * OWNER is global and can access every location.
 *
 * MANAGER, CASHIER and EMPLOYEE are restricted
 * to their assigned location.
 */
const canAccessLocation = (role, userLocationId, requestedLocationId) => {
    if (role === "OWNER") {
        return true;
    }
    return (!!userLocationId &&
        userLocationId === requestedLocationId);
};
exports.canAccessLocation = canAccessLocation;
/**
 * OWNER can access expenses from every location.
 *
 * MANAGER, CASHIER and EMPLOYEE can only access
 * expenses belonging to their assigned location.
 */
const canAccessExpense = (role, userLocationId, expenseLocationId) => {
    if (role === "OWNER") {
        return true;
    }
    return (!!userLocationId &&
        userLocationId === expenseLocationId);
};
exports.canAccessExpense = canAccessExpense;
