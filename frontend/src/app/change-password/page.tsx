'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { KeyRound, Lock, ShieldCheck, CheckCircle2, AlertCircle, Send, RefreshCw, Mail, ArrowRight, ArrowLeft, LayoutDashboard, Clock } from 'lucide-react';

export default function ChangePasswordPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user } = useAuth();

  // Stage: 'email_verification' | 'password_update' | 'success'
  const [stage, setStage] = useState<'email_verification' | 'password_update' | 'success'>('email_verification');

  // Form states
  const [emailInput, setEmailInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verifiedOtpCode, setVerifiedOtpCode] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 1 minute 20 seconds (80 seconds) countdown timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmailInput(user.email);
    }
  }, [user]);

  // Countdown timer effect for Resend OTP (80 seconds = 1:20)
  useEffect(() => {
    let interval: any = null;
    if (timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerSeconds]);

  // Format seconds to M:SS (e.g. 80 -> 1:20)
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Action 1: Send OTP code to email with 1:20 (80s) timer lock
  const handleSendOTP = async () => {
    const targetEmail = emailInput.trim() || user?.email || '';
    if (!targetEmail) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setMessage('');
    setSendingOtp(true);

    try {
      const res = await api.post('/api/auth/send-otp', { email: targetEmail });
      setMessage(res.data.message || `Verification OTP code sent to ${targetEmail}. Check your email inbox.`);
      // Start 1 minute 20 seconds (80s) countdown timer
      setTimerSeconds(80);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP verification code.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Action 2: Verify Email OTP Code
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = emailInput.trim() || user?.email || '';

    setError('');
    setMessage('');

    if (otpCode.length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/auth/verify-otp', {
        email: targetEmail,
        otp_code: otpCode.trim()
      });
      setMessage('Email verified successfully! You can now update your password below.');
      setVerifiedOtpCode(otpCode.trim());
      setStage('password_update');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid or expired OTP verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Action 3: Change Password with Old Password and Verified OTP
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!currentPassword) {
      setError('Please enter your old / current password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/api/auth/change-password', {
        current_password: currentPassword,
        otp_code: verifiedOtpCode,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setMessage(res.data.message || 'Password changed successfully!');
      setStage('success');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Password change failed.');
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
          {/* Page Header */}
          <div className="flex items-center gap-3.5 p-5 sm:p-6 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm">
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-[#0047AB] shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#2B241F]">Change Account Password</h1>
              <p className="text-xs font-semibold text-[#60534A]">Securely update your password with email verification</p>
            </div>
          </div>

          {message && stage !== 'success' && (
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

          {/* STAGE 1: Email Verification Card */}
          {stage === 'email_verification' && (
            <form onSubmit={handleVerifyOTP} className="bg-white border border-[#E8E2D9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-[#2B241F]">Email Identity Verification</h2>
                  <p className="text-xs font-semibold text-[#60534A] mt-0.5">
                    Verify your email address before setting a new password.
                  </p>
                </div>
                {/* Small Back Button */}
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF6F1] hover:bg-[#EFE7DE] text-[#60534A] hover:text-[#2B241F] text-xs font-extrabold border border-[#E2D7CB] transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </Link>
              </div>

              <div>
                <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider mb-2">
                  Recruiter Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] text-xs rounded-2xl pl-10 pr-4 py-3 font-bold focus:outline-none focus:border-[#0F2C59]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider">
                    Enter Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={sendingOtp || timerSeconds > 0 || !emailInput}
                    className="text-xs font-black text-[#0047AB] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:no-underline"
                  >
                    {sendingOtp ? (
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </span>
                    ) : timerSeconds > 0 ? (
                      <span className="flex items-center gap-1 text-[#8C7E72] font-mono">
                        <Clock className="w-3.5 h-3.5 text-[#8C7E72]" />
                        <span>Resend in {formatTimer(timerSeconds)}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Send className="w-3.5 h-3.5" />
                        <span>Send OTP Code</span>
                      </span>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="Enter 6-digit OTP code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] text-xs rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#0F2C59] font-bold font-mono tracking-wider"
                  />
                </div>
                <p className="text-[11px] font-semibold text-[#8C7E72] mt-1.5">
                  Click "Send OTP Code" to receive your verification code at <span className="font-bold text-[#2B241F]">{emailInput || 'your email'}</span>.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="sleek-btn-primary w-full text-xs font-black py-3.5 cursor-pointer disabled:opacity-50 shadow-md flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Email & Proceed</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>
          )}

          {/* STAGE 2: Change Password Card */}
          {stage === 'password_update' && (
            <form onSubmit={handleChangePassword} className="bg-white border border-[#E8E2D9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-[#2B241F]">Update Account Password</h2>
                  <p className="text-xs font-semibold text-[#60534A] mt-0.5">
                    Email verified! Enter your old password and choose a new password.
                  </p>
                </div>
                {/* Small Back Button */}
                <button
                  type="button"
                  onClick={() => setStage('email_verification')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF6F1] hover:bg-[#EFE7DE] text-[#60534A] hover:text-[#2B241F] text-xs font-extrabold border border-[#E2D7CB] transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>

              {/* Old / Current Password */}
              <div>
                <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider mb-2">
                  Old / Current Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] text-xs rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#0F2C59] font-bold"
                  />
                </div>
              </div>

              {/* New Password */}
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

              {/* Confirm New Password */}
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
                className="sleek-btn-primary w-full text-xs font-black py-3.5 cursor-pointer disabled:opacity-50 shadow-md flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    <KeyRound className="w-4 h-4" />
                    <span>Change Password</span>
                  </span>
                )}
              </button>
            </form>
          )}

          {/* STAGE 3: Success Completion Card */}
          {stage === 'success' && (
            <div className="bg-white border border-[#E8E2D9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-center animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-black text-[#2B241F]">Password Changed Successfully!</h2>
                <p className="text-xs font-semibold text-[#60534A] max-w-md mx-auto">
                  {message || 'Your account credentials have been updated securely. You can now return to your dashboard.'}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="sleek-btn-primary w-full inline-flex items-center justify-center gap-2 text-xs font-black py-3.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Return to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
