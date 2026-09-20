import { Response } from 'express';
import Career from '../models/Career';
import Recommendation from '../models/Recommendation';
import { AuthRequest } from '../middleware/auth.middleware';
import { generateCareerRecommendations } from '../services/gemini.service';
import { CAREER_GOALS_MAP } from '../utils/careerConstants';

// @desc    Recommend careers using Gemini API
// @route   POST /api/recommendations/recommend
// @access  Private
export const recommendCareers = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as any;
    if (!user) return res.status(401).json({ message: 'Not authorized' });

    // Note: Caching is bypassed for generating recommendations because the mathematical matching is instant and 100% free.


    let careers = [];
    const userBranch = user.branch;
    
    // If user has a branch, only fetch relevant careers (typically 10-25)
    // This dramatically reduces the payload size and speeds up Gemini API response
    if (userBranch && CAREER_GOALS_MAP[userBranch]) {
      const allowedTitles = CAREER_GOALS_MAP[userBranch];
      careers = await Career.find({ title: { $in: allowedTitles } });
      
      // If none of these careers are seeded in the DB, create dummy objects for Gemini
      if (careers.length === 0) {
        careers = allowedTitles.map(title => ({
          title,
          requiredSkills: [] // Gemini will use its internal knowledge if skills are empty
        }));
      }
    } else {
      // Fallback: If no branch, fetch a smaller subset or random subset to prevent hanging
      careers = await Career.aggregate([{ $sample: { size: 15 } }]);
    }
    
    
    // Call Gemini API
    const recommendationsData = await generateCareerRecommendations(
      {
        skills: user.skills,
        interests: user.interests,
        degree: user.degree,
        cgpa: user.cgpa
      },
      careers
    );

    // Save to DB
    await Recommendation.deleteMany({ userId: user._id }); // Clear old
    const recommendationsToInsert = recommendationsData.map((rec: any) => {
      // Find the corresponding career in the DB to attach market insights
      const careerDb = careers.find(c => c.title === rec.title);
      
      return {
        userId: user._id,
        career: rec.title,
        matchPercentage: rec.matchPercentage,
        reason: rec.reason,
        fitType: rec.fitType || 'moderate',
        missingSkills: rec.missingSkills || [],
        matchedSkills: rec.matchedSkills || [],
        salaryIndia: rec.salaryIndia || careerDb?.salaryIndia || 'N/A',
        demandLevel: rec.demandLevel || careerDb?.demandLevel || 'N/A',
        futureScope: careerDb?.futureScope || 'N/A',
        roadmapPreview: rec.roadmapPreview || [],
      };
    });

    const savedRecommendations = await Recommendation.insertMany(recommendationsToInsert);
    
    res.json(savedRecommendations);
  } catch (error: any) {
    console.error('Recommend Careers Error:', error);
    if (error.message && error.message.includes('429')) {
      return res.status(429).json({ message: 'AI Rate Limit Exceeded. Please wait 30 seconds and try again.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's recommendations
// @route   GET /api/recommendations
// @access  Private
export const getRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const recommendations = await Recommendation.find({ userId: req.user?._id });
    res.json(recommendations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
