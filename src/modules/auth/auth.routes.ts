import { Router } from 'express';
import { login, forgotPassword } from './auth.controller';
import { createUserByOwner, listAllStaff } from './user_management.controller';
import { changePassword, resetEmployeePasswordByOwner } from './password.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// Password Management
router.post('/change-password', authenticateToken, changePassword);
router.post('/reset-password-by-owner', authenticateToken, resetEmployeePasswordByOwner);

// Owner-Only Staff Management
router.post('/users/create', authenticateToken, createUserByOwner);
router.get('/users/all', authenticateToken, listAllStaff);

export default router;
