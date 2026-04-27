import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.route';
import taskRoutes from './routes/task.route';
import { errorMiddleware } from './middlewares/error.middleware';
import cookieParser from 'cookie-parser';
import { globalLimiter } from './middlewares/rateLimiter.middleware';
import analysticsRouter from './routes/analytics.route';
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', globalLimiter, authRoutes);
app.use('/api/tasks', globalLimiter, taskRoutes);
app.use('/api/analytics', globalLimiter, analysticsRouter);
// Error Middleware
app.use(errorMiddleware);

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


export default app;
