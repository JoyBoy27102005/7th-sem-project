import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { 
  Map as MapIcon, CheckCircle2, Zap, AlertCircle, Route, Search, ChevronDown, 
  Target, Clock, Brain, Circle, Bot, ArrowRight, Trophy, Activity, Lightbulb,
  BookOpen, Video, FileText, Award
} from 'lucide-react';

// Helper: always read token from the 'user' object stored in localStorage
const getAuthHeaders = () => {
  const storedUser = localStorage.getItem('user');
  const token = storedUser ? JSON.parse(storedUser).token : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper: normalize Gemini response — handles both [] and { roadmap: [] } shapes
const normalizeRoadmapData = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.roadmap)) return data.roadmap;
  if (data && Array.isArray(data.phases)) return data.phases;
  if (data && Array.isArray(data.months)) return data.months;
  if (data && Array.isArray(data.plan)) return data.plan;
  // If it's an object with numbered keys, convert to array
  if (data && typeof data === 'object') {
    const values = Object.values(data);
    if (values.length > 0 && values.every((v: any) => v && typeof v === 'object')) return values as any[];
  }
  return [];
};

const Roadmap = () => {
  const location = useLocation();
  
  // Core state
  const [careerPath, setCareerPath] = useState('');
  const [duration, setDuration] = useState('6');
  const [pace, setPace] = useState('Balanced');
  
  const [careers, setCareers] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  
  const [roadmap, setRoadmap] = useState<any[]>([]);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState('');

  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Insights
  const [careerReadiness, setCareerReadiness] = useState<number>(0);
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [matchedSkills, setMatchedSkills] = useState<string[]>([]);

  // Sync career from URL param
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const careerParam = queryParams.get('career');
    if (careerParam) setCareerPath(careerParam);
  }, [location]);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = getAuthHeaders();
        
        const [careersRes, profileRes, recsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/careers', { headers }),
          axios.get('http://localhost:5000/api/users/profile', { headers }),
          axios.get('http://localhost:5000/api/recommendations', { headers })
        ]);
        
        setCareers(careersRes.data);
        setProfile(profileRes.data);
        
        const recs = recsRes.data || [];
        setRecommendations(recs);

        // Single source of truth: Profile's active career goal
        const activeGoalName = profileRes.data.careerGoals?.[0] || '';
        setCareerPath(prev => prev || activeGoalName);

        // Load saved roadmap if it matches current goal
        try {
          const savedRes = await axios.get('http://localhost:5000/api/ai/roadmap/saved', { headers });
          if (savedRes.data) {
            const goalToCheck = activeGoalName;
            if (savedRes.data.targetCareerTitle === goalToCheck) {
              setDuration(savedRes.data.duration?.toString() || '6');
              setPace(savedRes.data.pace || 'Balanced');
              const normalized = normalizeRoadmapData(savedRes.data.roadmapData);
              setRoadmap(normalized);
            }
          }
        } catch (_) {
          // Normal if no roadmap is saved yet
        }

      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    fetchData();
  }, []);

  // Dynamic skill gap calculation whenever careerPath changes
  useEffect(() => {
    const fetchSkillGap = async () => {
      if (!careerPath) return;

      const rec = recommendations.find((r: any) => r.career === careerPath);
      const headers = getAuthHeaders();

      try {
        const { data } = await axios.post(
          'http://localhost:5000/api/ai/skill-gap',
          { targetCareerTitle: careerPath },
          { headers }
        );
        setMatchedSkills(data.existingSkills || []);
        setMissingSkills(data.missingSkills || []);

        if (rec) {
          setCareerReadiness(parseInt(rec.matchPercentage.match(/\d+/)?.[0] || '0'));
        } else {
          setCareerReadiness(0);
        }
      } catch (_) {
        if (rec) {
          setCareerReadiness(parseInt(rec.matchPercentage.match(/\d+/)?.[0] || '0'));
          setMissingSkills(rec.missingSkills || []);
          setMatchedSkills(rec.matchedSkills || []);
        } else {
          setCareerReadiness(0);
          setMissingSkills([]);
          setMatchedSkills([]);
        }
      }
    };

    fetchSkillGap();
  }, [careerPath, recommendations, profile]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Pre-flight validation
    if (!profile) {
      setError('Please complete your profile before generating a roadmap.');
      return;
    }
    if (!careerPath) {
      setError('Please select a target career.');
      return;
    }
    if (!duration) {
      setError('Please enter a duration.');
      return;
    }

    const headers = getAuthHeaders();
    if (!Object.keys(headers).length) {
      setError('You are not authenticated. Please log in again.');
      return;
    }

    setLoading(true);
    setLoadingStage(0);
    setError('');
    setRoadmap([]);
    setExpandedTopic(null);

    const loadingInterval = setInterval(() => {
      setLoadingStage(prev => {
        if (prev >= 3) { clearInterval(loadingInterval); return 3; }
        return prev + 1;
      });
    }, 1500);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/ai/roadmap',
        { targetCareerTitle: careerPath, duration: parseInt(duration), pace },
        { headers }
      );

      // CRITICAL FIX: normalize the response — Gemini may return { roadmap: [] } or plain []
      const normalized = normalizeRoadmapData(response.data);
      if (normalized.length === 0) {
        setError('Roadmap was generated but returned no phases. Please try again.');
      } else {
        setRoadmap(normalized);
      }
    } catch (err: any) {
      const serverData = err.response?.data || {};
      const exactError = serverData.message || err.message || 'Unknown error';
      setError(`Failed to generate roadmap: ${exactError}`);
    } finally {
      clearInterval(loadingInterval);
      setLoading(false);
      setLoadingStage(0);
    }
  };

  const getResourceIcon = (type: string) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('course')) return <BookOpen className="w-4 h-4 text-blue-500" />;
    if (t.includes('video') || t.includes('youtube')) return <Video className="w-4 h-4 text-red-500" />;
    if (t.includes('project')) return <Activity className="w-4 h-4 text-emerald-500" />;
    if (t.includes('cert')) return <Award className="w-4 h-4 text-amber-500" />;
    return <FileText className="w-4 h-4 text-purple-500" />;
  };

  const filteredCareers = careers.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const projectedReadiness = Math.min(100, careerReadiness + Math.round((missingSkills.length * 2.5)));

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* 1. HERO SECTION */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-secondary/10 via-secondary/5 to-card border border-secondary/20 shadow-xl p-10 md:p-14">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/20 blur-[100px] rounded-full pointer-events-none -mt-20 -mr-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-lg">
              <MapIcon className="w-6 h-6" />
            </div>
            <h1 className="text-[42px] font-extrabold tracking-tight text-foreground font-heading">Learning Roadmap</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl font-medium leading-relaxed mb-8">
            Build a personalized AI-powered learning journey designed to help you achieve your dream career efficiently.
          </p>
          
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex flex-col bg-card/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-border">
              <span className="text-muted-foreground font-bold uppercase tracking-wider text-[11px] mb-1">Current Goal</span>
              <span className="font-extrabold text-foreground text-base">{profile?.careerGoals?.[0] || 'Not Set'}</span>
            </div>
            <div className="flex flex-col bg-card/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-border">
              <span className="text-muted-foreground font-bold uppercase tracking-wider text-[11px] mb-1">Career Readiness</span>
              <span className="font-extrabold text-secondary text-base">{careerReadiness}%</span>
            </div>
            <div className="flex flex-col bg-card/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-border">
              <span className="text-muted-foreground font-bold uppercase tracking-wider text-[11px] mb-1">Roadmap Status</span>
              <span className="font-extrabold text-amber-500 text-base">{roadmap.length > 0 ? 'In Progress' : 'Not Started'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. INSIGHT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/40 backdrop-blur-sm border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Target className="w-8 h-8 text-secondary mb-3" />
            <span className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">Target Career</span>
            <span className="text-base font-extrabold text-foreground mt-1 truncate w-full">{careerPath || 'None Selected'}</span>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-sm border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Activity className="w-8 h-8 text-secondary mb-3" />
            <span className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">Career Readiness</span>
            <span className="text-base font-extrabold text-foreground mt-1">{careerReadiness}% Current</span>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-sm border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Brain className="w-8 h-8 text-secondary mb-3" />
            <span className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">Skills To Learn</span>
            <span className="text-base font-extrabold text-foreground mt-1">{missingSkills.length} Missing</span>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-sm border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Clock className="w-8 h-8 text-secondary mb-3" />
            <span className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">Est. Completion</span>
            <span className="text-base font-extrabold text-foreground mt-1">{roadmap.length > 0 ? `${duration} Months` : 'Pending'}</span>
          </CardContent>
        </Card>
      </div>

      {/* 3. GENERATOR CARD */}
      <Card className="border-border bg-card/60 backdrop-blur-md shadow-xl overflow-visible relative z-30">
        <CardHeader className="border-b border-border pb-6 bg-muted">
          <CardTitle className="font-heading text-[22px] flex items-center gap-2">
            <Zap className="w-5 h-5 text-secondary" /> Roadmap Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleGenerate} className="space-y-8">
            
            {/* Target Career Dropdown */}
            <div className="space-y-3" ref={dropdownRef}>
              <label className="text-[14px] font-extrabold text-foreground">Target Career</label>
              <div className="relative">
                <div 
                  className={`w-full flex items-center justify-between h-14 rounded-xl border ${isDropdownOpen ? 'border-secondary ring-4 ring-secondary/10' : 'border-border hover:border-primary'} bg-card/80 px-4 py-2 text-[15px] cursor-pointer transition-all shadow-sm`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className={careerPath ? 'text-foreground font-bold' : 'text-muted-foreground font-medium'}>
                    {careerPath || 'Search your dream career...'}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {isDropdownOpen && (
                  <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 border-b border-border">
                      <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search careers..."
                          className="flex-1 bg-transparent text-[14px] outline-none text-foreground placeholder:text-muted-foreground"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                      {filteredCareers.length > 0 ? filteredCareers.map((career: any) => (
                        <div
                          key={career._id || career.title}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-[14px] font-medium ${careerPath === career.title ? 'bg-secondary/10 text-secondary font-bold' : 'hover:bg-muted text-foreground'}`}
                          onClick={() => { setCareerPath(career.title); setIsDropdownOpen(false); setSearchQuery(''); }}
                        >
                          {careerPath === career.title && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                          {career.title}
                        </div>
                      )) : (
                        <div className="text-center text-[13px] text-muted-foreground py-6">No careers found for "{searchQuery}"</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Duration & Pace */}
            <div className="flex flex-col md:flex-row gap-8">
              <div className="space-y-3 flex-1">
                <label className="text-[14px] font-extrabold text-foreground">Duration (Months)</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full h-[52px] px-4 rounded-xl border border-border bg-card text-[15px] font-bold text-foreground focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all shadow-sm"
                    placeholder="Enter months (1-24)"
                  />
                </div>
              </div>

              <div className="space-y-3 flex-1">
                <label className="text-[14px] font-extrabold text-foreground">Learning Pace</label>
                <div className="flex p-1.5 bg-muted rounded-xl border border-border">
                  {['Slow', 'Balanced', 'Accelerated'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setPace(val)}
                      className={`flex-1 py-2.5 text-[14px] font-bold rounded-lg transition-all ${pace === val ? 'bg-card shadow-md text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error display */}
            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 flex items-center gap-3 font-semibold text-[14px] animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Loading / Generate Button */}
            {loading ? (
              <div className="bg-muted border border-border rounded-2xl p-6 flex flex-col items-center justify-center space-y-4">
                <Zap className="w-8 h-8 text-secondary animate-bounce" />
                <div className="text-[16px] font-bold text-foreground text-center h-6">
                  {loadingStage === 0 && "🧠 AI is analyzing your profile..."}
                  {loadingStage === 1 && "📊 Evaluating skill gaps..."}
                  {loadingStage === 2 && "🎯 Building personalized roadmap..."}
                  {loadingStage >= 3 && "🚀 Finalizing recommendations..."}
                </div>
                <div className="w-full max-w-md bg-muted rounded-full h-2 overflow-hidden border border-border">
                  <div 
                    className="bg-secondary h-full transition-all duration-1000 ease-in-out"
                    style={{ width: `${(loadingStage + 1) * 25}%` }}
                  />
                </div>
              </div>
            ) : (
              <Button 
                type="submit" 
                className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 text-[16px] font-extrabold rounded-xl"
              >
                <Route className="w-5 h-5 mr-2" /> Generate AI Roadmap
              </Button>
            )}

          </form>
        </CardContent>
      </Card>

      {/* 4. EMPTY STATE — only when not loading and no roadmap */}
      {!loading && roadmap.length === 0 && !error && (
        <div className="py-20 flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in-95 duration-700">
          <div className="w-32 h-32 mb-8 relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-card to-primary/5 border border-border shadow-2xl rounded-3xl flex items-center justify-center transform rotate-3">
              <MapIcon className="w-16 h-16 text-secondary" />
            </div>
          </div>
          <h3 className="font-heading text-[28px] font-bold text-foreground mb-3">Your personalized learning roadmap is waiting.</h3>
          <p className="text-[16px] text-muted-foreground font-medium max-w-lg mb-8 leading-relaxed">
            Select a career goal and generate an AI-powered roadmap tailored to your skills and experience. Start your journey today!
          </p>
          <Button 
            onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
            size="lg"
            className="h-12 px-8 font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-105"
          >
            Go Generate Roadmap
          </Button>
        </div>
      )}

      {/* 5. RESULTS SECTION */}
      {roadmap.length > 0 && (
        <div className="animate-in slide-in-from-bottom-8 duration-700 space-y-8 pt-8 border-t border-border">
          
          {/* Results Overview */}
          <div className="bg-card/50 backdrop-blur-md border border-border rounded-3xl p-8 flex flex-wrap gap-10 items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest">Roadmap Overview</span>
              <h2 className="font-heading text-[32px] font-extrabold text-foreground">{careerPath}</h2>
            </div>
            <div className="flex gap-8">
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-muted-foreground uppercase">Duration</span>
                <span className="font-extrabold text-[20px]">{duration} Months</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-muted-foreground uppercase">Current Readiness</span>
                <span className="font-extrabold text-[20px] text-secondary">{careerReadiness}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-muted-foreground uppercase">Expected Readiness</span>
                <span className="font-extrabold text-[20px] text-emerald-500">{projectedReadiness}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Timeline Column */}
            <div className="xl:col-span-2 space-y-6">
              <div className="relative border-l-2 border-border ml-6 space-y-10 pb-8">
                {roadmap.map((monthData: any, monthIdx: number) => (
                  <div key={monthIdx} className="relative pl-10">
                    {/* Node Dot */}
                    <div className="absolute left-[-17px] top-0 w-8 h-8 rounded-full bg-card border-4 border-secondary shadow-secondary/50 flex items-center justify-center">
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    </div>
                    
                    <Card className="bg-card/60 backdrop-blur-md border-border shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-secondary/80 to-secondary/20 opacity-80"></div>
                      <CardHeader className="pb-4 pt-6">
                        <CardTitle className="font-heading text-[24px] font-bold text-foreground">
                          {monthData.month || monthData.title || monthData.phase || `Phase ${monthIdx + 1}`}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <h4 className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4" /> Learning Milestones
                        </h4>
                        
                        {(monthData.topics || monthData.skills || monthData.items || monthData.content || []).map((topicName: string, topicIdx: number) => (
                          <div key={topicIdx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                            <div className="w-2 h-2 rounded-full bg-secondary shrink-0 mt-2"></div>
                            <span className="text-[15px] font-bold text-foreground leading-snug">{topicName}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel: AI Coach & Skill Gap */}
            <div className="space-y-6">
              
              {/* AI Coach Panel */}
              <Card className="border-border bg-gradient-to-b from-primary/5 to-card shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-muted rounded-bl-full blur-xl pointer-events-none" />
                <CardHeader className="pb-4 border-b border-border bg-card/40">
                  <CardTitle className="font-heading text-[20px] font-bold flex items-center gap-2">
                    <Bot className="w-6 h-6 text-secondary" /> AI Career Coach
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="p-4 rounded-xl bg-card border border-border shadow-sm relative text-sm font-medium leading-relaxed text-foreground">
                    <div className="absolute -left-2 top-4 w-4 h-4 rotate-45 bg-card border-l border-b border-border" />
                    "I have customized this <b>{duration}-month</b> plan based on your goal to become a <b>{careerPath}</b>. Your learning pace is set to <b>{pace}</b>."
                  </div>
                  
                  {missingSkills.length > 0 && (
                    <div className="p-4 rounded-xl bg-card border border-border shadow-sm relative text-sm font-medium leading-relaxed text-foreground">
                      <div className="absolute -left-2 top-4 w-4 h-4 rotate-45 bg-card border-l border-b border-border" />
                      "I recommend focusing on <b className="text-secondary">{missingSkills[0]}</b> first. Mastering this skill can increase your readiness by an estimated <b>+8%</b>."
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Skill Gap Analysis */}
              <Card className="border-border bg-card/60 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-4 border-b border-border">
                  <CardTitle className="font-heading text-[20px] font-bold flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-amber-500" /> Skill Gap Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  
                  <div>
                    <h4 className="text-[12px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4" /> Matched Skills ({matchedSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {matchedSkills.map((skill, idx) => (
                        <div key={idx} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[13px] font-bold">
                          {skill}
                        </div>
                      ))}
                      {matchedSkills.length === 0 && <span className="text-sm text-muted-foreground">No matched skills.</span>}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h4 className="text-[12px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4" /> Priority Missing Skills ({missingSkills.length})
                    </h4>
                    <div className="space-y-3">
                      {missingSkills.slice(0, 5).map((skill, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                          <span className="text-[14px] font-bold text-foreground">{skill}</span>
                          <span className="text-[11px] font-extrabold text-secondary bg-secondary/10 px-2 py-1 rounded-md">+{Math.floor(Math.random() * 5) + 5}% Impact</span>
                        </div>
                      ))}
                      {missingSkills.length === 0 && <span className="text-sm text-muted-foreground">You have all required skills!</span>}
                      {missingSkills.length > 5 && (
                        <div className="text-center text-[12px] font-bold text-muted-foreground pt-2">
                          + {missingSkills.length - 5} more skills
                        </div>
                      )}
                    </div>
                  </div>

                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roadmap;
