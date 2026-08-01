'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { User, Building, Mail, KeyRound, Lock, CheckCircle, ShieldAlert, Sparkles, Save, ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, logoutUser } = useAuth();

  // Profile Form States
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Set Password State for Google Accounts
  const [setNewPasswordVal, setSetNewPasswordVal] = useState('');
  const [setConfirmPasswordVal, setSetConfirmPasswordVal] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.full_name || user.name || '');
      setCompany(user.company || '');
    }
  }, [user]);

  // Check if account was created with Google OAuth
  const isGoogleUser = user?.company === 'Google Account' || user?.company === 'Google';

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setProfileLoading(true);

    try {
      const res = await api.put('/api/auth/profile', {
        name: name.trim(),
        company: company.trim() || 'Recruitment Agency',
      });
      setMessage(res.data.message || 'Profile updated successfully.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Profile update failed.');
    } finally {
      setProfileLoading(false);
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

    setPassLoading(true);

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
      setPassLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setPassLoading(true);

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
      setPassLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#2B241F] flex font-sans" suppressHydrationWarning>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className={`flex-1 transition-all duration-300 ml-0 ${collapsed ? 'md:ml-20' : 'md:ml-20 lg:ml-64'}`}>
        <Navbar collapsed={collapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <main className="pt-20 sm:pt-24 lg:pt-28 p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0F2C59] text-white flex items-center justify-center font-black text-lg shadow-md">
                {name ? name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#2B241F]">{name || 'Recruiter Profile'}</h1>
                <p className="text-xs font-semibold text-[#60534A]">
                  {isGoogleUser ? 'Google Signed Account' : 'Email/Password Recruiter Account'}
                </p>
              </div>
            </div>

            <div className="px-3 py-1 rounded-full bg-[#EFE7DE] border border-[#E2D7CB] text-[11px] font-extrabold text-[#0047AB] hidden sm:flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0047AB]" />
              <span>Verified Account</span>
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

          {/* Edit Profile Form */}
          <div className="bg-white border border-[#E8E2D9] rounded-3xl p-5 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-xs font-black text-[#2B241F] uppercase tracking-wider">
              <User className="w-4 h-4 text-[#0F2C59]" />
              <span>Profile Information</span>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider mb-2">Email Address (Read-only)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-[#FAF6F1]/60 border border-[#E2D7CB] text-[#60534A] text-xs rounded-2xl pl-10 pr-4 py-3 font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] text-xs rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#0F2C59] font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider mb-2">Company / Agency Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] text-xs rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#0F2C59] font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="sleek-btn-primary text-xs cursor-pointer font-bold py-3 px-6 inline-flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{profileLoading ? 'Saving Profile...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>

          {/* Set Initial Password Section (SHOWN FOR GOOGLE ACCOUNTS ONLY) */}
          {isGoogleUser && (
            <div className="bg-white border border-[#E8E2D9] rounded-3xl p-5 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center gap-2 text-xs font-black text-[#0047AB] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#0047AB]" />
                <span>Set Password for Google Account</span>
              </div>
              <p className="text-xs font-semibold text-[#60534A]">
                You registered using your Google Account. Set a password below to enable Email & Password sign in as well.
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
                  disabled={passLoading}
                  className="sleek-btn-primary text-xs cursor-pointer font-bold w-full py-3.5"
                >
                  {passLoading ? 'Setting Password...' : 'Set Google Account Password'}
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
                disabled={passLoading}
                className="sleek-btn-primary text-xs cursor-pointer font-bold w-full py-3.5"
              >
                {passLoading ? 'Updating Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
