import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Career from '../models/Career';
import { generateLearningRoadmap, generateInterviewQuestions, analyzeInterviewAnswer } from '../services/gemini.service';

// @desc    Generate Skill Gap Analysis
// @route   POST /api/ai/skill-gap
// @access  Private
export const generateSkillGapAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { targetCareerTitle } = req.body;

    if (!user) return res.status(401).json({ message: 'Not authorized' });

    const career = await Career.findOne({ title: targetCareerTitle });
    if (!career) return res.status(404).json({ message: 'Career not found' });

    // Normalize user skills: handle both comma-separated strings and arrays
    const normalizedUserSkills = user.skills
      .flatMap(s => s.split(','))
      .map(s => s.trim().toLowerCase())
      .filter(s => s.length > 0);

    // Skill Similarity Mapping Engine
    const skillMappings: Record<string, string[]> = {
      'cloud computing': ['aws', 'azure', 'google cloud', 'gcp', 'cloud', 'digitalocean'],
      'frontend development': ['react', 'angular', 'vue', 'next.js', 'svelte', 'html', 'css', 'javascript', 'frontend'],
      'backend development': ['node.js', 'express', 'django', 'flask', 'spring boot', 'java', 'python', 'ruby', 'backend'],
      'infrastructure management': ['linux', 'system administration', 'sysadmin', 'networking'],
      'database management': ['sql', 'mysql', 'postgresql', 'mongodb', 'oracle', 'databases', 'nosql'],
      'version control': ['git', 'github', 'gitlab', 'bitbucket'],
      'machine learning': ['ml', 'scikit-learn', 'tensorflow', 'pytorch', 'keras'],
      'programming': ['javascript', 'python', 'java', 'c++', 'ruby', 'go', 'rust', 'c#', 'typescript'],
      'web development': ['html', 'css', 'javascript', 'react', 'node.js', 'web'],
      'data analysis': ['pandas', 'numpy', 'matplotlib', 'seaborn', 'excel', 'tableau', 'power bi', 'sql'],
      'testing': ['jest', 'mocha', 'cypress', 'selenium', 'puppeteer', 'qa', 'testing'],
      'communication': ['communicat', 'write', 'english', 'speak', 'public speaking', 'presenting'],
      'api design': ['rest api', 'graphql', 'grpc', 'swagger', 'postman'],
      'software design': ['system design', 'oop', 'design patterns', 'architecture']
    };

    const isSkillMatched = (requiredSkill: string, userSkills: string[]) => {
      const req = requiredSkill.trim().toLowerCase();
      // Direct match
      if (userSkills.includes(req)) return true;
      
      // Synonym or subset match
      if (skillMappings[req]) {
        return skillMappings[req].some(synonym => userSkills.includes(synonym));
      }
      
      // Dynamic partial matching (e.g. if user has "React.js" and required is "React")
      return userSkills.some(userSkill => 
        userSkill.includes(req) || req.includes(userSkill)
      );
    };

    const existingSkills = career.requiredSkills.filter(skill => isSkillMatched(skill, normalizedUserSkills));
    const missingSkills = career.requiredSkills.filter(skill => !isSkillMatched(skill, normalizedUserSkills));

    res.json({
      careerTitle: career.title,
      requiredSkills: career.requiredSkills,
      normalizedUserSkills,
      existingSkills,
      missingSkills,
      recommendedSkillsToLearn: missingSkills // simple logic: recommend what's missing
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate Learning Roadmap
// @route   POST /api/ai/roadmap
// @access  Private
export const generateRoadmap = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { targetCareerTitle, duration, pace } = req.body;

    if (!user) return res.status(401).json({ message: 'Not authorized' });
    if (!targetCareerTitle) return res.status(400).json({ message: 'targetCareerTitle is required' });

    const userSkills = user.skills || [];
    const roadmapData = await generateLearningRoadmap(userSkills, targetCareerTitle, duration || 3, pace || 'Balanced');

    // Save to user profile
    user.savedRoadmap = {
      targetCareerTitle,
      duration: duration || 3,
      pace: pace || 'Balanced',
      roadmapData
    };
    await user.save();

    res.json(roadmapData);
  } catch (error: any) {
    console.error('Roadmap generation error:', error.message);
    res.status(500).json({ message: error.message || 'Internal server error during roadmap generation' });
  }
};

// @desc    Generate Interview Questions
// @route   POST /api/ai/interview
// @access  Private
export const generateInterview = async (req: AuthRequest, res: Response) => {
  try {
    const { careerPath, difficultyLevel, interviewType, questionCount } = req.body;

    const questions = await generateInterviewQuestions(careerPath, difficultyLevel, interviewType, questionCount);

    res.json(questions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Analyze Interview Answer
// @route   POST /api/ai/interview/analyze
// @access  Private
export const analyzeAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const { question, answer, careerPath } = req.body;

    if (!question || !answer || !careerPath) {
      return res.status(400).json({ message: 'Question, answer, and careerPath are required' });
    }

    const analysis = await analyzeInterviewAnswer(question, answer, careerPath);

    res.json(analysis);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get Saved Learning Roadmap
// @route   GET /api/ai/roadmap/saved
// @access  Private
export const getSavedRoadmap = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Not authorized' });

    if (!user.savedRoadmap) {
      return res.status(404).json({ message: 'No saved roadmap found' });
    }

    res.json(user.savedRoadmap);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
