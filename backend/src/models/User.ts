import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  degree?: string;
  branch?: string;
  currentQualification?: string;
  cgpa?: string;
  skills: string[];
  interests: string[];
  certifications: any[];
  projects: string[];
  careerGoals: string[];
  savedRoadmap?: any;
  profilePicture?: string;
  role: 'student' | 'admin';
  resetPasswordOTP?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    degree: { type: String },
    branch: { type: String },
    currentQualification: { type: String },
    cgpa: { type: String },
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    certifications: { type: [Schema.Types.Mixed], default: [] },
    projects: { type: [String], default: [] },
    careerGoals: { type: [String], default: [] },
    savedRoadmap: { type: Schema.Types.Mixed },
    profilePicture: { type: String },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    resetPasswordOTP: { type: String },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
