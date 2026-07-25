'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { User, Mail, Building, Lock, UserPlus, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password entry.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/register', {
        name,
        email,
        company,
        password,
      });
      setSuccess(response.data.message || 'Account created successfully! Redirecting to login...');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please check details.');
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
            <h1 className="text-2xl font-black text-[#2B241F] tracking-tight">Create Recruiter Account</h1>
            <p className="text-xs font-semibold text-[#60534A] mt-1">Register to start bulk resume parsing & JD matching</p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          {/* Full Name */}
          <div>
            <label className="block text-[#2B241F] font-black uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
              <input
                type="text"
                required
                placeholder="Enter your full name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 font-bold placeholder-[#9A8D80]"
              />
            </div>
          </div>

          {/* Work Email */}
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

          {/* Company / Organization */}
          <div>
            <label className="block text-[#2B241F] font-black uppercase tracking-wider mb-2">Company / Organization</label>
            <div className="relative">
              <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
              <input
                type="text"
                required
                placeholder="Recruitment Agency / Company Name..."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 font-bold placeholder-[#9A8D80]"
              />
            </div>
          </div>

          {/* Password Entry 1 */}
          <div>
            <label className="block text-[#2B241F] font-black uppercase tracking-wider mb-2">Password</label>
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

          {/* Password Entry 2: Confirm Password */}
          <div>
            <label className="block text-[#2B241F] font-black uppercase tracking-wider mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] rounded-2xl pl-10 pr-10 py-3 focus:outline-none focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 font-bold placeholder-[#9A8D80]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72] hover:text-[#2B241F] transition-colors"
                title={showConfirmPassword ? 'Hide Password' : 'Show Password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="sleek-btn-primary w-full py-3.5 mt-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </form>

        <div className="text-center text-xs font-semibold text-[#60534A] pt-4 border-t border-[#F1ECE6]">
          Already have a recruiter account?{' '}
          <Link href="/login" className="text-[#0047AB] font-black hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
