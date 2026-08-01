'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { loginWithFirebaseEmail, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginWithFirebaseEmail(email.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Invalid Firebase email or password credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#2B241F] flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white shadow-xl space-y-6 relative z-10 border border-[#E8E2D9]">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F2C59] via-[#0047AB] to-[#2563EB] p-1 flex items-center justify-center shrink-0 shadow-md border border-blue-400/30">
              <img src="/logo.png" alt="AI Resume Analyzer Logo Icon" className="w-full h-full object-contain rounded-xl" />
            </div>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#2B241F]">Recruiter Sign In</h1>
            <p className="text-xs font-semibold text-[#60534A] mt-1">Firebase Authentication & PostgreSQL Database</p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full border border-[#E2D7CB] bg-[#FAF6F1] hover:bg-[#EFE7DE] text-[#2B241F] font-bold text-xs rounded-2xl py-3 px-4 flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50"
        >
          {googleLoading ? (
            <div className="w-4 h-4 border-2 border-[#0F2C59] border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span className="font-extrabold">Sign in with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-[#E8E2D9] w-full" />
          <span className="bg-white px-3 text-[10px] font-black text-[#8C7E72] uppercase tracking-wider absolute">
            or email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] text-xs rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#0F2C59] font-bold"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs font-black text-[#0047AB] hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] text-xs rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#0F2C59] font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="sleek-btn-primary w-full text-xs font-black py-3.5 cursor-pointer disabled:opacity-50 mt-2 shadow-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating with Firebase...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                <LogIn className="w-4 h-4" />
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        <div className="pt-4 text-center border-t border-[#E8E2D9] text-xs font-semibold text-[#60534A]">
          Don't have a recruiter account yet?{' '}
          <Link href="/register" className="font-black text-[#0047AB] hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
