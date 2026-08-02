'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { KeyRound, Lock, ShieldCheck, CheckCircle2, AlertCircle, Send, RefreshCw } from 'lucide-react';

export default function ChangePasswordPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, logoutUser } = useAuth();

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  const userEmail = user?.email || '';

  const handleSendOTP = async () => {
    if (!userEmail) return;
    setError('');
    setMessage('');
    setSendingOtp(true);

    try {
      const res = await api.post('/api/auth/send-otp', { email: userEmail });
      setMessage(res.data.message || `Verification OTP code sent to ${userEmail}. Check your email inbox.`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP verification code.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!currentPassword) {
      setError('Please enter your old password.');
      return;
    }

    if (otpCode.length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
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
        otp_code: otpCode.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setMessage(res.data.message || 'Password changed successfully! Redirecting to Sign In...');
      setTimeout(() => {
        logoutUser();
      }, 2500);
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
              <p className="text-xs font-semibold text-[#60534A]">Verify identity with your old password and email verification code</p>
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

          {/* Form */}
          <form onSubmit={handleChangePassword} className="bg-white border border-[#E8E2D9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
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

            {/* Email OTP Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider">
                  Email Verification Code
                </label>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={sendingOtp || !userEmail}
                  className="text-xs font-black text-[#0047AB] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {sendingOtp ? (
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Sending OTP...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Send className="w-3 h-3" />
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
                Click "Send OTP Code" to receive a 6-digit verification code at <span className="font-bold text-[#2B241F]">{userEmail}</span>.
              </p>
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
        </main>
      </div>
    </div>
  );
}
