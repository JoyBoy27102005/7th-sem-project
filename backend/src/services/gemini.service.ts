import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { careers as staticCareers } from '../data/careers';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

// Model selection strategy:
// gemini-2.0-flash  → Fast tasks (recommendations, skill gap). Higher free-tier quota, ideal to avoid rate limits.
// gemini-2.5-flash  → Quality tasks (resume analysis, roadmap, interview questions). Better reasoning, slower.
const MODEL_FAST    = 'gemini-2.0-flash';  // Career recommendations & skill gap
const MODEL_QUALITY = 'gemini-2.5-flash'; // Resume, roadmap, interview prep

export const analyzeResume = async (resumeText: string) => {
  const prompt = `
    You are an expert ATS (Applicant Tracking System) and career coach.
    Analyze the following resume text.
    Return a JSON object with the following fields:
    - atsScore: A number from 0 to 100 representing how well formatted and strong this resume is.
    - missingSkills: An array of strings representing skills that are commonly expected but missing.
    - suggestions: An array of strings with actionable advice to improve the resume.

    Resume Text:
    ${resumeText}

    Respond ONLY with valid JSON. Do not include markdown formatting like \`\`\`json.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_QUALITY, // Resume analysis needs high-quality reasoning
      contents: prompt,
    });

    let result = response.text || '{}';
    result = result.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(result);
  } catch (error) {
    console.error('Gemini API Error (Resume):', error);
    throw new Error('Failed to analyze resume');
  }
};

// Helper to normalize skills for accurate comparisons (e.g. "Node.js" and "nodejs" should match)
const normalizeSkill = (skill: string): string => {
  return skill.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
};

const getEstimatedSkillsForCareer = (title: string): string[] => {
  const lowerTitle = title.toLowerCase();
  
  // 1. Medical (Physician, Doctor, Surgeon, Specialist)
  if (
    lowerTitle.includes('physician') || 
    lowerTitle.includes('surgeon') || 
    lowerTitle.includes('cardiologist') || 
    lowerTitle.includes('neurologist') || 
    lowerTitle.includes('dermatologist') || 
    lowerTitle.includes('pediatrician') || 
    lowerTitle.includes('radiologist') || 
    lowerTitle.includes('psychiatrist') || 
    lowerTitle.includes('medical') || 
    lowerTitle.includes('oncologist') || 
    lowerTitle.includes('orthopedic') || 
    lowerTitle.includes('doctor') ||
    lowerTitle.includes('dentist') ||
    lowerTitle.includes('orthodontist')
  ) {
    if (lowerTitle.includes('dentist') || lowerTitle.includes('orthodontist') || lowerTitle.includes('dental')) {
      return ['Dental Surgery', 'Oral Diagnosis', 'Patient Care', 'Dental Imaging', 'Clinical Practice'];
    }
    if (lowerTitle.includes('surgeon') || lowerTitle.includes('surgery')) {
      return ['Patient Diagnosis', 'Surgery Basics', 'Clinical Examination', 'Patient Care', 'Medical Ethics', 'Critical Care'];
    }
    return ['Patient Diagnosis', 'Clinical Examination', 'Patient Care', 'Patient Communication', 'Medical Ethics', 'Critical Care', 'Medical Documentation'];
  }
  
  // 2. Nursing
  if (lowerTitle.includes('nurse') || lowerTitle.includes('nursing')) {
    return ['Patient Care', 'Critical Care', 'Emergency Care', 'Clinical Documentation', 'Medication Management', 'Medical Communication'];
  }

  // 3. Physiotherapy
  if (lowerTitle.includes('physiotherapist') || lowerTitle.includes('rehabilitation') || lowerTitle.includes('ergonomics')) {
    return ['Physical Rehabilitation', 'Exercise Therapy', 'Patient Assessment', 'Manual Therapy', 'Clinical Practice'];
  }
  
  // 4. Law & Legal
  if (
    lowerTitle.includes('lawyer') || 
    lowerTitle.includes('advocate') || 
    lowerTitle.includes('legal') || 
    lowerTitle.includes('judge') || 
    lowerTitle.includes('prosecutor') || 
    lowerTitle.includes('arbitrator') ||
    lowerTitle.includes('compliance')
  ) {
    return ['Legal Research', 'Drafting', 'Contract Law', 'Corporate Law', 'Litigation', 'Legal Writing', 'Negotiation', 'Compliance'];
  }

  // 5. Accounting, Finance & Commerce
  if (
    lowerTitle.includes('accountant') || 
    lowerTitle.includes('auditor') || 
    lowerTitle.includes('tax') || 
    lowerTitle.includes('finance') || 
    lowerTitle.includes('ca') || 
    lowerTitle.includes('cs') || 
    lowerTitle.includes('cma') || 
    lowerTitle.includes('cfo') ||
    lowerTitle.includes('banking') ||
    lowerTitle.includes('investment') ||
    lowerTitle.includes('treasury') ||
    lowerTitle.includes('portfolio') ||
    lowerTitle.includes('wealth')
  ) {
    return ['Accounting', 'Bookkeeping', 'Taxation', 'GST', 'Auditing', 'Financial Analysis', 'Financial Reporting', 'MS Excel'];
  }

  // 6. Design (UI/UX, Graphic, Fashion, Visual)
  if (
    lowerTitle.includes('designer') || 
    lowerTitle.includes('graphic') || 
    lowerTitle.includes('fashion') || 
    lowerTitle.includes('ui') || 
    lowerTitle.includes('ux') || 
    lowerTitle.includes('product designer') || 
    lowerTitle.includes('brand') || 
    lowerTitle.includes('art director') || 
    lowerTitle.includes('illustrator')
  ) {
    if (lowerTitle.includes('ui') || lowerTitle.includes('ux') || lowerTitle.includes('interaction') || lowerTitle.includes('product')) {
      return ['UI Design', 'UX Design', 'Figma', 'Wireframing', 'Prototyping', 'User Research', 'Design Systems', 'Interaction Design'];
    }
    if (lowerTitle.includes('fashion') || lowerTitle.includes('textile') || lowerTitle.includes('garment')) {
      return ['Fashion Illustration', 'Textile Design', 'Garment Construction', 'Pattern Making', 'Brand Management', 'Creative Design'];
    }
    return ['Adobe Photoshop', 'Adobe Illustrator', 'Branding', 'Typography', 'Visual Design', 'Logo Design', 'Color Theory'];
  }

  // 7. Data Science, Analysis & Statistics
  if (
    lowerTitle.includes('data') || 
    lowerTitle.includes('analyst') || 
    lowerTitle.includes('statistician') || 
    lowerTitle.includes('actuary') ||
    lowerTitle.includes('quantitative') ||
    lowerTitle.includes('analytics')
  ) {
    return ['Data Analysis', 'Statistics', 'Python', 'SQL', 'MS Excel', 'Database Management Systems', 'R Programming'];
  }

  // 8. Software Engineering & Development (Tech roles)
  if (
    lowerTitle.includes('software') || 
    lowerTitle.includes('developer') || 
    lowerTitle.includes('engineer') || 
    lowerTitle.includes('architect') || 
    lowerTitle.includes('programmer') || 
    lowerTitle.includes('web') ||
    lowerTitle.includes('coder') ||
    lowerTitle.includes('embedded') ||
    lowerTitle.includes('hardware') ||
    lowerTitle.includes('iot') ||
    lowerTitle.includes('vlsi') ||
    lowerTitle.includes('fpga') ||
    lowerTitle.includes('telecom') ||
    lowerTitle.includes('robotics') ||
    lowerTitle.includes('automation') ||
    lowerTitle.includes('game') ||
    lowerTitle.includes('vr') ||
    lowerTitle.includes('ar')
  ) {
    if (lowerTitle.includes('frontend') || lowerTitle.includes('web')) {
      return ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Programming', 'Git', 'GitHub'];
    }
    if (lowerTitle.includes('backend') || lowerTitle.includes('database') || lowerTitle.includes('server')) {
      return ['Node.js', 'Express.js', 'MongoDB', 'SQL', 'Database Management Systems', 'REST APIs', 'Git', 'Programming'];
    }
    if (lowerTitle.includes('full stack') || lowerTitle.includes('fullstack')) {
      return ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express.js', 'MongoDB', 'Git', 'Programming'];
    }
    if (lowerTitle.includes('mobile') || lowerTitle.includes('app') || lowerTitle.includes('android') || lowerTitle.includes('ios') || lowerTitle.includes('react native') || lowerTitle.includes('flutter')) {
      return ['Mobile Development', 'JavaScript', 'React Native', 'Flutter', 'Git', 'Programming', 'Java', 'Swift'];
    }
    if (lowerTitle.includes('ai') || lowerTitle.includes('machine learning') || lowerTitle.includes('deep learning') || lowerTitle.includes('nlp') || lowerTitle.includes('transformers') || lowerTitle.includes('generative')) {
      return ['Python', 'Machine Learning', 'Deep Learning', 'Data Science', 'Data Analysis', 'SQL', 'Programming', 'Algorithms'];
    }
    if (lowerTitle.includes('cloud') || lowerTitle.includes('devops') || lowerTitle.includes('sre') || lowerTitle.includes('infrastructure') || lowerTitle.includes('system admin') || lowerTitle.includes('network')) {
      return ['Cloud Computing', 'AWS', 'Docker', 'Kubernetes', 'Linux', 'Git', 'Networking', 'Systems Design'];
    }
    if (lowerTitle.includes('security') || lowerTitle.includes('cybersecurity') || lowerTitle.includes('hacker') || lowerTitle.includes('penetration')) {
      return ['Cybersecurity', 'Ethical Hacking', 'Networking', 'Linux', 'Firewalls', 'Penetration Testing', 'Git'];
    }
    if (lowerTitle.includes('blockchain') || lowerTitle.includes('web3') || lowerTitle.includes('solidity')) {
      return ['Blockchain', 'Solidity', 'JavaScript', 'Node.js', 'Cryptography', 'Programming', 'Git'];
    }
    return ['Programming', 'Data Structures', 'Algorithms', 'Software Engineering', 'SQL', 'Git', 'GitHub', 'REST APIs', 'System Design'];
  }

  // 9. Marketing, Writing & Creative
  if (
    lowerTitle.includes('marketing') || 
    lowerTitle.includes('sales') || 
    lowerTitle.includes('writer') || 
    lowerTitle.includes('editor') || 
    lowerTitle.includes('copywriter') || 
    lowerTitle.includes('content') || 
    lowerTitle.includes('journalist') ||
    lowerTitle.includes('public relations') ||
    lowerTitle.includes('communications')
  ) {
    if (lowerTitle.includes('writer') || lowerTitle.includes('editor') || lowerTitle.includes('copywriter') || lowerTitle.includes('content') || lowerTitle.includes('journalist')) {
      return ['Content Writing', 'Copywriting', 'Editing', 'Proofreading', 'Creative Writing', 'SEO Writing', 'Communication'];
    }
    return ['Marketing', 'Sales', 'Business Communication', 'Negotiation', 'Digital Marketing', 'Social Media Strategy', 'Market Research'];
  }

  // 10. Management & HR
  if (
    lowerTitle.includes('manager') || 
    lowerTitle.includes('hr') || 
    lowerTitle.includes('human resources') || 
    lowerTitle.includes('consultant') || 
    lowerTitle.includes('project') || 
    lowerTitle.includes('product') ||
    lowerTitle.includes('administrator') ||
    lowerTitle.includes('operations') ||
    lowerTitle.includes('business development')
  ) {
    return ['Management', 'Leadership', 'Human Resources', 'Business Communication', 'Project Management', 'Agile', 'Scrum'];
  }

  // 11. Research & Science (General)
  if (lowerTitle.includes('research') || lowerTitle.includes('scientist') || lowerTitle.includes('academic') || lowerTitle.includes('professor') || lowerTitle.includes('teacher')) {
    return ['Research', 'Data Analysis', 'Scientific Writing', 'Laboratory Skills', 'Public Speaking', 'Communication', 'Subject Matter Expertise'];
  }

  // Generic Default Fallback
  return ['Problem Solving', 'Communication', 'Analytical Thinking', 'Teamwork', 'Project Planning'];
};

const getEstimatedSalaryAndDemand = (title: string): { salaryIndia: string; demandLevel: string } => {
  const lower = title.toLowerCase();

  // Medical Specialist / Surgeon
  if (lower.includes('surgeon') || lower.includes('cardiologist') || lower.includes('neurologist') || lower.includes('oncologist')) {
    return { salaryIndia: '₹12 - 30 LPA', demandLevel: 'Very High' };
  }
  if (lower.includes('physician') || lower.includes('doctor') || lower.includes('pediatrician') || lower.includes('radiologist') || lower.includes('psychiatrist')) {
    return { salaryIndia: '₹8 - 20 LPA', demandLevel: 'Very High' };
  }
  if (lower.includes('nurse') || lower.includes('nursing')) {
    return { salaryIndia: '₹3 - 8 LPA', demandLevel: 'High' };
  }
  if (lower.includes('physiotherapist') || lower.includes('rehabilitation')) {
    return { salaryIndia: '₹4 - 9 LPA', demandLevel: 'Growing' };
  }

  // Tech / Software / AI
  if (lower.includes('architect') || lower.includes('cfo') || lower.includes('director') || lower.includes('principal')) {
    return { salaryIndia: '₹18 - 40 LPA', demandLevel: 'Very High' };
  }
  if (lower.includes('ai') || lower.includes('machine learning') || lower.includes('deep learning') || lower.includes('data scientist')) {
    return { salaryIndia: '₹8 - 22 LPA', demandLevel: 'Very High' };
  }
  if (lower.includes('software engineer') || lower.includes('developer') || lower.includes('full stack') || lower.includes('backend') || lower.includes('devops') || lower.includes('blockchain')) {
    return { salaryIndia: '₹6 - 18 LPA', demandLevel: 'Very High' };
  }
  if (lower.includes('data analyst') || lower.includes('qa') || lower.includes('test') || lower.includes('administrator') || lower.includes('network')) {
    return { salaryIndia: '₹4 - 10 LPA', demandLevel: 'High' };
  }

  // Commerce / Finance
  if (lower.includes('ca') || lower.includes('chartered accountant') || lower.includes('investment banker')) {
    return { salaryIndia: '₹8 - 25 LPA', demandLevel: 'Very High' };
  }
  if (lower.includes('finance') || lower.includes('portfolio') || lower.includes('wealth') || lower.includes('cma') || lower.includes('cs')) {
    return { salaryIndia: '₹6 - 15 LPA', demandLevel: 'High' };
  }
  if (lower.includes('accountant') || lower.includes('auditor') || lower.includes('tax')) {
    return { salaryIndia: '₹3.5 - 9 LPA', demandLevel: 'Moderate' };
  }

  // Design
  if (lower.includes('ui') || lower.includes('ux') || lower.includes('product designer')) {
    return { salaryIndia: '₹6 - 15 LPA', demandLevel: 'Very High' };
  }
  if (lower.includes('designer') || lower.includes('graphic') || lower.includes('fashion')) {
    return { salaryIndia: '₹4 - 10 LPA', demandLevel: 'Growing' };
  }

  // Law
  if (lower.includes('lawyer') || lower.includes('corporate lawyer') || lower.includes('judge')) {
    return { salaryIndia: '₹6 - 18 LPA', demandLevel: 'High' };
  }
  if (lower.includes('legal') || lower.includes('compliance')) {
    return { salaryIndia: '₹4 - 10 LPA', demandLevel: 'Growing' };
  }

  // Default
  return { salaryIndia: '₹4.5 - 10 LPA', demandLevel: 'Moderate' };
};

const getRoadmapPreviewForCareer = (title: string, degree: string): string[] => {
  const lower = title.toLowerCase();

  // Medical
  if (lower.includes('dentist') || lower.includes('orthodontist') || lower.includes('dental')) {
    return ['Dental Anatomy', 'Clinical Observation', 'Dental Surgery Prep', 'Practice Licensing'];
  }
  if (lower.includes('physician') || lower.includes('surgeon') || lower.includes('cardiologist') || lower.includes('neurologist') || lower.includes('doctor')) {
    return ['Med Foundations', 'Clinical Rotation', 'Residency Prep', 'Specialization'];
  }
  if (lower.includes('nurse') || lower.includes('nursing')) {
    return ['Nursing Foundations', 'Clinical Practice', 'Patient Care Specialization', 'Licensing Exam'];
  }
  if (lower.includes('physiotherapist') || lower.includes('rehabilitation')) {
    return ['Anatomy & Physiology', 'Therapeutic Exercises', 'Clinical Internships', 'Rehab Certification'];
  }

  // Tech / Software
  if (lower.includes('ai') || lower.includes('machine learning') || lower.includes('deep learning') || lower.includes('data scientist')) {
    return ['Math & Statistics', 'Python & Data Analysis', 'ML Models & Frameworks', 'Advanced Deep Learning'];
  }
  if (lower.includes('cloud') || lower.includes('devops') || lower.includes('sre') || lower.includes('infrastructure')) {
    return ['Networking & Linux', 'Cloud Services (AWS)', 'Containers (Docker)', 'CI/CD & Kubernetes'];
  }
  if (lower.includes('software engineer') || lower.includes('developer') || lower.includes('full stack') || lower.includes('backend') || lower.includes('frontend')) {
    return ['Programming Basics', 'Data Structs & Algo', 'Project Portfolio', 'System Design'];
  }

  // Commerce / CA
  if (lower.includes('ca') || lower.includes('chartered accountant')) {
    return ['Foundation Course', 'Intermediate Exam', 'Articleship Training', 'CA Final Exam'];
  }
  if (lower.includes('finance') || lower.includes('portfolio') || lower.includes('investment') || lower.includes('wealth')) {
    return ['Financial Markets', 'Corporate Finance', 'Valuation & Modeling', 'CFA Prep / Certification'];
  }
  if (lower.includes('accountant') || lower.includes('auditor') || lower.includes('tax')) {
    return ['Accounting Principles', 'Tally & ERP Systems', 'Taxation Laws', 'Auditing Standards'];
  }

  // Design
  if (lower.includes('ui') || lower.includes('ux') || lower.includes('design') || lower.includes('graphic')) {
    return ['Design Principles', 'Tools Mastery (Figma)', 'Portfolio Building', 'User Testing'];
  }

  // Law
  if (lower.includes('lawyer') || lower.includes('advocate') || lower.includes('legal') || lower.includes('judge')) {
    return ['Constitutional Law', 'Legal Drafting', 'Moot Court Internships', 'Bar Exam & Practice'];
  }

  // Default
  return ['Foundations', 'Intermediate Skills', 'Advanced Practice', 'Professional Portfolio'];
};

export const generateCareerRecommendations = async (userProfile: any, careers: any[]) => {
  try {
    const userSkills = userProfile.skills || [];
    const normalizedUserSkills = userSkills.map((s: string) => normalizeSkill(s));

    const recommendations = careers.map((career: any) => {
      // Find the required skills, falling back to staticCareers list if empty/missing
      let requiredSkills: string[] = [];
      const foundStatic = staticCareers.find((c: any) => c.title.toLowerCase() === career.title.toLowerCase());
      
      if (foundStatic && foundStatic.requiredSkills && foundStatic.requiredSkills.length > 0) {
        requiredSkills = foundStatic.requiredSkills;
      } else if (career.requiredSkills && career.requiredSkills.length > 0 && !career.requiredSkills.includes('Industry-Specific Skills')) {
        requiredSkills = career.requiredSkills;
      } else {
        // Fallback to estimated skills based on the career title keywords
        requiredSkills = getEstimatedSkillsForCareer(career.title);
      }

      // Calculate matching and missing skills
      const matchedSkills = requiredSkills.filter(skill => 
        normalizedUserSkills.includes(normalizeSkill(skill))
      );

      const missingSkills = requiredSkills.filter(skill => 
        !normalizedUserSkills.includes(normalizeSkill(skill))
      );

      const totalRequired = requiredSkills.length;
      const matchPercentageNum = totalRequired > 0 
        ? Math.round((matchedSkills.length / totalRequired) * 100)
        : 0;

      // Determine fit type
      let fitType: 'strong' | 'moderate' | 'weak' = 'weak';
      if (matchPercentageNum >= 70) {
        fitType = 'strong';
      } else if (matchPercentageNum >= 50) {
        fitType = 'moderate';
      }

      // Generate dynamic professional explanation/reason
      let reason = '';
      if (fitType === 'strong') {
        if (missingSkills.length === 0) {
          reason = `You have a perfect match (100%) for this role! You possess all the required skills including ${matchedSkills.join(', ')}. You are highly qualified to pursue a career as a ${career.title}.`;
        } else {
          reason = `You have a strong match (${matchPercentageNum}%) for this role. You already possess key required skills such as ${matchedSkills.slice(0, 3).join(', ')}. Your skill set aligns very well with the demands of a ${career.title}.`;
        }
      } else if (fitType === 'moderate') {
        reason = `You have a moderate match (${matchPercentageNum}%) for this role. You have solid experience in ${matchedSkills.slice(0, 3).join(', ')}, but you should focus on developing key missing skills like ${missingSkills.slice(0, 3).join(', ')} to increase your compatibility.`;
      } else {
        if (matchedSkills.length === 0) {
          reason = `You have a weak match (${matchPercentageNum}%) for this role. You do not currently possess any of the primary required skills (such as ${missingSkills.slice(0, 3).join(', ')}). We recommend building foundational skills in this area if you wish to pursue it.`;
        } else {
          reason = `You have a weak match (${matchPercentageNum}%) for this role. You are currently missing critical skills such as ${missingSkills.slice(0, 3).join(', ')}. We recommend prioritizing these skills to start your transition into this field.`;
        }
      }

      return {
        title: career.title,
        matchPercentageNum,
        fitType,
        reason,
        missingSkills: missingSkills,
        matchedSkills: matchedSkills
      };
    });

    // Sort strictly from highest match percentage to lowest
    const sortedRecommendations = recommendations.sort((a, b) => b.matchPercentageNum - a.matchPercentageNum);

    // Return top 5 recommendations formatted as strings for matchPercentage
    return sortedRecommendations.slice(0, 5).map(r => {
      const salaryAndDemand = getEstimatedSalaryAndDemand(r.title);
      return {
        title: r.title,
        matchPercentage: `${r.matchPercentageNum}%`,
        fitType: r.fitType,
        reason: r.reason,
        missingSkills: r.missingSkills,
        matchedSkills: r.matchedSkills,
        salaryIndia: salaryAndDemand.salaryIndia,
        demandLevel: salaryAndDemand.demandLevel,
        roadmapPreview: getRoadmapPreviewForCareer(r.title, userProfile.degree)
      };
    });
  } catch (error) {
    console.error('Local Math Career Recommendations Error:', error);
    throw new Error('Failed to generate career recommendations mathematically');
  }
};

export const generateLearningRoadmap = async (userSkills: string[], targetCareer: string, duration: number, pace: string = 'Balanced') => {
  const prompt = `
    You are an expert tech mentor.
    Create a ${duration}-month learning roadmap for a student transitioning into the role of "${targetCareer}".
    The student already has the following skills: ${userSkills.join(', ')}.
    The student prefers a "${pace}" learning pace. If Accelerated, pack more advanced concepts faster. If Slow, spread foundational topics out more.

    Provide a JSON array where each element represents one month.
    Each element should have:
    - month: string (e.g., "Month 1")
    - topics: array of strings (the specific topics or technologies to learn that month)

    Make the progression logical. If they already know a skill well, skip it or focus on advanced concepts.

    Respond ONLY with valid JSON array. Do not include markdown formatting like \`\`\`json.
  `;

  let response: any;
  try {
    response = await ai.models.generateContent({
      model: MODEL_QUALITY,
      contents: prompt,
    });
  } catch (apiError: any) {
    console.error('Gemini API request failed (Roadmap):', apiError);
    throw new Error(`Gemini API request failed: ${apiError.message || String(apiError)}`);
  }

  let result = response.text || '[]';
  result = result.replace(/```json/g, '').replace(/```/g, '').trim();

  let roadmapData: any;
  try {
    roadmapData = JSON.parse(result);
  } catch (parseError: any) {
    console.error('Gemini roadmap JSON parse error:', parseError, '| Raw:', result.substring(0, 300));
    throw new Error(`Failed to parse AI response: ${parseError.message}`);
  }

  return roadmapData;
};

