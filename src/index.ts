import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { userRouter } from './routes/userRoutes';
import { taskRouter } from './routes/taskRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(limiter);

mongoose.connect(process.env.MONGODB_URI || '')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/users', userRouter);
app.use('/api/tasks', taskRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 