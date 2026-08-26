import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 1. Logged-in user changes own password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
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
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Owner resets an employee's password directly
export const resetEmployeePasswordByOwner = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
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
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
