import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  Mic, Target, Brain, TrendingUp, Award, Clock, ChevronRight, ChevronDown,
  CheckCircle2, PlayCircle, StopCircle, RefreshCw, Star, MessageSquare, AlertCircle, Check, HelpCircle, Briefcase
} from 'lucide-react';

const InterviewPrep = () => {
  const { user } = useAuth();
  
  // Form State
  const [careerPath, setCareerPath] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [interviewType, setInterviewType] = useState('Mixed');
  const [questionCount, setQuestionCount] = useState(10);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  
  // Data State
  const [questions, setQuestions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Analysis State
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [analysisResults, setAnalysisResults] = useState<Record<string, any>>({});
  const [analyzingIds, setAnalyzingIds] = useState<Record<string, boolean>>({});
  
  // Mock Interview State
  const [isMockMode, setIsMockMode] = useState(false);
  const [currentMockIndex, setCurrentMockIndex] = useState(0);
  const [mockTimeElapsed, setMockTimeElapsed] = useState(0);
  const [flatQuestions, setFlatQuestions] = useState<{category: string, question: string, id: string}[]>([]);

  // Expanded Categories
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    technical: true,
    behavioral: true,
    situational: true,
    hr: true
  });

  useEffect(() => {
    // Fetch profile to pre-fill career goal
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const { data } = await axios.get('http://localhost:5000/api/users/profile', { headers });
        if (data?.careerGoals?.length > 0) {
          setCareerPath(data.careerGoals[0]);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isMockMode) {
      timer = setInterval(() => {
        setMockTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isMockMode]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!careerPath.trim()) {
      setError('Please enter a target career.');
      return;
    }
    
    setError('');
    setLoading(true);
    setQuestions(null);
    setIsMockMode(false);
    
    try {
      const { data } = await axios.post('http://localhost:5000/api/ai/interview', { 
        careerPath, 
        difficultyLevel: difficulty,
        interviewType,
        questionCount
      });
      
      setQuestions(data);
      
      // Flatten questions for mock mode
      const flat: {category: string, question: string, id: string}[] = [];
      Object.keys(data).forEach(category => {
        if (Array.isArray(data[category])) {
          data[category].forEach((q: string, idx: number) => {
            flat.push({ category, question: q, id: `${category}-${idx}` });
          });
        }
      });
      setFlatQuestions(flat);
      
    } catch (err: any) {
      console.error('Failed to generate interview questions', err);
      setError(err.response?.data?.message || 'Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeAnswer = async (questionStr: string, id: string) => {
    const answer = answers[id];
    if (!answer || !answer.trim()) return;

    setAnalyzingIds(prev => ({ ...prev, [id]: true }));
    
    try {
      const { data } = await axios.post('http://localhost:5000/api/ai/interview/analyze', {
        question: questionStr,
        answer: answer,
        careerPath: careerPath
      });
      
      setAnalysisResults(prev => ({ ...prev, [id]: data }));
    } catch (err) {
      console.error('Failed to analyze answer', err);
    } finally {
      setAnalyzingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const startMockInterview = () => {
    setIsMockMode(true);
    setCurrentMockIndex(0);
    setMockTimeElapsed(0);
  };

  const endMockInterview = () => {
    setIsMockMode(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Helper for score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-500 text-[16px]">
      {/* Hero Section */}
      <Card className="border-border bg-gradient-to-r from-primary/10 via-primary/5 to-card/60 backdrop-blur-xl shadow-xl relative overflow-hidden group border rounded-3xl">
        <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
        <CardContent className="p-10 flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
          <div className="space-y-6 text-left w-full md:w-3/5">
            <div>
              <span className="px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-primary-foreground bg-primary rounded-full shadow-md inline-block mb-4 animate-pulse">
                🎤 INTERVIEW COACH
              </span>
              <h1 className="text-[48px] font-bold tracking-tight text-foreground leading-tight" style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}>
                Interview Preparation
              </h1>
              <p className="text-[18px] text-muted-foreground mt-2 font-medium">
                Practice AI-generated interview questions, improve your communication skills, and prepare confidently for your dream career.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[16px] font-medium">
              <div className="p-5 rounded-2xl bg-card/50 border border-border flex flex-col justify-center shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Target className="w-5 h-5 text-secondary" /> Current Career Goal
                </div>
                <div className="font-semibold text-[18px] text-foreground truncate">
                  {careerPath || 'Not Set'}
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-card/50 border border-border flex flex-col justify-center shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="w-5 h-5 text-secondary" /> Interview Readiness
                </div>
                <div className="font-semibold text-[18px] text-foreground">
                  {questions ? 'Practicing' : 'Ready to Start'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex w-2/5 justify-end">
            <div className="w-64 h-64 bg-muted rounded-full flex items-center justify-center animate-pulse shadow-2xl border-4 border-card">
              <Mic className="w-24 h-24 text-secondary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Questions Practiced', value: Object.keys(analysisResults).length, icon: MessageSquare, color: 'text-secondary' },
          { label: 'Mock Sessions', value: isMockMode ? 1 : 0, icon: PlayCircle, color: 'text-secondary' },
          { label: 'Avg Accuracy', value: Object.keys(analysisResults).length > 0 ? `${Math.round(Object.values(analysisResults).reduce((acc, curr) => acc + curr.technicalAccuracy, 0) / Object.values(analysisResults).length)}%` : '-', icon: Target, color: 'text-secondary' },
          { label: 'Confidence Level', value: Object.keys(analysisResults).length > 0 ? `${Math.round(Object.values(analysisResults).reduce((acc, curr) => acc + curr.confidenceScore, 0) / Object.values(analysisResults).length)}%` : '-', icon: Star, color: 'text-secondary' },
        ].map((stat, i) => (
          <Card key={i} className="rounded-2xl border-border shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-card border ${stat.color.replace('text-', 'border-')}/20 shadow-sm`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <h3 className="text-2xl font-bold font-heading">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Generator Form & AI Coach */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="rounded-3xl shadow-md border-border overflow-hidden">
            <CardHeader className="bg-muted border-b border-border pb-6">
              <CardTitle className="font-heading text-[22px] flex items-center gap-2">
                <Brain className="w-5 h-5 text-secondary" /> Advanced Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <form onSubmit={handleGenerate} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-secondary" /> Target Career
                  </label>
                  <Input 
                    value={careerPath} 
                    onChange={(e) => setCareerPath(e.target.value)} 
                    placeholder="e.g. Frontend Developer" 
                    className="h-12 rounded-xl border-border bg-card"
                  />
                </div>
                
                <div className="space-y-2 relative">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Target className="w-5 h-5 text-secondary" /> Interview Type
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsTypeOpen(!isTypeOpen)}
                      className="flex h-12 w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all duration-300 hover:border-secondary/50 shadow-sm hover:shadow"
                    >
                      <span className="font-medium text-foreground">
                        {interviewType === 'Mixed' ? 'Mixed (All Types)' : interviewType}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isTypeOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isTypeOpen && (
                      <div className="absolute z-50 w-full mt-2 rounded-xl border border-border bg-card shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-1.5 flex flex-col gap-1">
                          {['Mixed', 'Technical', 'Behavioral', 'HR', 'Situational'].map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => { setInterviewType(type); setIsTypeOpen(false); }}
                              className={`relative flex w-full items-center rounded-lg py-2.5 px-3 text-sm font-medium transition-all duration-200 ${interviewType === type ? 'bg-secondary text-primary-foreground shadow-sm' : 'hover:bg-muted text-foreground'}`}
                            >
                              {type === 'Mixed' ? 'Mixed (All Types)' : type}
                              {interviewType === type && <Check className="w-4 h-4 ml-auto" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-secondary" /> Difficulty
                    </label>
                    <div className="flex p-1 bg-muted rounded-2xl w-full border border-border shadow-inner">
                      {['Beginner', 'Intermediate', 'Advanced'].map(diff => (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => setDifficulty(diff)}
                          className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all duration-300 truncate ${difficulty === diff ? 'bg-primary bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md scale-100' : 'text-muted-foreground hover:bg-card hover:text-foreground scale-[0.98]'}`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-secondary" /> Questions
                    </label>
                    <div className="flex gap-2">
                      {[5, 10, 20, 30].map(count => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setQuestionCount(count)}
                          className={`flex-1 py-2.5 text-sm font-bold rounded-xl border transition-all duration-300 ${questionCount === count ? 'bg-primary border-primary text-primary-foreground shadow-md ring-2 ring-primary/20 ring-offset-1 ring-offset-card scale-100' : 'bg-card border-border hover:border-primary text-muted-foreground hover:text-foreground hover:shadow-sm scale-[0.98]'}`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 text-red-500 text-sm rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-[16px] font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                  {loading ? (
                    <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Generating...</>
                  ) : (
                    <><RefreshCw className="w-5 h-5 mr-2" /> Generate Questions</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {questions && (
            <Card className="rounded-3xl shadow-md border-border bg-muted">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-secondary/20 rounded-lg"><Award className="w-6 h-6 text-secondary" /></div>
                  <h3 className="font-heading font-semibold text-[20px] text-foreground">AI Interview Coach</h3>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Based on your selection, focus on these areas:</p>
                  <ul className="space-y-2 text-sm font-medium">
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 shrink-0" /> Clear communication of technical concepts</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 shrink-0" /> Structured problem-solving approach</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 shrink-0" /> STAR method for behavioral answers</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Questions & Mock Mode */}
        <div className="lg:col-span-2">
          {!questions && !loading && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10 border-dashed border-2 border-border rounded-3xl bg-card backdrop-blur-sm transition-colors duration-300 hover:border-secondary">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border border-border text-primary relative mb-6">
                <MessageSquare className="w-12 h-12" />
                <div className="absolute inset-0 rounded-full border border-border animate-ping opacity-25" />
              </div>
              <h3 className="font-heading text-[28px] font-bold tracking-tight text-foreground mb-2">Ready to Practice?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                Select your career and generate personalized interview questions powered by AI. Get instant feedback on your answers to improve confidence.
              </p>
            </div>
          )}

          {loading && (
            <div className="space-y-6 animate-pulse">
              <div className="h-16 bg-muted rounded-2xl w-full" />
              <div className="h-32 bg-muted rounded-2xl w-full" />
              <div className="h-32 bg-muted rounded-2xl w-full" />
            </div>
          )}

          {questions && !isMockMode && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
                <div>
                  <h2 className="font-heading text-xl font-semibold">Your Interview Kit</h2>
                  <p className="text-sm text-muted-foreground">{flatQuestions.length} questions generated</p>
                </div>
                <Button onClick={startMockInterview} className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
                  <PlayCircle className="w-5 h-5" /> Start Mock Interview
                </Button>
              </div>

              {['technical', 'behavioral', 'situational', 'hr'].map((category) => {
                const catQuestions = questions[category];
                if (!catQuestions || catQuestions.length === 0) return null;
                
                const title = category.charAt(0).toUpperCase() + category.slice(1) + ' Questions';
                
                return (
                  <Card key={category} className="rounded-2xl border-border shadow-sm overflow-hidden">
                    <div 
                      className="flex items-center justify-between p-5 bg-muted cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => toggleCategory(category)}
                    >
                      <CardTitle className="font-heading text-[20px] font-semibold text-foreground flex items-center gap-2">
                        {category === 'technical' && <Target className="w-5 h-5 text-secondary" />}
                        {category === 'behavioral' && <Award className="w-5 h-5 text-secondary" />}
                        {title}
                        <span className="text-xs bg-card px-2 py-1 rounded-full border border-border ml-2">{catQuestions.length}</span>
                      </CardTitle>
                      {expandedCategories[category] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                    
                    {expandedCategories[category] && (
                      <CardContent className="p-0 border-t border-border divide-y divide-border">
                        {catQuestions.map((q: string, i: number) => {
                          const id = `${category}-${i}`;
                          const analysis = analysisResults[id];
                          const isAnalyzing = analyzingIds[id];
                          
                          return (
                            <div key={id} className="p-5 space-y-4">
                              <div className="flex gap-3">
                                <span className="font-bold text-muted-foreground mt-0.5">{i + 1}.</span>
                                <p className="font-medium text-[16px] text-foreground leading-relaxed">{q}</p>
                              </div>
                              
                              <div className="pl-6">
                                <textarea
                                  className="w-full min-h-[100px] p-3 rounded-xl border border-border bg-card text-sm focus:ring-2 focus:ring-secondary focus:outline-none resize-y"
                                  value={answers[id] || ''}
                                  onChange={(e) => setAnswers(prev => ({ ...prev, [id]: e.target.value }))}
                                />
                                <div className="mt-2 flex justify-end">
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleAnalyzeAnswer(q, id)}
                                    disabled={!answers[id] || isAnalyzing}
                                    className="rounded-lg"
                                  >
                                    {isAnalyzing ? 'Analyzing...' : 'Analyze Answer'}
                                  </Button>
                                </div>
                                
                                {analysis && (
                                  <div className="mt-4 p-4 rounded-xl bg-muted border border-border animate-in fade-in">
                                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                      <Brain className="w-4 h-4 text-secondary" /> AI Feedback
                                    </h4>
                                    
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                      <div className="bg-card p-2 rounded-lg text-center border border-border shadow-sm">
                                        <div className="text-xs text-muted-foreground mb-1">Communication</div>
                                        <div className={`font-bold ${getScoreColor(analysis.communicationScore)}`}>{analysis.communicationScore}%</div>
                                      </div>
                                      <div className="bg-card p-2 rounded-lg text-center border border-border shadow-sm">
                                        <div className="text-xs text-muted-foreground mb-1">Accuracy</div>
                                        <div className={`font-bold ${getScoreColor(analysis.technicalAccuracy)}`}>{analysis.technicalAccuracy}%</div>
                                      </div>
                                      <div className="bg-card p-2 rounded-lg text-center border border-border shadow-sm">
                                        <div className="text-xs text-muted-foreground mb-1">Clarity</div>
                                        <div className={`font-bold ${getScoreColor(analysis.clarityScore)}`}>{analysis.clarityScore}%</div>
                                      </div>
                                      <div className="bg-card p-2 rounded-lg text-center border border-border shadow-sm">
                                        <div className="text-xs text-muted-foreground mb-1">Confidence</div>
                                        <div className={`font-bold ${getScoreColor(analysis.confidenceScore)}`}>{analysis.confidenceScore}%</div>
                                      </div>
                                    </div>
                                    
                                    <p className="text-sm text-foreground leading-relaxed mb-3">
                                      {analysis.feedback}
                                    </p>
                                    
                                    {analysis.suggestions?.length > 0 && (
                                      <div className="space-y-1">
                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Suggestions</div>
                                        <ul className="space-y-1">
                                          {analysis.suggestions.map((s: string, idx: number) => (
                                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                              <span className="text-secondary mt-1">•</span> {s}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Mock Interview Mode */}
          {isMockMode && flatQuestions.length > 0 && (
            <Card className="rounded-3xl border-border shadow-xl overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="bg-primary p-4 flex justify-between items-center text-primary-foreground">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg animate-pulse">
                    <Mic className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-lg font-heading">Live Mock Interview</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 font-mono text-lg bg-black/20 px-3 py-1 rounded-lg">
                    <Clock className="w-4 h-4" /> {formatTime(mockTimeElapsed)}
                  </div>
                  <Button variant="ghost" size="sm" onClick={endMockInterview} className="hover:bg-white/20 text-white">
                    <StopCircle className="w-5 h-5 mr-2" /> End Session
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-8 space-y-8">
                <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                  <span className="uppercase tracking-wider text-secondary">{flatQuestions[currentMockIndex].category} Question</span>
                  <span>Question {currentMockIndex + 1} of {flatQuestions.length}</span>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-heading font-semibold text-foreground leading-tight">
                  {flatQuestions[currentMockIndex].question}
                </h2>
                
                <div className="pt-8">
                  <textarea
                    className="w-full min-h-[200px] p-5 rounded-2xl border-2 border-border bg-card text-[16px] focus:ring-4 focus:ring-secondary/20 focus:border-secondary focus:outline-none resize-y"
                    value={answers[flatQuestions[currentMockIndex].id] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [flatQuestions[currentMockIndex].id]: e.target.value }))}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="bg-muted p-6 flex justify-between items-center border-t border-border">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentMockIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentMockIndex === 0}
                  className="rounded-xl h-12 px-6"
                >
                  Previous
                </Button>
                
                <div className="flex gap-3">
                  <Button 
                    variant="secondary"
                    className="rounded-xl h-12 px-6 gap-2"
                    onClick={() => handleAnalyzeAnswer(flatQuestions[currentMockIndex].question, flatQuestions[currentMockIndex].id)}
                    disabled={!answers[flatQuestions[currentMockIndex].id] || analyzingIds[flatQuestions[currentMockIndex].id]}
                  >
                    <Brain className="w-4 h-4" /> Analyze
                  </Button>
                  
                  {currentMockIndex < flatQuestions.length - 1 ? (
                    <Button 
                      onClick={() => setCurrentMockIndex(prev => prev + 1)}
                      className="rounded-xl h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Next Question
                    </Button>
                  ) : (
                    <Button 
                      onClick={endMockInterview}
                      className="rounded-xl h-12 px-8 bg-secondary hover:bg-secondary/90 text-primary-foreground gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" /> Finish Interview
                    </Button>
                  )}
                </div>
              </CardFooter>
              
              {/* Show Analysis inline if it exists in Mock Mode */}
              {analysisResults[flatQuestions[currentMockIndex].id] && (
                <div className="mx-8 mb-8 p-6 rounded-2xl bg-muted border border-border animate-in slide-in-from-bottom-4">
                   <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-secondary" /> AI Evaluation
                  </h4>
                  <p className="text-foreground leading-relaxed mb-4">
                    {analysisResults[flatQuestions[currentMockIndex].id].feedback}
                  </p>
                </div>
              )}
            </Card>
          )}

        </div>
      </div>
    </div>
  );
};

export default InterviewPrep;
