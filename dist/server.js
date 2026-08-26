"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_js_1 = __importDefault(require("./app.js"));
const PORT = Number(process.env.PORT) || 5000;
app_js_1.default.listen(PORT, () => {
    console.log("=================================");
    console.log("   DEV MOTORS BACKEND SERVER");
    console.log("=================================");
    console.log(`Server running on port ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
});
