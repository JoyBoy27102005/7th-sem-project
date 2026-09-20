import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { createDefaultAdmin } from './utils/createDefaultAdmin';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import careerRoutes from './routes/career.routes';
import recommendationRoutes from './routes/recommendation.routes';
import resumeRoutes from './routes/resume.routes';
import aiRoutes from './routes/ai.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Database and create default admin
const startServer = async () => {
  try {
    await connectDB();
    await createDefaultAdmin();

    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Basic route
app.get('/', (req, res) => {
  res.send('NextStep.ai API is running');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ai', aiRoutes);

startServer();