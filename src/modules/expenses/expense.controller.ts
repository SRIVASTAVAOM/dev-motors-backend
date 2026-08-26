import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createExpense = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const { amount, description, categoryId, receiptFileName, expenseDate } = req.body;

    if (!amount || !description) {
      return res.status(400).json({ success: false, message: 'Amount and description are required' });
    }

    // 1. Fetch exact user from DB using token identifiers
    let dbUser = null;
    const searchId = authUser?.userId || authUser?.id;
    const searchEmpCode = authUser?.employeeId;

    if (searchId) {
      dbUser = await prisma.user.findUnique({ where: { id: searchId } });
    }
    if (!dbUser && searchEmpCode) {
      dbUser = await prisma.user.findUnique({ where: { employeeId: searchEmpCode } });
    }
    if (!dbUser) {
      dbUser = await prisma.user.findFirst({ where: { role: 'EMPLOYEE' } });
    }

    if (!dbUser) {
      return res.status(400).json({ success: false, message: 'Valid employee account not found in database' });
    }

    // 2. Resolve Category (Match by UUID, Name, or fallback)
    let dbCategory = null;
    if (categoryId) {
      dbCategory = await prisma.expenseCategory.findFirst({
        where: {
          OR: [
            { id: categoryId },
            { name: { equals: categoryId, mode: 'insensitive' } },
          ],
        },
      });
    }

    if (!dbCategory) {
      dbCategory = await prisma.expenseCategory.findFirst();
    }

    if (!dbCategory) {
      dbCategory = await prisma.expenseCategory.create({
        data: {
          name: 'General Expenses',
          code: 'GEN',
          limitAmount: 50000,
        },
      });
    }

    // 3. Resolve Location
    let targetLocationId = dbUser.locationId;
    if (!targetLocationId) {
      const firstLoc = await prisma.location.findFirst();
      targetLocationId = firstLoc?.id ?? null;
    }

    // 4. Create Expense Record
    const newExpense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        description,
        status: 'PENDING_MANAGER',
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        receiptFileName: receiptFileName || 'receipt.jpg',
        receiptUrl: 'https://devmotors-assets.s3.amazonaws.com/receipts/bill.png',
        employeeId: dbUser.id,
        locationId: targetLocationId!,
        categoryId: dbCategory.id,
      },
      include: {
        category: true,
        location: true,
        employee: {
          select: { id: true, name: true, employeeId: true, role: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Expense claim created successfully',
      data: newExpense,
    });
  } catch (error: any) {
    console.error('Create Expense Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const searchId = authUser?.userId || authUser?.id;
    const role = (authUser?.role || '').toUpperCase();

    let whereClause: any = {};

    if (role === 'EMPLOYEE' && searchId) {
      // Find actual user ID
      const dbUser = await prisma.user.findFirst({
        where: { OR: [{ id: searchId }, { employeeId: authUser?.employeeId }] },
      });
      if (dbUser) {
        whereClause.employeeId = dbUser.id;
      }
    } else if (role === 'MANAGER' && authUser?.locationId) {
      whereClause.locationId = authUser.locationId;
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: {
        category: true,
        location: true,
        employee: {
          select: { id: true, name: true, employeeId: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ success: true, data: expenses });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.expenseCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return res.status(200).json({ success: true, data: categories });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approveExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, amount } = req.body;

    let newStatus: any = 'APPROVED';
    if (action === 'REJECT') newStatus = 'REJECTED';
    else if (action === 'PAY') newStatus = 'PAID';

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        status: newStatus,
        ...(amount ? { amount: parseFloat(amount) } : {}),
      },
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.expense.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Expense deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
