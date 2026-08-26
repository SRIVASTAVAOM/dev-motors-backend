import { Router } from "express";

import {
  getNotifications,
  markAsRead,
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
  "/:notificationId/read",
  authenticate,
  markAsRead
);

export default router;