'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import FloatingDock from '@/components/layout/FloatingDock';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { KeyRound, Lock, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, ArrowLeft, LayoutDashboard } from 'lucide-react';

export default function ChangePasswordPage() {
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
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans pb-32" suppressHydrationWarning>
      <Navbar />

      <main className="pt-20 sm:pt-24 max-w-xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-4 p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/80 to-slate-900 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0 shadow-lg">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-heading">Change Account Password</h1>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Enter your current password and set a new password</p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Change Password Form Card */}
        {!isSuccess ? (
          <form onSubmit={handleChangePassword} className="bg-[#111827]/80 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white font-heading">Update Password</h2>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  Logged in as <span className="font-bold text-cyan-300">{user?.email || 'Recruiter'}</span>
                </p>
              </div>
              {/* Small Back Button */}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-extrabold transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Link>
            </div>

            {/* Old / Current Password */}
            <div>
              <label className="block text-xs font-black text-slate-200 uppercase tracking-wider mb-2 font-heading">
                Old / Current Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-900/80 border border-white/10 text-white text-xs rounded-2xl pl-10 pr-4 py-3.5 focus:outline-none focus:border-cyan-500 font-bold placeholder-slate-500"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-black text-slate-200 uppercase tracking-wider mb-2 font-heading">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-900/80 border border-white/10 text-white text-xs rounded-2xl pl-10 pr-4 py-3.5 focus:outline-none focus:border-cyan-500 font-bold placeholder-slate-500"
                />
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-black text-slate-200 uppercase tracking-wider mb-2 font-heading">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-900/80 border border-white/10 text-white text-xs rounded-2xl pl-10 pr-4 py-3.5 focus:outline-none focus:border-cyan-500 font-bold placeholder-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="sleek-btn-primary w-full text-xs font-black py-3.5 cursor-pointer disabled:opacity-50 shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 mt-2"
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
          <div className="bg-[#111827]/80 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-6 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white font-heading">Password Changed Successfully!</h2>
              <p className="text-xs font-semibold text-slate-400 max-w-md mx-auto">
                {message || 'Your account password has been updated securely. You can now return to your dashboard.'}
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard"
                className="sleek-btn-primary w-full inline-flex items-center justify-center gap-2 text-xs font-black py-3.5 shadow-xl shadow-cyan-500/20"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Return to Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      <FloatingDock />
    </div>
  );
}
