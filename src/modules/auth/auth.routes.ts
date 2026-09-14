import { Router } from 'express';
import { login, forgotPassword, updateProfile } from './auth.controller';
import { createUserByOwner, listAllStaff } from './user_management.controller';
import { changePassword, resetEmployeePasswordByOwner } from './password.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// Profile Management
router.post('/update-profile', authenticateToken, updateProfile);
router.put('/update-profile', authenticateToken, updateProfile);

// Password Management
router.post('/change-password', authenticateToken, changePassword);
router.post('/reset-password-by-owner', authenticateToken, resetEmployeePasswordByOwner);

// Owner-Only Staff Management
router.post('/users/create', authenticateToken, createUserByOwner);
router.post('/users', authenticateToken, createUserByOwner);
router.get('/users/all', authenticateToken, listAllStaff);
router.get('/users', authenticateToken, listAllStaff);

export default router;
