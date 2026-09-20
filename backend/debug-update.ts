import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';
import jwt from 'jsonwebtoken';

dotenv.config();
  
const run = async () => {
  await mongoose.connect(process.env.MONGO_URI as string);
  const user = await User.findOne({ email: 'darjiparthiv200@gmail.com' });
  if (!user) {
    console.error('User not found');
    process.exit(1);
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '30d' });
  
  const payload = {
    name: 'ZORO',
    degree: 'B.Tech',
    branch: 'Computer Engineering',
    currentQualification: '4th Year (Undergraduate)',
    cgpa: '8.5',
    skills: ['HTML', 'CSS', 'javascript', 'react js'],
    interests: [],
    certifications: [],
    projects: [],
    careerGoals: ['Full Stack Developer']
  };

  console.log('Sending payload:', payload);

  try {
    const res = await fetch('http://127.0.0.1:5000/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Error:', res.status, data);
    } else {
      console.log('Success:', data);
    }
  } catch (error: any) {
    console.error('Network Error:', error);
  }

  process.exit(0);
};

run();
