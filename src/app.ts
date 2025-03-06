import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';

import authRouter from './routes/auth.routes';
import taskRouter from './routes/task.routes';

dotenv.config();
connectDB();

const app = express();

// --------- Middlewares ---------
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --------- Main Routes (v1) ---------
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tasks', taskRouter);


// ------------------------------------

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Task Management API' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;