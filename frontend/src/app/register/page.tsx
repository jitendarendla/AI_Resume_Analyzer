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
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#111827]/80 backdrop-blur-2xl shadow-2xl space-y-5 relative z-10 border border-white/10">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 p-0.5 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20 border border-white/20">
              <img src="/logo.png" alt="AI Resume Analyzer Logo Icon" className="w-full h-full object-contain rounded-xl" />
            </div>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-heading">Create Recruiter Account</h1>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-black text-slate-200 uppercase tracking-wider mb-1.5 font-heading">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Sarah Connor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900/80 border border-white/10 text-white text-xs rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-cyan-500 font-bold placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-200 uppercase tracking-wider mb-1.5 font-heading">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="sarah@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/80 border border-white/10 text-white text-xs rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-cyan-500 font-bold placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-200 uppercase tracking-wider mb-1.5 font-heading">
              Company / Agency Name
            </label>
            <div className="relative">
              <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Global Talent Solutions"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-slate-900/80 border border-white/10 text-white text-xs rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-cyan-500 font-bold placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-200 uppercase tracking-wider mb-1.5 font-heading">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/80 border border-white/10 text-white text-xs rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-cyan-500 font-bold placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-200 uppercase tracking-wider mb-1.5 font-heading">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-900/80 border border-white/10 text-white text-xs rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-cyan-500 font-bold placeholder-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="sleek-btn-primary w-full text-xs font-black py-3.5 cursor-pointer disabled:opacity-50 mt-2 shadow-xl shadow-cyan-500/20"
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

        <div className="pt-3 text-center border-t border-white/10 text-xs font-semibold text-slate-400">
          Already registered?{' '}
          <Link href="/login" className="font-black text-cyan-400 hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
