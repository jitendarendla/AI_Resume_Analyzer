'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { email, password });
      loginUser(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#2B241F] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white shadow-xl space-y-6 relative z-10 border border-[#E8E2D9]">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F2C59] via-[#0047AB] to-[#2563EB] p-1 flex items-center justify-center shrink-0 shadow-md border border-blue-400/30">
              <img src="/logo.png" alt="AI Resume Analyzer Logo Icon" className="w-full h-full object-contain rounded-xl" />
            </div>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[#2B241F] tracking-tight">Recruiter Sign In</h1>
            <p className="text-xs font-semibold text-[#60534A] mt-1">Sign in to access your Candidate Evaluation Dashboard</p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#2B241F] font-black uppercase tracking-wider mb-2">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
              <input
                type="email"
                required
                placeholder="recruiter@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 font-bold placeholder-[#9A8D80]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[#2B241F] font-black uppercase tracking-wider">Password</label>
              <Link href="/forgot-password" className="text-[#0047AB] font-bold hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] rounded-2xl pl-10 pr-10 py-3 focus:outline-none focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 font-bold placeholder-[#9A8D80]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72] hover:text-[#2B241F] transition-colors"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="sleek-btn-primary w-full py-3.5"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Signing In...' : 'Sign In to Dashboard'}</span>
          </button>
        </form>

        <div className="text-center text-xs font-semibold text-[#60534A] pt-4 border-t border-[#F1ECE6]">
          Don't have a recruiter account?{' '}
          <Link href="/register" className="text-[#0047AB] font-black hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
