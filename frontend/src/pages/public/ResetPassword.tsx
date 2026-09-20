import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import axios from 'axios';
import { Compass, ArrowRight, Lock, Hash, Eye, EyeOff, CheckCircle2, Infinity } from 'lucide-react';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:5000/api/auth/verifyotp', { email, otp });
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/resetpassword', { email, otp, newPassword });
      setSuccess('Your password has been successfully reset.');
      setStep(3); // Move to Success Screen
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
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
            <CardTitle className="text-2xl font-bold tracking-tight font-heading">
              {step === 1 ? 'Verify OTP' : step === 2 ? 'Set New Password' : 'Password Reset Successful'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {step === 1 ? 'Enter the OTP sent to your email' : step === 2 ? 'Choose a strong new password' : 'You can now log in with your new password'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 3 ? (
              <div className="p-6 text-center space-y-6">
                <div className="flex justify-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500 animate-in zoom-in duration-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground">Success!</h3>
                  <p className="text-sm text-muted-foreground">{success}</p>
                </div>
                <Link to="/login" className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg text-primary-foreground bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60 shadow-md shadow-primary/20 transition-all hover:scale-[1.02] mt-4">
                  Back to Login
                </Link>
              </div>
            ) : step === 1 ? (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="p-3 text-sm bg-primary/10 text-primary rounded-lg border border-primary/20">
                  If an account with that email exists, a 6-digit OTP has been sent.
                </div>
                {error && <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-lg border border-destructive/20">{error}</div>}
                
                {!location.state?.email && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground/80">Email Address</label>
                    <div className="relative flex items-center">
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-3 bg-background/50 border-border/50 focus-visible:ring-primary" />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">6-Digit OTP</label>
                  <div className="relative flex items-center">
                    <Hash className="absolute left-3 w-4 h-4 text-muted-foreground" />
                    <Input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required className="pl-9 bg-background/50 border-border/50 focus-visible:ring-primary" maxLength={6} />
                  </div>
                </div>

                <button disabled={loading} type="submit" className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg text-primary-foreground bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60 shadow-md shadow-primary/20 transition-all hover:scale-[1.02] mt-2 disabled:opacity-70 disabled:hover:scale-100">
                  {loading ? 'Verifying...' : 'Verify OTP'} <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {error && <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-lg border border-destructive/20">{error}</div>}
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">New Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 w-4 h-4 text-muted-foreground" />
                    <Input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="pl-9 pr-10 bg-background/50 border-border/50 focus-visible:ring-primary" autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-muted-foreground hover:text-foreground focus:outline-none">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Confirm Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 w-4 h-4 text-muted-foreground" />
                    <Input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pl-9 pr-10 bg-background/50 border-border/50 focus-visible:ring-primary" autoComplete="new-password" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 text-muted-foreground hover:text-foreground focus:outline-none">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground/80 space-y-1 mt-1 mb-2">
                  <p>Password requirements:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Minimum 8 characters</li>
                    <li>One uppercase & one lowercase letter</li>
                    <li>One number & one special character</li>
                  </ul>
                </div>

                <button disabled={loading} type="submit" className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg text-primary-foreground bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60 shadow-md shadow-primary/20 transition-all hover:scale-[1.02] mt-2 disabled:opacity-70 disabled:hover:scale-100">
                  {loading ? 'Resetting...' : 'Reset Password'} <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
