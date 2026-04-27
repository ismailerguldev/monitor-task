import express from 'express';
import { getMe, login, logout, refreshAccessToken, register } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rateLimiter.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { LoginUserSchema, RegisterUserSchema } from '../validations/auth.validation';
import { getAnalytics } from '../controllers/analytics.controller';

const router = express.Router();

router.get("/", authMiddleware, getAnalytics)
export default router;