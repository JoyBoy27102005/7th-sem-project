import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import axios from 'axios';
import { 
  Compass, BarChart3, UserRound, Brain, Map, FileText, MessageSquare, 
  LogOut, Sparkles, Target, Zap, User, Bot, Infinity 
} from 'lucide-react';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { useExitConfirmation } from '../../hooks/useExitConfirmation';

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const showExitPrompt = useExitConfirmation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [profile, setProfile] = useState<any>(null);
  const [missingSkillsCount, setMissingSkillsCount] = useState<number>(0);
  const [careerReadiness, setCareerReadiness] = useState<number>(0);
  const [topMissingSkill, setTopMissingSkill] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileRes, recsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users/profile'),
          axios.get('http://localhost:5000/api/recommendations')
        ]);
        setProfile(profileRes.data);
        
        const recs = recsRes.data || [];

        // Calculate career readiness compatibility score
        const activeGoalName = profileRes.data.careerGoals?.[0];
        const activeGoalRec = recs.find((r: any) => r.career === activeGoalName);
        const bestRec = activeGoalRec || (recs.length > 0 ? recs[0] : null);
        
        setMissingSkillsCount(bestRec?.missingSkills?.length || 0);
        
        const readiness = bestRec 
          ? parseInt(bestRec.matchPercentage.match(/\d+/)?.[0] || '0') 
          : 0;
        setCareerReadiness(readiness);
        
        if (bestRec && bestRec.missingSkills && bestRec.missingSkills.length > 0) {
          setTopMissingSkill(bestRec.missingSkills[0]);
        }
      } catch (err) {
        console.error('Failed to fetch sidebar profile insights', err);
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user, location.pathname]);

  const navGroups = [
    {
      label: 'Overview',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: <BarChart3 className="w-[22px] h-[22px]" /> },
      ]
    },
    {
      label: 'Career Development',
      items: [
        { name: 'Career Intelligence', path: '/recommendations', icon: <Brain className="w-[22px] h-[22px]" /> },
        { name: 'Learning Roadmap', path: '/roadmap', icon: <Map className="w-[22px] h-[22px]" /> },
      ]
    },
    {
      label: 'Job Preparation',
      items: [
        { name: 'Resume Analyzer', path: '/resume', icon: <FileText className="w-[22px] h-[22px]" /> },
        { name: 'Interview Prep', path: '/interview', icon: <MessageSquare className="w-[22px] h-[22px]" /> },
      ]
    }
  ];

  return (
    <div className="h-screen flex bg-background relative overflow-hidden font-sans">
      {/* Ambient background decoration */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]"></div>
      </div>

      {/* Exit Confirmation Toast */}
      {showExitPrompt && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-foreground text-background px-6 py-3 rounded-full shadow-2xl font-medium text-sm flex items-center gap-2">
            <span>Press back again to exit</span>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-[340px] shrink-0 bg-[#0A1931] text-[#FAF8F2] border-r border-[#102F5F] flex flex-col relative z-20 shadow-2xl overflow-y-auto">
        <div className="p-8 pb-4">
          {/* Logo Section */}
          <Link to="/" className="flex flex-col items-start gap-1 mb-8 group cursor-pointer relative">
            <div className="absolute top-0 left-0 w-24 h-24 bg-primary/20 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-3xl bg-white text-foreground shadow-lg shadow-black/5 group-hover:scale-105 transition-all">
                <Infinity className="w-7 h-7" strokeWidth={3} />
              </div>
              <div className="flex flex-col">
                <span className="text-[32px] font-bold tracking-tight text-[#FAF8F2] leading-none" style={{ fontFamily: 'Inter, sans-serif' }}>
                  NextStep<span className="text-[#B8860B]">.ai</span>
                </span>
                <span className="text-[12px] font-bold text-[#FAF8F2]/70 uppercase tracking-widest mt-1">AI Career Navigator</span>
              </div>
            </div>
          </Link>

          {/* Profile User Summary */}
          <button 
            onClick={() => navigate('/profile')}
            className="w-full mt-4 text-left flex items-center justify-between p-4 rounded-2xl bg-[#FAF8F2] backdrop-blur-sm border border-[#FAF8F2]/20 hover:bg-[#FAF8F2]/90 hover:border-[#B8860B]/40 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#B8860B]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="flex items-center gap-3.5 relative z-10 overflow-hidden min-w-0">
              <div className="w-12 h-12 rounded-full bg-transparent border border-[#0A1931]/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 group-hover:shadow-sm overflow-hidden">
                {(profile?.profilePicture || user?.profilePicture) ? (
                  <img src={profile?.profilePicture || user?.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-[#0A1931]" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[16px] font-extrabold text-[#0A1931] truncate">{profile?.name || user?.name || 'User'}</span>
                <span className="text-[13px] text-[#0A1931]/70 font-medium truncate mt-0.5">{profile?.email || user?.email || 'user@example.com'}</span>
              </div>
            </div>
            <div className="shrink-0 text-[#0A1931]/40 group-hover:text-[#0A1931] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </button>
        </div>

        {/* Profile Sidebar Insights */}
        {profile && (
          <div className="px-8 pb-4">
            {profile.degree && profile.branch && profile.careerGoals?.length > 0 ? (
              <div className="p-6 rounded-2xl bg-[#FAF8F2] border border-[#0A1931]/10 shadow-sm space-y-6 text-left hover:border-[#B8860B]/30 transition-all group">
                
                <div className="flex items-center gap-5">
                  <div className="relative flex items-center justify-center shrink-0">
                    <svg className="w-[64px] h-[64px] transform -rotate-90 drop-shadow-md">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="5" className="text-[#0A1931]/10" fill="transparent" />
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="5" className="text-[#0A1931] transition-all duration-1000 ease-out" fill="transparent" strokeDasharray={175.93} strokeDashoffset={175.93 - (175.93 * careerReadiness) / 100} />
                    </svg>
                    <span className="absolute text-[16px] font-black text-[#0A1931]">{careerReadiness}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[16px] font-extrabold text-[#0A1931] leading-tight">Career Readiness</span>
                    <span className="text-[13px] text-[#0A1931]/70 font-medium mt-1">Goal Alignment</span>
                  </div>
                </div>

                <div className="space-y-3.5 text-[14px] border-t border-[#0A1931]/10 pt-5">
                  {profile.degree && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#0A1931]/70 font-semibold">Degree</span>
                      <span className="font-extrabold text-[#0A1931] truncate max-w-[120px] text-right">{profile.degree}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-[#0A1931]/70 font-semibold">Current Goal</span>
                    <span className="font-extrabold text-[#0A1931] truncate max-w-[120px] text-right">{profile.careerGoals?.[0] || 'Not Set'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#0A1931]/70 font-semibold">Skills Added</span>
                    <span className="font-extrabold text-[#0A1931]">{(profile.skills || []).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#0A1931]/70 font-semibold">Missing Skills</span>
                    <span className="font-extrabold text-[#B8860B]">{missingSkillsCount}</span>
                  </div>
                </div>

                {topMissingSkill && (
                  <div className="mt-2 pt-5 border-t border-[#0A1931]/10">
                    <div className="bg-[#B8860B] border border-[#B8860B]/80 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-[#0A1931]/10 rounded-bl-full pointer-events-none" />
                      <div className="flex items-center gap-1.5 text-[#0A1931] text-[11px] font-black uppercase tracking-widest relative z-10">
                        <Target className="w-4 h-4" /> Recommended Focus
                      </div>
                      <span className="font-extrabold text-[15px] text-[#0A1931] relative z-10">{topMissingSkill}</span>
                      <div className="text-[12px] font-bold text-[#FAF8F2] bg-[#0A1931] inline-flex w-fit px-2.5 py-1 rounded-md mt-1 border border-transparent relative z-10">
                        Potential Gain: +8% Match
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#FAF8F2]/5 border border-dashed border-[#B8860B]/30 flex flex-col items-center justify-center text-center gap-3 transition-all hover:bg-[#FAF8F2]/10 hover:border-[#B8860B]/50">
                <Target className="w-8 h-8 text-[#B8860B]/60" />
                <div className="space-y-1">
                  <h4 className="text-[14px] font-bold text-[#FAF8F2]">Profile Incomplete</h4>
                  <p className="text-[12px] text-[#FAF8F2]/60 leading-relaxed">Set your degree, branch, and target career to unlock AI skill insights.</p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => navigate('/profile')}
                  className="mt-2 bg-[#B8860B]/10 hover:bg-[#B8860B]/20 text-[#B8860B] border-none font-bold shadow-none"
                >
                  Complete Profile
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Navigation Grouping */}
        <div className="px-8 flex-1 pb-6 space-y-8 mt-2">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-4">
              <h4 className="text-[12px] font-black text-[#FAF8F2]/70 uppercase tracking-widest px-2">
                {group.label}
              </h4>
              <nav className="space-y-2">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link 
                      key={item.name} 
                      to={item.path} 
                      className={`group relative flex items-center px-4 py-3.5 rounded-2xl text-[16px] font-bold transition-all duration-300 overflow-hidden ${
                        isActive 
                          ? 'bg-[#FAF8F2]/5 text-[#B8860B]' 
                          : 'text-[#FAF8F2]/70 hover:bg-[#FAF8F2]/5 hover:text-[#FAF8F2] border border-transparent'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#B8860B] shadow-[0_0_12px_rgba(184,134,11,0.5)]" />
                      )}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#B8860B]/10 to-transparent pointer-events-none" />
                      )}
                      <div className={`mr-4 ${isActive ? 'text-[#B8860B]' : 'text-[#FAF8F2]/70 group-hover:text-[#FAF8F2]'} transition-colors`}>
                        {item.icon}
                      </div>
                      <span className="relative z-10">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}

          {/* AI Career Assistant Shortcut */}
          <div className="p-5 rounded-2xl bg-[#FAF8F2]/5 border border-[#B8860B]/20 relative overflow-hidden group mt-6 hover:shadow-lg hover:shadow-[#B8860B]/10 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#B8860B]/10 rounded-bl-[100px] pointer-events-none transition-transform group-hover:scale-110" />
            <div className="relative z-10 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#B8860B]/10 flex items-center justify-center text-[#B8860B]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[16px] font-black text-[#B8860B] mb-1">Career Copilot</h4>
                <p className="text-[13px] text-[#FAF8F2]/90 leading-relaxed">Chat with AI to refine your goals and overcome challenges.</p>
              </div>
              <Button 
                size="sm" 
                className="w-full mt-2 justify-center bg-[#B8860B] hover:bg-[#B8860B]/90 text-[#FAF8F2] border-none font-bold shadow-md shadow-[#B8860B]/20 transition-all hover:scale-[1.02]"
                onClick={() => navigate('/ai-assistant')}
              >
                Open Assistant
              </Button>
            </div>
          </div>
        </div>
        
        {/* Logout Section */}
        <div className="p-8 pt-6 border-t border-[#102F5F] bg-[#0A1931]/95 backdrop-blur-md sticky bottom-0 z-30">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3.5 text-[16px] font-bold rounded-2xl text-[#FAF8F2]/70 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 mr-4 group-hover:text-rose-400 transition-colors" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 md:p-16 overflow-y-auto relative z-10 bg-background/50">
        <div className="absolute top-6 right-8 md:right-12 z-50">
          <ThemeSwitcher />
        </div>
        <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
