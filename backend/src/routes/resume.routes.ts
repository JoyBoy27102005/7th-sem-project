import express from 'express';
import {
  uploadAndAnalyzeResume,
  getResumes,
  getAllResumes,
} from '../controllers/resume.controller';

import { protect, admin } from '../middleware/auth.middleware';
import upload from '../middleware/upload.middleware';

const router = express.Router();

// Student Routes
router.get('/', protect, getResumes);

router.post(
  '/upload-analyze',
  protect,
  upload.single('resume'),
  uploadAndAnalyzeResume
);

// Admin Route
router.get('/admin', protect, admin, getAllResumes);

export default router;