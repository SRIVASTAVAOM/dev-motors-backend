import { prisma } from "../../lib/prisma.js";
export const getExpenses = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            role: true,
            locationId: true,
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
        : user.role === "MANAGER"
            ? {
                locationId: user.locationId ?? undefined,
            }
            : {
                employeeId: user.id,
            };
    return prisma.expense.findMany({
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
                },
            },
        },
        orderBy: {
            expenseDate: "desc",
        },
    });
};
export const createExpense = async (data) => {
    const actor = await prisma.user.findUnique({
        where: { id: data.employeeId },
        select: {
            id: true,
            role: true,
            locationId: true,
            status: true,
        },
    });
    if (!actor) {
        throw new Error("User not found");
    }
    if (actor.status !== "ACTIVE") {
        throw new Error("User account is inactive");
    }
    // OWNER can create expenses for any active location.
    // All other roles can create expenses only for their own location.
    if (actor.role !== "OWNER") {
        if (!actor.locationId || actor.locationId !== data.locationId) {
            throw new Error("You can only create expenses for your assigned location");
        }
    }
    const location = await prisma.location.findFirst({
        where: {
            id: data.locationId,
            isActive: true,
        },
    });
    if (!location) {
        throw new Error("Invalid or inactive location");
    }
    const result = await prisma.$transaction(async (tx) => {
        const expense = await tx.expense.create({
            data: {
                employeeId: data.employeeId,
                locationId: data.locationId,
                categoryId: data.categoryId,
                amount: data.amount,
                description: data.description,
                expenseDate: data.expenseDate,
                receiptUrl: data.receiptUrl,
                receiptFileName: data.receiptFileName,
                receiptMimeType: data.receiptMimeType,
                receiptSize: data.receiptSize,
                status: "PENDING",
            },
        });
        // Assign approval to the active Manager of the expense location.
        const manager = await tx.user.findFirst({
            where: {
                locationId: data.locationId,
                role: "MANAGER",
                status: "ACTIVE",
            },
            select: {
                id: true,
            },
        });
        if (!manager) {
            throw new Error("No active manager found for this expense location");
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
export const editExpenseAmount = async (expenseId, ownerId, newAmount, remarks) => {
    const owner = await prisma.user.findUnique({
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
    return prisma.$transaction(async (tx) => {
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
export const getExpenseTimeline = async (expenseId) => {
    return prisma.expenseAudit.findMany({
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
