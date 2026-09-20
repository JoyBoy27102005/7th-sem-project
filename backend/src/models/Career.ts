import mongoose, { Schema, Document } from 'mongoose';

export interface ICareer extends Document {
  title: string;
  category: string;
  description: string;
  salaryIndia: string;
  salaryGlobal: string;
  demandLevel: string;
  requiredSkills: string[];
  futureScope: string;
  roadmap?: {
    month: string;
    topics: string[];
  }[];
}

const CareerSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    category: { type: String },
    description: { type: String, required: true },
    salaryIndia: { type: String },
    salaryGlobal: { type: String },
    demandLevel: { type: String },
    requiredSkills: { type: [String], default: [] },
    futureScope: { type: String },
    roadmap: [
      {
        month: { type: String },
        topics: { type: [String] },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ICareer>('Career', CareerSchema);
