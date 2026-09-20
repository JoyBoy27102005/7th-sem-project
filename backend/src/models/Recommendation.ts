import mongoose, { Schema, Document } from 'mongoose';

export interface IRecommendation extends Document {
  userId: mongoose.Types.ObjectId;
  career: string;
  matchPercentage: string;
  reason: string;
  fitType: string;
  missingSkills: string[];
  matchedSkills: string[];
  salaryIndia: string;
  demandLevel: string;
  futureScope: string;
  roadmapPreview: string[];
  createdAt: Date;
}

const RecommendationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    career: { type: String, required: true },
    matchPercentage: { type: String, required: true },
    reason: { type: String },
    fitType: { type: String, default: 'moderate' },
    missingSkills: [{ type: String }],
    matchedSkills: [{ type: String }],
    salaryIndia: { type: String },
    demandLevel: { type: String },
    futureScope: { type: String },
    roadmapPreview: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);
