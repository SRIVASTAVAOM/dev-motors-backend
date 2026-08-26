import { Router } from 'express';
import { login, forgotPassword } from './auth.controller';
import { createUserByOwner, listAllStaff } from './user_management.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// Owner-Only Staff Management
router.post('/users/create', authenticateToken, createUserByOwner);
router.get('/users/all', authenticateToken, listAllStaff);

export default router;
