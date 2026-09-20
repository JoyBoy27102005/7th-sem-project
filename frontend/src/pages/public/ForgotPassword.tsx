import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import axios from 'axios';
import { Compass, ArrowRight, Mail, Infinity } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:5000/api/auth/forgotpassword', { email });
      // Redirect to ResetPassword page and pass email
      navigate('/reset-password', { state: { email } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
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
            <CardTitle className="text-2xl font-bold tracking-tight font-heading">Forgot Password</CardTitle>
            <CardDescription className="text-muted-foreground">Enter your email to receive a 6-digit OTP</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-lg border border-destructive/20">{error}</div>}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-muted-foreground" />
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-9 bg-background/50 border-border/50 focus-visible:ring-primary" />
                </div>
              </div>
              <button disabled={loading} type="submit" className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg text-primary-foreground bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60 shadow-md shadow-primary/20 transition-all hover:scale-[1.02] mt-2 disabled:opacity-70 disabled:hover:scale-100">
                {loading ? 'Sending...' : 'Send OTP'} <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </form>
            
            <p className="text-center text-sm text-muted-foreground mt-6">
              Remember your password?{' '}
              <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
