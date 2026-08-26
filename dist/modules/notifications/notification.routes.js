"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_js_1 = require("./notification.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_js_1.authenticate, notification_controller_js_1.getNotifications);
router.patch("/:notificationId/read", auth_middleware_js_1.authenticate, notification_controller_js_1.markAsRead);
exports.default = router;
