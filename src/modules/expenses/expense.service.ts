import { prisma } from "../../lib/prisma.js";

interface CreateExpenseInput {
  employeeId: string;
  locationId: string;
  categoryId: string;
  amount: number;
  description?: string;
  expenseDate: Date;
  receiptUrl: string;
  receiptFileName?: string;
  receiptMimeType?: string;
  receiptSize?: number;
}


export const getExpenseCategories = async () => {
  return prisma.expenseCategory.findMany({
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

export const getExpenses = async (userId: string) => {
  const user = await prisma.user.findUnique({
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

  const where =
    user.role === "OWNER"
      ? {}
      : user.role === "MANAGER" || user.role === "CASHIER"
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

export const createExpense = async (data: CreateExpenseInput) => {
  const actor = await prisma.user.findUnique({
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
    throw new Error(
      "You can only create expenses for your assigned location"
    );
  }

  // The employee must already belong to a manager.
  if (!actor.managerId) {
    throw new Error(
      "No manager is assigned to this employee"
    );
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
        id: actor.managerId!,
      },
      select: {
        id: true,
        role: true,
        locationId: true,
        status: true,
      },
    });

    if (
      !manager ||
      manager.role !== "MANAGER" ||
      manager.status !== "ACTIVE" ||
      manager.locationId !== data.locationId
    ) {
      throw new Error(
        "No valid manager is assigned to this employee's location"
      );
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
        type: "EXPENSE_SUBMITTED" as const,
        isRead: false,
      })),
    });

    return expense;
  });

  return result;
};

export const editExpenseAmount = async (
  expenseId: string,
  ownerId: string,
  newAmount: number,
  remarks?: string
) => {
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
        type: "SYSTEM" as const,
        isRead: false,
      })),
    });

    return updated;
  });
};

export const getExpenseTimeline = async (expenseId: string) => {
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
