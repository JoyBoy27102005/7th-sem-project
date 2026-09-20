import express from 'express';
import { getCareers, getCareerById, createCareer, updateCareer, deleteCareer } from '../controllers/career.controller';
import { protect, admin } from '../middleware/auth.middleware';

const router = express.Router();

router.route('/')
  .get(getCareers)
  .post(protect, admin, createCareer);

router.route('/:id')
  .get(getCareerById)
  .put(protect, admin, updateCareer)
  .delete(protect, admin, deleteCareer);

export default router;
