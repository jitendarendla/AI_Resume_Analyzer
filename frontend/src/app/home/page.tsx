'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  UploadCloud,
  FileSpreadsheet,
  Users,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Search,
  Database,
  Download,
  Star,
  ChevronRight,
  UserCheck,
  LogIn
} from 'lucide-react';

export default function HomePage() {
  const { user, token } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Security Directive: Navigating to Home page clears stored token session
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('recruiter');
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-blue-600 selection:text-white" suppressHydrationWarning>
      {/* Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0b132b]/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0047AB] p-1 flex items-center justify-center shrink-0 shadow-lg border border-blue-400/30">
              <img src="/logo.png" alt="AI Resume Analyzer Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-base text-white tracking-wider leading-none uppercase">
                AI RESUME
              </span>
              <span className="text-[10px] text-cyan-400 font-extrabold tracking-widest uppercase mt-0.5">
                ANALYZER
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</a>
            <a href="#analytics" className="hover:text-cyan-400 transition-colors">Analytics</a>
            <a href="#enterprise" className="hover:text-cyan-400 transition-colors">Enterprise</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              Recruiter Sign In
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-24 relative overflow-hidden bg-gradient-to-b from-[#0b132b] via-[#0047AB]/20 to-slate-900">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Next-Gen Enterprise Resume Parsing Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            AI-Powered Bulk <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
              Resume Analyzer
            </span> & ATS Matcher
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Upload hundreds of candidate CVs in seconds. Extract 100% accurate skills, contact details, education, work experience, and generate instant Job Description match scoring reports.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/40 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700 flex items-center justify-center gap-3 transition-all"
            >
              <LogIn className="w-5 h-5 text-blue-400" />
              <span>Recruiter Sign In</span>
            </Link>
          </div>

          <div className="pt-10 grid grid-cols-3 gap-6 border-t border-slate-800/80 max-w-2xl mx-auto text-center">
            <div>
              <p className="text-3xl font-black text-white">1000+</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Resumes per Batch</p>
            </div>
            <div>
              <p className="text-3xl font-black text-cyan-400">100%</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Accurate Extraction</p>
            </div>
            <div>
              <p className="text-3xl font-black text-indigo-400">⚡ &lt;2s</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Parallel Processing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-24 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-white tracking-tight">Built for Modern HR Teams & Enterprise Recruiters</h2>
            <p className="text-slate-400 text-sm">Automate candidate evaluation, eliminate manual resume reading, and make data-driven hiring decisions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">High Concurrency Bulk Parsing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload up to 1000+ resumes per batch. Our 32-worker parallel engine parses PDF, DOCX, and TXT files instantly.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">100% Accurate Data Extraction</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Extract candidate names, emails, phone numbers, locations, skills, education, certifications, and links without fake placeholders.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Instant Excel Report Generator</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Download structured OpenPyXL `.xlsx` candidate spreadsheets with custom ATS scores, skill matrices, and contact details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-white tracking-tight">How AI Resume Analyzer Works</h2>
            <p className="text-slate-400 text-sm">Four simple steps to evaluate bulk resumes and shortlist top talent.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
              <span className="text-2xl font-black text-blue-400">01</span>
              <h4 className="font-extrabold text-white text-base">Bulk Upload</h4>
              <p className="text-xs text-slate-400">Drag & drop candidate resumes or entire folder batches into the upload queue.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
              <span className="text-2xl font-black text-cyan-400">02</span>
              <h4 className="font-extrabold text-white text-base">Target JD Input</h4>
              <p className="text-xs text-slate-400">Paste your job description requirements to enable automated ATS skill matching.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
              <span className="text-2xl font-black text-indigo-400">03</span>
              <h4 className="font-extrabold text-white text-base">AI Extraction</h4>
              <p className="text-xs text-slate-400">Parallel NLP workers extract skills, experience years, education degrees, and contact details.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
              <span className="text-2xl font-black text-emerald-400">04</span>
              <h4 className="font-extrabold text-white text-base">Export Report</h4>
              <p className="text-xs text-slate-400">View analytics in Candidate Hub and export 100% formatted Excel reports instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Ready to Accelerate Your Recruitment Process?</h2>
          <p className="text-blue-100 text-sm max-w-xl mx-auto">Start analyzing bulk candidate resumes today with our enterprise-grade platform.</p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-blue-800 font-black text-sm shadow-2xl hover:bg-blue-50 transition-all transform hover:scale-105"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 border-t border-slate-800 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="AI Resume Analyzer Logo" className="h-8 w-auto object-contain rounded-lg" />
            <span className="font-bold text-white">AI RESUME ANALYZER</span>
          </div>
          <p>© {new Date().getFullYear()} AI Resume Analyzer Portal. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-white">Sign In</Link>
            <Link href="/register" className="hover:text-white">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
