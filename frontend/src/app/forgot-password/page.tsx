'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { KeyRound, Mail, Lock, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, Send, Check } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'send_otp' | 'verify_otp' | 'new_password'>('send_otp');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/send-otp', { email });
      setMessage(res.data.message || `Verification OTP code sent to ${email}. Please check your email inbox.`);
      setStep('verify_otp');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/verify-otp', { email, otp_code: otpCode });
      setMessage(res.data.message || 'Email verified successfully!');
      setStep('new_password');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid or expired OTP code. Please check your email inbox.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/api/auth/reset-password-with-otp', {
        email,
        otp_code: otpCode,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setMessage(res.data.message || 'Password updated successfully!');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#111827]/80 backdrop-blur-2xl shadow-2xl space-y-6 relative z-10 border border-white/10">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 p-0.5 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20 border border-white/20">
              <img src="/logo.png" alt="AI Resume Analyzer Logo Icon" className="w-full h-full object-contain rounded-xl" />
            </div>
          </Link>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-heading">Reset Account Password</h1>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              {step === 'send_otp' && 'Enter your registered email address to receive an OTP verification code.'}
              {step === 'verify_otp' && `Enter the 6-digit OTP code sent to ${email}`}
              {step === 'new_password' && 'Enter and confirm your new secure account password.'}
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-black ${
              step === 'send_otp' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {step !== 'send_otp' ? <Check className="w-3.5 h-3.5" /> : '1'}
            </span>
            <span className="text-[11px] font-bold text-slate-300">Send OTP</span>
          </div>

          <div className="w-6 h-0.5 bg-white/10" />

          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-black ${
              step === 'verify_otp' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : step === 'new_password' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
            }`}>
              {step === 'new_password' ? <Check className="w-3.5 h-3.5" /> : '2'}
            </span>
            <span className="text-[11px] font-bold text-slate-300">Verify</span>
          </div>

          <div className="w-6 h-0.5 bg-white/10" />

          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-black ${
              step === 'new_password' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'bg-slate-800 text-slate-500'
            }`}>
              3
            </span>
            <span className="text-[11px] font-bold text-slate-300">Password</span>
          </div>
        </div>

        {message && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Send OTP */}
        {step === 'send_otp' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-200 uppercase tracking-wider mb-2 font-heading">Registered Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/80 border border-white/10 text-white text-xs rounded-2xl pl-10 pr-4 py-3.5 focus:outline-none focus:border-cyan-500 font-bold placeholder-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="sleek-btn-primary w-full text-xs font-black py-3.5 cursor-pointer disabled:opacity-50 shadow-xl shadow-cyan-500/20"
            >
              {loading ? 'Sending OTP Code...' : 'Send Verification OTP'}
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 'verify_otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-200 uppercase tracking-wider mb-2 font-heading">6-Digit Verification OTP</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-900/80 border border-white/10 text-cyan-400 text-sm font-mono font-black tracking-widest text-center rounded-2xl py-3.5 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="sleek-btn-primary w-full text-xs font-black py-3.5 cursor-pointer disabled:opacity-50 shadow-xl shadow-cyan-500/20"
            >
              {loading ? 'Verifying Code...' : 'Verify OTP Code'}
            </button>

            <button
              type="button"
              onClick={() => setStep('send_otp')}
              className="w-full text-center text-xs font-black text-slate-400 hover:text-white cursor-pointer"
            >
              ← Back to Email Step
            </button>
          </form>
        )}

        {/* STEP 3: Set New Password */}
        {step === 'new_password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-200 uppercase tracking-wider mb-2 font-heading">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-900/80 border border-white/10 text-white text-xs rounded-2xl pl-10 pr-10 py-3.5 focus:outline-none focus:border-cyan-500 font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-200 uppercase tracking-wider mb-2 font-heading">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-900/80 border border-white/10 text-white text-xs rounded-2xl pl-10 pr-10 py-3.5 focus:outline-none focus:border-cyan-500 font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="sleek-btn-primary w-full text-xs font-black py-3.5 cursor-pointer disabled:opacity-50 shadow-xl shadow-cyan-500/20"
            >
              {loading ? 'Resetting Password...' : 'Save New Password & Sign In'}
            </button>
          </form>
        )}

        <div className="pt-2 text-center border-t border-white/10">
          <Link href="/login" className="text-xs font-black text-cyan-400 hover:underline">
            ← Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
