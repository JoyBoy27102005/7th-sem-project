import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { 
  BrainCircuit, Briefcase, Target, ChevronRight, Zap, 
  GraduationCap, AlertTriangle, CheckCircle2, Check, 
  Coins, TrendingUp, Lightbulb, AlertCircle, Award, 
  BarChart3, Layers, ArrowRight, HelpCircle, X, Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CAREER_GOALS_MAP } from '@/utils/careerConstants';
import { useAuth } from '@/context/AuthContext';

// Helper to normalize skills for accurate comparisons
const normalizeSkill = (skill: string): string => {
  return skill.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
};

const Recommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  
  // User Profile & Goals State
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userBranch, setUserBranch] = useState<string>('');
  const [updatingGoal, setUpdatingGoal] = useState<string | null>(null);

  // Expanded Accordion Card State
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Comparison State
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Filter State
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recRes, profileRes] = await Promise.all([
        axios.get('http://localhost:5000/api/recommendations'),
        axios.get('http://localhost:5000/api/users/profile')
      ]);
      setRecommendations(recRes.data);
      setUserProfile(profileRes.data);
      setUserBranch(profileRes.data.branch || '');
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  const generateRecommendations = async () => {
    if (!userBranch) {
      setRecError("Please complete your Academic Background (Degree and Branch) in your profile to generate accurate matches.");
      return;
    }
    if (cooldown > 0) return;
    setRecLoading(true);
    setRecError(null);
    setSelectedForCompare([]); // Clear selections
    try {
      const { data } = await axios.post('http://localhost:5000/api/recommendations/recommend');
      setRecommendations(data);
      setCooldown(3); // Small cooldown on success to prevent accidental double clicks
    } catch (error: any) {
      console.error('Failed to generate recommendations', error);
      if (error.response?.status === 429) {
        setCooldown(30); // 30 second cooldown on rate limit
      } else {
        setCooldown(5);
      }
      setRecError(error.response?.data?.message || 'Failed to generate recommendations. Please try again.');
    } finally {
      setRecLoading(false);
    }
  };

  const handleSetGoal = async (careerTitle: string) => {
    if (!userProfile) return;
    if (!user || !user._id) {
      alert('Authentication Error: Please log in again.');
      console.error('Update aborted: User not authenticated');
      return;
    }

    setUpdatingGoal(careerTitle);
    
    try {
      const currentGoals = userProfile.careerGoals || [];
      let updatedGoals;
      if (currentGoals.includes(careerTitle)) {
        updatedGoals = currentGoals.filter((g: string) => g !== careerTitle);
      } else {
        updatedGoals = [...currentGoals, careerTitle];
      }

      console.log('--- CAREER GOAL UPDATE INITIATED ---');
      console.log('Authenticated User:', user);
      console.log('Updating Goals:', updatedGoals);

      const { data } = await axios.put('http://localhost:5000/api/users/profile', { careerGoals: updatedGoals });
      setUserProfile(data);

      console.log('--- CAREER GOAL UPDATE SUCCESSFUL ---');
    } catch (error: any) {
      console.error('--- CAREER GOAL UPDATE FAILED ---');
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
      } else if (error.request) {
        console.error('No response received from backend (Server might be down):', error.request);
        alert('Server unreachable. Please check your internet connection or try again later.');
      } else {
        console.error('Error setting up the request:', error.message);
        alert('An unexpected error occurred. Please try again.');
      }
    } finally {
      setUpdatingGoal(null);
    }
  };

  const isGoalSet = (title: string) => {
    return userProfile?.careerGoals?.includes(title);
  };

  // Helper to categorize career dynamically for filters
  const getCareerCategories = (title: string): string[] => {
    const lower = title.toLowerCase();
    const categories = ['All'];
    if (
      lower.includes('physician') || 
      lower.includes('pediatrician') || 
      lower.includes('dermatologist') || 
      lower.includes('oncologist') || 
      lower.includes('radiologist') || 
      lower.includes('psychiatrist') || 
      lower.includes('doctor') ||
      lower.includes('clinical') ||
      lower.includes('practitioner')
    ) {
      categories.push('Clinical');
    }
    if (lower.includes('surgeon') || lower.includes('surgery')) {
      categories.push('Surgery');
    }
    if (lower.includes('research') || lower.includes('scientist') || lower.includes('biomedical') || lower.includes('data manager') || lower.includes('lab')) {
      categories.push('Research');
    }
    if (lower.includes('administrator') || lower.includes('admin') || lower.includes('policy')) {
      categories.push('Administration');
    }
    if (lower.includes('management') || lower.includes('manager') || lower.includes('director') || lower.includes('leader')) {
      categories.push('Healthcare Management');
    }
    // Tech Fallback
    if (lower.includes('developer') || lower.includes('engineer') || lower.includes('programmer') || lower.includes('web') || lower.includes('architect')) {
      categories.push('Development');
    }
    // Commerce Fallback
    if (lower.includes('analyst') || lower.includes('banker') || lower.includes('accountant') || lower.includes('finance') || lower.includes('ca ')) {
      categories.push('Finance');
    }
    return categories;
  };

  // UI Match Helpers
  const getMatchScore = (matchStr: string) => {
    const match = matchStr?.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  const getScoreDetails = (score: number) => {
    if (score >= 80) return {
      label: 'Excellent Match',
      colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      progressClass: 'bg-emerald-500'
    };
    if (score >= 60) return {
      label: 'Strong Match',
      colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      progressClass: 'bg-blue-500'
    };
    if (score >= 40) return {
      label: 'Good Potential',
      colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      progressClass: 'bg-amber-500'
    };
    return {
      label: 'Skill Development Needed',
      colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      progressClass: 'bg-rose-500'
    };
  };

  // Dynamic Skill Gap Calculator
  const calculateSkillGap = (careerScore: number, skillIndex: number) => {
    const baseGap = 100 - careerScore;
    const variation = ((skillIndex * 7) % 15) - 7; // -7% to +7% variation
    return Math.max(10, Math.min(95, baseGap + variation));
  };

  // Calculations for Summary Cards
  const getDashboardStats = () => {
    if (recommendations.length === 0) return { bestMatch: 'N/A', score: 0, careersCount: 0, skillsMatched: 0, missingCount: 0, profileStrength: 0 };
    
    const best = recommendations[0];
    const score = getMatchScore(best.matchPercentage);
    
    const careersCount = userBranch ? (CAREER_GOALS_MAP[userBranch]?.length || 15) : 15;
    
    const matchedSet = new Set<string>();
    recommendations.forEach(r => {
      (r.matchedSkills || []).forEach((s: string) => matchedSet.add(s.toLowerCase()));
    });
    
    const missingSet = new Set<string>();
    recommendations.forEach(r => {
      (r.missingSkills || []).forEach((s: string) => missingSet.add(s.toLowerCase()));
    });

    // Profile Strength Calculation
    let strength = 0;
    if (userProfile?.degree) strength += 20;
    if (userProfile?.branch) strength += 20;
    if (userProfile?.cgpa) strength += 15;
    if (userProfile?.skills && userProfile.skills.length > 0) {
      strength += Math.min(20, userProfile.skills.length * 2);
    }
    if (userProfile?.interests && userProfile.interests.length > 0) {
      strength += Math.min(15, userProfile.interests.length * 3);
    }
    if (userProfile?.careerGoals && userProfile.careerGoals.length > 0) {
      strength += 10;
    }

    return {
      bestMatch: best.career,
      score,
      careersCount,
      skillsMatched: matchedSet.size,
      missingCount: missingSet.size,
      profileStrength: strength
    };
  };

  const stats = getDashboardStats();

  // Next Recommended Action logic
  const getNextAction = () => {
    if (recommendations.length === 0) return null;
    const topRec = recommendations[0];
    const missing = topRec.missingSkills || [];
    if (missing.length === 0) return null;
    
    const nextSkill = missing[0];
    const score = getMatchScore(topRec.matchPercentage);
    const impact = Math.max(5, Math.round((100 - score) / Math.max(1, missing.length)));
    
    return {
      skill: nextSkill,
      targetCareer: topRec.career,
      impact,
      estimatedTime: '2 Weeks'
    };
  };
  
  const nextAction = getNextAction();

  // Extract all categories in recommendations to build dynamic filters
  const getAvailableFilters = () => {
    const filters = new Set<string>();
    filters.add('All');
    recommendations.forEach(r => {
      getCareerCategories(r.career).forEach(cat => {
        if (cat !== 'All') filters.add(cat);
      });
    });
    return Array.from(filters);
  };
  
  const availableFilters = getAvailableFilters();

  // Filter and sort recommendations
  const filteredRecommendations = recommendations.filter(rec => {
    if (activeFilter === 'All') return true;
    return getCareerCategories(rec.career).includes(activeFilter);
  });

  const handleSelectCompare = (careerTitle: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (selectedForCompare.includes(careerTitle)) {
      setSelectedForCompare(selectedForCompare.filter(t => t !== careerTitle));
    } else {
      if (selectedForCompare.length < 3) {
        setSelectedForCompare([...selectedForCompare, careerTitle]);
      } else {
        alert("You can compare up to 3 careers at a time.");
      }
    }
  };

  const getDemandColorBadge = (demand: string) => {
    const d = demand.toLowerCase();
    if (d.includes('very high')) return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    if (d.includes('high')) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    if (d.includes('growing')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  };

  const toggleExpandCard = (career: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCard(expandedCard === career ? null : career);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h1 className="text-[36px] font-bold tracking-tight text-foreground font-heading">Career Intelligence</h1>
          </div>
          <p className="text-muted-foreground max-w-xl">
            SaaS-grade AI career analytics matching your skills against emerging opportunities.
          </p>
          {recError && (
            <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-medium flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
              {recError}
            </div>
          )}
        </div>
        
        {recommendations.length > 0 && (
          <Button 
            onClick={generateRecommendations} 
            disabled={recLoading || cooldown > 0 || !userBranch}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all hover:scale-105 shrink-0"
          >
            {recLoading ? (
              <><Zap className="w-4 h-4 mr-2 animate-pulse" /> Analyzing Profile...</>
            ) : cooldown > 0 ? (
              <><AlertCircle className="w-4 h-4 mr-2" /> Wait {cooldown}s</>
            ) : !userBranch ? (
              <><AlertCircle className="w-4 h-4 mr-2" /> Profile Incomplete</>
            ) : (
              <><Zap className="w-4 h-4 mr-2" /> Recalculate Matches</>
            )}
          </Button>
        )}
      </div>

      {(recommendations.length > 0 && userBranch) ? (
        <>
          {/* Dashboard Summary Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Card 1: Best Match */}
            <Card className="bg-card border-border hover:border-secondary/50 transition-all hover:shadow-lg backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/5 rounded-bl-full flex items-center justify-center transition-all group-hover:scale-110">
                <Award className="w-5 h-5 text-secondary/40 group-hover:text-secondary transition-colors" />
              </div>
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">🎯 Best Match</div>
                <div className="mt-3">
                  {recLoading ? (
                    <div className="h-6 bg-muted rounded animate-pulse w-24" />
                  ) : (
                    <>
                      <div className="text-lg font-bold text-foreground truncate">{stats.bestMatch}</div>
                      <div className="text-xs text-secondary font-semibold mt-1">{stats.score}% Match Score</div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Careers Analyzed */}
            <Card className="bg-card border-border hover:border-secondary/50 transition-all hover:shadow-lg backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full flex items-center justify-center transition-all group-hover:scale-110">
                <Briefcase className="w-5 h-5 text-blue-500/40 group-hover:text-blue-500 transition-colors" />
              </div>
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">📊 Careers Evaluated</div>
                <div className="mt-3">
                  {recLoading ? (
                    <div className="h-8 bg-muted rounded animate-pulse w-16" />
                  ) : (
                    <>
                      <div className="text-2xl font-black text-foreground">{stats.careersCount}</div>
                      <div className="text-xs text-muted-foreground mt-1">Specific to your branch</div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Skills Matched */}
            <Card className="bg-card border-border hover:border-secondary/50 transition-all hover:shadow-lg backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full flex items-center justify-center transition-all group-hover:scale-110">
                <CheckCircle2 className="w-5 h-5 text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
              </div>
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">🧠 Skills Matched</div>
                <div className="mt-3">
                  {recLoading ? (
                    <div className="h-8 bg-muted rounded animate-pulse w-16" />
                  ) : (
                    <>
                      <div className="text-2xl font-black text-foreground">{stats.skillsMatched}</div>
                      <div className="text-xs text-emerald-500 font-semibold mt-1">Across matches</div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Missing Skills */}
            <Card className="bg-card border-border hover:border-secondary/50 transition-all hover:shadow-lg backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full flex items-center justify-center transition-all group-hover:scale-110">
                <AlertCircle className="w-5 h-5 text-amber-500/40 group-hover:text-amber-500 transition-colors" />
              </div>
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">⚠ Missing Skills</div>
                <div className="mt-3">
                  {recLoading ? (
                    <div className="h-8 bg-muted rounded animate-pulse w-16" />
                  ) : (
                    <>
                      <div className="text-2xl font-black text-foreground">{stats.missingCount}</div>
                      <div className="text-xs text-amber-500 font-semibold mt-1">To close matches gap</div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Card 5: Profile Strength */}
            <Card className="bg-card border-border hover:border-secondary/50 transition-all hover:shadow-lg backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/5 rounded-bl-full flex items-center justify-center transition-all group-hover:scale-110">
                <BarChart3 className="w-5 h-5 text-violet-500/40 group-hover:text-violet-500 transition-colors" />
              </div>
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">📈 Profile Strength</div>
                <div className="mt-3">
                  {recLoading ? (
                    <div className="h-8 bg-muted rounded animate-pulse w-16" />
                  ) : (
                    <>
                      <div className="text-2xl font-black text-foreground">{stats.profileStrength}%</div>
                      <div className="text-xs text-violet-500 font-semibold mt-1">Platform completeness</div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Next Action Banner */}
          {nextAction && !recLoading && (
            <Card className="bg-secondary/10 border border-secondary/20 hover:border-secondary/40 transition-all relative overflow-hidden">
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0 text-secondary">
                    <Zap className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-secondary uppercase tracking-wider">🚀 Recommended Next Step</div>
                    <div className="font-semibold text-sm text-foreground mt-0.5">
                      Complete: <span className="text-secondary font-bold">{nextAction.skill} Fundamentals</span> to prepare for your target career <span className="font-bold">{nextAction.targetCareer}</span>.
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 text-xs font-semibold shrink-0">
                  <div className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-md border border-emerald-500/20">
                    +{nextAction.impact}% Match Increase
                  </div>
                  <div className="px-2.5 py-1 bg-muted text-muted-foreground rounded-md border border-border">
                    Est: {nextAction.estimatedTime}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filtering and Compare Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2 border-b border-border">
            {/* Dynamic filter tags */}
            <div className="flex flex-wrap gap-2">
              {availableFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    activeFilter === filter
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Selection compare size indicator */}
            {selectedForCompare.length > 0 && (
              <div className="text-xs font-bold text-secondary flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                <span>{selectedForCompare.length} selected for comparison</span>
                <button 
                  onClick={() => setSelectedForCompare([])}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Recommendations Grid / Skeleton Loader */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {recLoading ? (
              /* Loading Skeletons */
              Array.from({ length: 4 }).map((_, sIdx) => (
                <Card key={sIdx} className="border-border bg-card animate-pulse border">
                  <CardContent className="p-6 space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-muted" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded-md w-1/4" />
                        <div className="h-6 bg-muted rounded-md w-1/2" />
                      </div>
                    </div>
                    <div className="h-14 bg-muted rounded-xl" />
                    <div className="h-6 bg-muted rounded-md w-1/3" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded-md w-1/2" />
                        <div className="h-3 bg-muted rounded-md w-3/4" />
                        <div className="h-3 bg-muted rounded-md w-2/3" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded-md w-1/2" />
                        <div className="h-3 bg-muted rounded-md w-3/4" />
                        <div className="h-3 bg-muted rounded-md w-2/3" />
                      </div>
                    </div>
                    <div className="h-10 bg-muted rounded-xl" />
                  </CardContent>
                </Card>
              ))
            ) : filteredRecommendations.length > 0 ? (
              filteredRecommendations.map((rec, index) => {
                const score = getMatchScore(rec.matchPercentage);
                const scoreDetails = getScoreDetails(score);
                const goalSet = isGoalSet(rec.career);
                const isBestMatch = recommendations[0].career === rec.career;
                const isExpanded = expandedCard === rec.career;
                const isCompared = selectedForCompare.includes(rec.career);
                
                return (
                  <Card 
                    key={index} 
                    className={`group relative overflow-hidden border-border bg-card backdrop-blur-sm hover:shadow-xl hover:shadow-secondary/10 transition-all duration-300 ${
                      isBestMatch 
                        ? 'border-secondary/60 ring-2 ring-secondary/10 shadow-lg shadow-secondary/10 hover:border-secondary' 
                        : 'hover:border-border'
                    }`}
                  >
                    {/* Glowing effect inside Top/Best Match Card */}
                    {isBestMatch && (
                      <div className="absolute inset-0 bg-secondary/5 opacity-50 pointer-events-none" />
                    )}

                    {/* Checkbox for compare */}
                    <div className="absolute top-5 left-5 z-20">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={(e) => handleSelectCompare(rec.career, e)}
                          className="w-4 h-4 text-secondary rounded border-border focus:ring-secondary/30 cursor-pointer"
                        />
                        <span className="sr-only">Select for comparison</span>
                      </label>
                    </div>

                    {/* Best Match ribbon */}
                    {isBestMatch && (
                      <div className="absolute top-5 right-5 z-20">
                        <div className="text-[10px] font-black tracking-widest text-primary-foreground bg-secondary px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" /> BEST MATCH
                        </div>
                      </div>
                    )}

                    <CardContent className="p-6 flex flex-col h-full relative z-10 space-y-5">
                      
                      {/* Career Header Row */}
                      <div className="flex justify-between items-start gap-4 pl-8 pt-1">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20 group-hover:scale-105 transition-transform duration-300 shrink-0 ${isBestMatch ? 'border-secondary/40 ring-2 ring-secondary/20 shadow-sm shadow-secondary/30' : ''}`}>
                            <Briefcase className="w-6 h-6 text-secondary" />
                          </div>
                          <div className="text-left">
                            <div className="text-xs font-bold text-secondary mb-0.5">#{index + 1} RECOMMENDED CAREER</div>
                            <h3 className="font-heading text-[22px] font-semibold group-hover:text-secondary text-foreground transition-colors pr-10">{rec.career}</h3>
                          </div>
                        </div>
                      </div>

                      {/* Match Score Progress Bar & Detailed Visualization */}
                      <div className="p-4 rounded-xl bg-muted border border-border space-y-3">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${scoreDetails.colorClass}`}>
                              {scoreDetails.label}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1.5 text-xs text-muted-foreground">
                            <span className="font-extrabold text-foreground text-sm">{score}%</span>
                            <span>Compatibility Score</span>
                            <span className="text-foreground font-semibold">({score}/100)</span>
                          </div>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${scoreDetails.progressClass}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>

                      {/* Market Insights Row (Always visible inside card) */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {rec.salaryIndia && rec.salaryIndia !== 'N/A' && (
                          <div className="text-xs font-semibold px-3 py-1.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg flex items-center gap-1.5 shadow-sm">
                            <Coins className="w-3.5 h-3.5" /> Salary: {rec.salaryIndia}
                          </div>
                        )}
                        {rec.demandLevel && rec.demandLevel !== 'N/A' && (
                          <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 shadow-sm ${getDemandColorBadge(rec.demandLevel)}`}>
                            <TrendingUp className="w-3.5 h-3.5" /> {rec.demandLevel} Demand
                          </div>
                        )}
                      </div>

                      {/* Strong & Missing Skills Lists (Replacing large paragraph text block) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-left">
                        {/* Strong Skills */}
                        <div className="space-y-2.5">
                          <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Strong Skills
                          </div>
                          <ul className="space-y-1.5 text-xs text-muted-foreground">
                            {rec.matchedSkills && rec.matchedSkills.length > 0 ? (
                              rec.matchedSkills.slice(0, 3).map((skill: string, idx: number) => (
                                <li key={idx} className="flex items-center gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-emerald-500" /> {skill}
                                </li>
                              ))
                            ) : (
                              <li className="italic">No direct matches.</li>
                            )}
                          </ul>
                        </div>

                        {/* Missing Skills */}
                        <div className="space-y-2.5">
                          <div className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-500" /> Missing Skills
                          </div>
                          <ul className="space-y-1.5 text-xs text-muted-foreground">
                            {rec.missingSkills && rec.missingSkills.length > 0 ? (
                              rec.missingSkills.slice(0, 3).map((skill: string, idx: number) => (
                                <li key={idx} className="flex items-center gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-amber-500" /> {skill}
                                </li>
                              ))
                            ) : (
                              <li className="italic text-emerald-500 font-semibold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> All skills possessed!
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>

                      {/* Expandable Accordion: Why this recommendation? */}
                      <div className="border border-border rounded-xl overflow-hidden bg-muted">
                        <button
                          onClick={(e) => toggleExpandCard(rec.career, e)}
                          className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-foreground hover:bg-muted transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <HelpCircle className="w-4 h-4 text-secondary" /> Why this recommendation?
                          </span>
                          <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 text-xs text-muted-foreground leading-relaxed text-left animate-in fade-in slide-in-from-top-1 duration-200">
                            {rec.reason}
                          </div>
                        )}
                      </div>

                      {/* Skills to Acquire Section with Skill Gap % & Tooltips */}
                      {rec.missingSkills && rec.missingSkills.length > 0 && (
                        <div className="space-y-2.5 pt-1 text-left">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Lightbulb className="w-4 h-4 text-amber-500" /> Key Skills to Acquire & Gap Assessment
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {rec.missingSkills.slice(0, 4).map((skill: string, i: number) => {
                              const gapPercent = calculateSkillGap(score, i);
                              return (
                                <span 
                                  key={i} 
                                  className="px-2.5 py-1 bg-secondary/20 text-primary rounded-lg text-xs font-medium border border-border flex items-center gap-1.5 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all duration-200 cursor-help"
                                  title={`Critical skill gap. Acquiring "${skill}" will reduce this ${gapPercent}% gap and improve your career match score.`}
                                >
                                  {skill} 
                                  <span className="font-bold text-amber-500 text-[10px] ml-0.5 bg-amber-500/10 px-1 rounded-sm border border-amber-500/10">{gapPercent}% Gap</span>
                                </span>
                              );
                            })}
                            {rec.missingSkills.length > 4 && (
                              <span className="px-2.5 py-1 bg-secondary/20 text-primary rounded-lg text-xs font-medium border border-border">
                                +{rec.missingSkills.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Roadmap Preview Display */}
                      {rec.roadmapPreview && rec.roadmapPreview.length > 0 && (
                        <div className="space-y-2.5 pt-1 text-left">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-secondary" /> Roadmap Preview Sequence
                          </p>
                          <div className="p-3 bg-muted border border-border rounded-xl flex items-center flex-wrap gap-2 text-xs">
                            {rec.roadmapPreview.map((step: string, sIdx: number) => (
                              <React.Fragment key={sIdx}>
                                <div className={`px-2.5 py-1.5 rounded-lg border font-semibold ${sIdx === rec.roadmapPreview.length - 1 ? 'bg-secondary/10 border-secondary/20 text-secondary' : 'bg-card border-border text-muted-foreground'}`}>
                                  {step}
                                </div>
                                {sIdx < rec.roadmapPreview.length - 1 && (
                                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Card Footer actions */}
                      <div className="px-4 py-3 bg-muted border border-border rounded-xl flex flex-col sm:flex-row gap-2 justify-between items-center transition-colors pt-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                        <Link to={`/roadmap?career=${encodeURIComponent(rec.career)}`} className="w-full sm:w-auto">
                          <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
                            View Roadmap <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                        
                        <Button 
                          variant={goalSet ? "secondary" : "ghost"}
                          size="sm"
                          disabled={updatingGoal === rec.career}
                          onClick={() => handleSetGoal(rec.career)}
                          className={`w-full sm:w-auto transition-all ${goalSet ? 'bg-green-500/10 text-green-600 border-green-500/20 opacity-100 hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/20' : 'text-muted-foreground hover:text-secondary'}`}
                          title={goalSet ? "Click to remove this goal" : "Click to set as career goal"}
                        >
                          {goalSet ? (
                            <><Check className="w-4 h-4 mr-1.5" /> Active Goal</>
                          ) : updatingGoal === rec.career ? (
                            <><Zap className="w-4 h-4 mr-1.5 animate-pulse" /> Updating...</>
                          ) : (
                            <><Target className="w-4 h-4 mr-1.5" /> Set as Goal</>
                          )}
                        </Button>
                      </div>

                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-1 xl:col-span-2 text-center py-20 text-muted-foreground flex flex-col items-center justify-center bg-muted border border-dashed border-border rounded-2xl">
                <Info className="w-12 h-12 text-muted-foreground mb-3" />
                <h3 className="font-heading text-xl font-bold text-foreground">No careers match your filter</h3>
                <p className="text-sm mt-1">Try changing your filter selection above or recalculating matches.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Empty State Experience when no recommendations exist */
        <div className="w-full max-w-2xl mx-auto py-16 animate-in zoom-in-95 duration-500">
          <Card className="border-dashed border-2 border-border bg-card backdrop-blur-sm shadow-none transition-colors duration-300 hover:border-secondary">
            <CardContent className="flex flex-col items-center justify-center p-10 md:p-16 text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border border-border text-primary relative">
                <BrainCircuit className="w-12 h-12" />
                <div className="absolute inset-0 rounded-full border border-border animate-ping opacity-25" />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-[28px] font-bold tracking-tight text-foreground font-heading">Discover Your Next Step</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Complete your profile to unlock AI-powered career recommendations, skill-gap analysis, and personalized learning roadmaps.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-2">
                <Link to="/profile" className="w-full sm:w-auto">
                  <Button 
                    size="lg"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md"
                  >
                    Complete Profile
                  </Button>
                </Link>
                <Button 
                  onClick={generateRecommendations} 
                  disabled={recLoading || cooldown > 0 || !userBranch}
                  variant="outline"
                  size="lg"
                  className="w-full hover:bg-muted border-border text-primary disabled:opacity-50"
                >
                  {recLoading ? 'Analyzing...' : cooldown > 0 ? `Please wait ${cooldown}s` : !userBranch ? 'Profile Incomplete' : 'Analyze Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Compare Careers Button (Sticky bar at bottom) */}
      {selectedForCompare.length >= 2 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[50] animate-in slide-in-from-bottom-8 duration-300">
          <div className="bg-popover/90 backdrop-blur-xl border border-secondary/20 px-6 py-4 rounded-full shadow-2xl flex items-center gap-4 border-l-4 border-l-secondary">
            <span className="text-xs font-bold text-foreground">
              ⚖ <span className="text-secondary">{selectedForCompare.length}</span> careers selected for comparison
            </span>
            <Button 
              onClick={() => setIsCompareModalOpen(true)}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-bold text-xs"
            >
              Compare Now
            </Button>
          </div>
        </div>
      )}

      {/* Career Comparison Modal */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-card border border-border w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center bg-card">
              <h2 className="text-[22px] font-semibold text-foreground flex items-center gap-2 font-heading">
                ⚖ Career Comparison Analysis
              </h2>
              <button 
                onClick={() => setIsCompareModalOpen(false)}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-x-auto overflow-y-auto max-h-[70vh] scrollbar-thin">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground font-bold uppercase tracking-wider">
                    <th className="pb-4 pt-2">Career Profile</th>
                    {selectedForCompare.map(title => (
                      <th key={title} className="pb-4 pt-2 px-4">{title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {/* Match score row */}
                  <tr>
                    <td className="py-4 font-bold text-muted-foreground text-xs uppercase">Compatibility Score</td>
                    {selectedForCompare.map(title => {
                      const rec = recommendations.find(r => r.career === title);
                      const score = getMatchScore(rec?.matchPercentage || '0%');
                      return (
                        <td key={title} className="py-4 px-4 font-black text-secondary text-base text-left">
                          {score}% <span className="text-xs font-semibold text-muted-foreground">({score}/100)</span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Fit type row */}
                  <tr>
                    <td className="py-4 font-bold text-muted-foreground text-xs uppercase">Fit Type</td>
                    {selectedForCompare.map(title => {
                      const rec = recommendations.find(r => r.career === title);
                      const score = getMatchScore(rec?.matchPercentage || '0%');
                      const scoreDetails = getScoreDetails(score);
                      return (
                        <td key={title} className="py-4 px-4 text-left">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${scoreDetails.colorClass}`}>
                            {scoreDetails.label}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Salary row */}
                  <tr>
                    <td className="py-4 font-bold text-muted-foreground text-xs uppercase">Salary Expectation</td>
                    {selectedForCompare.map(title => {
                      const rec = recommendations.find(r => r.career === title);
                      return (
                        <td key={title} className="py-4 px-4 font-semibold text-green-500 text-left">
                          {rec?.salaryIndia || 'N/A'}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Demand row */}
                  <tr>
                    <td className="py-4 font-bold text-muted-foreground text-xs uppercase">Market Demand</td>
                    {selectedForCompare.map(title => {
                      const rec = recommendations.find(r => r.career === title);
                      return (
                        <td key={title} className="py-4 px-4 text-left">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getDemandColorBadge(rec?.demandLevel || 'Moderate')}`}>
                            {rec?.demandLevel || 'Moderate'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Strong skills row */}
                  <tr>
                    <td className="py-4 font-bold text-muted-foreground text-xs uppercase">Possessed Skills</td>
                    {selectedForCompare.map(title => {
                      const rec = recommendations.find(r => r.career === title);
                      return (
                        <td key={title} className="py-4 px-4 text-left">
                          <div className="flex flex-wrap gap-1">
                            {(rec?.matchedSkills || []).slice(0, 4).map((s: string, idx: number) => (
                              <span key={idx} className="text-[10px] font-medium px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/10">{s}</span>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Missing skills row */}
                  <tr>
                    <td className="py-4 font-bold text-muted-foreground text-xs uppercase">Skills to Acquire</td>
                    {selectedForCompare.map(title => {
                      const rec = recommendations.find(r => r.career === title);
                      return (
                        <td key={title} className="py-4 px-4 text-left">
                          <div className="flex flex-wrap gap-1">
                            {(rec?.missingSkills || []).slice(0, 4).map((s: string, idx: number) => (
                              <span key={idx} className="text-[10px] font-medium px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded border border-amber-500/10">{s}</span>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Roadmap row */}
                  <tr>
                    <td className="py-4 font-bold text-muted-foreground text-xs uppercase">Education Roadmap</td>
                    {selectedForCompare.map(title => {
                      const rec = recommendations.find(r => r.career === title);
                      return (
                        <td key={title} className="py-4 px-4 text-xs font-semibold text-muted-foreground text-left">
                          {rec?.roadmapPreview?.join(' → ') || 'N/A'}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-border bg-muted flex justify-end">
              <Button 
                onClick={() => setIsCompareModalOpen(false)}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Close Comparison
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
