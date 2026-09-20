import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Resource from './src/models/Resource';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI as string);
  const resources = await Resource.find();
  console.log('Total Resources:', resources.length);
  if (resources.length > 0) {
    console.log('First Resource:', JSON.stringify(resources[0], null, 2));
  }
  process.exit(0);
};

run();
