const mongoose = require('mongoose');

const domainsToRemove = [
  "Engineering (B.E./B.Tech)",
  "Medical Degrees",
  "Commerce Degrees",
  "Science Degrees",
  "Arts & Humanities",
  "Law Degrees",
  "Design Degrees"
];

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

// Also delete any existing branch entries that might have weird characters, 
// then insert fresh ones.

mongoose.connect('mongodb://127.0.0.1:27017/ai-career-guidance')
  .then(async () => {
    console.log('Connected to DB');
    const db = mongoose.connection.db;
    const careersCol = db.collection('careers');
    
    // Remove the 7 domains
    for (const d of domainsToRemove) {
      await careersCol.deleteOne({ title: d });
      console.log('Removed domain:', d);
    }
    
    // Insert all branches
    for (const [domain, branches] of Object.entries(BRANCHES_MAP)) {
      for (const branch of branches) {
        // Find if exists
        const exists = await careersCol.findOne({ title: branch });
        if (!exists) {
          const careerObj = {
            title: branch,
            category: domain,
            description: `Study and specialization in ${branch}`,
            salaryIndia: 'Varies',
            salaryGlobal: 'Varies',
            demandLevel: 'High',
            requiredSkills: ['Subject Knowledge', 'Analytical Skills', 'Problem Solving', 'Communication'],
            futureScope: `Promising career opportunities in the field of ${domain}.`,
            roadmap: [
              { month: 'Year 1', topics: ['Foundational Concepts'] },
              { month: 'Year 2', topics: ['Core Subjects'] },
              { month: 'Year 3', topics: ['Advanced Topics and Specialization'] }
            ]
          };
          await careersCol.insertOne(careerObj);
          console.log('Inserted branch:', branch);
        } else {
          console.log('Branch already exists:', branch);
        }
      }
    }
    
    console.log('Done!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
