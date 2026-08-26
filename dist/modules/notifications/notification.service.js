import { prisma } from "../../lib/prisma.js";
export const getMyNotifications = async (userId) => {
    return prisma.notification.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
export const markNotificationAsRead = async (notificationId, userId) => {
    const notification = await prisma.notification.findFirst({
        where: {
            id: notificationId,
            userId,
        },
    });
    if (!notification) {
        throw new Error("Notification not found");
    }
    return prisma.notification.update({
        where: {
            id: notificationId,
        },
        data: {
            isRead: true,
        },
    });
};
