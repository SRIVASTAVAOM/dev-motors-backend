import { prisma } from "./prisma.js";

export type BusinessRole =
  | "EMPLOYEE"
  | "MANAGER"
  | "CASHIER"
  | "OWNER";

export const getUserAccessContext = async (userId: string) => {
  const user = await prisma.user.findUnique({
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

/**
 * OWNER is global and can access every location.
 *
 * MANAGER, CASHIER and EMPLOYEE are restricted
 * to their assigned location.
 */
export const canAccessLocation = (
  role: BusinessRole,
  userLocationId: string | null,
  requestedLocationId: string
) => {
  if (role === "OWNER") {
    return true;
  }

  return (
    !!userLocationId &&
    userLocationId === requestedLocationId
  );
};

/**
 * OWNER can access expenses from every location.
 *
 * MANAGER, CASHIER and EMPLOYEE can only access
 * expenses belonging to their assigned location.
 */
export const canAccessExpense = (
  role: BusinessRole,
  userLocationId: string | null,
  expenseLocationId: string
) => {
  if (role === "OWNER") {
    return true;
  }

  return (
    !!userLocationId &&
    userLocationId === expenseLocationId
  );
};