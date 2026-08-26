import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";
export const loginUser = async ({ employeeId, password, }) => {
    const user = await prisma.user.findUnique({
        where: {
            employeeId,
        },
        include: {
            location: true,
        },
    });
    if (!user) {
        throw new Error("Invalid employee ID or password");
    }
    if (user.status !== "ACTIVE") {
        throw new Error("Your account is inactive");
    }
    const passwordMatched = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatched) {
        throw new Error("Invalid employee ID or password");
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not configured");
    }
    const token = jwt.sign({
        userId: user.id,
        employeeId: user.employeeId,
        role: user.role,
    }, jwtSecret, {
        expiresIn: "7d",
    });
    return {
        token,
        user: {
            id: user.id,
            employeeId: user.employeeId,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
            location: user.location,
        },
    };
};
