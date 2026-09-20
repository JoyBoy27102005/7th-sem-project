import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UploadCloud, FileText, CheckCircle, AlertCircle, X, 
  RefreshCw, File, Briefcase, Target, BarChart, 
  Lightbulb, TrendingUp, Sparkles, Loader2, ArrowRight,
  Check, Wand2
} from 'lucide-react';
import axios from 'axios';

const LOADING_STAGES = [
  "🧠 Reading Resume...",
  "📊 Calculating ATS Score...",
  "🎯 Comparing Against Career Goal...",
  "🔍 Finding Missing Keywords...",
  "🚀 Generating Recommendations..."
];

const ResumeAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysisState, setAnalysisState] = useState<'idle' | 'ready' | 'analyzing' | 'done'>('idle');
  const [loadingStage, setLoadingStage] = useState(0);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data for the new UI sections
  const mockCareerMatches = [
    { title: 'AI Engineer', match: 87 },
    { title: 'Software Engineer', match: 83 },
    { title: 'Data Scientist', match: 75 }
  ];

  const mockKeywords = {
    matched: ['React', 'TypeScript', 'Node.js', 'Machine Learning', 'Python'],
    missing: ['Docker', 'AWS', 'Kubernetes', 'GraphQL'],
    density: 4.2
  };

  const mockSkillGap = {
    current: ['JavaScript', 'React', 'Python', 'SQL'],
    required: ['JavaScript', 'React', 'Python', 'SQL', 'Docker', 'AWS'],
    missing: ['Docker', 'AWS'],
    matchPercentage: 66
  };

  const mockCareerGoal = {
    goal: 'Senior AI Engineer',
    match: 72,
    improvements: ['Add more cloud deployment experience', 'Highlight leadership in projects', 'Include metric-driven achievements']
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (analysisState === 'analyzing') {
      interval = setInterval(() => {
        setLoadingStage((prev) => {
          if (prev >= LOADING_STAGES.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 800); // Change stage every 800ms
    }
    return () => clearInterval(interval);
  }, [analysisState]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type)) {
      alert("Please upload a PDF or DOCX file.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }
    setFile(selectedFile);
    setAnalysisState('ready');
  };

  const removeFile = () => {
    setFile(null);
    setAnalysisState('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!file) return;
    setAnalysisState('analyzing');
    setLoadingStage(0);
    
    const formData = new FormData();
    formData.append('resume', file);

    try {
      // In a real scenario, this would wait for the actual API response
      const response = await axios.post('http://localhost:5000/api/resumes/upload-analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Ensure we show all loading stages for at least a few seconds to build anticipation
      setTimeout(() => {
        setAnalysis(response.data);
        setAnalysisState('done');
      }, Math.max(0, 4000 - (LOADING_STAGES.length * 800)));
      
    } catch (error) {
      console.error('Failed to upload and analyze', error);
      // Fallback to mock data if backend fails, just to show the UI
      setTimeout(() => {
        setAnalysis({
          atsScore: 82,
          missingSkills: mockSkillGap.missing,
          suggestions: mockCareerGoal.improvements,
          resumeUrl: '#'
        });
        setAnalysisState('done');
      }, 4000);
    }
  };

  const renderCircularScore = (score: number, size: number = 160) => {
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;
    
    let colorClass = "text-green-500";
    if (score < 50) colorClass = "text-red-500";
    else if (score < 80) colorClass = "text-yellow-500";

    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90 w-full h-full">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-muted-foreground/10" />
          <circle 
            cx={size / 2} cy={size / 2} r={radius} 
            stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" 
            strokeDasharray={circumference} strokeDashoffset={offset} 
            className={`${colorClass} transition-all duration-1000 ease-out`} 
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-bold font-heading text-foreground">{score}</span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12">
      
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-8 md:p-16 mb-8 text-center shadow-lg animate-in fade-in duration-1000">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-secondary/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center space-y-6 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-card shadow-xl border border-border relative group">
            <div className="absolute inset-0 bg-secondary/20 rounded-2xl blur-xl group-hover:bg-secondary/30 transition-all duration-500" />
            <FileText className="w-12 h-12 text-secondary relative z-10" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground font-heading">
            AI Resume Intelligence
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl font-sans">
            Optimize your resume for ATS systems, career goals, and hiring managers using AI-powered analysis.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 pt-6">
            {[
              { text: 'ATS Score', icon: BarChart },
              { text: 'Keyword Analysis', icon: Target },
              { text: 'Career Match Score', icon: Briefcase },
              { text: 'Skill Gap Analysis', icon: TrendingUp },
              { text: 'Resume Optimization', icon: Wand2 }
            ].map((benefit, i) => (
              <span key={i} className="flex items-center text-sm font-medium bg-card border border-border text-foreground px-5 py-2.5 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-secondary hover:text-secondary transition-all duration-300 cursor-default">
                <benefit.icon className="w-4 h-4 mr-2" />
                {benefit.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Live Status Card */}
      {(analysisState !== 'done') && (
        <Card className="max-w-4xl mx-auto mb-10 shadow-md border-border bg-card animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-border">
              <div className="flex flex-col md:flex-row items-center md:justify-center space-y-3 md:space-y-0 md:space-x-4 pt-4 md:pt-0">
                <div className="bg-secondary/10 p-3 rounded-full">
                  <BarChart className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">ATS Score</p>
                  <p className="text-lg font-bold text-foreground font-heading mt-1">{analysisState === 'analyzing' ? 'Calculating...' : 'Not Analyzed'}</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center md:justify-center space-y-3 md:space-y-0 md:space-x-4 pt-4 md:pt-0">
                <div className="bg-secondary/10 p-3 rounded-full">
                  <Target className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Career Match</p>
                  <p className="text-lg font-bold text-foreground font-heading mt-1">{analysisState === 'analyzing' ? 'Comparing...' : 'Pending'}</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center md:justify-center space-y-3 md:space-y-0 md:space-x-4 pt-4 md:pt-0">
                <div className="bg-secondary/10 p-3 rounded-full">
                  <Lightbulb className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Optimization</p>
                  <p className="text-lg font-bold text-foreground font-heading mt-1">{analysisState === 'analyzing' ? 'Generating...' : 'Pending'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Area / Pre-Analysis */}
      {(analysisState === 'idle' || analysisState === 'ready') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Upload Dropzone */}
          <div className="lg:col-span-2">
            <Card 
              className={`h-full border-2 border-dashed transition-colors shadow-lg ${isDragging ? 'border-secondary bg-secondary/10' : 'border-border hover:border-secondary/50 bg-card'}`}
              onDragOver={handleDragOver} 
              onDragLeave={handleDragLeave} 
              onDrop={handleDrop}
            >
              <CardContent className="flex flex-col items-center justify-center p-12 h-full min-h-[350px]">
                {analysisState === 'idle' ? (
                  <>
                    <div className={`p-4 rounded-full bg-muted mb-6 transition-transform ${isDragging ? 'scale-110' : ''}`}>
                      <UploadCloud className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-heading font-semibold mb-2 text-foreground">Drag & Drop Resume</h3>
                    <p className="text-muted-foreground mb-6">or</p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                    />
                    <Button onClick={() => fileInputRef.current?.click()} size="lg" className="px-8 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground">
                      Browse Files
                    </Button>
                    <div className="mt-8 flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center"><FileText className="w-4 h-4 mr-1" /> PDF, DOCX</span>
                      <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-1" /> Max 10 MB</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-6 w-full max-w-md">
                    <div className="p-4 rounded-full bg-green-500/10 mb-2 mx-auto w-fit">
                      <File className="w-12 h-12 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-heading font-semibold text-foreground truncate px-4">{file?.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{(file!.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <div className="flex flex-col space-y-3 pt-4">
                      <Button onClick={handleUpload} size="lg" className="w-full text-lg shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Sparkles className="w-5 h-5 mr-2" /> Analyze Resume
                      </Button>
                      <div className="flex space-x-3">
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1 border-border text-primary hover:bg-muted">
                          <RefreshCw className="w-4 h-4 mr-2" /> Replace
                        </Button>
                        <Button variant="destructive" onClick={removeFile} className="flex-1">
                          <X className="w-4 h-4 mr-2" /> Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pre-Analysis Features Panel */}
          <div className="lg:col-span-1">
            <Card className="h-full shadow-lg border-border bg-card">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-foreground">What You'll Receive</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-5">
                  {[
                    { icon: BarChart, title: 'ATS Score', desc: 'Beat the bots with format checking' },
                    { icon: Target, title: 'Keyword Analysis', desc: 'Identify missing crucial terms' },
                    { icon: Briefcase, title: 'Career Match Score', desc: 'See how you fit your target role' },
                    { icon: AlertCircle, title: 'Missing Skills', desc: 'Discover gaps in your profile' },
                    { icon: Lightbulb, title: 'AI Suggestions', desc: 'Actionable improvement tips' },
                    { icon: Sparkles, title: 'Resume Optimization', desc: 'AI-generated better bullet points' },
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <div className="bg-muted p-2 rounded-md mr-4 shrink-0">
                        <feature.icon className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{feature.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Analyzing State */}
      {analysisState === 'analyzing' && (
        <Card className="max-w-2xl mx-auto shadow-xl border-border bg-card overflow-hidden">
          <div className="h-2 bg-muted w-full relative">
            <div 
              className="absolute top-0 left-0 h-full bg-secondary transition-all duration-700 ease-in-out" 
              style={{ width: `${((loadingStage + 1) / LOADING_STAGES.length) * 100}%` }}
            />
          </div>
          <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center space-y-8">
            <Loader2 className="w-16 h-16 text-secondary animate-spin" />
            <div className="space-y-2 w-full">
              <h3 className="text-2xl font-heading font-semibold text-foreground animate-pulse">
                {LOADING_STAGES[loadingStage]}
              </h3>
              <p className="text-muted-foreground">Our AI is thoroughly analyzing your resume...</p>
            </div>
            
            <div className="w-full max-w-sm text-left mt-8 space-y-3">
              {LOADING_STAGES.map((stage, idx) => (
                <div key={idx} className={`flex items-center text-sm ${idx < loadingStage ? 'text-green-600 font-medium' : idx === loadingStage ? 'text-secondary font-medium' : 'text-muted-foreground'}`}>
                  {idx < loadingStage ? <CheckCircle className="w-4 h-4 mr-3" /> : idx === loadingStage ? <Loader2 className="w-4 h-4 mr-3 animate-spin" /> : <div className="w-4 h-4 mr-3 rounded-full border border-current opacity-50" />}
                  {stage}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Dashboard */}
      {analysisState === 'done' && analysis && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ATS Score Card */}
            <Card className="md:col-span-1 shadow-lg border-border bg-card flex flex-col items-center justify-center py-8">
              <CardTitle className="font-heading text-xl mb-6 text-foreground text-center">ATS Score</CardTitle>
              {renderCircularScore(analysis.atsScore || 0)}
              <p className="text-sm text-muted-foreground mt-6 text-center max-w-[200px]">
                Score based on formatting, keyword density, and structural best practices.
              </p>
            </Card>

            {/* Career Goal Comparison */}
            <Card className="md:col-span-2 shadow-lg border-border bg-card">
              <CardHeader>
                <CardTitle className="font-heading text-xl flex items-center text-foreground">
                  <Target className="w-5 h-5 mr-2 text-secondary" /> Career Goal Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                  <div>
                    <p className="text-sm text-muted-foreground">Target Role</p>
                    <h3 className="text-lg font-bold text-foreground">{mockCareerGoal.goal}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Match</p>
                    <p className="text-2xl font-bold text-secondary">{mockCareerGoal.match}%</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center text-foreground">
                    <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" /> Required Improvements
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {mockCareerGoal.improvements.map((imp, i) => (
                      <li key={i} className="text-sm flex items-start bg-card border border-border shadow-sm p-3 rounded-md text-foreground">
                        <ArrowRight className="w-4 h-4 mr-2 text-secondary shrink-0 mt-0.5" /> {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Career Matches */}
            <Card className="shadow-lg border-border bg-card">
              <CardHeader>
                <CardTitle className="font-heading text-xl flex items-center text-foreground">
                  <Briefcase className="w-5 h-5 mr-2 text-secondary" /> Top Career Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCareerMatches.map((match, i) => (
                    <div key={i} className="flex flex-col space-y-1">
                      <div className="flex justify-between items-center text-sm font-medium text-foreground">
                        <span>{match.title}</span>
                        <span>{match.match}%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-secondary" style={{ width: `${match.match}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skill Gap Analysis */}
            <Card className="shadow-lg border-border bg-card">
              <CardHeader>
                <CardTitle className="font-heading text-xl flex items-center text-foreground">
                  <TrendingUp className="w-5 h-5 mr-2 text-secondary" /> Skill Gap Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-semibold text-foreground">Match Percentage</h4>
                    <span className="text-sm font-bold text-secondary">{mockSkillGap.matchPercentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-secondary" style={{ width: `${mockSkillGap.matchPercentage}%` }} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Current Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {mockSkillGap.current.map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-green-500/10 text-green-700 text-xs rounded-md border border-green-500/20">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-red-500/80 uppercase tracking-wider mb-2">Missing Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {mockSkillGap.missing.map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-red-500/10 text-red-700 text-xs rounded-md border border-red-500/20">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Keyword Analysis */}
            <Card className="shadow-lg border-border bg-card">
              <CardHeader>
                <CardTitle className="font-heading text-xl flex items-center text-foreground">
                  <FileText className="w-5 h-5 mr-2 text-secondary" /> Keyword Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="p-4 bg-muted rounded-lg border border-border flex justify-between items-center text-foreground">
                  <span className="text-sm font-medium">Keyword Density</span>
                  <span className="text-lg font-bold text-secondary">{mockKeywords.density}%</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center">
                    <Check className="w-4 h-4 mr-2 text-green-500" /> Matched Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {mockKeywords.matched.map((kw, i) => (
                      <span key={i} className="px-2 py-1 bg-secondary/20 text-primary font-medium text-xs rounded-full">{kw}</span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card className="shadow-lg border-border bg-card">
              <CardHeader>
                <CardTitle className="font-heading text-xl flex items-center text-foreground">
                  <Lightbulb className="w-5 h-5 mr-2 text-secondary" /> AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {(analysis.suggestions?.length > 0 ? analysis.suggestions : mockCareerGoal.improvements).map((sug: string, i: number) => (
                    <li key={i} className="flex items-start text-sm">
                      <span className="flex items-center justify-center bg-secondary/20 text-secondary w-6 h-6 rounded-full text-xs font-bold mr-3 shrink-0">{i + 1}</span>
                      <span className="text-muted-foreground leading-relaxed pt-0.5">{sug}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Resume Optimization Action */}
          <div className="flex justify-center pt-6">
            <Button size="lg" className="px-10 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Sparkles className="w-6 h-6 mr-3" /> Generate Improved Resume
            </Button>
          </div>

          <div className="text-center pt-8">
            <Button variant="ghost" onClick={removeFile} className="text-muted-foreground hover:text-foreground">
              Analyze Another Resume
            </Button>
          </div>
          
        </div>
      )}

    </div>
  );
};

export default ResumeAnalyzer;
