export const DEGREES = [
  "Engineering (B.E./B.Tech)",
  "Medical Degrees",
  "Commerce Degrees",
  "Science Degrees",
  "Arts & Humanities",
  "Law Degrees",
  "Design Degrees"
];

export const BRANCHES_MAP: Record<string, string[]> = {
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
    "MBBS – Bachelor of Medicine, Bachelor of Surgery",
    "BDS – Bachelor of Dental Surgery",
    "BPT – Bachelor of Physiotherapy",
    "BAMS – Bachelor of Ayurvedic Medicine and Surgery",
    "BHMS – Bachelor of Homeopathic Medicine and Surgery",
    "B.Sc Nursing – Bachelor of Science in Nursing"
  ],
  "Commerce Degrees": [
    "B.Com – Bachelor of Commerce",
    "BBA – Bachelor of Business Administration",
    "B.Sc/B.Com Finance – Finance Degree",
    "CA – Chartered Accountant",
    "CS – Company Secretary",
    "CMA – Cost and Management Accountant"
  ],
  "Science Degrees": [
    "B.Sc Physics – Bachelor of Science in Physics",
    "B.Sc Mathematics – Bachelor of Science in Mathematics",
    "B.Sc Biology – Bachelor of Science in Biology"
  ],
  "Arts & Humanities": [
    "BA English – Bachelor of Arts in English",
    "BA Psychology – Bachelor of Arts in Psychology",
    "BA Economics – Bachelor of Arts in Economics",
    "BA Political Science – Bachelor of Arts in Political Science"
  ],
  "Law Degrees": [
    "LLB – Bachelor of Legislative Law"
  ],
  "Design Degrees": [
    "B.Des in UI/UX Design",
    "B.Des in Graphic Design",
    "B.Des in Fashion Design"
  ]
};

