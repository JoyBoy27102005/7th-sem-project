import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { ChevronDown, Check, Upload, X, FileText, User, GraduationCap, Star, Award, Camera, Loader2, Eye } from 'lucide-react';

import { DEGREES, BRANCHES_MAP, CAREER_GOALS_MAP, SKILLS_MAP } from '@/utils/careerConstants';
import { useAuth } from '@/context/AuthContext';


const QUALIFICATIONS = [
  "High School (11th/12th)",
  "1st Year (Undergraduate)",
  "2nd Year (Undergraduate)",
  "3rd Year (Undergraduate)",
  "4th Year (Undergraduate)",
  "5th Year (Medical/Architecture)",
  "Postgraduate (Masters/PG Diploma)",
  "PhD / Doctorate",
  "Passed Out / Graduated"
];

const Profile = () => {
  const { user, updateUser } = useAuth();
  
  const [isUploading, setIsUploading] = useState(false);
  const [isViewingModalOpen, setIsViewingModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<any>({
    name: user?.name || '', degree: DEGREES[0], branch: BRANCHES_MAP[DEGREES[0]][0], currentQualification: '', cgpa: '', skills: [], certifications: [], certificationsText: '', projects: '', interests: '', careerGoals: []
  });
  const [loading, setLoading] = useState(true);
  
  const [isDegreeOpen, setIsDegreeOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const branchDropdownRef = useRef<HTMLDivElement>(null);

  const [isCareerGoalOpen, setIsCareerGoalOpen] = useState(false);
  const careerGoalDropdownRef = useRef<HTMLDivElement>(null);
  const [tempCareerGoals, setTempCareerGoals] = useState<string[]>([]);

  const [isQualificationOpen, setIsQualificationOpen] = useState(false);
  const qualificationDropdownRef = useRef<HTMLDivElement>(null);

  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const skillsDropdownRef = useRef<HTMLDivElement>(null);
  const [tempSkills, setTempSkills] = useState<string[]>([]);

  const [branchSearch, setBranchSearch] = useState('');
  const [careerGoalSearch, setCareerGoalSearch] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [uploadingCert, setUploadingCert] = useState(false);

  const handleUploadCertificate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingCert(true);
    const formData = new FormData();
    formData.append('certificate', file);
    try {
      const { data } = await axios.post('http://localhost:5000/api/users/profile/certifications/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProfile((prev: any) => ({
        ...prev,
        certifications: [...(prev.certifications || []), data]
      }));
    } catch (error) {
      console.error('Failed to upload', error);
      alert('Failed to upload certificate. Make sure it is less than 10MB and is a valid format (PNG, JPEG, PDF).');
    } finally {
      setUploadingCert(false);
      e.target.value = '';
    }
  };

  const removeCertificate = (index: number) => {
    const updated = [...(profile.certifications || [])];
    updated.splice(index, 1);
    setProfile({ ...profile, certifications: updated });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/users/profile');
        const initialDegree = data.degree || '';
        const initialBranch = data.branch || '';
        const initialCareerGoals = data.careerGoals || [];
        setProfile({
          ...data,
          degree: initialDegree,
          branch: initialBranch,
          careerGoals: initialCareerGoals,
          skills: data.skills || [],
          certifications: Array.isArray(data.certifications) 
            ? data.certifications.filter((c: any) => typeof c === 'object' && c.url) 
            : [],
          certificationsText: Array.isArray(data.certifications) 
            ? data.certifications.filter((c: any) => typeof c === 'string' || (typeof c === 'object' && !c.url)).map((c: any) => typeof c === 'string' ? c : c.name).join(', ') 
            : '',
          projects: data.projects ? data.projects.join(', ') : '',
          interests: data.interests ? data.interests.join(', ') : '',
          currentQualification: data.currentQualification || ''
        });
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDegreeOpen(false);
      }
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target as Node)) {
        setIsBranchOpen(false);
      }
      if (careerGoalDropdownRef.current && !careerGoalDropdownRef.current.contains(event.target as Node)) {
        setIsCareerGoalOpen(false);
      }
      if (qualificationDropdownRef.current && !qualificationDropdownRef.current.contains(event.target as Node)) {
        setIsQualificationOpen(false);
      }
      if (skillsDropdownRef.current && !skillsDropdownRef.current.contains(event.target as Node)) {
        setIsSkillsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cgpaStr = profile.cgpa?.trim() || '';
    if (cgpaStr) {
      if (cgpaStr.endsWith('%')) {
        const val = parseFloat(cgpaStr.replace('%', ''));
        if (isNaN(val) || val < 0 || val > 100) {
          alert('Invalid CGPA: Percentage must be between 0% and 100%.');
          return;
        }
      } else {
        const val = parseFloat(cgpaStr);
        if (isNaN(val) || val < 0 || val > 10) {
          alert('Invalid CGPA: Must be between 0.0 and 10.0, or a valid percentage (e.g., 85%).');
          return;
        }
      }
    }

    if (!user || !user._id) {
      alert('Authentication Error: Please log in again.');
      console.error('Update aborted: User not authenticated');
      return;
    }

    try {
      const certTextArray = profile.certificationsText ? profile.certificationsText.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
      const projectsArray = Array.isArray(profile.projects) 
        ? profile.projects 
        : (profile.projects || '').split(',').map((s: string) => s.trim()).filter(Boolean);
        
      const interestsArray = Array.isArray(profile.interests)
        ? profile.interests
        : (profile.interests || '').split(',').map((s: string) => s.trim()).filter(Boolean);

      const requestPayload = {
        ...profile,
        certifications: [...(profile.certifications || []), ...certTextArray],
        projects: projectsArray,
        interests: interestsArray
      };

      console.log('--- PROFILE UPDATE INITIATED ---');
      console.log('Authenticated User:', user);
      console.log('Form Data (Raw Profile State):', profile);
      console.log('API Request Payload:', requestPayload);

      const response = await axios.put('http://localhost:5000/api/users/profile', requestPayload);
      
      console.log('API Response:', response.data);
      console.log('--- PROFILE UPDATE SUCCESSFUL ---');
      
      alert('Profile updated successfully.');
    } catch (error: any) {
      console.error('--- PROFILE UPDATE FAILED ---');
      console.error('Profile Update Error Details:', error);
      if (error.response) {
        if (error.response.status === 401) {
          alert('Authentication expired. Please log in again.');
        } else if (error.response.status === 404) {
          alert('Unable to find your account. Please contact support.');
        } else {
          alert('Failed to save changes. Please try again later.');
        }
        console.error('Backend Error Response Data:', error.response.data);
        console.error('Backend Error Status:', error.response.status);
      } else if (error.request) {
        console.error('No response received from backend (Server might be down):', error.request);
        alert('Server unreachable. Please check your internet connection or try again later.');
      } else {
        console.error('Error setting up the request:', error.message);
        alert('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('picture', file);

    try {
      setIsUploading(true);
      const res = await axios.post('http://localhost:5000/api/users/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.token}`
        }
      });
      if (updateUser) {
        updateUser({ profilePicture: res.data.url });
      }
    } catch (error) {
      console.error('Error uploading profile picture', error);
      alert('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const currentBranches = BRANCHES_MAP[profile.degree] || [];
  const currentCareerGoals = CAREER_GOALS_MAP[profile.branch] || [];
  const currentSkills = SKILLS_MAP[profile.branch] || [];

  const filteredBranches = currentBranches.filter(br => br.toLowerCase().includes(branchSearch.toLowerCase()));
  const filteredCareerGoals = currentCareerGoals.filter(cg => cg.toLowerCase().includes(careerGoalSearch.toLowerCase()));
  const filteredSkills = currentSkills.filter(sk => sk.toLowerCase().includes(skillSearch.toLowerCase()));

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4 mb-1">
          <div className="relative group">
            <div className="w-16 h-16 rounded-2xl bg-muted text-primary flex items-center justify-center overflow-hidden border border-border transition-all group-hover:border-secondary shadow-sm">
              {isUploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-secondary" />
              ) : user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 opacity-70" />
              )}
            </div>
            {!isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                {user?.profilePicture && (
                  <button type="button" onClick={() => setIsViewingModalOpen(true)} className="p-1 hover:bg-white/20 rounded-full transition-colors" title="View Photo">
                    <Eye className="w-4 h-4 text-white" />
                  </button>
                )}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1 hover:bg-white/20 rounded-full transition-colors" title={user?.profilePicture ? "Change Photo" : "Upload Photo"}>
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>
          <div>
            <h1 className="text-[36px] font-bold tracking-tight text-foreground font-heading">
              Your Profile
            </h1>
            <p className="text-muted-foreground pl-1 mt-1">Keep your details up to date to get the best career recommendations.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Section 1: Personal Info */}
        <Card className="border border-border bg-card shadow-xl hover:shadow-2xl hover:border-secondary/50 transition-all duration-300 relative z-40">
          <div className="px-6 pt-6 pb-2 flex items-center gap-2 border-b border-border mb-4">
            <User className="w-4 h-4 text-secondary" />
            <h2 className="font-heading text-[22px] font-semibold text-foreground">Personal Information</h2>
          </div>
          <CardContent className="pt-2 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <Input className="bg-muted border-border text-foreground h-11" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">CGPA</label>
                <Input className="bg-muted border-border text-foreground h-11" value={profile.cgpa} onChange={(e) => setProfile({...profile, cgpa: e.target.value})} />
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Section 2: Academic Info */}
        <Card className="border border-border bg-card shadow-xl hover:shadow-2xl hover:border-secondary/50 transition-all duration-300 overflow-visible relative z-30">
          <div className="px-6 pt-6 pb-2 flex items-center gap-2 border-b border-border mb-4">
            <GraduationCap className="w-4 h-4 text-secondary" />
            <h2 className="font-heading text-[22px] font-semibold text-foreground">Academic Background</h2>
          </div>
          <CardContent className="pt-2 pb-6 overflow-visible">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Degree */}
              <div className="space-y-2 relative" ref={dropdownRef}>
                <label className="text-sm font-medium text-muted-foreground">Degree</label>
                <div
                  onClick={() => setIsDegreeOpen(!isDegreeOpen)}
                  className="flex items-center justify-between h-11 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm cursor-pointer text-foreground hover:bg-muted transition-colors"
                >
                  <span className="truncate pr-4">{profile.degree || 'Select Degree'}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
                {isDegreeOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-border bg-card shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-1">
                      {DEGREES.map((deg) => (
                        <div
                          key={deg}
                          onClick={() => {
                            const newBranches = BRANCHES_MAP[deg] || [];
                            const firstBranch = newBranches[0] || '';
                            setProfile({ ...profile, degree: deg, branch: firstBranch, careerGoals: [], skills: [] });
                            setIsDegreeOpen(false);
                          }}
                          className={`flex items-center justify-between px-2 py-2 text-sm rounded-sm cursor-pointer hover:bg-muted transition-colors ${profile.degree === deg ? 'bg-secondary/10 text-secondary font-medium' : 'text-foreground'}`}
                        >
                          <span className="truncate">{deg}</span>
                          {profile.degree === deg && <Check className="w-4 h-4 shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Branch */}
              <div className="space-y-2 relative" ref={branchDropdownRef}>
                <label className="text-sm font-medium text-muted-foreground">Branch</label>
                <div
                  onClick={() => setIsBranchOpen(!isBranchOpen)}
                  className="flex items-center justify-between h-11 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm cursor-pointer text-foreground hover:bg-muted transition-colors"
                >
                  <span className="truncate pr-4">{profile.branch || 'Select Branch'}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
                {isBranchOpen && currentBranches.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-border bg-card shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 border-b border-border sticky top-0 bg-card z-10">
                      <Input placeholder="Search branches..." value={branchSearch} onChange={(e) => setBranchSearch(e.target.value)} onClick={(e) => e.stopPropagation()} className="h-8 bg-muted border-border text-foreground text-xs placeholder:text-muted-foreground" />
                    </div>
                    <div className="p-1">
                      {filteredBranches.length > 0 ? filteredBranches.map((br) => (
                        <div key={br} onClick={() => { setProfile({ ...profile, branch: br, careerGoals: [], skills: [] }); setIsBranchOpen(false); setBranchSearch(''); }} className={`flex items-center justify-between px-2 py-2 text-sm rounded-sm cursor-pointer hover:bg-muted transition-colors ${profile.branch === br ? 'bg-secondary/10 text-secondary font-medium' : 'text-foreground'}`}>
                          <span className="truncate">{br}</span>
                          {profile.branch === br && <Check className="w-4 h-4 shrink-0" />}
                        </div>
                      )) : <div className="px-2 py-4 text-sm text-center text-muted-foreground">No branches found</div>}
                    </div>
                  </div>
                )}
              </div>

              {/* Qualification */}
              <div className="space-y-2 relative" ref={qualificationDropdownRef}>
                <label className="text-sm font-medium text-muted-foreground">Current Qualification / Year</label>
                <div
                  onClick={() => setIsQualificationOpen(!isQualificationOpen)}
                  className="flex items-center justify-between h-11 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm cursor-pointer text-foreground hover:bg-muted transition-colors"
                >
                  <span className="truncate pr-4">{profile.currentQualification || 'Select Qualification'}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
                {isQualificationOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-border bg-card shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-1">
                      {QUALIFICATIONS.map((qual) => (
                        <div key={qual} onClick={() => { setProfile({ ...profile, currentQualification: qual }); setIsQualificationOpen(false); }} className={`flex items-center justify-between px-2 py-2 text-sm rounded-sm cursor-pointer hover:bg-muted transition-colors ${profile.currentQualification === qual ? 'bg-secondary/10 text-secondary font-medium' : 'text-foreground'}`}>
                          <span className="truncate">{qual}</span>
                          {profile.currentQualification === qual && <Check className="w-4 h-4 shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Career Goals */}
              <div className="space-y-2 relative" ref={careerGoalDropdownRef}>
                <label className="text-sm font-medium text-muted-foreground">Career Goals</label>
                <div
                  onClick={() => { if (!isCareerGoalOpen) { setTempCareerGoals([...(profile.careerGoals || [])]); } setIsCareerGoalOpen(!isCareerGoalOpen); }}
                  className="flex items-center justify-between h-11 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm cursor-pointer text-foreground hover:bg-muted transition-colors"
                >
                  <span className="truncate pr-4">{profile.careerGoals?.length > 0 ? profile.careerGoals.join(', ') : 'Select Career Goals'}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
                {isCareerGoalOpen && currentCareerGoals.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-full rounded-md border border-border bg-card shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                    <div className="p-2 border-b border-border sticky top-0 bg-card z-10">
                      <Input placeholder="Search career goals..." value={careerGoalSearch} onChange={(e) => setCareerGoalSearch(e.target.value)} onClick={(e) => e.stopPropagation()} className="h-8 bg-muted border-border text-foreground text-xs placeholder:text-muted-foreground" />
                    </div>
                    <div className="p-1 overflow-y-auto max-h-52">
                      {filteredCareerGoals.length > 0 ? filteredCareerGoals.map((cg) => {
                        const isSelected = tempCareerGoals.includes(cg);
                        return (
                          <div key={cg} onClick={(e) => { e.stopPropagation(); const newGoals = isSelected ? tempCareerGoals.filter((g: string) => g !== cg) : [...tempCareerGoals, cg]; setTempCareerGoals(newGoals); }} className={`flex items-center justify-between px-2 py-2 text-sm rounded-sm cursor-pointer hover:bg-muted transition-colors ${isSelected ? 'bg-secondary/10 text-secondary font-medium' : 'text-foreground'}`}>
                            <span className="truncate">{cg}</span>
                            {isSelected && <Check className="w-4 h-4 shrink-0" />}
                          </div>
                        );
                      }) : <div className="px-2 py-4 text-sm text-center text-muted-foreground">No goals found</div>}
                    </div>
                    <div className="p-1.5 border-t border-border bg-card rounded-b-md">
                      <Button type="button" size="sm" className="w-full text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium" onClick={(e) => { e.stopPropagation(); setProfile({...profile, careerGoals: tempCareerGoals}); setIsCareerGoalOpen(false); setCareerGoalSearch(''); }}>Apply</Button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Section 3: Skills */}
        <Card className="border border-border bg-card shadow-xl hover:shadow-2xl hover:border-secondary/50 transition-all duration-300 relative z-20">
          <div className="px-6 pt-6 pb-2 flex items-center gap-2 border-b border-border mb-4">
            <Star className="w-4 h-4 text-secondary" />
            <h2 className="font-heading text-[22px] font-semibold text-foreground">Skills</h2>
          </div>
          <CardContent className="pt-2 pb-6">
            <div className="space-y-2 relative" ref={skillsDropdownRef}>
              <label className="text-sm font-medium text-muted-foreground">Select your skills</label>
              <div
                onClick={() => { if (!isSkillsOpen) { setTempSkills([...(profile.skills || [])]); } setIsSkillsOpen(!isSkillsOpen); }}
                className="flex items-center justify-between h-11 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm cursor-pointer text-foreground hover:bg-muted transition-colors"
              >
                <span className="truncate pr-4">{profile.skills?.length > 0 ? profile.skills.join(', ') : 'Select Skills'}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
              {isSkillsOpen && currentSkills.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-full rounded-md border border-border bg-card shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                  <div className="p-2 border-b border-border sticky top-0 bg-card z-10">
                    <Input placeholder="Search skills..." value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} onClick={(e) => e.stopPropagation()} className="h-8 bg-muted border-border text-foreground text-xs placeholder:text-muted-foreground" />
                  </div>
                  <div className="p-1 overflow-y-auto max-h-52">
                    {filteredSkills.length > 0 ? filteredSkills.map((sk) => {
                      const isSelected = tempSkills.includes(sk);
                      return (
                        <div key={sk} onClick={(e) => { e.stopPropagation(); const newSkills = isSelected ? tempSkills.filter((s: string) => s !== sk) : [...tempSkills, sk]; setTempSkills(newSkills); }} className={`flex items-center justify-between px-2 py-2 text-sm rounded-sm cursor-pointer hover:bg-muted transition-colors ${isSelected ? 'bg-secondary/10 text-secondary font-medium' : 'text-foreground'}`}>
                          <span className="truncate">{sk}</span>
                          {isSelected && <Check className="w-4 h-4 shrink-0" />}
                        </div>
                      );
                    }) : <div className="px-2 py-4 text-sm text-center text-muted-foreground">No skills found</div>}
                  </div>
                  <div className="p-1.5 border-t border-border bg-card rounded-b-md">
                    <Button type="button" size="sm" className="w-full text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium" onClick={(e) => { e.stopPropagation(); setProfile({...profile, skills: tempSkills}); setIsSkillsOpen(false); setSkillSearch(''); }}>Apply</Button>
                  </div>
                </div>
              )}
            </div>

            {profile.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {profile.skills.map((skill: string) => (
                  <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 4: Certifications */}
        <Card className="border border-border bg-card shadow-xl hover:shadow-2xl hover:border-secondary/50 transition-all duration-300 relative z-10">
          <div className="px-6 pt-6 pb-2 flex items-center gap-2 border-b border-border mb-4">
            <Award className="w-4 h-4 text-secondary" />
            <h2 className="font-heading text-[22px] font-semibold text-foreground">Certifications</h2>
          </div>
          <CardContent className="pt-2 pb-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Upload files (PNG, JPEG & PDF)</label>
              <div className="relative flex items-center">
                <Input
                  className="bg-muted border-border text-foreground h-11 pr-28"
                  value={profile.certificationsText}
                  onChange={(e) => setProfile({...profile, certificationsText: e.target.value})}
                />
                <div className="absolute right-1.5 flex items-center">
                  <input type="file" accept=".png,.jpg,.jpeg,.pdf" onChange={handleUploadCertificate} disabled={uploadingCert} className="hidden" id="cert-upload" />
                  <label htmlFor="cert-upload" className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer transition-colors ${uploadingCert ? 'opacity-50 cursor-not-allowed' : ''}`} title="Upload Certificate File">
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingCert ? 'Uploading...' : 'Upload'}
                  </label>
                </div>
              </div>
            </div>

            {profile.certifications?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.certifications.map((cert: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted hover:bg-muted transition-colors">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-7 h-7 rounded-md bg-secondary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5 text-secondary" />
                      </div>
                      {cert.url ? (
                        <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-sm truncate hover:underline text-primary font-semibold">{cert.name || 'Certificate'}</a>
                      ) : (
                        <span className="text-sm truncate text-foreground">{cert.name || 'Certificate'}</span>
                      )}
                    </div>
                    <button type="button" onClick={() => removeCertificate(index)} className="text-muted-foreground hover:text-red-500 transition-colors ml-2 shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all hover:scale-[1.01]"
        >
          Save Changes
        </Button>

      </form>

      {/* Profile Photo Modal */}
      {isViewingModalOpen && user?.profilePicture && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative max-w-2xl w-full max-h-[90vh] flex flex-col items-center">
            <button 
              onClick={() => setIsViewingModalOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img 
              src={user.profilePicture} 
              alt="Profile View" 
              className="w-auto h-auto max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain border border-white/20" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
