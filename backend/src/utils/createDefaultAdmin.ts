import bcrypt from 'bcryptjs';
import User from '../models/User';

export const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (existingAdmin) {
      console.log(' Default admin already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD as string,
      10
    );

    await User.create({
      name: 'Administrator',
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
    });

    console.log(' Default admin created');
  } catch (err) {
    console.error(' Failed to create default admin');
    console.error(err);
  }
};