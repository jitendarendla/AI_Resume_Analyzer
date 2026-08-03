'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { KeyRound, Lock, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, ArrowLeft, LayoutDashboard } from 'lucide-react';

export default function ChangePasswordPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user } = useAuth();

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setMessage(res.data.message || 'Password changed successfully!');
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to change password. Please check your current password.');
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
              <p className="text-xs font-semibold text-[#60534A]">Enter your current password and set a new password</p>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Change Password Form Card */}
          {!isSuccess ? (
            <form onSubmit={handleChangePassword} className="bg-white border border-[#E8E2D9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-[#2B241F]">Update Password</h2>
                  <p className="text-xs font-semibold text-[#60534A] mt-0.5">
                    Logged in as <span className="font-bold text-[#2B241F]">{user?.email || 'Recruiter'}</span>
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
          ) : (
            /* Success Completion Card */
            <div className="bg-white border border-[#E8E2D9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-center animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-black text-[#2B241F]">Password Changed Successfully!</h2>
                <p className="text-xs font-semibold text-[#60534A] max-w-md mx-auto">
                  {message || 'Your account password has been updated securely. You can now return to your dashboard.'}
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
