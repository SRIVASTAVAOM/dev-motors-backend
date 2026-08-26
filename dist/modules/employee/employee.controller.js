"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyExpensesController = exports.getMyProfile = void 0;
const employee_service_js_1 = require("./employee.service.js");
const getMyProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const employee = await (0, employee_service_js_1.getEmployeeProfile)(req.user.userId);
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
    }
    catch (error) {
        console.error("Get employee profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch employee profile",
        });
    }
};
exports.getMyProfile = getMyProfile;
const getMyExpensesController = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const expenses = await (0, employee_service_js_1.getMyExpenses)(req.user.userId);
        return res.status(200).json({
            success: true,
            count: expenses.length,
            data: expenses,
        });
    }
    catch (error) {
        console.error("Get employee expenses error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch expenses",
        });
    }
};
exports.getMyExpensesController = getMyExpensesController;
