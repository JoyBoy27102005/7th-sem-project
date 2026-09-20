import express from 'express';
import { recommendCareers, getRecommendations } from '../controllers/recommendation.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.route('/')
  .get(protect, getRecommendations);

router.route('/recommend')
  .post(protect, recommendCareers);

export default router;
