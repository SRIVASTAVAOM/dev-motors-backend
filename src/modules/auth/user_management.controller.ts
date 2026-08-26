import { Request, Response } from 'express';
import { PrismaClient, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const createUserByOwner = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    if (authUser?.role?.toUpperCase() !== 'OWNER') {
      return res.status(403).json({ success: false, message: 'Only OWNER can create staff accounts.' });
    }

    const { employeeId, name, email, password, role, phone, locationId } = req.body;

    if (!employeeId || !name || !password || !role) {
      return res.status(400).json({ success: false, message: 'Employee ID, Name, Password, and Role are required.' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { employeeId: employeeId.trim() },
          { email: email ? email.trim() : `${employeeId.trim().toLowerCase()}@devmotors.com` },
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Employee ID or Email already exists.' });
    }

    let targetLocationId = locationId;
    if (!targetLocationId) {
      const defaultLoc = await prisma.location.findFirst();
      targetLocationId = defaultLoc?.id;
    }

    const passwordHash = await bcrypt.hash(password.trim(), 10);
    const userRole = role.toUpperCase() as Role;

    const newUser = await prisma.user.create({
      data: {
        employeeId: employeeId.trim(),
        name: name.trim(),
        email: email ? email.trim() : `${employeeId.trim().toLowerCase()}@devmotors.com`,
        phone: phone?.trim() || null,
        role: userRole,
        status: UserStatus.ACTIVE,
        passwordHash,
        locationId: targetLocationId,
      },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        role: true,
        locationId: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: `Staff member ${newUser.name} (${newUser.role}) created successfully.`,
      data: newUser,
    });
  } catch (error: any) {
    console.error('Create User Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create user.' });
  }
};

export const listAllStaff = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    if (authUser?.role?.toUpperCase() !== 'OWNER') {
      return res.status(403).json({ success: false, message: 'Only OWNER can view full staff list.' });
    }

    const staff = await prisma.user.findMany({
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        location: { select: { name: true, city: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ success: true, data: staff });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
