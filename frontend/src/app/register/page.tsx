'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Building, Lock, UserPlus, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { registerUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await registerUser(name.trim(), email.trim(), company.trim() || 'Recruitment Agency', password);
      setSuccess('Account created successfully! Redirecting to Dashboard...');
    } catch (err: any) {
      setError(err.message || 'Account registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#2B241F] flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white shadow-xl space-y-5 relative z-10 border border-[#E8E2D9]">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F2C59] via-[#0047AB] to-[#2563EB] p-1 flex items-center justify-center shrink-0 shadow-md border border-blue-400/30">
              <img src="/logo.png" alt="AI Resume Analyzer Logo Icon" className="w-full h-full object-contain rounded-xl" />
            </div>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#2B241F]">Create Recruiter Account</h1>
            <p className="text-xs font-semibold text-[#60534A] mt-1">High-Security JWT Authentication & PostgreSQL Database</p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#1E6B43] text-xs font-bold flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#1E6B43] shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
              <input
                type="text"
                required
                placeholder="Sarah Connor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] text-xs rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#0F2C59] font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
              <input
                type="email"
                required
                placeholder="sarah@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] text-xs rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#0F2C59] font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider mb-1.5">
              Company / Agency Name
            </label>
            <div className="relative">
              <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
              <input
                type="text"
                placeholder="Global Talent Solutions"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] text-xs rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#0F2C59] font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] text-xs rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#0F2C59] font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] text-xs rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#0F2C59] font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="sleek-btn-primary w-full text-xs font-black py-3.5 cursor-pointer disabled:opacity-50 mt-2 shadow-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Recruiter Account...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                <UserPlus className="w-4 h-4" />
                <span>Register Account</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        <div className="pt-3 text-center border-t border-[#E8E2D9] text-xs font-semibold text-[#60534A]">
          Already registered?{' '}
          <Link href="/login" className="font-black text-[#0047AB] hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
