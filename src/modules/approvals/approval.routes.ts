import { Router } from "express";

import {
  getMyPendingApprovals,
  processExpenseApproval,
} from "./approval.controller.js";

import {
  authenticate,
} from "../../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/pending",
  authenticate,
  getMyPendingApprovals
);

router.patch(
  "/:approvalId",
  authenticate,
  processExpenseApproval
);

export default router;