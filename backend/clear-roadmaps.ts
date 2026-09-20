import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI as string);
  await User.updateMany({}, { $unset: { savedRoadmap: 1 } });
  console.log('Cleared saved roadmaps for all users to force regeneration.');
  process.exit(0);
};

run();
