import { Router } from 'express';
import { login, register, forgotPassword, updateProfile } from './auth.controller.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/update-profile', updateProfile);
router.put('/update-profile', updateProfile);

export default router;
