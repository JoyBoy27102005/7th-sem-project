import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import axios from 'axios';
import { Compass, ArrowRight, Mail, Lock, Eye, EyeOff, Infinity } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const remembered = localStorage.getItem('nextstep_remembered_email');
    if (remembered) {
      setEmail(remembered);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('nextstep_remembered_email', email);
      login(data);
      if (data.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <Link to="/" className="flex flex-row items-center justify-center gap-3 mb-6 group cursor-pointer w-fit mx-auto">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-white text-foreground shadow-lg shadow-black/5 group-hover:scale-105 transition-transform">
            <Infinity className="w-6 h-6" strokeWidth={3} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
            NextStep<span className="text-[#B8860B]">.ai</span>
          </span>
        </Link>

        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight font-heading">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">Login to continue your journey</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              {error && <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-lg border border-destructive/20">{error}</div>}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-muted-foreground" />
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-9 bg-background/50 border-border/50 focus-visible:ring-primary" autoComplete="off" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground/80">Password</label>
                  <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-muted-foreground" />
                  <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-9 pr-10 bg-background/50 border-border/50 focus-visible:ring-primary" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-muted-foreground hover:text-foreground focus:outline-none">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button disabled={loading} type="submit" className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg text-primary-foreground bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60 shadow-md shadow-primary/20 transition-all hover:scale-[1.02] mt-2 disabled:opacity-70 disabled:hover:scale-100">
                {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </form>
            
            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
