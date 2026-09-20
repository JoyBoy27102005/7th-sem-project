import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI as string);
  const users = await User.find();
  for (const user of users) {
    if (user.savedRoadmap) {
      console.log('User has saved roadmap:', user.email);
      console.log('First month topics:', JSON.stringify(user.savedRoadmap.roadmapData[0].topics, null, 2));
    }
  }
  process.exit(0);
};

run();
