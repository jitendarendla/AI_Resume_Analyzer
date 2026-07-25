'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  User,
  ShieldCheck,
  Building,
  Mail,
  Edit3,
  FileText,
  Users,
  Download,
  X,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Lock,
  Send,
  Check
} from 'lucide-react';

export default function ProfilePage() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, loginUser } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Database Statistics
  const [stats, setStats] = useState<any>(null);

  // Edit Profile Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');

  // Password Modal & Real-Time OTP Verification State
  const [isPassOpen, setIsPassOpen] = useState(false);
  const [otpStep, setOtpStep] = useState<'send_otp' | 'enter_otp' | 'new_password'>('send_otp');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.full_name || user.name || '');
      setCompany(user.company || 'Recruitment Agency');
      setVerifyEmail(user.email || '');
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/reports/stats');
      setStats(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const openPasswordModal = () => {
    setPassErr('');
    setPassMsg('');
    setOtpStep('send_otp');
    setEnteredOtp('');
    setIsEmailVerified(false);
    setNewPassword('');
    setConfirmPassword('');
    if (user?.email) {
      setVerifyEmail(user.email);
    }
    setIsPassOpen(true);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassErr('');
    setPassMsg('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/send-otp', { email: verifyEmail });
      setPassMsg(res.data.message || `Verification OTP code sent to ${verifyEmail}. Please check your email inbox.`);
      setOtpStep('enter_otp');
    } catch (err: any) {
      setPassErr(err.response?.data?.detail || 'Failed to send verification OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassErr('');
    setPassMsg('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/verify-otp', {
        email: verifyEmail,
        otp_code: enteredOtp,
      });
      setPassMsg(res.data.message || 'Email verified successfully!');
      setIsEmailVerified(true);
      setOtpStep('new_password');
    } catch (err: any) {
      setPassErr(err.response?.data?.detail || 'Invalid or expired OTP code. Please check your email inbox.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordWithOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassErr('');
    setPassMsg('');

    if (newPassword !== confirmPassword) {
      setPassErr('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPassErr('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/api/auth/reset-password-with-otp', {
        email: verifyEmail,
        otp_code: enteredOtp,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setPassMsg(res.data.message || 'Password updated successfully!');
      setTimeout(() => {
        setIsPassOpen(false);
      }, 1500);
    } catch (err: any) {
      setPassErr(err.response?.data?.detail || 'Password update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put('/api/auth/profile', { name, company });
      const token = localStorage.getItem('token') || '';
      loginUser({
        access_token: token,
        recruiter_id: res.data.user.recruiter_id,
        email: res.data.user.email,
        name: res.data.user.name,
        company: res.data.user.company,
        is_admin: res.data.user.is_admin
      });
      setIsEditOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Profile update failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#2B241F] flex font-sans" suppressHydrationWarning>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <Navbar collapsed={collapsed} />

        <main className="pt-20 p-8 space-y-8 max-w-7xl mx-auto">
          {/* Main Profile Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Recruiter Identity Card */}
            <div className="p-8 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-6 text-center">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#0F2C59] via-[#0047AB] to-[#2563EB] text-white mx-auto flex items-center justify-center font-black text-4xl shadow-xl border-2 border-white">
                  {mounted && user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'R'}
                </div>

                <div>
                  <h2 className="text-xl font-black text-[#2B241F]">
                    {mounted && user?.full_name ? user.full_name : 'Recruiter Account'}
                  </h2>
                  <p className="text-xs font-bold text-[#60534A] mt-1">
                    {mounted && user?.email ? user.email : 'recruiter@company.com'}
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF5EF] border border-[#D4E8DC] text-[#1E6B43] font-black text-[11px] uppercase mt-3">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified HR Account
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF6F1] border border-[#E2D7CB] text-left space-y-3 text-xs font-bold text-[#60534A]">
                  <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-2">
                    <span className="text-[#8C7E72] font-semibold">Company / Org:</span>
                    <span className="text-[#2B241F] font-black">{mounted && user?.company ? user.company : 'Recruitment Agency'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-2">
                    <span className="text-[#8C7E72] font-semibold">Account Role:</span>
                    <span className="text-[#0F2C59] font-black">{mounted && user?.is_admin ? 'System Administrator' : 'Lead Recruiter'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8C7E72] font-semibold">Status:</span>
                    <span className="text-[#1E6B43] font-black flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#F1ECE6]">
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="sleek-btn-secondary w-full justify-center cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-[#0F2C59]" />
                  <span>Edit Profile Details</span>
                </button>

                <button
                  onClick={openPasswordModal}
                  className="sleek-btn-primary w-full justify-center cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Verify Email & Change Password</span>
                </button>
              </div>
            </div>

            {/* Right Column: Account Metrics */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#EFE7DE] text-[#0F2C59] flex items-center justify-center border border-[#E2D7CB]">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-[#60534A] block pt-1">Resumes Parsed</span>
                  <h3 className="text-3xl font-black text-[#2B241F]">{stats?.total_resumes ?? 0}</h3>
                  <p className="text-xs font-semibold text-[#60534A]">Candidate Records</p>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#F4EBF0] text-[#7A3E65] flex items-center justify-center border border-[#E6D4DF]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-[#60534A] block pt-1">Generated Reports</span>
                  <h3 className="text-3xl font-black text-[#2B241F]">{stats?.total_reports ?? 0}</h3>
                  <p className="text-xs font-semibold text-[#60534A]">JD Evaluation Batches</p>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#EAF5EF] text-[#1E6B43] flex items-center justify-center border border-[#D4E8DC]">
                    <Download className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-[#60534A] block pt-1">Excel Downloads</span>
                  <h3 className="text-3xl font-black text-[#2B241F]">{stats?.total_downloads ?? 0}</h3>
                  <p className="text-xs font-semibold text-[#60534A]">Exported Files</p>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Modal */}
          {isEditOpen && (
            <div className="fixed inset-0 z-50 bg-[#140F0C]/75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[#E8E2D9] text-[#2B241F] space-y-6">
                <div className="flex items-center justify-between border-b border-[#F1ECE6] pb-3">
                  <h3 className="text-lg font-black text-[#2B241F]">Edit Profile Information</h3>
                  <button onClick={() => setIsEditOpen(false)} className="text-[#8C7E72] hover:text-[#2B241F]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-black text-[#2B241F] uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-xs text-[#2B241F] rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:border-[#0F2C59]"
                    />
                  </div>

                  <div>
                    <label className="block font-black text-[#2B241F] uppercase mb-1">Company / Organization</label>
                    <input
                      type="text"
                      required
                      placeholder="Recruitment Agency / Company Name..."
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-xs text-[#2B241F] rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:border-[#0F2C59]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-[#60534A]">Cancel</button>
                    <button type="submit" className="sleek-btn-primary">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Change Password Modal with Confidential Email OTP Verification */}
          {isPassOpen && (
            <div className="fixed inset-0 z-50 bg-[#140F0C]/75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[#E8E2D9] text-[#2B241F] space-y-6">
                <div className="flex items-center justify-between border-b border-[#F1ECE6] pb-3">
                  <div>
                    <h3 className="text-lg font-black text-[#2B241F]">Change Password</h3>
                    <p className="text-[11px] font-semibold text-[#60534A]">Check your real email inbox for the 6-digit verification code</p>
                  </div>
                  <button onClick={() => setIsPassOpen(false)} className="text-[#8C7E72] hover:text-[#2B241F]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {passErr && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{passErr}</span>
                  </div>
                )}

                {passMsg && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{passMsg}</span>
                  </div>
                )}

                {/* STEP 1: Send OTP to Email */}
                {otpStep === 'send_otp' && (
                  <form onSubmit={handleSendOTP} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[#2B241F] font-black uppercase tracking-wider mb-2">Work Email to Verify</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
                        <input
                          type="email"
                          required
                          value={verifyEmail}
                          onChange={(e) => setVerifyEmail(e.target.value)}
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
                      <span>{loading ? 'Sending Email OTP...' : 'Send Verification OTP to Email'}</span>
                    </button>
                  </form>
                )}

                {/* STEP 2: Enter & Verify 6-digit OTP from Email Inbox */}
                {otpStep === 'enter_otp' && (
                  <form onSubmit={handleVerifyOTP} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[#2B241F] font-black uppercase tracking-wider mb-2">Enter 6-Digit OTP Code from Email</label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="Check your email inbox..."
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] text-center text-xl font-mono tracking-widest rounded-2xl px-4 py-3 font-black focus:outline-none focus:border-[#0F2C59]"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setOtpStep('send_otp')}
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

                {/* STEP 3: Create New Password (Unlocked upon email OTP verification) */}
                {otpStep === 'new_password' && (
                  <form onSubmit={handleResetPasswordWithOTP} className="space-y-4 text-xs">
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
                          className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-xs text-[#2B241F] rounded-xl pl-10 pr-10 py-2.5 font-bold focus:outline-none focus:border-[#0F2C59]"
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
                          className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-xs text-[#2B241F] rounded-xl pl-10 pr-10 py-2.5 font-bold focus:outline-none focus:border-[#0F2C59]"
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

                    <div className="pt-2 flex items-center justify-end gap-3">
                      <button type="button" onClick={() => setIsPassOpen(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-[#60534A]">Cancel</button>
                      <button type="submit" disabled={loading} className="sleek-btn-primary">
                        <span>{loading ? 'Updating...' : 'Update Password'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
