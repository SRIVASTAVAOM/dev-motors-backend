import { Request, Response } from 'express';
import { prisma } from '../../config/database.js';

export const createExpense = async (req: Request, res: Response) => {
  try {
    const { categoryId, amount, description, expenseDate } = req.body;

    const currentUserId = (req as any).user?.userId;
    let user = null;
    if (currentUserId) {
      user = await prisma.user.findFirst({ where: { id: currentUserId }, include: { location: true } });
    }

    // Default fallback to first active location if not set
    let activeLocationId = user?.locationId;
    if (!activeLocationId) {
      const defaultLoc = await prisma.location.findFirst();
      activeLocationId = defaultLoc?.id;
    }

    let cat = await prisma.expenseCategory.findFirst({
      where: {
        OR: [
          { id: categoryId },
          { name: { equals: categoryId, mode: 'insensitive' } }
        ]
      }
    }).catch(() => null);

    if (!cat) {
      cat = await prisma.expenseCategory.findFirst().catch(() => null);
    }

    const newExpense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount) || 0.0,
        description: description || 'Operational Expense',
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        status: 'PENDING_MANAGER',
        receiptUrl: 'https://devmotors-assets.s3.amazonaws.com/receipts/bill.png',
        receiptFileName: 'bill_receipt_proof.jpg',
        employeeId: user ? user.id : '4b981a1f-e125-4916-8041-a4f427cbc7f9',
        locationId: activeLocationId!,
        categoryId: cat ? cat.id : categoryId,
      },
      include: {
        category: true,
        employee: true,
        location: true,
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: newExpense
    });
  } catch (error: any) {
    console.error('Create Expense Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create expense' });
  }
};

export const addExpense = createExpense;

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        employee: true,
        location: true,
      }
    });
    return res.status(200).json({ success: true, data: expenses });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyExpenses = getExpenses;

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.expenseCategory.findMany({
      where: { isActive: true }
    });
    return res.status(200).json({ success: true, data: categories });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const processApproval = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, amount, remarks } = req.body;

    let targetStatus: any = 'PENDING_MANAGER';

    if (action === 'MANAGER_APPROVE' || action === 'FORWARD_FINANCE') {
      targetStatus = 'PENDING_FINANCE';
    } else if (action === 'CASHIER_APPROVE' || action === 'FORWARD_OWNER') {
      targetStatus = 'PENDING_OWNER';
    } else if (action === 'OWNER_FINAL_APPROVE' || action === 'PAID' || action === 'APPROVE') {
      targetStatus = 'PAID';
    } else if (action === 'REJECT') {
      targetStatus = 'REJECTED';
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        status: targetStatus,
        ...(amount ? { amount: parseFloat(amount) } : {}),
      },
      include: {
        category: true,
        employee: true,
        location: true,
      }
    });

    return res.status(200).json({
      success: true,
      message: `Expense status changed to ${targetStatus}`,
      data: updated
    });
  } catch (error: any) {
    console.error('Approval Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.auditLog.deleteMany({ where: { expenseId: id } }).catch(() => {});
    await prisma.expense.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Expense deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete expense' });
  }
};

export const getTimeline = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const logs = await prisma.auditLog.findMany({
      where: { expenseId: id },
      orderBy: { createdAt: 'asc' },
    }).catch(() => []);
    return res.status(200).json({ success: true, data: logs });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
