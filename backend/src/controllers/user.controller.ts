import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);

    if (user) {
      const Recommendation = require('../models/Recommendation').default;
      const Resume = require('../models/Resume').default;
      const recommendedCareers = await Recommendation.find({ userId: user._id });
      const resumes = await Resume.find({ userId: user._id }).sort({ createdAt: -1 });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        degree: user.degree,
        branch: user.branch,
        currentQualification: user.currentQualification,
        cgpa: user.cgpa,
        skills: user.skills,
        interests: user.interests,
        certifications: user.certifications,
        projects: user.projects,
        careerGoals: user.careerGoals,
        profilePicture: user.profilePicture,
        role: user.role,
        recommendedCareers,
        resume: resumes.length > 0 ? resumes[0] : null,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.degree = req.body.degree || user.degree;
      user.branch = req.body.branch || user.branch;
      user.currentQualification = req.body.currentQualification || user.currentQualification;
      user.cgpa = req.body.cgpa || user.cgpa;
      user.skills = req.body.skills || user.skills;
      user.interests = req.body.interests || user.interests;
      user.certifications = req.body.certifications || user.certifications;
      user.projects = req.body.projects || user.projects;
      user.careerGoals = req.body.careerGoals || user.careerGoals;

      if (req.body.password) {
        // Need to hash new password. In a real app we'd add pre-save hook on User schema,
        // but here we can just update it since bcrypt is not in the model.
        // Wait, I should add a pre-save hook to the User schema to make it cleaner,
        // but since I didn't, I will hash it here.
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        degree: updatedUser.degree,
        branch: updatedUser.branch,
        currentQualification: updatedUser.currentQualification,
        cgpa: updatedUser.cgpa,
        skills: updatedUser.skills,
        interests: updatedUser.interests,
        certifications: updatedUser.certifications,
        projects: updatedUser.projects,
        careerGoals: updatedUser.careerGoals,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

import cloudinary from '../config/cloudinary';
import streamifier from 'streamifier';

// @desc    Upload a certificate file
// @route   POST /api/users/profile/certifications/upload
// @access  Private
export const uploadCertificate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'certifications',
        resource_type: 'auto', // Handles images and PDFs
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ message: 'Failed to upload file' });
        }
        res.json({
          url: result?.secure_url,
          public_id: result?.public_id,
          name: req.file?.originalname,
        });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload a profile picture
// @route   POST /api/users/profile/picture
// @access  Private
export const uploadProfilePicture = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'profile_pictures',
        resource_type: 'image',
      },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ message: 'Failed to upload image' });
        }
        
        const updatedUser = await User.findByIdAndUpdate(
          req.user?._id,
          { profilePicture: result?.secure_url },
          { new: true }
        ).select('-password');

        if (!updatedUser) {
          return res.status(404).json({ message: 'User not found' });
        }

        res.json({
          url: result?.secure_url,
          user: updatedUser
        });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get admin dashboard statistics
// @route   GET /api/users/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req: AuthRequest, res: Response) => {
  try {
    const Recommendation = require('../models/Recommendation').default;
    const Resume = require('../models/Resume').default;

    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalRecommendations = await Recommendation.countDocuments();
    const totalResumes = await Resume.countDocuments();

    res.json({
      totalUsers,
      totalAdmins,
      totalRecommendations,
      totalResumes,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Admin cannot be deleted' });
    }

    await user.deleteOne();

    res.json({
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};