import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUsers,
  uploadCertificate,
  uploadProfilePicture,
  getAdminStats,
  deleteUser,
} from '../controllers/user.controller';

import { protect, admin } from '../middleware/auth.middleware';
import upload from '../middleware/upload.middleware';

const router = express.Router();

// Student Profile
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.post(
  '/profile/certifications/upload',
  protect,
  upload.single('certificate'),
  uploadCertificate
);

router.post(
  '/profile/picture',
  protect,
  upload.single('picture'),
  uploadProfilePicture
);

// Admin Routes
router.get('/', protect, admin, getUsers);
router.get('/admin/stats', protect, admin, getAdminStats);
router.delete('/:id', protect, admin, deleteUser);

export default router;