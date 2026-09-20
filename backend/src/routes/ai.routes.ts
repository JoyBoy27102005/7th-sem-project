import express from 'express';
import { generateSkillGapAnalysis, generateRoadmap, generateInterview, getSavedRoadmap, analyzeAnswer } from '../controllers/ai.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/skill-gap', protect, generateSkillGapAnalysis);
router.post('/roadmap', protect, generateRoadmap);
router.get('/roadmap/saved', protect, getSavedRoadmap);
router.post('/interview', protect, generateInterview);
router.post('/interview/analyze', protect, analyzeAnswer);

export default router;
