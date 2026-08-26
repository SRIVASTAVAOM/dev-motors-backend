import { Response } from "express";

import {
  AuthenticatedRequest,
} from "../../middleware/auth.middleware.js";

import {
  getEmployeeProfile,
  getMyExpenses,
} from "./employee.service.js";

export const getMyProfile = async (
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

    const employee = await getEmployeeProfile(req.user.userId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Get employee profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch employee profile",
    });
  }
};

export const getMyExpensesController = async (
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

    const expenses = await getMyExpenses(req.user.userId);

    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    console.error("Get employee expenses error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch expenses",
    });
  }
};