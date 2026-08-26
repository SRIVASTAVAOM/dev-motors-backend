import { prisma } from "../../lib/prisma.js";

export const getEmployeeProfile = async (userId: string) => {
  return prisma.user.findUnique({
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

export const getMyExpenses = async (userId: string) => {
  return prisma.expense.findMany({
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