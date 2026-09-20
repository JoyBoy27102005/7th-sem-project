import { Response } from 'express';
import Career from '../models/Career';
import { AuthRequest } from '../middleware/auth.middleware';

// @desc    Fetch all careers
// @route   GET /api/careers
// @access  Public
export const getCareers = async (req: AuthRequest, res: Response) => {
  try {
    const careers = await Career.find({});
    res.json(careers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single career
// @route   GET /api/careers/:id
// @access  Public
export const getCareerById = async (req: AuthRequest, res: Response) => {
  try {
    const career = await Career.findById(req.params.id);
    if (career) {
      res.json(career);
    } else {
      res.status(404).json({ message: 'Career not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a career
// @route   POST /api/careers
// @access  Private/Admin
export const createCareer = async (req: AuthRequest, res: Response) => {
  try {
    const career = new Career(req.body);
    const createdCareer = await career.save();
    res.status(201).json(createdCareer);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a career
// @route   PUT /api/careers/:id
// @access  Private/Admin
export const updateCareer = async (req: AuthRequest, res: Response) => {
  try {
    const career = await Career.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (career) {
      res.json(career);
    } else {
      res.status(404).json({ message: 'Career not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a career
// @route   DELETE /api/careers/:id
// @access  Private/Admin
export const deleteCareer = async (req: AuthRequest, res: Response) => {
  try {
    const career = await Career.findById(req.params.id);
    if (career) {
      await career.deleteOne();
      res.json({ message: 'Career removed' });
    } else {
      res.status(404).json({ message: 'Career not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
