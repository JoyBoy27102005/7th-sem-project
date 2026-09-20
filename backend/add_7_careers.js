const mongoose = require('mongoose');

const newCareers = [
  {
    title: 'Engineering (B.E./B.Tech)',
    category: 'Engineering',
    description: 'A broad field covering various engineering disciplines like Computer Science, Mechanical, Civil, etc.',
    salaryIndia: '₹4,00,000 - ₹20,00,000',
    salaryGlobal: '$70,000 - $150,000',
    demandLevel: 'High',
    requiredSkills: ['Problem Solving', 'Mathematics', 'Analytical Thinking', 'Programming', 'Physics'],
    futureScope: 'High demand across tech and core industries.',
    roadmap: [
      { month: 'Month 1', topics: ['Mathematics', 'Physics Basics'] },
      { month: 'Month 2', topics: ['Core Engineering Principles'] },
      { month: 'Month 3', topics: ['Specialization Basics'] }
    ]
  },
  {
    title: 'Medical Degrees',
    category: 'Healthcare & Medicine',
    description: 'The field of medicine, including MBBS, BDS, BPT, etc., focusing on healthcare and patient well-being.',
    salaryIndia: '₹6,00,000 - ₹25,00,000',
    salaryGlobal: '$100,000 - $250,000',
    demandLevel: 'Very High',
    requiredSkills: ['Biology', 'Patient Care', 'Anatomy', 'Clinical Practice', 'Empathy'],
    futureScope: 'Ever-growing need for medical professionals globally.',
    roadmap: [
      { month: 'Month 1', topics: ['Anatomy Basics', 'Physiology'] },
      { month: 'Month 2', topics: ['Biochemistry', 'Pathology Basics'] },
      { month: 'Month 3', topics: ['Clinical Examination Skills'] }
    ]
  },
  {
    title: 'Commerce Degrees',
    category: 'Commerce & Finance',
    description: 'Studies in business, accounting, finance, and economics.',
    salaryIndia: '₹3,00,000 - ₹15,00,000',
    salaryGlobal: '$50,000 - $120,000',
    demandLevel: 'High',
    requiredSkills: ['Accounting', 'Financial Analysis', 'Business Management', 'Economics', 'Communication'],
    futureScope: 'Strong demand in corporate and financial sectors.',
    roadmap: [
      { month: 'Month 1', topics: ['Basic Accounting', 'Business Economics'] },
      { month: 'Month 2', topics: ['Financial Statements', 'Corporate Finance'] },
      { month: 'Month 3', topics: ['Taxation', 'Business Law'] }
    ]
  },
  {
    title: 'Science Degrees',
    category: 'Pure Sciences',
    description: 'Degrees focused on pure sciences like Physics, Chemistry, Biology, and Mathematics.',
    salaryIndia: '₹3,00,000 - ₹12,00,000',
    salaryGlobal: '$50,000 - $100,000',
    demandLevel: 'Moderate',
    requiredSkills: ['Research', 'Data Analysis', 'Laboratory Techniques', 'Scientific Writing', 'Critical Thinking'],
    futureScope: 'Great scope in research, development, and academia.',
    roadmap: [
      { month: 'Month 1', topics: ['Scientific Method', 'Basic Lab Skills'] },
      { month: 'Month 2', topics: ['Core Science Subjects'] },
      { month: 'Month 3', topics: ['Research Methodologies'] }
    ]
  },
  {
    title: 'Arts & Humanities',
    category: 'Arts & Humanities',
    description: 'Studies encompassing literature, history, philosophy, sociology, and political science.',
    salaryIndia: '₹2,50,000 - ₹10,00,000',
    salaryGlobal: '$40,000 - $90,000',
    demandLevel: 'Moderate',
    requiredSkills: ['Critical Thinking', 'Communication', 'Writing', 'Research', 'Sociological Analysis'],
    futureScope: 'Opportunities in media, education, public policy, and writing.',
    roadmap: [
      { month: 'Month 1', topics: ['Literature Basics', 'Historical Contexts'] },
      { month: 'Month 2', topics: ['Sociological Theories'] },
      { month: 'Month 3', topics: ['Advanced Writing and Research'] }
    ]
  },
  {
    title: 'Law Degrees',
    category: 'Law',
    description: 'The study of the legal system, constitutional laws, and corporate laws.',
    salaryIndia: '₹4,00,000 - ₹20,00,000',
    salaryGlobal: '$70,000 - $160,000',
    demandLevel: 'High',
    requiredSkills: ['Legal Reasoning', 'Argumentation', 'Research', 'Communication', 'Drafting'],
    futureScope: 'Continuous demand for corporate lawyers, litigators, and legal advisors.',
    roadmap: [
      { month: 'Month 1', topics: ['Constitutional Law Basics'] },
      { month: 'Month 2', topics: ['Contracts and Torts'] },
      { month: 'Month 3', topics: ['Legal Drafting and Moot Court'] }
    ]
  },
  {
    title: 'Design Degrees',
    category: 'Design',
    description: 'Creative fields including fashion, graphic, industrial, and UX/UI design.',
    salaryIndia: '₹3,50,000 - ₹15,00,000',
    salaryGlobal: '$60,000 - $130,000',
    demandLevel: 'High',
    requiredSkills: ['Creativity', 'Visual Communication', 'Design Software', 'User Empathy', 'Prototyping'],
    futureScope: 'High growth driven by digital products and branding needs.',
    roadmap: [
      { month: 'Month 1', topics: ['Design Fundamentals', 'Color Theory'] },
      { month: 'Month 2', topics: ['Typography', 'Layout Design'] },
      { month: 'Month 3', topics: ['Digital Design Tools', 'Portfolio Building'] }
    ]
  }
];

mongoose.connect('mongodb://127.0.0.1:27017/ai-career-guidance')
  .then(async () => {
    console.log('Connected to DB');
    const db = mongoose.connection.db;
    
    for (const career of newCareers) {
      // Check if exists
      const exists = await db.collection('careers').findOne({ title: career.title });
      if (!exists) {
        await db.collection('careers').insertOne(career);
        console.log('Inserted:', career.title);
      } else {
        console.log('Already exists:', career.title);
      }
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
