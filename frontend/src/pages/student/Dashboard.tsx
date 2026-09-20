import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  ResponsiveContainer, Tooltip 
} from 'recharts';
import { 
  Briefcase, FileText, Zap, TrendingUp, Target, Award, User, 
  ChevronRight, CheckCircle2, AlertTriangle, AlertCircle, Coins, 
  Layers, ArrowRight, X, Sparkles, BookOpen, Clock, Activity, 
  ShieldAlert, Bell, Sparkle, ShieldCheck, Check, Map
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalcLoading, setRecalcLoading] = useState(false);
  const [recalcCooldown, setRecalcCooldown] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (recalcCooldown > 0) {
      const timer = setTimeout(() => setRecalcCooldown(recalcCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [recalcCooldown]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const [profileRes, recsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users/profile', { headers }),
        axios.get('http://localhost:5000/api/recommendations', { headers })
      ]);
      setProfile(profileRes.data);
      setRecommendations(profileRes.data?.branch ? (recsRes.data || []) : []);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    if (recalcCooldown > 0 || recalcLoading) return;
    setRecalcLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.post('http://localhost:5000/api/recommendations/recommend', {}, { headers });
      const [profileRes, recsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users/profile', { headers }),
        axios.get('http://localhost:5000/api/recommendations', { headers })
      ]);
      setProfile(profileRes.data);
      setRecommendations(profileRes.data?.branch ? (recsRes.data || []) : []);
      setRecalcCooldown(5);
    } catch (error) {
      console.error('Failed to recalculate matches', error);
    } finally {
      setRecalcLoading(false);
    }
  };

  // Helper: Profile Strength
  const calculateProfileStrength = (prof: any): number => {
    if (!prof) return 0;
    let strength = 0;
    if (prof.degree) strength += 20;
    if (prof.branch) strength += 20;
    if (prof.cgpa) strength += 15;
    if (prof.skills && prof.skills.length > 0) {
      strength += Math.min(20, prof.skills.length * 2);
    }
    if (prof.interests && prof.interests.length > 0) {
      strength += Math.min(15, prof.interests.length * 3);
    }
    if (prof.careerGoals && prof.careerGoals.length > 0) {
      strength += 10;
    }
    return strength;
  };
  const profileStrength = calculateProfileStrength(profile);

  // Helper: Match score helper
  const getMatchScore = (matchStr: string) => {
    const match = matchStr?.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  // Active Goal Match Percentage (Readiness Score)
  const activeGoalName = profile?.careerGoals?.[0];
  const activeGoalRec = recommendations.find(r => r.career === activeGoalName);
  const bestMatchRec = recommendations.length > 0 ? recommendations[0] : null;
  
  const readinessScore = activeGoalRec 
    ? getMatchScore(activeGoalRec.matchPercentage) 
    : (bestMatchRec ? getMatchScore(bestMatchRec.matchPercentage) : 0);

  const activeGoalTitle = activeGoalName || (bestMatchRec ? bestMatchRec.career : 'Set Career Goal');

  // Next Milestone (Immediate skill gap)
  const missingSkillsList = activeGoalRec?.missingSkills || bestMatchRec?.missingSkills || [];
  const nextMilestone = missingSkillsList[0] || (profile?.skills?.length > 0 ? 'Review Matches' : 'Add Profile Skills');

  // Estimated Time Achievement
  const timeEstimate = missingSkillsList.length === 0 
    ? (profile?.careerGoals?.length > 0 ? 'Ready for Application' : 'Goal Unset') 
    : `${missingSkillsList.length * 2} Weeks`;

  // Roadmap Progress calculation
  const possessedCount = profile?.skills?.length || 0;
  const missingCount = missingSkillsList.length;
  const totalCount = possessedCount + missingCount;
  const roadmapProgressPercent = totalCount > 0 ? Math.round((possessedCount / totalCount) * 100) : 0;

  // Radar chart data helper
  const getRadarData = (skills: string[] = []) => {
    const categories = [
      { subject: 'Communication', matchers: ['communicat', 'write', 'english', 'speak', 'public speaking', 'negotiation', 'present', 'content'] },
      { subject: 'Technical Skills', matchers: ['code', 'programm', 'develop', 'databas', 'cloud', 'git', 'engineer', 'web', 'react', 'python', 'javascript', 'node', 'java', 'html', 'css', 'software', 'technology'] },
      { subject: 'Problem Solving', matchers: ['problem', 'solving', 'algo', 'structur', 'analys', 'analytic', 'math', 'logic', 'critical thinking', 'quantitative'] },
      { subject: 'Industry Skills', matchers: ['practice', 'industry', 'clinical', 'patient', 'medical', 'dental', 'legal', 'law', 'corporate', 'tax', 'audit', 'accounting', 'gst', 'design'] },
      { subject: 'Leadership', matchers: ['lead', 'manag', 'scrum', 'agile', 'hr', 'director', 'project', 'operation', 'team', 'consult'] },
      { subject: 'Research', matchers: ['research', 'scienc', 'thesis', 'laborat', 'biolog', 'physic', 'chemist', 'statist'] }
    ];

    return categories.map(cat => {
      const matches = skills.filter(s => 
        cat.matchers.some(m => s.toLowerCase().includes(m))
      );
      const score = Math.min(95, Math.max(30, 40 + matches.length * 15 + (skills.length > 0 ? (skills.length % 7) : 0)));
      return {
        subject: cat.subject,
        A: score,
        fullMark: 100
      };
    });
  };

  const radarData = getRadarData(profile?.skills || []);

  // Checklist Steps
  const checklistSteps = [
    { id: 'profile', name: 'Profile Completed', completed: !!profile?.degree, label: 'Add Degree, CGPA & Branch' },
    { id: 'skills', name: 'Skills Added', completed: (profile?.skills?.length || 0) > 0, label: 'Add skills on profile tab' },
    { id: 'analysis', name: 'Career Analysis Generated', completed: recommendations.length > 0 && !!profile?.branch, label: 'Recalculate matches' },
    { id: 'roadmap', name: 'Learning Roadmap Started', completed: (profile?.careerGoals?.length || 0) > 0, label: 'Add at least one career goal' },
    { id: 'resume', name: 'Resume Uploaded', completed: !!profile?.resume?.fileName || (profile?.resume?.atsScore || 0) > 0, label: 'Analyze resume on ATS page' },
    { id: 'interview', name: 'Interview Preparation', completed: (profile?.skills?.length || 0) > 3, label: 'Add 3+ skills for practice prep' },
    { id: 'job_ready', name: 'Job Ready', completed: readinessScore >= 75, label: 'Reach 75%+ readiness score' }
  ];
  const completedStepsCount = checklistSteps.filter(s => s.completed).length;
  const goalProgressPercent = Math.round((completedStepsCount / checklistSteps.length) * 100);

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse pb-12">
        <div className="h-48 bg-muted rounded-3xl w-full" />
        <div className="h-16 bg-muted rounded-2xl w-full" />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-muted rounded-3xl" />
          <div className="h-96 bg-muted rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16 relative animate-in fade-in duration-500 text-[16px]">
      
      {/* Row 1: Hero Section */}
      <Card className="border border-border bg-card shadow-xl relative overflow-hidden group rounded-3xl">
        <div className="absolute inset-0 bg-grid-[hsl(var(--primary))]/[0.02] pointer-events-none" />
        <CardContent className="p-10 md:p-12 flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
          
          <div className="space-y-6 text-left w-full md:w-3/5">
            <div>
              <span className="px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-primary-foreground bg-primary rounded-full shadow-md inline-block mb-4 animate-pulse">
                🚀 AI CAREER COMMAND CENTER
              </span>
              <h1 className="text-[48px] font-bold tracking-tight text-foreground leading-tight" style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}>
                👋 Welcome Back, <span className="text-secondary">{user?.name?.split(' ')[0] || 'User'}</span>
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[16px] font-medium">
              <div className="p-5 rounded-2xl bg-background border border-border flex flex-col justify-center shadow-sm">
                <span className="text-muted-foreground text-[14px] uppercase tracking-wider font-bold">🎯 Current Career Goal</span>
                <span className="font-extrabold text-foreground mt-1 truncate max-w-[280px] text-lg" title={activeGoalTitle}>{activeGoalTitle}</span>
              </div>
              <div className="p-5 rounded-2xl bg-background border border-border flex flex-col justify-center shadow-sm">
                <span className="text-muted-foreground text-[14px] uppercase tracking-wider font-bold">🏆 Next Milestone</span>
                <span className="font-extrabold text-secondary mt-1 truncate max-w-[280px] text-lg" title={nextMilestone}>{nextMilestone}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-[14px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>Profile Strength</span>
                <span className="text-secondary font-black">{profileStrength}%</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-secondary rounded-full transition-all duration-1000" 
                  style={{ width: `${profileStrength}%` }}
                />
              </div>
              <div className="flex justify-between text-[14px] text-muted-foreground">
                <span>Estimated Target: <span className="font-semibold text-foreground">{timeEstimate}</span></span>
                <span>Completeness Status</span>
              </div>
            </div>
          </div>

          {/* Large circular progress ring */}
          <div className="relative flex items-center justify-center w-40 h-40 md:w-48 md:h-48 bg-background rounded-full border border-border shadow-2xl shrink-0 group transition-transform duration-300 hover:scale-105">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 overflow-visible">
              <circle cx="50" cy="50" r="40" stroke="hsl(var(--primary))" strokeWidth="8" fill="transparent" className="opacity-10" />
              <circle cx="50" cy="50" r="40" stroke="hsl(var(--secondary))" strokeWidth="10" strokeLinecap="round" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * readinessScore) / 100} className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl md:text-5xl font-black text-foreground tracking-tight">{readinessScore}%</span>
              <span className="text-[12px] font-bold text-muted-foreground uppercase mt-1">Readiness</span>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Row 2: Quick Actions Bar */}
      <div className="text-left space-y-4">
        <h3 className="text-[15px] font-bold text-muted-foreground uppercase tracking-widest pl-1">⚡ Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Link to="/profile">
            <Button variant="outline" className="group w-full h-14 justify-center font-semibold text-base bg-card text-primary border-border hover:bg-primary hover:text-primary-foreground hover:border-primary rounded-2xl shadow-sm flex gap-3 px-5 transition-all hover:scale-[1.02]">
              <User className="w-5 h-5 text-secondary shrink-0" />
              <span>Update Profile</span>
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            onClick={handleRecalculate}
            disabled={recalcLoading || recalcCooldown > 0}
            className="group w-full h-14 justify-center font-semibold text-base bg-card text-primary border-border hover:bg-primary hover:text-primary-foreground hover:border-primary rounded-2xl shadow-sm flex gap-3 px-5 transition-all hover:scale-[1.02]"
          >
            <Zap className={`w-5 h-5 text-secondary shrink-0 ${recalcLoading ? 'animate-bounce' : ''}`} />
            <span>{recalcLoading ? 'Analyzing...' : recalcCooldown > 0 ? `Wait ${recalcCooldown}s` : 'Generate Analysis'}</span>
          </Button>

          <Link to="/roadmap">
            <Button variant="outline" className="group w-full h-14 justify-center font-semibold text-base bg-card text-primary border-border hover:bg-primary hover:text-primary-foreground hover:border-primary rounded-2xl shadow-sm flex gap-3 px-5 transition-all hover:scale-[1.02]">
              <Layers className="w-5 h-5 text-secondary shrink-0" />
              <span>Continue Roadmap</span>
            </Button>
          </Link>

          <Link to="/resume">
            <Button variant="outline" className="group w-full h-14 justify-center font-semibold text-base bg-card text-primary border-border hover:bg-primary hover:text-primary-foreground hover:border-primary rounded-2xl shadow-sm flex gap-3 px-5 transition-all hover:scale-[1.02]">
              <FileText className="w-5 h-5 text-secondary shrink-0" />
              <span>Upload Resume</span>
            </Button>
          </Link>

          <Link to="/interview">
            <Button variant="outline" className="group w-full h-14 justify-center font-semibold text-base bg-card text-primary border-border hover:bg-primary hover:text-primary-foreground hover:border-primary rounded-2xl shadow-sm flex gap-3 px-5 transition-all hover:scale-[1.02]">
              <Target className="w-5 h-5 text-secondary shrink-0" />
              <span>Interview Practice</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Row 3: 6 KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {/* KPI 1: Career Match */}
        <Card className="border border-border bg-card hover:border-secondary/50 transition-all hover:shadow-lg relative overflow-hidden group rounded-2xl">
          <div className="absolute top-0 right-0 w-14 h-14 bg-muted rounded-bl-full flex items-center justify-center">
            <Award className="w-5 h-5 text-secondary transition-colors" />
          </div>
          <CardContent className="p-6 flex flex-col justify-between h-full text-left relative z-10">
            <div className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pr-12">🎯 Best Match</div>
            <div className="mt-4">
              <div className="text-[18px] font-extrabold text-foreground truncate" title={bestMatchRec?.career || 'N/A'}>
                {bestMatchRec?.career || 'N/A'}
              </div>
              <div className="text-[12px] text-secondary font-semibold mt-1">Rank #1 Match Score</div>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Career Readiness */}
        <Card className="border border-border bg-card hover:border-secondary/50 transition-all hover:shadow-lg relative overflow-hidden group rounded-2xl">
          <div className="absolute top-0 right-0 w-14 h-14 bg-muted rounded-bl-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-secondary transition-colors" />
          </div>
          <CardContent className="p-6 flex flex-col justify-between h-full text-left relative z-10">
            <div className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pr-12">📈 Readiness</div>
            <div className="mt-4">
              <div className="text-2xl font-black text-foreground">{readinessScore}%</div>
              <div className="text-[12px] text-secondary font-semibold mt-1">Goal compatibility</div>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Skill Gaps */}
        <Card className="border border-border bg-card hover:border-secondary/50 transition-all hover:shadow-lg relative overflow-hidden group rounded-2xl">
          <div className="absolute top-0 right-0 w-14 h-14 bg-muted rounded-bl-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-secondary transition-colors" />
          </div>
          <CardContent className="p-6 flex flex-col justify-between h-full text-left relative z-10">
            <div className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pr-12">⚠ Skill Gaps</div>
            <div className="mt-4">
              <div className="text-2xl font-black text-foreground">{missingSkillsList.length}</div>
              <div className="text-[12px] text-secondary font-semibold mt-1">Skills to acquire</div>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Expected Salary */}
        <Card className="border border-border bg-card hover:border-secondary/50 transition-all hover:shadow-lg relative overflow-hidden group rounded-2xl">
          <div className="absolute top-0 right-0 w-14 h-14 bg-muted rounded-bl-full flex items-center justify-center">
            <Coins className="w-5 h-5 text-secondary transition-colors" />
          </div>
          <CardContent className="p-6 flex flex-col justify-between h-full text-left relative z-10">
            <div className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pr-12">💰 Avg Salary</div>
            <div className="mt-4">
              <div className="text-[18px] font-extrabold text-foreground truncate">
                {activeGoalRec?.salaryIndia || bestMatchRec?.salaryIndia || 'N/A'}
              </div>
              <div className="text-[12px] text-secondary font-semibold mt-1">Average in India</div>
            </div>
          </CardContent>
        </Card>

        {/* KPI 5: Market Demand */}
        <Card className="border border-border bg-card hover:border-secondary/50 transition-all hover:shadow-lg relative overflow-hidden group rounded-2xl">
          <div className="absolute top-0 right-0 w-14 h-14 bg-muted rounded-bl-full flex items-center justify-center">
            <Zap className="w-5 h-5 text-secondary transition-colors" />
          </div>
          <CardContent className="p-6 flex flex-col justify-between h-full text-left relative z-10">
            <div className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pr-12">🔥 Market Demand</div>
            <div className="mt-4">
              <div className="text-[18px] font-extrabold text-foreground truncate">
                {activeGoalRec?.demandLevel || bestMatchRec?.demandLevel || 'N/A'}
              </div>
              <div className="text-[12px] text-secondary font-semibold mt-1">Growth potential</div>
            </div>
          </CardContent>
        </Card>

        {/* KPI 6: Roadmap Progress */}
        <Card className="border border-border bg-card hover:border-secondary/50 transition-all hover:shadow-lg relative overflow-hidden group rounded-2xl">
          <div className="absolute top-0 right-0 w-14 h-14 bg-muted rounded-bl-full flex items-center justify-center">
            <Layers className="w-5 h-5 text-secondary transition-colors" />
          </div>
          <CardContent className="p-6 flex flex-col justify-between h-full text-left relative z-10">
            <div className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pr-12">📚 Roadmap</div>
            <div className="mt-4">
              <div className="text-2xl font-black text-foreground">{roadmapProgressPercent}%</div>
              <div className="text-[12px] text-secondary font-semibold mt-1">Goal completion</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Skill Radar Chart & AI Recommendation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Skill Radar Chart */}
        <Card className="lg:col-span-7 border border-border bg-card shadow-xl p-8 rounded-3xl">
          <CardHeader className="pb-4 text-left p-0">
            <CardTitle className="text-[24px] font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-6 h-6 text-secondary" /> Skill Radar Profile matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[380px] flex items-center justify-center relative p-0">
            {profile?.skills?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" r="80%" data={radarData}>
                  <PolarGrid stroke="hsl(var(--primary))" strokeOpacity={0.1} />
                  <PolarAngleAxis dataKey="subject" stroke="hsl(var(--foreground))" fontSize={12} fontWeight="600" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(var(--primary))" strokeOpacity={0.1} tick={false} />
                  <Radar name={user?.name || 'Student'} dataKey="A" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="hsl(var(--primary))" fillOpacity={0.15} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))', fontSize: '13px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] w-[90%] flex flex-col items-center justify-center text-center p-8 border-dashed border-2 border-border rounded-3xl bg-card transition-colors duration-300 hover:border-secondary">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border border-border text-primary relative mb-5">
                  <Target className="w-10 h-10" />
                  <div className="absolute inset-0 rounded-full border border-border animate-ping opacity-25" />
                </div>
                <h3 className="font-heading text-xl font-bold tracking-tight text-foreground mb-1">No skills database mapped</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                  Configure profile skills to visualize distribution matrices.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Recommendation Next Step Panel */}
        <Card className="lg:col-span-5 border border-border bg-card shadow-xl flex flex-col justify-between p-10 rounded-3xl">
          <CardHeader className="pb-4 text-left p-0">
            <CardTitle className="text-[24px] font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-secondary animate-pulse" /> AI Recommended Next Step
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-left flex-1 flex flex-col justify-between p-0 mt-4">
            {missingSkillsList.length > 0 ? (
              <>
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-secondary border border-secondary/80 flex flex-col shadow-md">
                    <span className="text-[12px] font-bold text-primary-foreground/90 uppercase tracking-widest">Recommended Skill Target</span>
                    <span className="text-[22px] font-black text-primary-foreground mt-1">{nextMilestone} Fundamentals</span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">AI Justification Rationale</span>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      Acquiring <strong>{nextMilestone}</strong> represents the most high-impact gap in your alignment parameters. Finishing this specific milestone closes your current gap and prepares you for core operations in the {activeGoalTitle} field.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4 text-[14px] font-semibold">
                    <div className="px-3.5 py-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
                      <Sparkle className="w-4 h-4 fill-current" /> +10% Target Match Boost
                    </div>
                    <div className="px-3.5 py-2.5 bg-muted text-foreground rounded-xl border border-border flex items-center gap-1.5 shadow-sm">
                      <Clock className="w-4 h-4 text-secondary" /> 2 Weeks Target
                    </div>
                  </div>

                  <Link to="/roadmap">
                    <Button className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-semibold text-base flex items-center justify-center gap-2 rounded-2xl transition-all hover:scale-[1.02]">
                      Start Learning Module <ChevronRight className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full py-8">
                <Check className="w-16 h-16 text-secondary bg-secondary/10 p-3 rounded-full border border-secondary/20 mb-4" />
                <h4 className="font-extrabold text-foreground text-lg">Target Readiness Met!</h4>
                <p className="text-sm text-muted-foreground mt-2 max-w-[320px] leading-relaxed">
                  You possess all mapped skills required for your active career goal. Proceed to resume analyzer.
                </p>
                <Link to="/resume" className="mt-6 w-full">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold h-14 rounded-2xl transition-all hover:scale-[1.02]">Upload Resume</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Row 5: Top Career Matches & Learning Roadmap Preview */}
      {/* Row 5: Top Career Matches & Learning Roadmap Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Career Matches */}
        <Card className="border border-border bg-card shadow-xl flex flex-col justify-between p-8 rounded-3xl">
          <CardHeader className="pb-4 text-left p-0">
            <CardTitle className="text-[24px] font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-secondary" /> Top Career Matches
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-left flex-1 flex flex-col justify-between p-0 mt-4">
            <div className="divide-y divide-border space-y-4">
              {recommendations.slice(0, 3).map((rec, rIdx) => (
                <div key={rIdx} className="py-4 flex justify-between items-center gap-4 first:pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-black text-muted-foreground">#{rIdx + 1}</span>
                      <span 
                        className="text-[24px] font-bold text-foreground hover:text-secondary transition-colors cursor-pointer" 
                        onClick={() => navigate('/recommendations')}
                      >
                        {rec.career}
                      </span>
                    </div>
                    <div className="flex gap-3 text-[14px] font-semibold">
                      <span className="text-primary bg-muted px-2.5 py-1 rounded-lg border border-border">{rec.salaryIndia}</span>
                      <span className="text-primary bg-muted px-2.5 py-1 rounded-lg border border-border">{rec.demandLevel} Demand</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[28px] font-black text-secondary bg-secondary/10 px-4 py-2 rounded-2xl border border-secondary/20">{rec.matchPercentage}</span>
                  </div>
                </div>
              ))}
              {recommendations.length === 0 && (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No matches compiled yet. Trigger analysis to view recommendations.
                </div>
              )}
            </div>

            <Link to="/recommendations" className="block w-full pt-4">
              <Button variant="outline" className="w-full text-base font-semibold h-14 bg-card text-primary border-border hover:bg-primary hover:text-primary-foreground hover:border-primary rounded-2xl transition-all hover:scale-[1.02]">
                View All Recommendations
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Learning Roadmap Preview */}
        <Card className="border border-border bg-card shadow-xl flex flex-col justify-between p-8 rounded-3xl">
          <CardHeader className="pb-4 text-left p-0">
            <CardTitle className="text-[24px] font-semibold text-foreground flex items-center gap-2">
              <Layers className="w-6 h-6 text-secondary" /> Learning Roadmap Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-left flex-1 flex flex-col justify-between p-0 mt-4">
            <div className="space-y-4">
              {bestMatchRec?.roadmapPreview && bestMatchRec.roadmapPreview.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {bestMatchRec.roadmapPreview.slice(0, 3).map((step: string, sIdx: number) => (
                    <div key={sIdx} className="flex items-center gap-4 py-4 px-5 bg-muted border border-border rounded-2xl">
                      <div className="w-8 h-8 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center text-xs font-black text-secondary shrink-0">
                        {sIdx + 1}
                      </div>
                      <span className="text-base font-bold text-foreground truncate">{step}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col items-center justify-center text-center p-8 border-dashed border-2 border-border rounded-3xl bg-card transition-colors duration-300 hover:border-secondary">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border border-border text-primary relative mb-4">
                      <Map className="w-8 h-8" />
                      <div className="absolute inset-0 rounded-full border border-border animate-ping opacity-25" />
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs font-medium">
                      Enroll in a career path to display targeted roadmap sequences.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center text-[14px] font-bold text-muted-foreground uppercase pt-2 border-t border-border">
                <span>Roadmap Progress Score</span>
                <span className="text-secondary font-black">{roadmapProgressPercent}%</span>
              </div>
            </div>

            <Link to="/roadmap" className="block w-full pt-4">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base h-14 flex items-center justify-center gap-2 rounded-2xl shadow-md transition-all hover:scale-[1.02]">
                Continue Learning <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

      </div>

      {/* Row 6: ATS Score Section & Career Journey Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ATS Score Optimization Center */}
        <Card className="border border-border bg-card shadow-xl flex flex-col justify-between p-8 rounded-3xl min-h-[380px]">
          <CardHeader className="pb-4 text-left p-0">
            <CardTitle className="text-[24px] font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6 text-secondary" /> ATS Resume Optimization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-left flex-1 flex flex-col justify-center p-0 mt-4">
            {profile?.resume?.fileName || (profile?.resume?.atsScore || 0) > 0 ? (
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-muted border border-border my-auto">
                <div className="relative flex items-center justify-center w-24 h-24 bg-secondary/10 rounded-full border border-secondary/20 shrink-0">
                  <span className="text-3xl font-black text-secondary">{profile.resume.atsScore || 0}%</span>
                </div>
                <div className="space-y-2 flex-1">
                  <h4 className="font-extrabold text-base text-foreground">ATS Benchmark Rating</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Resume file <strong>{profile.resume.fileName || 'profile_resume.pdf'}</strong> was parsed successfully. Optimize parameters to reach 85%+ readiness score.
                  </p>
                  <div className="text-[12px] text-emerald-600 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/10 inline-block mt-1">
                    ✓ Parser Synced
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 my-auto">
                <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-center">
                  <ShieldAlert className="w-14 h-14 text-rose-500/60 mx-auto mb-3" />
                  <h4 className="font-bold text-base text-foreground">No Resume Synced</h4>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-[360px] mx-auto">
                    Upload and optimize your resume to unlock automated ATS checks:
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm font-semibold text-muted-foreground pl-4">
                  <div className="flex items-center gap-2">✓ ATS Score Assessment</div>
                  <div className="flex items-center gap-2">✓ Keyword Feedback</div>
                  <div className="flex items-center gap-2">✓ AI Job Matching</div>
                  <div className="flex items-center gap-2">✓ Skill Gap Checks</div>
                </div>
              </div>
            )}

            <Link to="/resume" className="block w-full pt-4">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base h-14 rounded-2xl shadow-md transition-all hover:scale-[1.02]">
                Upload & Optimize Resume
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Career Goal Progress Journey Tracker */}
        <Card className="border border-border bg-card shadow-xl flex flex-col justify-between p-8 rounded-3xl">
          <CardHeader className="pb-4 text-left p-0">
            <CardTitle className="text-[24px] font-semibold text-foreground flex items-center gap-2">
              <Target className="w-6 h-6 text-secondary" /> Career Journey Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-left flex-1 flex flex-col justify-between p-0 mt-4">
            <div className="space-y-4 w-full">
              <div className="flex justify-between items-center text-[14px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>Journey Completeness</span>
                <span className="text-secondary font-black">{goalProgressPercent}%</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-secondary rounded-full transition-all duration-500" 
                  style={{ width: `${goalProgressPercent}%` }}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {checklistSteps.map((step, sIdx) => (
                  <div 
                    key={sIdx} 
                    className={`p-4 rounded-2xl border text-sm flex items-center gap-3 ${
                      step.completed 
                        ? 'bg-secondary/10 border-secondary/30 text-foreground' 
                        : 'bg-muted border-border text-muted-foreground'
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-border shrink-0" />
                    )}
                    <div className="truncate flex-1">
                      <div className="font-extrabold text-sm leading-tight truncate">{step.name}</div>
                      <div className="text-[12px] text-muted-foreground mt-1 truncate">{step.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
};

export default Dashboard;
