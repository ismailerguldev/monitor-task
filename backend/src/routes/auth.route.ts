import express from 'express';
import { changeEmail, changePassword, getMe, login, logout, refreshAccessToken, register, updateProfile } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rateLimiter.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { LoginUserSchema, RegisterUserSchema, UpdateEmailSchema, UpdatePasswordSchema, UpdateProfileSchema } from '../validations/auth.validation';

const router = express.Router();

router.post('/register', authLimiter, validateBody(RegisterUserSchema), register);
router.post('/login', authLimiter, validateBody(LoginUserSchema), login);
router.post('/refresh', refreshAccessToken)
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);
router.patch('/me', authMiddleware, validateBody(UpdateProfileSchema), updateProfile);
router.put('/me/password', authMiddleware, validateBody(UpdatePasswordSchema), changePassword);
router.put('/me/email', authMiddleware, validateBody(UpdateEmailSchema), changeEmail);
export default router;