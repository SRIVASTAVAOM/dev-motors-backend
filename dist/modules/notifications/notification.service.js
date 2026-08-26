"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationAsRead = exports.getMyNotifications = void 0;
const prisma_js_1 = require("../../lib/prisma.js");
const getMyNotifications = async (userId) => {
    return prisma_js_1.prisma.notification.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
exports.getMyNotifications = getMyNotifications;
const markNotificationAsRead = async (notificationId, userId) => {
    const notification = await prisma_js_1.prisma.notification.findFirst({
        where: {
            id: notificationId,
            userId,
        },
    });
    if (!notification) {
        throw new Error("Notification not found");
    }
    return prisma_js_1.prisma.notification.update({
        where: {
            id: notificationId,
        },
        data: {
            isRead: true,
        },
    });
};
exports.markNotificationAsRead = markNotificationAsRead;
