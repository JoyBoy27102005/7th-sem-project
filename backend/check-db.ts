import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI as string);
  const users = await User.find();
  for (const user of users) {
    console.log(`User: ${user.email}, Name: ${user.name}`);
    console.log(`Skills: ${user.skills}`);
    console.log(`Degree: ${user.degree}, Branch: ${user.branch}`);
    console.log(`Projects: ${user.projects}`);
    console.log(`Career Goals: ${user.careerGoals}`);
    console.log('---------------------');
  }
  process.exit(0);
};

run();
