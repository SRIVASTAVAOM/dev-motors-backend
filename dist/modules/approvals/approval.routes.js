"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const approval_controller_js_1 = require("./approval.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
router.get("/pending", auth_middleware_js_1.authenticate, approval_controller_js_1.getMyPendingApprovals);
router.patch("/:approvalId", auth_middleware_js_1.authenticate, approval_controller_js_1.processExpenseApproval);
exports.default = router;
