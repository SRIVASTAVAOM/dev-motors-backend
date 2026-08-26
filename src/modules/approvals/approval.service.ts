import { prisma } from "../../lib/prisma.js";

type ApprovalAction = "APPROVE" | "REJECT";

/**
 * Workflow:
 *
 * EMPLOYEE
 *    ↓
 * LOCATION MANAGER
 *    ↓ APPROVE
 * OWNER
 *    ↓ APPROVE
 * LOCATION CASHIER
 *    ↓ APPROVE
 * FINAL APPROVED
 */

export const getPendingApprovals = async (userId: string) => {
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

  if (user.role === "OWNER") {
    return prisma.expenseApproval.findMany({
      where: {
        approverId: user.id,
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
                locationId: true,
                managerId: true,
              },
            },
            location: true,
            category: true,
          },
        },
        approver: {
          select: {
            id: true,
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

  if (user.role !== "MANAGER" && user.role !== "CASHIER") {
    throw new Error(
      "Only managers, owners and cashiers can view approvals"
    );
  }

  return prisma.expenseApproval.findMany({
    where: {
      approverId: user.id,
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
              locationId: true,
              managerId: true,
            },
          },
          location: true,
          category: true,
        },
      },
      approver: {
        select: {
          id: true,
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

export const processApproval = async (
  approvalId: string,
  actorId: string,
  action: ApprovalAction,
  remarks?: string
) => {
  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    select: {
      id: true,
      employeeId: true,
      name: true,
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

  if (
    actor.role !== "OWNER" &&
    actor.role !== "MANAGER" &&
    actor.role !== "CASHIER"
  ) {
    throw new Error(
      "You are not authorized to process expenses"
    );
  }

  const approval = await prisma.expenseApproval.findUnique({
    where: {
      id: approvalId,
    },
    include: {
      expense: {
        include: {
          employee: {
            select: {
              id: true,
              employeeId: true,
              name: true,
              locationId: true,
              managerId: true,
            },
          },
          location: true,
        },
      },
      approver: {
        select: {
          id: true,
          role: true,
          locationId: true,
        },
      },
    },
  });

  if (!approval) {
    throw new Error("Approval request not found");
  }

  if (approval.status !== "PENDING") {
    throw new Error("This approval has already been processed");
  }

  // The approval must belong to the logged-in actor.
  if (approval.approverId !== actor.id) {
    throw new Error(
      "You are not authorized to process this approval"
    );
  }

  // Location users can only process their own location.
  if (actor.role !== "OWNER") {
    if (
      !actor.locationId ||
      actor.locationId !== approval.expense.locationId
    ) {
      throw new Error(
        "You can only process expenses from your assigned location"
      );
    }
  }

  // ----------------------------------------------------------
  // REJECTION
  // ----------------------------------------------------------

  if (action === "REJECT") {
    return prisma.$transaction(async (tx) => {
      const updatedApproval =
        await tx.expenseApproval.update({
          where: {
            id: approvalId,
          },
          data: {
            status: "REJECTED",
            remarks: remarks || null,
            rejectedAt: new Date(),
          },
        });

      await tx.expenseApproval.updateMany({
        where: {
          expenseId: approval.expenseId,
          status: "PENDING",
          id: {
            not: approvalId,
          },
        },
        data: {
          status: "CANCELLED",
        },
      });

      const updatedExpense =
        await tx.expense.update({
          where: {
            id: approval.expenseId,
          },
          data: {
            status: "REJECTED",
          },
        });

      const users = await tx.user.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            {
              locationId: approval.expense.locationId,
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

      await tx.notification.createMany({
        data: users.map((user) => ({
          userId: user.id,
          title: "Expense Rejected",
          message:
            `Expense of ₹${approval.expense.amount} has been rejected by ${actor.name}.` +
            (remarks ? ` Remarks: ${remarks}` : ""),
          type: "EXPENSE_REJECTED" as const,
          isRead: false,
        })),
      });

      await tx.expenseAudit.create({
        data: {
          expenseId: approval.expenseId,
          actorId: actor.id,
          action: "EXPENSE_REJECTED",
          remarks: remarks || null,
        },
      });

      return {
        approval: updatedApproval,
        expense: updatedExpense,
        nextStage: "REJECTED",
      };
    });
  }

  // ----------------------------------------------------------
  // APPROVAL
  // ----------------------------------------------------------

  return prisma.$transaction(async (tx) => {
    const currentApproval =
      await tx.expenseApproval.findUnique({
        where: {
          id: approvalId,
        },
        include: {
          expense: {
            include: {
              employee: {
                select: {
                  id: true,
                  employeeId: true,
                  name: true,
                  locationId: true,
                  managerId: true,
                },
              },
            },
          },
        },
      });

    if (!currentApproval) {
      throw new Error("Approval request not found");
    }

    if (currentApproval.status !== "PENDING") {
      throw new Error("This approval has already been processed");
    }

    const now = new Date();

    const updatedApproval =
      await tx.expenseApproval.update({
        where: {
          id: approvalId,
        },
        data: {
          status: "APPROVED",
          remarks: remarks || null,
          approvedAt: now,
        },
      });

    let nextStage:
      | "PENDING_OWNER"
      | "PENDING_CASHIER"
      | "APPROVED";

    let nextApproverId: string | null = null;

    // --------------------------------------------------------
    // MANAGER → OWNER
    // --------------------------------------------------------

    if (actor.role === "MANAGER") {
      const owner = await tx.user.findFirst({
        where: {
          role: "OWNER",
          status: "ACTIVE",
        },
        select: {
          id: true,
        },
      });

      if (!owner) {
        throw new Error(
          "No active owner found"
        );
      }

      nextStage = "PENDING_OWNER";
      nextApproverId = owner.id;

      await tx.expense.update({
        where: {
          id: currentApproval.expenseId,
        },
        data: {
          status: "PENDING_OWNER",
        },
      });

      await tx.expenseApproval.create({
        data: {
          expenseId: currentApproval.expenseId,
          approverId: owner.id,
          status: "PENDING",
        },
      });

      await tx.notification.create({
        data: {
          userId: owner.id,
          title: "Expense Pending Owner Approval",
          message:
            `Expense of ₹${currentApproval.expense.amount} from ` +
            `${currentApproval.expense.employee.name} ` +
            `has been approved by ${actor.name} and requires your approval.`,
          type: "EXPENSE_SUBMITTED",
          isRead: false,
        },
      });

      await tx.expenseAudit.create({
        data: {
          expenseId: currentApproval.expenseId,
          actorId: actor.id,
          action: "MANAGER_APPROVED",
          remarks: remarks || null,
        },
      });

      return {
        approval: updatedApproval,
        expenseId: currentApproval.expenseId,
        nextStage,
        nextApproverId,
      };
    }

    // --------------------------------------------------------
    // OWNER → LOCATION CASHIER
    // --------------------------------------------------------

    if (actor.role === "OWNER") {
      const cashier = await tx.user.findFirst({
        where: {
          role: "CASHIER",
          status: "ACTIVE",
          locationId: currentApproval.expense.locationId,
        },
        select: {
          id: true,
        },
      });

      if (!cashier) {
        throw new Error(
          "No active cashier found for this expense location"
        );
      }

      nextStage = "PENDING_CASHIER";
      nextApproverId = cashier.id;

      await tx.expense.update({
        where: {
          id: currentApproval.expenseId,
        },
        data: {
          status: "PENDING_CASHIER",
        },
      });

      await tx.expenseApproval.create({
        data: {
          expenseId: currentApproval.expenseId,
          approverId: cashier.id,
          status: "PENDING",
        },
      });

      await tx.notification.create({
        data: {
          userId: cashier.id,
          title: "Expense Ready for Account Processing",
          message:
            `Expense of ₹${currentApproval.expense.amount} ` +
            `for ${currentApproval.expense.employee.name} ` +
            `has been approved by the Owner and is ready for processing.`,
          type: "EXPENSE_APPROVED",
          isRead: false,
        },
      });

      await tx.expenseAudit.create({
        data: {
          expenseId: currentApproval.expenseId,
          actorId: actor.id,
          action: "OWNER_APPROVED",
          remarks: remarks || null,
        },
      });

      return {
        approval: updatedApproval,
        expenseId: currentApproval.expenseId,
        nextStage,
        nextApproverId,
      };
    }

    // --------------------------------------------------------
    // CASHIER → FINAL APPROVED
    // --------------------------------------------------------

    if (actor.role === "CASHIER") {
      nextStage = "APPROVED";

      await tx.expense.update({
        where: {
          id: currentApproval.expenseId,
        },
        data: {
          status: "APPROVED",
        },
      });

      const users = await tx.user.findMany({
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

      await tx.notification.createMany({
        data: users.map((user) => ({
          userId: user.id,
          title: "Expense Fully Approved",
          message:
            `Expense of ₹${currentApproval.expense.amount} ` +
            `has completed the approval workflow.`,
          type: "EXPENSE_APPROVED" as const,
          isRead: false,
        })),
      });

      await tx.expenseAudit.create({
        data: {
          expenseId: currentApproval.expenseId,
          actorId: actor.id,
          action: "CASHIER_PROCESSED",
          remarks: remarks || null,
        },
      });

      return {
        approval: updatedApproval,
        expenseId: currentApproval.expenseId,
        nextStage,
        nextApproverId,
      };
    }

    throw new Error("Invalid approval stage");
  });
};
