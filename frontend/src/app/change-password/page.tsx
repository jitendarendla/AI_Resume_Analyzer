'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { KeyRound, Lock, CheckCircle, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';

export default function ChangePasswordPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Set Password State for Google Accounts
  const [setNewPasswordVal, setSetNewPasswordVal] = useState('');
  const [setConfirmPasswordVal, setSetConfirmPasswordVal] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, logoutUser } = useAuth();

  // Check if account was created with Google OAuth
  const isGoogleUser = user?.company === 'Google Account' || user?.company === 'Google';

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setMessage(res.data.message);
      setTimeout(() => {
        logoutUser();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Password change failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetGooglePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (setNewPasswordVal !== setConfirmPasswordVal) {
      setError('Passwords do not match.');
      return;
    }

    if (setNewPasswordVal.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/api/auth/set-password', {
        new_password: setNewPasswordVal,
        confirm_password: setConfirmPasswordVal,
      });
      setMessage(res.data.message);
      setSetNewPasswordVal('');
      setSetConfirmPasswordVal('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to set password for Google account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#2B241F] flex font-sans" suppressHydrationWarning>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className={`flex-1 transition-all duration-300 ml-0 ${collapsed ? 'md:ml-20' : 'md:ml-20 lg:ml-64'}`}>
        <Navbar collapsed={collapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <main className="pt-20 sm:pt-24 lg:pt-28 p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-center gap-3 p-5 sm:p-6 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm">
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-[#0047AB]">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#2B241F]">Password Management</h1>
              <p className="text-xs font-semibold text-[#60534A]">
                {isGoogleUser ? 'Google Signed Account • Set & Change Password' : 'Email/Password Account • Change Password'}
              </p>
            </div>
          </div>

          {message && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#1E6B43] text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Set Initial Password Section (SHOWN FOR GOOGLE ACCOUNTS ONLY) */}
          {isGoogleUser && (
            <div className="bg-white border border-[#E8E2D9] rounded-3xl p-5 sm:p-8 shadow-sm space-y-5 relative overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-black text-[#0047AB] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#0047AB]" />
                <span>Set Password for Google Account</span>
              </div>
              <p className="text-xs font-semibold text-[#60534A]">
                You signed up using your Google Account. Set a password below to enable Email & Password sign in as well.
              </p>

              <form onSubmit={handleSetGooglePassword} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={setNewPasswordVal}
                      onChange={(e) => setSetNewPasswordVal(e.target.value)}
                      className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] text-xs rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#0F2C59] font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider mb-2">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={setConfirmPasswordVal}
                      onChange={(e) => setSetConfirmPasswordVal(e.target.value)}
                      className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] text-xs rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#0F2C59] font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="sleek-btn-primary text-xs cursor-pointer font-bold w-full py-3.5"
                >
                  {loading ? 'Setting Password...' : 'Set Google Account Password'}
                </button>
              </form>
            </div>
          )}

          {/* Change Password Section (AVAILABLE TO BOTH GOOGLE & EMAIL LOGINS) */}
          <div className="bg-white border border-[#E8E2D9] rounded-3xl p-5 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-xs font-black text-[#2B241F] uppercase tracking-wider">
              <KeyRound className="w-4 h-4 text-[#0F2C59]" />
              <span>Change Password</span>
            </div>
            <p className="text-xs font-semibold text-[#60534A]">
              Update your existing account password to maintain security.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
              {!isGoogleUser && (
                <div>
                  <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider mb-2">Current Password</label>
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
              )}

              <div>
                <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider mb-2">New Password</label>
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
                <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider mb-2">Confirm New Password</label>
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
                className="sleek-btn-primary text-xs cursor-pointer font-bold w-full py-3.5"
              >
                {loading ? 'Updating Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
