const fs = require('fs');

const profilePath = '../frontend/src/pages/student/Profile.tsx';
const constantsPath = '../frontend/src/utils/careerConstants.ts';

const content = fs.readFileSync(profilePath, 'utf8');

const regex = /(const DEGREES = \[[\s\S]*?\];\s*const BRANCHES_MAP: Record<string, string\[\]> = {[\s\S]*?};\s*const CAREER_GOALS_MAP: Record<string, string\[\]> = {[\s\S]*?};\s*const SKILLS_MAP: Record<string, string\[\]> = {[\s\S]*?};)/;

const match = content.match(regex);

if (match && match[1]) {
  const extracted = match[1];
  
  // Add 'export ' before each const
  const exported = extracted
    .replace('const DEGREES = ', 'export const DEGREES = ')
    .replace('const BRANCHES_MAP: Record<string, string[]> = ', 'export const BRANCHES_MAP: Record<string, string[]> = ')
    .replace('const CAREER_GOALS_MAP: Record<string, string[]> = ', 'export const CAREER_GOALS_MAP: Record<string, string[]> = ')
    .replace('const SKILLS_MAP: Record<string, string[]> = ', 'export const SKILLS_MAP: Record<string, string[]> = ');
    
  fs.mkdirSync('../frontend/src/utils', { recursive: true });
  fs.writeFileSync(constantsPath, exported, 'utf8');
  
  // Remove from Profile.tsx
  const updatedContent = content.replace(extracted, "import { DEGREES, BRANCHES_MAP, CAREER_GOALS_MAP, SKILLS_MAP } from '@/utils/careerConstants';\n");
  fs.writeFileSync(profilePath, updatedContent, 'utf8');
  
  console.log('Successfully extracted constants and updated Profile.tsx');
} else {
  console.log('Failed to match constants block');
}
