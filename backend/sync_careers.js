const fs = require('fs');
const mongoose = require('mongoose');

// Read Profile.tsx
const profileContent = fs.readFileSync('../frontend/src/pages/student/Profile.tsx', 'utf-8');

// Extract CAREER_GOALS_MAP
const match = profileContent.match(/const CAREER_GOALS_MAP: Record<string, string\[\]> = ({[\s\S]*?});/);
let careerGoalsMap = {};
if (match && match[1]) {
  try {
    // Basic trick to parse the JS object string
    const mapStr = match[1].replace(/([a-zA-Z0-9_\-\.]+)\s*:/g, '"$1":').replace(/'/g, '"');
    // Using Function instead of JSON.parse because it's not valid JSON
    careerGoalsMap = new Function("return " + match[1])();
  } catch (e) {
    console.error("Error parsing map", e);
    process.exit(1);
  }
}

// Get all unique careers
const uniqueCareers = new Set();
Object.values(careerGoalsMap).forEach(careersArray => {
  careersArray.forEach(c => uniqueCareers.add(c));
});
const allCareersList = Array.from(uniqueCareers);
console.log('Total unique careers in CAREER_GOALS_MAP:', allCareersList.length);

const BRANCHES_MAP = {
  "Engineering (B.E./B.Tech)": [
    "B.Tech/B.E. in Computer Science and Engineering (CSE)",
    "B.Tech/B.E. in Information Technology (IT)",
    "B.Tech/B.E. in Computer Engineering (CE)",
    "B.Tech/B.E. in Electronics and Communication Engineering (ECE)",
    "B.Tech/B.E. in Electrical Engineering (EE)",
    "B.Tech/B.E. in Mechanical Engineering (ME)",
    "B.Tech/B.E. in Civil Engineering",
    "B.Tech/B.E. in Chemical Engineering",
    "B.Tech/B.E. in Aerospace Engineering",
    "B.Tech/B.E. in Biotechnology"
  ],
  "Medical Degrees": [
    "MBBS - Bachelor of Medicine, Bachelor of Surgery",
    "BDS - Bachelor of Dental Surgery",
    "BPT - Bachelor of Physiotherapy",
    "BAMS - Bachelor of Ayurvedic Medicine and Surgery",
    "BHMS - Bachelor of Homeopathic Medicine and Surgery",
    "B.Sc Nursing - Bachelor of Science in Nursing"
  ],
  "Commerce Degrees": [
    "B.Com - Bachelor of Commerce",
    "BBA - Bachelor of Business Administration",
    "B.Sc/B.Com Finance - Finance Degree",
    "CA - Chartered Accountant",
    "CS - Company Secretary",
    "CMA - Cost and Management Accountant"
  ],
  "Science Degrees": [
    "B.Sc Physics - Bachelor of Science in Physics",
    "B.Sc Mathematics - Bachelor of Science in Mathematics",
    "B.Sc Biology - Bachelor of Science in Biology"
  ],
  "Arts & Humanities": [
    "BA English - Bachelor of Arts in English",
    "BA Psychology - Bachelor of Arts in Psychology",
    "BA Economics - Bachelor of Arts in Economics",
    "BA Political Science - Bachelor of Arts in Political Science"
  ],
  "Law Degrees": [
    "LLB - Bachelor of Legislative Law"
  ],
  "Design Degrees": [
    "B.Des in UI/UX Design",
    "B.Des in Graphic Design",
    "B.Des in Fashion Design"
  ]
};

const allBranches = [];
Object.values(BRANCHES_MAP).forEach(b => allBranches.push(...b));

mongoose.connect('mongodb://127.0.0.1:27017/ai-career-guidance')
  .then(async () => {
    console.log('Connected to DB');
    const db = mongoose.connection.db;
    const careersCol = db.collection('careers');
    
    // 1. Remove branches
    let removedCount = 0;
    for (const branch of allBranches) {
      const res = await careersCol.deleteOne({ title: branch });
      if (res.deletedCount > 0) removedCount++;
    }
    console.log(`Removed ${removedCount} branches from DB.`);
    
    // 2. Add missing careers
    let addedCount = 0;
    for (const careerTitle of allCareersList) {
      const exists = await careersCol.findOne({ title: careerTitle });
      if (!exists) {
        const careerObj = {
          title: careerTitle,
          category: 'Various',
          description: `A professional role as a ${careerTitle}.`,
          salaryIndia: 'Varies by experience and location',
          salaryGlobal: 'Varies by experience and location',
          demandLevel: 'Varies',
          requiredSkills: ['Problem Solving', 'Communication', 'Industry-Specific Skills'],
          futureScope: 'Promising career path with continuous learning.',
          roadmap: [
            { month: 'Phase 1', topics: ['Fundamentals and Core Concepts'] },
            { month: 'Phase 2', topics: ['Advanced Skills and Specialization'] },
            { month: 'Phase 3', topics: ['Real-world Projects and Networking'] }
          ]
        };
        await careersCol.insertOne(careerObj);
        addedCount++;
        console.log('Inserted missing career:', careerTitle);
      }
    }
    console.log(`Added ${addedCount} missing careers.`);
    
    console.log('Done!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
