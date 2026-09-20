# NextStep.ai

A production-ready AI-powered Career Guidance Portal for students and fresh graduates. The platform uses Google's Gemini API to analyze resumes, recommend careers, generate personalized learning roadmaps, and prepare users for interviews.

## Features

- **Authentication:** JWT-based login, registration, and role management (student/admin).
- **Student Profile:** Track CGPA, degree, skills, and career goals.
- **Career Recommendation Engine:** AI matches student profile with a database of 20 seeded careers.
- **Skill Gap Analysis:** Highlights what skills a user is missing for their target career.
- **AI Learning Roadmap:** Generates personalized month-by-month study plans.
- **Resume Analyzer:** Upload PDF resumes to get ATS scores and improvement suggestions (powered by Cloudinary and Gemini).
- **Interview Prep:** AI generates technical, HR, and coding questions based on role and difficulty.
- **Admin Dashboard:** Manage users and career datasets.

## Technology Stack

### Frontend
- React 18 (Vite)
- TypeScript
- Tailwind CSS
- UI Components (Radix UI, Lucide Icons)
- React Router DOM
- Recharts (Data Visualization)
- Axios (API Client)

### Backend
- Node.js & Express.js
- TypeScript
- MongoDB Atlas & Mongoose
- Google GenAI SDK (Gemini 2.5)
- Multer & Cloudinary (File Uploads)
- PDF-Parse (Resume text extraction)
- JWT & bcryptjs (Security)

## Installation & Setup

1. **Clone and Setup**
   Ensure you have Node.js and MongoDB running.
   
2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ai-career-guidance
   JWT_SECRET=your_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
   Seed the database with default careers:
   ```bash
   npm run seed
   ```
   Start backend server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Deployment Guide

- **Frontend (Vercel):** Link your GitHub repository to Vercel. Ensure the build command is `npm run build` and output directory is `dist`.
- **Backend (Render):** Link repository to Render. Build command: `npm run build`. Start command: `npm start`. Add all environment variables from `.env` to the Render dashboard.

## API Documentation

- `POST /api/auth/register` - Register a user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/users/profile` - Get logged in user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/careers` - List all careers
- `POST /api/recommendations/recommend` - AI career recommendations
- `POST /api/resumes/upload-analyze` - Upload PDF and analyze
- `POST /api/ai/skill-gap` - Analyze skill gap
- `POST /api/ai/roadmap` - Generate AI learning roadmap
- `POST /api/ai/interview` - Generate interview questions
