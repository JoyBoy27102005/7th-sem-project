import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Career from '../models/Career';
import { careers } from '../data/careers';
import { connectDB } from '../config/db';

dotenv.config();

const importData = async () => {
  try {
    await connectDB();

    await Career.deleteMany();

    await Career.insertMany(careers);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();

    await Career.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error with data destruction: ${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
