import { prisma } from "../../lib/prisma.js";
export const getPendingApprovals = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            role: true,
            locationId: true,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    if (user.role === "OWNER") {
        return prisma.expenseApproval.findMany({
            where: {
                status: "PENDING",
            },
            include: {
                expense: {
                    include: {
                        employee: {
                            select: {
                                id: true,
                                employeeId: true,
                                name: true,
                                email: true,
                            },
                        },
                        location: true,
                        category: true,
                    },
                },
                approver: {
                    select: {
                        employeeId: true,
                        name: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    return prisma.expenseApproval.findMany({
        where: {
            approverId: userId,
            status: "PENDING",
        },
        include: {
            expense: {
                include: {
                    employee: {
                        select: {
                            id: true,
                            employeeId: true,
                            name: true,
                            email: true,
                        },
                    },
                    location: true,
                    category: true,
                },
            },
            approver: {
                select: {
                    employeeId: true,
                    name: true,
                    role: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
export const processApproval = async (approvalId, actorId, action, remarks) => {
    const actor = await prisma.user.findUnique({
        where: { id: actorId },
        select: {
            id: true,
            employeeId: true,
            name: true,
            role: true,
            locationId: true,
        },
    });
    if (!actor) {
        throw new Error("User not found");
    }
    if (actor.role !== "OWNER" &&
        actor.role !== "MANAGER" &&
        actor.role !== "CASHIER") {
        throw new Error("You are not authorized to approve expenses");
    }
    const approval = await prisma.expenseApproval.findUnique({
        where: {
            id: approvalId,
        },
        include: {
            expense: true,
        },
    });
    if (!approval) {
        throw new Error("Approval request not found");
    }
    if (approval.status !== "PENDING") {
        throw new Error("This approval has already been processed");
    }
    // OWNER is the common/global approver.
    if (actor.role !== "OWNER") {
        if (approval.approverId !== actorId) {
            throw new Error("You are not authorized to process this approval");
        }
        if (!actor.locationId ||
            actor.locationId !== approval.expense.locationId) {
            throw new Error("You can only approve expenses from your assigned location");
        }
    }
    return prisma.$transaction(async (tx) => {
        const currentApproval = await tx.expenseApproval.findUnique({
            where: {
                id: approvalId,
            },
            include: {
                expense: true,
            },
        });
        if (!currentApproval) {
            throw new Error("Approval request not found");
        }
        if (currentApproval.status !== "PENDING") {
            throw new Error("This approval has already been processed");
        }
        const now = new Date();
        const approvalStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";
        const expenseStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";
        // 1. Process selected approval.
        const updatedApproval = await tx.expenseApproval.update({
            where: {
                id: approvalId,
            },
            data: {
                status: approvalStatus,
                remarks: remarks || null,
                approvedAt: action === "APPROVE" ? now : null,
                rejectedAt: action === "REJECT" ? now : null,
            },
        });
        // 2. Cancel all other pending approvals.
        await tx.expenseApproval.updateMany({
            where: {
                expenseId: currentApproval.expenseId,
                status: "PENDING",
                id: {
                    not: approvalId,
                },
            },
            data: {
                status: "CANCELLED",
            },
        });
        // 3. Finalize expense.
        const updatedExpense = await tx.expense.update({
            where: {
                id: currentApproval.expenseId,
            },
            data: {
                status: expenseStatus,
            },
        });
        // 4. Get all active users from the expense location + Owner.
        const locationUsers = await tx.user.findMany({
            where: {
                status: "ACTIVE",
                OR: [
                    {
                        locationId: currentApproval.expense.locationId,
                    },
                    {
                        role: "OWNER",
                    },
                ],
            },
            select: {
                id: true,
            },
        });
        // 5. Get all configured approvers.
        const configuredApprovers = await tx.approvalConfigurationUser.findMany({
            where: {
                configuration: {
                    isActive: true,
                },
            },
            select: {
                userId: true,
            },
        });
        // 6. Combine recipients without duplicates.
        const recipientIds = [
            ...new Set([
                ...locationUsers.map((user) => user.id),
                ...configuredApprovers.map((approver) => approver.userId),
            ]),
        ];
        // 7. Send notifications.
        await tx.notification.createMany({
            data: recipientIds.map((userId) => ({
                userId,
                title: action === "APPROVE"
                    ? "Expense Approved"
                    : "Expense Rejected",
                message: action === "APPROVE"
                    ? `Expense of ₹${currentApproval.expense.amount} has been approved by ${actor.name}.`
                    : `Expense of ₹${currentApproval.expense.amount} has been rejected by ${actor.name}.${remarks ? ` Remarks: ${remarks}` : ""}`,
                type: action === "APPROVE"
                    ? "EXPENSE_APPROVED"
                    : "EXPENSE_REJECTED",
                isRead: false,
            })),
        });
        // 8. Create immutable audit record.
        await tx.expenseAudit.create({
            data: {
                expenseId: currentApproval.expenseId,
                actorId: actor.id,
                action: action === "APPROVE"
                    ? "EXPENSE_APPROVED"
                    : "EXPENSE_REJECTED",
                oldAmount: currentApproval.expense.amount,
                newAmount: currentApproval.expense.amount,
                remarks: remarks ||
                    `${action === "APPROVE" ? "Approved" : "Rejected"} by ${actor.name}`,
            },
        });
        return {
            approval: updatedApproval,
            expense: updatedExpense,
        };
    });
};
