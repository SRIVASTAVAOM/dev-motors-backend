import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import expenseRoutes from "./modules/expenses/expense.routes.js";
import employeeRoutes from "./modules/employee/employee.routes.js";
import approvalRoutes from "./modules/approvals/approval.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";
const app = express();
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Health check
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Dev Motors API is running",
    });
});
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/notifications", notificationRoutes);
export default app;
