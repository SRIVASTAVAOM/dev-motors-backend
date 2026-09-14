import { Response } from "express";

import {
  AuthenticatedRequest,
} from "../../middleware/auth.middleware.js";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
} from "./notification.service.js";


export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const notifications =
      await getMyNotifications(req.user.userId);

    const unreadCount = notifications.filter(
      (notification: any) => !notification.isRead
    ).length;

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

export const markAsRead = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const notificationIdParam =
      req.params.notificationId;

    // Express params can be string | string[].
    if (typeof notificationIdParam !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notificationId = notificationIdParam;

    const notification =
      await markNotificationAsRead(
        notificationId,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    console.error(
      "Mark notification read error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update notification";

    return res.status(404).json({
      success: false,
      message,
    });
  }
};

export const markAllAsRead = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    await markAllNotificationsAsRead(req.user.userId);

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update notifications",
    });
  }
};

export const clearNotifications = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    await clearAllNotifications(req.user.userId);

    return res.status(200).json({
      success: true,
      message: "All notifications cleared",
    });
  } catch (error) {
    console.error("Clear notifications error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to clear notifications",
    });
  }
};