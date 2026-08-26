import { createExpense, editExpenseAmount, getExpenseTimeline, getExpenses, } from "./expense.service.js";
export const getExpensesController = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const expenses = await getExpenses(req.user.userId);
        return res.status(200).json({
            success: true,
            count: expenses.length,
            data: expenses,
        });
    }
    catch (error) {
        console.error("Get expenses error:", error);
        const message = error instanceof Error
            ? error.message
            : "Failed to load expenses";
        return res.status(400).json({
            success: false,
            message,
        });
    }
};
export const addExpense = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const { locationId, categoryId, amount, description, expenseDate, receiptUrl, receiptFileName, receiptMimeType, receiptSize, } = req.body;
        if (!locationId) {
            return res.status(400).json({
                success: false,
                message: "Location is required",
            });
        }
        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: "Expense category is required",
            });
        }
        if (!amount) {
            return res.status(400).json({
                success: false,
                message: "Amount is required",
            });
        }
        if (!expenseDate) {
            return res.status(400).json({
                success: false,
                message: "Expense date is required",
            });
        }
        if (!receiptUrl) {
            return res.status(400).json({
                success: false,
                message: "Receipt is required",
            });
        }
        const expense = await createExpense({
            employeeId: req.user.userId,
            locationId,
            categoryId,
            amount: Number(amount),
            description,
            expenseDate: new Date(expenseDate),
            receiptUrl,
            receiptFileName,
            receiptMimeType,
            receiptSize: receiptSize
                ? Number(receiptSize)
                : undefined,
        });
        return res.status(201).json({
            success: true,
            message: "Expense submitted successfully",
            data: expense,
        });
    }
    catch (error) {
        console.error("Create expense error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create expense",
        });
    }
};
export const editExpenseAmountController = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ success: false, message: "Authentication required" });
        const expenseId = req.params.expenseId;
        if (typeof expenseId !== "string")
            return res.status(400).json({ success: false, message: "Invalid expense ID" });
        const amount = Number(req.body.amount);
        const updated = await editExpenseAmount(expenseId, req.user.userId, amount, req.body.remarks);
        return res.status(200).json({ success: true, message: "Expense amount updated", data: updated });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update expense";
        return res.status(400).json({ success: false, message });
    }
};
export const getExpenseTimelineController = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ success: false, message: "Authentication required" });
        const expenseId = req.params.expenseId;
        if (typeof expenseId !== "string")
            return res.status(400).json({ success: false, message: "Invalid expense ID" });
        const timeline = await getExpenseTimeline(expenseId);
        return res.status(200).json({ success: true, data: timeline });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load expense timeline";
        return res.status(400).json({ success: false, message });
    }
};