export const CAREER_GOALS_MAP: Record<string, string[]> = {
  // Engineering
  "B.Tech/B.E. in Computer Science and Engineering (CSE)": [
    "Software Engineer", "Full Stack Developer", "Frontend Developer", "Backend Developer", "Mobile App Developer",
    "AI Engineer", "Machine Learning Engineer", "Deep Learning Engineer", "Data Scientist", "Data Analyst",
    "Cloud Engineer", "DevOps Engineer", "Site Reliability Engineer", "Cybersecurity Analyst", "Security Engineer",
    "Blockchain Developer", "Game Developer", "AR/VR Developer", "Database Administrator", "Software Architect",
    "Solutions Architect", "Product Manager", "Technical Program Manager", "Research Scientist", "Entrepreneur"
  ],
  "B.Tech/B.E. in Information Technology (IT)": [
    "IT Consultant", "Software Developer", "System Administrator", "Network Engineer", "Cloud Engineer",
    "DevOps Engineer", "Cybersecurity Analyst", "Database Administrator", "Technical Support Engineer",
    "IT Project Manager", "Infrastructure Engineer", "Systems Analyst", "Technology Consultant"
  ],
  "B.Tech/B.E. in Computer Engineering (CE)": [
    "Embedded Systems Engineer", "Hardware Engineer", "IoT Engineer", "Firmware Engineer", "Network Engineer",
    "Systems Architect", "AI Engineer", "Cybersecurity Engineer", "Chip Design Engineer", "Test Engineer"
  ],
  "B.Tech/B.E. in Electronics and Communication Engineering (ECE)": [
    "VLSI Engineer", "Embedded Engineer", "Telecom Engineer", "FPGA Engineer", "IoT Engineer", "Robotics Engineer",
    "Hardware Design Engineer", "Automation Engineer", "Signal Processing Engineer", "Semiconductor Engineer",
    "Electronics Design Engineer", "R&D Engineer"
  ],
  "B.Tech/B.E. in Electrical Engineering (EE)": [
    "Electrical Design Engineer", "Power Systems Engineer", "Renewable Energy Engineer", "Automation Engineer",
    "Control Systems Engineer", "Maintenance Engineer", "Electrical Project Engineer", "Energy Consultant",
    "Grid Engineer", "Substation Engineer", "Instrumentation Engineer"
  ],
  "B.Tech/B.E. in Mechanical Engineering (ME)": [
    "Design Engineer", "CAD Engineer", "Manufacturing Engineer", "Production Engineer", "Automotive Engineer",
    "Robotics Engineer", "Quality Engineer", "Maintenance Engineer", "Industrial Engineer", "Project Engineer",
    "HVAC Engineer", "Tool Design Engineer", "Supply Chain Engineer"
  ],
  "B.Tech/B.E. in Civil Engineering": [
    "Structural Engineer", "Site Engineer", "Construction Manager", "Urban Planner", "Transportation Engineer",
    "Geotechnical Engineer", "Survey Engineer", "Project Manager", "Environmental Engineer", "Quantity Surveyor",
    "Water Resources Engineer", "Highway Engineer"
  ],
  "B.Tech/B.E. in Chemical Engineering": [
    "Process Engineer", "Production Engineer", "Petroleum Engineer", "Refinery Engineer", "Quality Control Engineer",
    "Research Engineer", "Safety Engineer", "Plant Manager", "Process Design Engineer", "Materials Engineer"
  ],
  "B.Tech/B.E. in Aerospace Engineering": [
    "Aircraft Design Engineer", "Aerodynamics Engineer", "Space Systems Engineer", "Propulsion Engineer",
    "Flight Test Engineer", "Avionics Engineer", "Defense Research Scientist", "Satellite Engineer"
  ],
  "B.Tech/B.E. in Biotechnology": [
    "Biotech Research Scientist", "Genetic Engineer", "Bioinformatics Analyst", "Clinical Research Associate",
    "Biomedical Engineer", "Pharmaceutical Scientist", "Quality Assurance Analyst", "Microbiologist",
    "Molecular Biologist", "Bioprocess Engineer"
  ],

  // Medical
  "MBBS – Bachelor of Medicine, Bachelor of Surgery": [
    "General Physician", "Surgeon", "Cardiologist", "Neurologist", "Dermatologist", "Pediatrician",
    "Radiologist", "Psychiatrist", "Medical Officer", "Hospital Administrator", "Oncologist", "Orthopedic Surgeon"
  ],
  "BDS – Bachelor of Dental Surgery": [
    "Dentist", "Orthodontist", "Oral Surgeon", "Dental Consultant", "Dental Researcher", "Prosthodontist"
  ],
  "BPT – Bachelor of Physiotherapy": [
    "Physiotherapist", "Sports Physiotherapist", "Rehabilitation Specialist", "Clinical Physiotherapist", "Ergonomics Consultant"
  ],
  "BAMS – Bachelor of Ayurvedic Medicine and Surgery": [
    "Ayurvedic Doctor", "Ayurvedic Consultant", "Ayurvedic Researcher", "Wellness Consultant", "Holistic Health Practitioner"
  ],
  "BHMS – Bachelor of Homeopathic Medicine and Surgery": [
    "Homeopathic Doctor", "Homeopathic Consultant", "Clinical Practitioner", "Wellness Advisor"
  ],
  "B.Sc Nursing – Bachelor of Science in Nursing": [
    "Registered Nurse", "Nurse Practitioner", "ICU Nurse", "Healthcare Administrator", "Nursing Educator", "Community Health Nurse"
  ],

  // Commerce
  "B.Com – Bachelor of Commerce": [
    "Accountant", "Auditor", "Tax Consultant", "Financial Analyst", "Banking Officer", "Investment Advisor", "Credit Analyst", "Finance Executive"
  ],
  "BBA – Bachelor of Business Administration": [
    "Business Analyst", "Marketing Manager", "HR Manager", "Operations Manager", "Sales Manager", "Entrepreneur",
    "Business Development Manager", "Management Consultant"
  ],
  "B.Sc/B.Com Finance – Finance Degree": [
    "Financial Analyst", "Investment Banker", "Wealth Manager", "Portfolio Manager", "Risk Analyst", "Financial Planner",
    "Treasury Analyst", "Equity Research Analyst"
  ],
  "CA – Chartered Accountant": [
    "Chartered Accountant", "Auditor", "Tax Consultant", "Finance Manager", "Chief Financial Officer", "Forensic Auditor"
  ],
  "CS – Company Secretary": [
    "Company Secretary", "Corporate Governance Officer", "Legal Compliance Officer", "Corporate Consultant", "Regulatory Affairs Specialist"
  ],
  "CMA – Cost and Management Accountant": [
    "Cost Accountant", "Management Accountant", "Financial Controller", "Cost Analyst", "Budget Analyst"
  ],

  // Science
  "B.Sc Physics – Bachelor of Science in Physics": [
    "Physicist", "Research Scientist", "Astrophysicist", "Data Analyst", "Nuclear Scientist", "Professor",
    "Quantum Researcher", "Lab Scientist"
  ],
  "B.Sc Mathematics – Bachelor of Science in Mathematics": [
    "Actuary", "Statistician", "Data Scientist", "Quantitative Analyst", "Research Mathematician", "Professor",
    "Operations Research Analyst", "Risk Modeler"
  ],
  "B.Sc Biology – Bachelor of Science in Biology": [
    "Biologist", "Research Scientist", "Microbiologist", "Genetic Researcher", "Wildlife Biologist",
    "Environmental Scientist", "Ecologist", "Lab Analyst"
  ],

  // Arts & Humanities
  "BA English – Bachelor of Arts in English": [
    "Content Writer", "Editor", "Copywriter", "Journalist", "Author", "Professor", "Technical Writer", "Communications Specialist"
  ],
  "BA Psychology – Bachelor of Arts in Psychology": [
    "Psychologist", "Counselor", "Clinical Psychologist", "HR Specialist", "Behavioral Analyst", "Career Counselor",
    "School Psychologist", "Therapist"
  ],
  "BA Economics – Bachelor of Arts in Economics": [
    "Economist", "Policy Analyst", "Financial Analyst", "Market Research Analyst", "Consultant", "Economic Researcher",
    "Investment Analyst", "Data Analyst"
  ],
  "BA Political Science – Bachelor of Arts in Political Science": [
    "Civil Servant", "Political Consultant", "Policy Analyst", "Research Analyst", "Diplomat", "Legislative Assistant",
    "Public Affairs Specialist", "Political Strategist"
  ],

  // Law
  "LLB – Bachelor of Legislative Law": [
    "Lawyer", "Advocate", "Legal Advisor", "Corporate Lawyer", "Public Prosecutor", "Judge", "Legal Consultant",
    "Arbitrator", "Legal Researcher", "Compliance Officer"
  ],

  // Design
  "B.Des in UI/UX Design": [
    "UI Designer", "UX Designer", "Product Designer", "Interaction Designer", "UX Researcher", "Design Consultant",
    "Information Architect", "Service Designer"
  ],
  "B.Des in Graphic Design": [
    "Graphic Designer", "Brand Designer", "Visual Designer", "Creative Director", "Motion Graphics Designer",
    "Art Director", "Illustrator", "Packaging Designer"
  ],
  "B.Des in Fashion Design": [
    "Fashion Designer", "Fashion Stylist", "Textile Designer", "Fashion Consultant", "Creative Director",
    "Merchandiser", "Costume Designer", "Fashion Buyer"
  ]
};

