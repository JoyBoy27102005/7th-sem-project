import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { Target, CheckCircle2, XCircle, Zap, AlertCircle, Activity, Search, ChevronDown } from 'lucide-react';
import { CAREER_GOALS_MAP } from '@/utils/careerConstants';

const SkillGap = () => {
  const [careerPath, setCareerPath] = useState('');
  const [careers, setCareers] = useState<any[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userBranch, setUserBranch] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCareersAndProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [careersRes, profileRes] = await Promise.all([
          axios.get('http://localhost:5000/api/careers', { headers }),
          axios.get('http://localhost:5000/api/users/profile', { headers })
        ]);
        setCareers(careersRes.data);
        setUserBranch(profileRes.data.branch || '');
        
        if (profileRes.data?.careerGoals?.length > 0) {
          setCareerPath(profileRes.data.careerGoals[0]);
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    fetchCareersAndProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!careerPath) {
      setError('Please select a career path.');
      return;
    }
    setLoading(true);
    setError('');
    setGapAnalysis(null);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await axios.post('http://localhost:5000/api/ai/skill-gap', { targetCareerTitle: careerPath }, { headers });
      setGapAnalysis(data);
    } catch (err: any) {
      console.error('Failed to analyze skill gap', err);
      setError(err.response?.data?.message || 'Failed to analyze skill gap. Make sure the career title exists.');
    } finally {
      setLoading(false);
    }
  };

  const allowedCareers = userBranch && CAREER_GOALS_MAP[userBranch] ? CAREER_GOALS_MAP[userBranch] : [];
  
  const filteredCareers = careers.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = allowedCareers.length > 0 ? allowedCareers.includes(c.title) : true;
    return matchesSearch && matchesBranch;
  });

  const existingCount = gapAnalysis?.existingSkills?.length || 0;
  const missingCount = gapAnalysis?.missingSkills?.length || 0;
  const totalSkills = existingCount + missingCount;
  const matchPercentage = totalSkills === 0 ? 0 : Math.round((existingCount / totalSkills) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-muted text-primary">
              <Target className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}>Skill Gap Analysis</h1>
          </div>
          <p className="text-muted-foreground max-w-xl">
            Compare your current skills against your target career to uncover exactly what you need to learn.
          </p>
        </div>
      </div>

      <Card className="border-border bg-card/40 backdrop-blur-sm shadow-xl shadow-primary/5 relative z-30">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="space-y-2 flex-1 w-full" ref={dropdownRef}>
              <label className="text-sm font-semibold text-foreground/90">Target Career</label>
              
              <div className="relative">
                <div 
                  className={`w-full flex items-center justify-between h-11 rounded-md border ${isDropdownOpen ? 'border-secondary ring-2 ring-secondary/20' : 'border-border'} bg-card/50 px-3 py-2 text-sm cursor-pointer hover:border-primary/40 transition-colors`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className={careerPath ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                    {careerPath || 'Search and select a career...'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl">
                    <div className="p-3 border-b border-border bg-muted flex items-center gap-2">
                      <Search className="w-4 h-4 text-muted-foreground" />
                      <input 
                        type="text" 
                        placeholder="Type to search careers..." 
                        className="w-full bg-transparent border-none focus:outline-none text-sm placeholder:text-muted-foreground text-foreground"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1.5 scrollbar-thin">
                      {filteredCareers.length > 0 ? (
                        filteredCareers.map((c) => (
                          <div 
                            key={c._id || c.title}
                            className={`px-3 py-2.5 text-sm rounded-lg cursor-pointer flex items-center transition-colors ${careerPath === c.title ? 'bg-secondary/10 text-secondary font-medium' : 'hover:bg-muted text-foreground'}`}
                            onClick={() => {
                              setCareerPath(c.title);
                              setIsDropdownOpen(false);
                              setSearchQuery('');
                              setError('');
                            }}
                          >
                            {c.title}
                            {careerPath === c.title && <CheckCircle2 className="w-4 h-4 ml-auto text-secondary" />}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-8 text-sm text-center text-muted-foreground flex flex-col items-center justify-center">
                          <Search className="w-8 h-8 text-muted-foreground mb-2" />
                          No careers found matching "{searchQuery}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto h-11 px-8 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 transition-all hover:scale-105"
            >
              {loading ? (
                <><Zap className="w-4 h-4 mr-2 animate-pulse" /> Analyzing...</>
              ) : (
                <><Activity className="w-4 h-4 mr-2" /> Analyze Gap</>
              )}
            </Button>
          </form>
          {error && (
            <div className="mt-4 p-3 text-sm bg-destructive/10 text-destructive rounded-lg border border-destructive/20 flex items-center gap-2 animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
        </CardContent>
      </Card>

      {gapAnalysis && (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
          
          {/* Summary Progress Bar */}
          <Card className="border-border bg-card/40 backdrop-blur-sm overflow-hidden">
             <CardContent className="p-6">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h3 className="text-lg font-bold">Skill Readiness</h3>
                    <p className="text-sm text-muted-foreground">Based on the requirements for <span className="font-semibold text-foreground">{careerPath}</span></p>
                  </div>
                  <div className="text-2xl font-bold text-secondary">{matchPercentage}%</div>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden mt-4">
                  <div 
                    className="h-full bg-gradient-to-r from-secondary to-secondary/80 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${matchPercentage}%` }}
                  />
                </div>
             </CardContent>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Existing Skills */}
            <Card className="border-border bg-card/40 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow flex flex-col">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="p-6 border-b border-border bg-green-500/5 flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 text-green-600 rounded-lg">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Acquired Skills</h3>
                    <p className="text-sm text-muted-foreground">Skills you already possess</p>
                  </div>
                </div>
                <div className="p-6 flex-1">
                  {existingCount > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {gapAnalysis.existingSkills.map((s: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 rounded-full text-sm font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No matching skills found in your profile.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Missing Skills */}
            <Card className="border-border bg-card/40 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow flex flex-col">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="p-6 border-b border-border bg-orange-500/5 flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 text-orange-600 rounded-lg">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Skills to Learn</h3>
                    <p className="text-sm text-muted-foreground">Missing areas to focus on</p>
                  </div>
                </div>
                <div className="p-6 flex-1">
                  {missingCount > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {gapAnalysis.missingSkills.map((s: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20 rounded-full text-sm font-medium flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5" /> {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <p className="font-medium text-foreground">You have all required skills!</p>
                      <p className="text-sm mt-1">You are perfectly aligned for this career.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillGap;
