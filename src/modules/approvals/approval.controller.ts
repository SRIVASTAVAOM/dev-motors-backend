import { Response } from "express";

import {
  AuthenticatedRequest,
} from "../../middleware/auth.middleware.js";

import {
  getPendingApprovals,
  processApproval,
} from "./approval.service.js";

export const getMyPendingApprovals = async (
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

    const approvals = await getPendingApprovals(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      count: approvals.length,
      data: approvals,
    });
  } catch (error) {
    console.error(
      "Get pending approvals error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending approvals",
    });
  }
};

export const processExpenseApproval = async (
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

    // Express can type route params as string | string[].
    // We only accept a single string approval ID.
    const approvalIdParam = req.params.approvalId;

    if (typeof approvalIdParam !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid approval ID",
      });
    }

    const approvalId = approvalIdParam;

    const action = req.body.action;
    const remarks = req.body.remarks;

    if (!approvalId) {
      return res.status(400).json({
        success: false,
        message: "Approval ID is required",
      });
    }

    if (
      action !== "APPROVE" &&
      action !== "REJECT"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Action must be APPROVE or REJECT",
      });
    }

    const result = await processApproval(
      approvalId,
      req.user.userId,
      action as "APPROVE" | "REJECT",
      remarks
    );

    return res.status(200).json({
      success: true,
      message:
        action === "APPROVE"
          ? "Expense approved successfully"
          : "Expense rejected successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "Process approval error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to process approval";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};