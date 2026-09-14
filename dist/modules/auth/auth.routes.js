"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const user_management_controller_1 = require("./user_management.controller");
const password_controller_1 = require("./password.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/login', auth_controller_1.login);
router.post('/forgot-password', auth_controller_1.forgotPassword);
// Profile Management
router.post('/update-profile', auth_middleware_1.authenticateToken, auth_controller_1.updateProfile);
router.put('/update-profile', auth_middleware_1.authenticateToken, auth_controller_1.updateProfile);
// Password Management
router.post('/change-password', auth_middleware_1.authenticateToken, password_controller_1.changePassword);
router.post('/reset-password-by-owner', auth_middleware_1.authenticateToken, password_controller_1.resetEmployeePasswordByOwner);
// Owner-Only Staff Management
router.post('/users/create', auth_middleware_1.authenticateToken, user_management_controller_1.createUserByOwner);
router.post('/users', auth_middleware_1.authenticateToken, user_management_controller_1.createUserByOwner);
router.get('/users/all', auth_middleware_1.authenticateToken, user_management_controller_1.listAllStaff);
router.get('/users', auth_middleware_1.authenticateToken, user_management_controller_1.listAllStaff);
exports.default = router;
