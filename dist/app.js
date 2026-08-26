"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_js_1 = __importDefault(require("./modules/auth/auth.routes.js"));
const expense_routes_js_1 = __importDefault(require("./modules/expenses/expense.routes.js"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json());
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Dev Motors API Live' });
});
app.use('/api/auth', auth_routes_js_1.default);
app.use('/api/expenses', expense_routes_js_1.default);
exports.default = app;
