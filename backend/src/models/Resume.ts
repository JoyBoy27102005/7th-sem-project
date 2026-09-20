import mongoose, { Schema, Document } from 'mongoose';

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  resumeUrl: string;
  atsScore: string;
  missingSkills: string[];
  suggestions: string[];
  createdAt: Date;
}

const ResumeSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    resumeUrl: { type: String, required: true },
    atsScore: { type: String },
    missingSkills: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<IResume>('Resume', ResumeSchema);
