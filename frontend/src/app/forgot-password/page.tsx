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
    <div className="min-h-screen bg-[#F8F5F1] text-[#2B241F] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white shadow-xl space-y-6 relative z-10 border border-[#E8E2D9]">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F2C59] via-[#0047AB] to-[#2563EB] p-1 flex items-center justify-center shrink-0 shadow-md border border-blue-400/30">
              <img src="/logo.png" alt="AI Resume Analyzer Logo Icon" className="w-full h-full object-contain rounded-xl" />
            </div>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[#2B241F] tracking-tight">Forgot Password</h1>
            <p className="text-xs font-semibold text-[#60534A] mt-1">Check your real email inbox for the 6-digit OTP code</p>
          </div>
        </div>

        {/* Progress Step Bar */}
        <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-[#60534A]">
          <span className={`px-2.5 py-1 rounded-full ${step === 'send_otp' ? 'bg-[#0047AB] text-white' : 'bg-[#EFE7DE] text-[#0F2C59]'}`}>1. Send OTP</span>
          <span>→</span>
          <span className={`px-2.5 py-1 rounded-full ${step === 'verify_otp' ? 'bg-[#0047AB] text-white' : 'bg-[#EFE7DE] text-[#60534A]'}`}>2. Verify OTP</span>
          <span>→</span>
          <span className={`px-2.5 py-1 rounded-full ${step === 'new_password' ? 'bg-[#0047AB] text-white' : 'bg-[#EFE7DE] text-[#60534A]'}`}>3. Reset Password</span>
        </div>

        {message && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Send OTP */}
        {step === 'send_otp' && (
          <form onSubmit={handleSendOTP} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#2B241F] font-black uppercase tracking-wider mb-2">Registered Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recruiter@company.com"
                  className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] rounded-2xl pl-10 pr-4 py-3 font-bold focus:outline-none focus:border-[#0F2C59]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="sleek-btn-primary w-full py-3.5"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Sending Email OTP...' : 'Send Verification OTP'}</span>
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 'verify_otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#2B241F] font-black uppercase tracking-wider mb-2">Enter 6-Digit OTP Code from Email</label>
              <input
                type="text"
                maxLength={6}
                required
                placeholder="Check your email inbox..."
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] text-center text-xl font-mono tracking-widest rounded-2xl px-4 py-3 font-black focus:outline-none focus:border-[#0F2C59]"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep('send_otp')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#60534A]"
              >
                Resend Email OTP
              </button>
              <button
                type="submit"
                disabled={loading}
                className="sleek-btn-primary py-3 px-6"
              >
                <Check className="w-4 h-4" />
                <span>{loading ? 'Verifying...' : 'Verify OTP Code'}</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Reset Password with Eye Toggles */}
        {step === 'new_password' && (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-black text-[#2B241F] uppercase mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] rounded-2xl pl-10 pr-10 py-3 font-bold focus:outline-none focus:border-[#0F2C59]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72] hover:text-[#2B241F]"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-black text-[#2B241F] uppercase mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] rounded-2xl pl-10 pr-10 py-3 font-bold focus:outline-none focus:border-[#0F2C59]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72] hover:text-[#2B241F]"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="sleek-btn-primary w-full py-3.5"
            >
              <span>{loading ? 'Updating Password...' : 'Reset & Update Password'}</span>
            </button>
          </form>
        )}

        <div className="text-center text-xs font-semibold text-[#60534A] pt-4 border-t border-[#F1ECE6]">
          Remembered your password?{' '}
          <Link href="/login" className="text-[#0047AB] font-black hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
