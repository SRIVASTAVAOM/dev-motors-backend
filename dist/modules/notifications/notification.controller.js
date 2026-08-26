"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getNotifications = void 0;
const notification_service_js_1 = require("./notification.service.js");
const getNotifications = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const notifications = await (0, notification_service_js_1.getMyNotifications)(req.user.userId);
        const unreadCount = notifications.filter((notification) => !notification.isRead).length;
        return res.status(200).json({
            success: true,
            count: notifications.length,
            unreadCount,
            data: notifications,
        });
    }
    catch (error) {
        console.error("Get notifications error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
        });
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const notificationIdParam = req.params.notificationId;
        // Express params can be string | string[].
        if (typeof notificationIdParam !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID",
            });
        }
        const notificationId = notificationIdParam;
        const notification = await (0, notification_service_js_1.markNotificationAsRead)(notificationId, req.user.userId);
        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            data: notification,
        });
    }
    catch (error) {
        console.error("Mark notification read error:", error);
        const message = error instanceof Error
            ? error.message
            : "Failed to update notification";
        return res.status(404).json({
            success: false,
            message,
        });
    }
};
exports.markAsRead = markAsRead;
