import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';
import { initCronJobs } from './utils/cron';
import { authLimiter, apiLimiter } from './middlewares/rateLimit.middleware';

import authRouter from './routes/auth.routes';
import taskRouter from './routes/task.routes';
import notificationRouter from './routes/notification.routes';
import userRouter from './routes/user.routes';

dotenv.config();
connectDB();

const app = express();

// --------- Middlewares ---------
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1', apiLimiter);

// --------- Main Routes (v1) ---------
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/users', userRouter);

// ------------------------------------

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Task Management API' });
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  initCronJobs();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;