import { Router } from "express";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearNotifications,
} from "./notification.controller.js";

import {
  authenticate,
} from "../../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/",
  authenticate,
  getNotifications
);

router.patch(
  "/read-all",
  authenticate,
  markAllAsRead
);

router.delete(
  "/",
  authenticate,
  clearNotifications
);

router.patch(
  "/:notificationId/read",
  authenticate,
  markAsRead
);

export default router;