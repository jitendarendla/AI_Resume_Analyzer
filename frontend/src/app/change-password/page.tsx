'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { KeyRound, Mail, Lock, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Send } from 'lucide-react';

export default function ChangePasswordPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, logoutUser } = useAuth();

  // Step state: 1 = Send OTP, 2 = Verify OTP, 3 = New Password
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const userEmail = user?.email || '';

  // Step 1: Send OTP to email
  const handleSendOTP = async () => {
    if (!userEmail) return;
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/send-otp', { email: userEmail });
      setMessage(res.data.message || `Verification OTP sent to ${userEmail}. Check your inbox.`);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP code to email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP code
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (otpCode.length !== 6) {
      setError('Please enter the valid 6-digit OTP code sent to your email.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/api/auth/verify-otp', {
        email: userEmail,
        otp_code: otpCode.trim()
      });
      setMessage('OTP verified successfully! Please enter your new password.');
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Update Password with OTP
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
        email: userEmail,
        otp_code: otpCode.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setMessage('Password updated successfully! Redirecting to Sign In page...');
      setTimeout(() => {
        logoutUser();
      }, 2500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Password update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#2B241F] flex font-sans" suppressHydrationWarning>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className={`flex-1 transition-all duration-300 ml-0 ${collapsed ? 'md:ml-20' : 'md:ml-20 lg:ml-64'}`}>
        <Navbar collapsed={collapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <main className="pt-20 sm:pt-24 lg:pt-28 p-4 sm:p-6 lg:p-8 max-w-xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="flex items-center gap-3.5 p-5 sm:p-6 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm">
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-[#0047AB] shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#2B241F]">Change Account Password</h1>
              <p className="text-xs font-semibold text-[#60534A]">Verify identity via Resend email OTP code before setting a new password</p>
            </div>
          </div>

          {/* Stepper Progress Header */}
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#EFE7DE] border border-[#E2D7CB] text-xs font-black text-center">
            <div className={`py-2 rounded-xl transition-all ${step === 1 ? 'bg-[#0F2C59] text-white shadow-sm' : 'text-[#60534A]'}`}>
              1. Send OTP
            </div>
            <div className={`py-2 rounded-xl transition-all ${step === 2 ? 'bg-[#0F2C59] text-white shadow-sm' : 'text-[#60534A]'}`}>
              2. Verify OTP
            </div>
            <div className={`py-2 rounded-xl transition-all ${step === 3 ? 'bg-[#0F2C59] text-white shadow-sm' : 'text-[#60534A]'}`}>
              3. Set Password
            </div>
          </div>

          {message && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#1E6B43] text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Send OTP to Email */}
          {step === 1 && (
            <div className="bg-white border border-[#E8E2D9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider">
                  Target Recruiter Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
                  <input
                    type="email"
                    disabled
                    value={userEmail}
                    className="w-full bg-[#FAF6F1]/80 border border-[#E2D7CB] text-[#2B241F] text-xs rounded-2xl pl-10 pr-4 py-3 font-bold"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading || !userEmail}
                className="sleek-btn-primary w-full text-xs font-black py-3.5 cursor-pointer disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending OTP via Resend...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Verification OTP Code</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 2: Enter & Verify OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="bg-white border border-[#E8E2D9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider">
                    Enter 6-Digit Email OTP Code
                  </label>
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="text-[11px] font-black text-[#0047AB] hover:underline"
                  >
                    Resend Code
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] text-center tracking-[0.5em] text-lg rounded-2xl px-4 py-3 focus:outline-none focus:border-[#0F2C59] font-mono font-black"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="sleek-btn-primary w-full text-xs font-black py-3.5 cursor-pointer disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying OTP Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Code & Proceed</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 3: Set New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="bg-white border border-[#E8E2D9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] text-xs rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#0F2C59] font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] text-xs rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#0F2C59] font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="sleek-btn-primary w-full text-xs font-black py-3.5 cursor-pointer disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Update Account Password</span>
                  </>
                )}
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