export const generateInterviewQuestions = async (careerPath: string, difficultyLevel: string, interviewType: string = 'Mixed', questionCount: number = 10) => {
  const prompt = `
    You are an expert technical interviewer.
    Generate interview questions for a candidate applying for the "${careerPath}" role.
    The difficulty level is: ${difficultyLevel}.
    The interview focus type is: ${interviewType}.
    Generate exactly ${questionCount} questions in total.

    Depending on the interviewType, distribute the questions appropriately across these categories:
    - technical (technical knowledge, coding, system design)
    - behavioral (past experiences, conflict resolution, teamwork)
    - situational (hypothetical scenarios, problem solving)
    - hr (culture fit, motivation, career goals)

    Return a JSON object containing arrays of strings for each relevant category. If a category has no questions, return an empty array.
    Example format:
    {
      "technical": ["question 1", "question 2"],
      "behavioral": ["question 3"],
      "situational": [],
      "hr": ["question 4"]
    }

    Respond ONLY with valid JSON. Do not include markdown formatting like \`\`\`json.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_QUALITY,
      contents: prompt,
    });

    let result = response.text || '{}';
    result = result.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(result);
  } catch (error) {
    console.error('Gemini API Error (Interview):', error);
    throw new Error('Failed to generate interview questions');
  }
};

export const analyzeInterviewAnswer = async (question: string, answer: string, careerPath: string) => {
  const prompt = `
    You are an expert AI Interview Coach evaluating a candidate applying for the "${careerPath}" role.
    Analyze the candidate's answer to the following interview question:
    
    Question: "${question}"
    Candidate's Answer: "${answer}"

    Return a JSON object with the following analysis metrics and feedback:
    - communicationScore: number (0-100), how well-structured and articulate the answer is
    - confidenceScore: number (0-100), inferred confidence from the language used (e.g., active voice vs passive/hesitant)
    - technicalAccuracy: number (0-100), how accurate and relevant the content is to the question
    - clarityScore: number (0-100), how easy it is to understand the main points
    - feedback: string, a short paragraph of constructive AI feedback explaining what was good and what can be improved
    - suggestions: array of strings (2-3 bullet points of specific actionable advice to improve this answer)

    Respond ONLY with valid JSON. Do not include markdown formatting like \`\`\`json.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_QUALITY,
      contents: prompt,
    });

    let result = response.text || '{}';
    result = result.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(result);
  } catch (error) {
    console.error('Gemini API Error (Answer Analysis):', error);
    throw new Error('Failed to analyze interview answer');
  }
};
