import { Router } from "express";
import { getMyProfile, } from "./employee.controller.js";
import { authenticate, } from "../../middleware/auth.middleware.js";
import { getMyExpensesController, } from "./employee.controller.js";
const router = Router();
router.get("/me", authenticate, getMyProfile);
router.get("/me/expenses", authenticate, getMyExpensesController);
export default router;
