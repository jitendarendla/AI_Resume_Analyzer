'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import FloatingDock from '@/components/layout/FloatingDock';
import { useAuth } from '@/context/AuthContext';
import {
  UploadCloud,
  FileSpreadsheet,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Search,
  Download,
  Layers,
  Zap,
  ShieldCheck,
  BarChart3,
  UserCheck,
  LogIn,
  LayoutDashboard
} from 'lucide-react';

export default function RootHomePage() {
  const { user, token } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950" suppressHydrationWarning>
      <Navbar />

      <main className="pt-20 sm:pt-24 space-y-16 sm:space-y-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950/60 to-slate-950 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl text-center space-y-8">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-cyan-500/30 text-xs font-extrabold text-cyan-300 shadow-lg relative z-10">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Enterprise Bulk Candidate Evaluation Engine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight font-heading leading-tight max-w-4xl mx-auto relative z-10">
              AI-Powered Bulk <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">Resume Analyzer</span> & Excel Generator
            </h1>

            <p className="text-sm sm:text-lg font-semibold text-slate-400 max-w-3xl mx-auto leading-relaxed relative z-10">
              Upload hundreds of candidate CVs in seconds. Extract 100% accurate skills, contact details, location, technology title, and generate instant formatted Excel reports.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 relative z-10">
              {mounted && token ? (
                <Link
                  href="/dashboard"
                  className="sleek-btn-primary text-sm px-8 py-4 cursor-pointer shadow-xl shadow-cyan-500/20 flex items-center gap-3"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="sleek-btn-primary text-sm px-8 py-4 cursor-pointer shadow-xl shadow-cyan-500/20 flex items-center gap-3"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/login"
                    className="px-8 py-4 rounded-2xl bg-slate-800/80 border border-white/10 text-slate-200 hover:bg-slate-700 font-bold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer"
                  >
                    <LogIn className="w-5 h-5 text-cyan-400" />
                    <span>Recruiter Sign In</span>
                  </Link>
                </>
              )}
            </div>

            <div className="pt-10 grid grid-cols-3 gap-6 border-t border-white/10 max-w-2xl mx-auto text-center relative z-10">
              <div>
                <p className="text-3xl font-black text-white font-mono">1000+</p>
                <p className="text-xs text-slate-400 font-medium mt-1">Resumes per Batch</p>
              </div>
              <div>
                <p className="text-3xl font-black text-cyan-400 font-mono">100%</p>
                <p className="text-xs text-slate-400 font-medium mt-1">Accurate Extraction</p>
              </div>
              <div>
                <p className="text-3xl font-black text-purple-400 font-mono">⚡ &lt;2s</p>
                <p className="text-xs text-slate-400 font-medium mt-1">Parallel Processing</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-white tracking-tight font-heading">Built for Modern HR Teams & Enterprise Recruiters</h2>
            <p className="text-slate-400 text-sm font-semibold">Automate candidate evaluation, eliminate manual resume reading, and make data-driven hiring decisions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[#111827]/80 border border-white/10 shadow-xl backdrop-blur-xl hover:border-cyan-500/40 transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-black shadow-md">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white font-heading">High Concurrency Bulk Parsing</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Upload up to 1000+ resumes per batch. Our parallel engine parses PDF, DOCX, and TXT files instantly.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#111827]/80 border border-white/10 shadow-xl backdrop-blur-xl hover:border-purple-500/40 transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-black shadow-md">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white font-heading">100% Accurate Data Extraction</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Extract candidate names, emails, phone numbers, locations, technology title, and skills without fake placeholders.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#111827]/80 border border-white/10 shadow-xl backdrop-blur-xl hover:border-emerald-500/40 transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black shadow-md">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white font-heading">7-Column Excel Generator</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Download structured OpenPyXL `.xlsx` candidate spreadsheets with S.No, Name, Email, Phone, Location, Technology/Title, and Skills.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-white tracking-tight font-heading">How AI Resume Analyzer Works</h2>
            <p className="text-slate-400 text-sm font-semibold">Four simple steps to evaluate bulk resumes and shortlist top talent.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-[#111827]/80 border border-white/10 shadow-xl space-y-3">
              <span className="text-2xl font-black text-cyan-400 font-mono">01</span>
              <h4 className="font-black text-white text-base font-heading">Bulk Upload</h4>
              <p className="text-xs text-slate-400 font-medium">Drag & drop candidate resumes or entire folder batches into the upload queue.</p>
            </div>

            <div className="p-6 rounded-3xl bg-[#111827]/80 border border-white/10 shadow-xl space-y-3">
              <span className="text-2xl font-black text-blue-400 font-mono">02</span>
              <h4 className="font-black text-white text-base font-heading">Folder Organization</h4>
              <p className="text-xs text-slate-400 font-medium">Group resumes into custom folder campaigns for instant tracking and Excel export.</p>
            </div>

            <div className="p-6 rounded-3xl bg-[#111827]/80 border border-white/10 shadow-xl space-y-3">
              <span className="text-2xl font-black text-purple-400 font-mono">03</span>
              <h4 className="font-black text-white text-base font-heading">AI Extraction</h4>
              <p className="text-xs text-slate-400 font-medium">Parallel NLP workers extract skills, experience years, education degrees, and contact details.</p>
            </div>

            <div className="p-6 rounded-3xl bg-[#111827]/80 border border-white/10 shadow-xl space-y-3">
              <span className="text-2xl font-black text-emerald-400 font-mono">04</span>
              <h4 className="font-black text-white text-base font-heading">Export Report</h4>
              <p className="text-xs text-slate-400 font-medium">View analytics in Candidate Hub and export 100% formatted Excel reports instantly.</p>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-blue-900 via-cyan-950 to-slate-900 border border-white/10 shadow-2xl text-center relative overflow-hidden backdrop-blur-xl space-y-6">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-heading relative z-10">
              Ready to Accelerate Your Recruitment Process?
            </h2>
            <p className="text-slate-300 text-sm font-semibold max-w-xl mx-auto relative z-10">
              Start analyzing bulk candidate resumes today with our enterprise-grade platform.
            </p>
            <div className="pt-2 relative z-10">
              <Link
                href="/login"
                className="sleek-btn-primary text-sm px-8 py-4 inline-flex items-center gap-3 cursor-pointer shadow-xl shadow-cyan-500/20"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-24 py-12 bg-[#090D16] border-t border-white/10 text-xs text-slate-400 font-semibold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="AI Resume Analyzer Logo" className="h-full w-full object-contain rounded-md" />
            </div>
            <span className="font-black text-white tracking-wider font-heading">AI RESUME ANALYZER</span>
          </div>
          <p>© {new Date().getFullYear()} AI Resume Analyzer Portal. All rights reserved.</p>
          <div className="flex items-center gap-6 font-bold">
            <Link href="/login" className="hover:text-cyan-400 transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-cyan-400 transition-colors">Register</Link>
          </div>
        </div>
      </footer>

      {mounted && token && <FloatingDock />}
    </div>
  );
}