export const SKILLS_MAP: Record<string, string[]> = {
  "B.Tech/B.E. in Computer Science and Engineering (CSE)": [
    "Programming", "Data Structures", "Algorithms", "Object Oriented Programming", "Database Management Systems", "SQL", "Operating Systems", "Computer Networks", "Software Engineering", "Web Development", "HTML", "CSS", "JavaScript", "TypeScript", "React", "Angular", "Vue.js", "Node.js", "Express.js", "Python", "Java", "C", "C++", "C#", "Go", "Rust", "PHP", "Django", "Flask", "Spring Boot", "Git", "GitHub", "REST APIs", "GraphQL", "Cloud Computing", "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "DevOps", "CI/CD", "Linux", "Cybersecurity", "Ethical Hacking", "Machine Learning", "Deep Learning", "Artificial Intelligence", "Data Science", "Big Data", "Hadoop", "Spark", "Blockchain", "IoT", "Mobile Development", "Android Development", "Flutter", "React Native", "System Design", "Microservices"
  ],
  "B.Tech/B.E. in Information Technology (IT)": [
    "Networking", "System Administration", "Cloud Computing", "AWS", "Azure", "Google Cloud", "Linux", "Windows Server", "Cybersecurity", "Firewalls", "Penetration Testing", "Database Administration", "SQL", "Oracle", "MySQL", "DevOps", "Docker", "Kubernetes", "IT Support", "Help Desk", "Network Security", "IT Governance", "Virtualization", "VMware", "Project Management", "Agile", "Scrum", "Web Development", "Programming", "Python", "Java", "PowerShell"
  ],
  "B.Tech/B.E. in Computer Engineering (CE)": [
    "Programming", "Embedded Systems", "Microprocessors", "Microcontrollers", "Computer Architecture", "Digital Electronics", "Hardware Design", "PCB Design", "IoT", "FPGA", "VLSI", "C Programming", "C++", "Python", "Computer Networks", "Operating Systems", "Robotics", "Automation", "System Design", "Cybersecurity", "Cloud Computing", "Machine Learning"
  ],
  "B.Tech/B.E. in Electronics and Communication Engineering (ECE)": [
    "Digital Electronics", "Analog Electronics", "VLSI Design", "FPGA Design", "Embedded Systems", "Microcontrollers", "Signal Processing", "Communication Systems", "Wireless Communication", "5G Technology", "IoT", "PCB Design", "Circuit Design", "MATLAB", "Verilog", "VHDL", "Python", "C Programming", "Robotics", "Automation", "Telecommunications", "Network Engineering", "RF Engineering", "Semiconductor Technology"
  ],
  "B.Tech/B.E. in Electrical Engineering (EE)": [
    "Power Systems", "Electrical Machines", "Control Systems", "Circuit Analysis", "Power Electronics", "Renewable Energy", "Solar Energy", "Wind Energy", "PLC", "SCADA", "Automation", "Instrumentation", "Industrial Automation", "MATLAB", "AutoCAD Electrical", "Electrical Design", "Energy Management", "Project Management", "Smart Grid Technology"
  ],
  "B.Tech/B.E. in Mechanical Engineering (ME)": [
    "AutoCAD", "SolidWorks", "CATIA", "Creo", "ANSYS", "Machine Design", "Thermodynamics", "Fluid Mechanics", "Manufacturing", "Production Engineering", "Quality Control", "Lean Manufacturing", "Six Sigma", "CNC Programming", "Robotics", "Automation", "Industrial Engineering", "Project Management", "Supply Chain Management", "Maintenance Engineering", "Product Design", "3D Printing"
  ],
  "B.Tech/B.E. in Civil Engineering": [
    "AutoCAD", "STAAD Pro", "ETABS", "Revit", "Structural Analysis", "Construction Management", "Surveying", "Quantity Estimation", "Project Planning", "Primavera", "Urban Planning", "Transportation Engineering", "Geotechnical Engineering", "Environmental Engineering", "Building Design", "BIM", "Site Management", "Water Resource Engineering", "Road Design", "Bridge Design"
  ],
  "B.Tech/B.E. in Chemical Engineering": [
    "Process Engineering", "Plant Design", "Chemical Process Simulation", "Aspen HYSYS", "Aspen Plus", "Process Control", "Thermodynamics", "Quality Control", "Petroleum Engineering", "Refinery Operations", "Safety Engineering", "Environmental Compliance", "Industrial Chemistry", "Production Management", "Research and Development"
  ],
  "B.Tech/B.E. in Aerospace Engineering": [
    "Aerodynamics", "Aircraft Design", "Flight Mechanics", "Propulsion Systems", "Avionics", "MATLAB", "CATIA", "ANSYS", "CFD", "Finite Element Analysis", "Satellite Systems", "Space Technology", "Rocket Propulsion", "Control Systems", "Embedded Systems", "Research Skills"
  ],
  "B.Tech/B.E. in Biotechnology": [
    "Genetics", "Molecular Biology", "Microbiology", "Bioinformatics", "Biochemistry", "Cell Biology", "Biomedical Engineering", "Clinical Research", "Laboratory Techniques", "DNA Sequencing", "PCR", "Protein Engineering", "Pharmaceutical Research", "Data Analysis", "Research Methodology"
  ],
  "MBBS – Bachelor of Medicine, Bachelor of Surgery": [
    "Patient Diagnosis", "Clinical Examination", "Medical Research", "Emergency Care", "Surgery Basics", "Radiology Interpretation", "Medical Ethics", "Healthcare Management", "Patient Communication", "Critical Care", "Medical Documentation"
  ],
  "BDS – Bachelor of Dental Surgery": [
    "Dental Surgery", "Oral Diagnosis", "Orthodontics", "Prosthodontics", "Patient Care", "Dental Imaging", "Clinical Practice", "Oral Pathology", "Healthcare Management"
  ],
  "BPT – Bachelor of Physiotherapy": [
    "Physical Rehabilitation", "Exercise Therapy", "Sports Rehabilitation", "Patient Assessment", "Manual Therapy", "Healthcare Management", "Clinical Practice"
  ],
  "BAMS – Bachelor of Ayurvedic Medicine and Surgery": [
    "Ayurvedic Diagnosis", "Panchakarma", "Herbal Medicine", "Patient Care", "Clinical Practice", "Research Skills", "Healthcare Management"
  ],
  "BHMS – Bachelor of Homeopathic Medicine and Surgery": [
    "Homeopathic Diagnosis", "Patient Care", "Case Analysis", "Clinical Practice", "Healthcare Management", "Research Skills"
  ],
  "B.Sc Nursing – Bachelor of Science in Nursing": [
    "Patient Care", "Critical Care", "ICU Management", "Emergency Care", "Clinical Documentation", "Healthcare Administration", "Medical Communication", "Medication Management"
  ],
  "B.Com – Bachelor of Commerce": [
    "Accounting", "Bookkeeping", "Taxation", "GST", "Tally", "Financial Analysis", "Auditing", "Banking", "Business Communication", "MS Excel", "Financial Reporting", "Investment Analysis"
  ],
  "BBA – Bachelor of Business Administration": [
    "Management", "Leadership", "Marketing", "Human Resources", "Operations Management", "Business Analytics", "Sales", "Negotiation", "Business Communication", "Project Management", "Entrepreneurship", "MS Excel"
  ],
  "B.Sc/B.Com Finance – Finance Degree": [
    "Financial Modeling", "Investment Analysis", "Portfolio Management", "Risk Management", "Equity Research", "Financial Planning", "Corporate Finance", "Valuation", "Bloomberg Terminal", "Advanced Excel", "Power BI"
  ],
  "CA – Chartered Accountant": [
    "Accounting", "Taxation", "GST", "Auditing", "Financial Reporting", "Corporate Law", "Financial Management", "Cost Accounting", "Risk Assessment", "Excel"
  ],
  "CS – Company Secretary": [
    "Corporate Governance", "Company Law", "Legal Compliance", "Corporate Communication", "Secretarial Audit", "Risk Management", "Business Ethics", "Regulatory Affairs"
  ],
  "CMA – Cost and Management Accountant": [
    "Cost Accounting", "Management Accounting", "Budgeting", "Financial Analysis", "Cost Control", "ERP Systems", "Business Strategy", "Performance Management"
  ],
  "B.Sc Physics – Bachelor of Science in Physics": [
    "Research", "Mathematical Modeling", "Data Analysis", "MATLAB", "Python", "Experimental Physics", "Quantum Mechanics", "Electronics", "Scientific Computing"
  ],
  "B.Sc Mathematics – Bachelor of Science in Mathematics": [
    "Statistics", "Probability", "Data Analysis", "Python", "R Programming", "Machine Learning", "Actuarial Science", "Quantitative Analysis", "Research"
  ],
  "B.Sc Biology – Bachelor of Science in Biology": [
    "Genetics", "Microbiology", "Ecology", "Research", "Laboratory Skills", "Bioinformatics", "Scientific Writing", "Data Analysis"
  ],
  "BA English – Bachelor of Arts in English": [
    "Content Writing", "Copywriting", "Editing", "Proofreading", "Creative Writing", "Journalism", "Public Speaking", "Communication", "SEO Writing", "Research"
  ],
  "BA Psychology – Bachelor of Arts in Psychology": [
    "Counseling", "Behavior Analysis", "Research Methods", "Communication", "Data Analysis", "Empathy", "Clinical Assessment", "Psychological Testing"
  ],
  "BA Economics – Bachelor of Arts in Economics": [
    "Economic Analysis", "Statistics", "Data Analysis", "Excel", "Research", "Financial Modeling", "Policy Analysis", "Econometrics"
  ],
  "BA Political Science – Bachelor of Arts in Political Science": [
    "Public Policy", "Political Analysis", "Research", "Diplomacy", "Public Administration", "Communication", "International Relations", "Governance"
  ],
  "LLB – Bachelor of Legislative Law": [
    "Legal Research", "Drafting", "Contract Law", "Corporate Law", "Litigation", "Legal Writing", "Negotiation", "Arbitration", "Compliance", "Public Speaking"
  ],
  "B.Des in UI/UX Design": [
    "UI Design", "UX Design", "Figma", "Adobe XD", "Wireframing", "Prototyping", "User Research", "Usability Testing", "Design Systems", "Interaction Design", "Information Architecture", "HTML", "CSS"
  ],
  "B.Des in Graphic Design": [
    "Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign", "Branding", "Typography", "Visual Design", "Logo Design", "Motion Graphics", "Creativity", "Color Theory"
  ],
  "B.Des in Fashion Design": [
    "Fashion Illustration", "Textile Design", "Garment Construction", "Pattern Making", "CAD for Fashion", "Fashion Merchandising", "Trend Forecasting", "Brand Management", "Creative Design"
  ]
};