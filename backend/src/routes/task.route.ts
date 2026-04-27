import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { createTask, editTask, getTasks, softDeleteTask } from '../controllers/task.controller';

const router = express.Router();

router.post('/', authMiddleware, createTask);
router.get('/', authMiddleware, getTasks);
router.patch("/:id", authMiddleware, editTask);
router.delete("/:id", authMiddleware, softDeleteTask);
export default router;