import { Response } from 'express';
import Resume from '../models/Resume';
import { AuthRequest } from '../middleware/auth.middleware';
import { analyzeResume } from '../services/gemini.service';
import cloudinary from '../config/cloudinary';
const pdfParse = require('pdf-parse');
import streamifier from 'streamifier';

// @desc    Upload and analyze resume
// @route   POST /api/resumes/upload-analyze
// @access  Private
export const uploadAndAnalyzeResume = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Not authorized' });

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // 1. Upload to Cloudinary using buffer
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'resumes', resource_type: 'raw' },
      async (error, result) => {
        if (error || !result) {
          console.error("Cloudinary Upload Error:", error);
          return res.status(500).json({ message: 'Cloudinary upload failed' });
        }

        try {
          // 2. Extract Text from PDF
          const pdfData = await pdfParse(req.file!.buffer);
          const text = pdfData.text;

          // 3. Analyze with Gemini
          const analysis = await analyzeResume(text);

          // 4. Save to DB
          const newResume = await Resume.create({
            userId: user._id,
            resumeUrl: result.secure_url,
            atsScore: analysis.atsScore?.toString() || '0',
            missingSkills: analysis.missingSkills || [],
            suggestions: analysis.suggestions || [],
          });

          res.status(201).json(newResume);
        } catch (innerError: any) {
          console.error("Inner Error during upload:", innerError);
          res.status(500).json({ message: innerError.message });
        }
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

  } catch (error: any) {
    console.error("Outer Error during upload:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's resumes
// @route   GET /api/resumes
// @access  Private
export const getResumes = async (req: AuthRequest, res: Response) => {
  try {
    const resumes = await Resume.find({ userId: req.user?._id }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get all resumes (Admin)
// @route   GET /api/resumes/admin
// @access  Private/Admin
export const getAllResumes = async (req: AuthRequest, res: Response) => {
  try {
    const resumes = await Resume.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(resumes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};