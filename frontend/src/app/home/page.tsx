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
  LayoutDashboard
} from 'lucide-react';

export default function HomePage() {
  const { user, token } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans pb-32 selection:bg-cyan-500 selection:text-slate-950" suppressHydrationWarning>
      <Navbar />

      <main className="pt-20 sm:pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* Studio Hero Banner */}
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950/60 to-slate-950 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl text-center space-y-6">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-cyan-500/30 text-xs font-extrabold text-cyan-300 shadow-lg relative z-10">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>AI-Powered Resume Analysis & ATS Match Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight font-heading leading-tight max-w-4xl mx-auto relative z-10">
            AI Resume <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">Analyzer</span> & ATS Matcher
          </h1>

          <p className="text-sm sm:text-lg font-semibold text-slate-400 max-w-2xl mx-auto relative z-10">
            Evaluate hundreds of candidate resumes in seconds. Extract skills, work history, ATS match scores, and export structured Excel reports.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 relative z-10">
            {mounted && token ? (
              <Link
                href="/dashboard"
                className="sleek-btn-primary text-sm px-7 py-3.5 cursor-pointer shadow-xl shadow-cyan-500/20 flex items-center gap-2"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="sleek-btn-primary text-sm px-7 py-3.5 cursor-pointer shadow-xl shadow-cyan-500/20 flex items-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>Get Started Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/register"
                  className="px-6 py-3.5 rounded-2xl bg-slate-800/80 border border-white/10 text-slate-200 hover:bg-slate-700 hover:text-white font-black text-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Recruiter Register</span>
                </Link>
              </>
            )}
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10 relative z-10">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block font-heading">Parsing Speed</span>
              <span className="text-xl font-black text-cyan-400 font-mono">100 CVs / Sec</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block font-heading">Supported Formats</span>
              <span className="text-xl font-black text-purple-400 font-mono">PDF & DOCX</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block font-heading">Report Export</span>
              <span className="text-xl font-black text-emerald-400 font-mono">1-Click Excel</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block font-heading">Folder Batches</span>
              <span className="text-xl font-black text-amber-400 font-mono">Unlimited</span>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-3xl bg-[#111827]/80 border border-white/10 shadow-xl backdrop-blur-xl space-y-4 hover:border-cyan-500/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-black shadow-md">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white font-heading">Bulk Resume Upload</h3>
            <p className="text-xs font-semibold text-slate-400 leading-relaxed">
              Upload multiple PDF or DOCX candidate resumes at once. Auto-group into custom folder batches.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-[#111827]/80 border border-white/10 shadow-xl backdrop-blur-xl space-y-4 hover:border-cyan-500/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-black shadow-md">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white font-heading">JD Match & ATS Scoring</h3>
            <p className="text-xs font-semibold text-slate-400 leading-relaxed">
              Compare candidate skills against your Job Description. Get instant ATS match percentages and experience rankings.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-[#111827]/80 border border-white/10 shadow-xl backdrop-blur-xl space-y-4 hover:border-cyan-500/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shadow-md">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white font-heading">Formatted Excel Reports</h3>
            <p className="text-xs font-semibold text-slate-400 leading-relaxed">
              Export ranked candidate sheets directly into formatted `.xlsx` workbooks for client or HR review.
            </p>
          </div>
        </div>
      </main>

      {mounted && token && <FloatingDock />}
    </div>
  );
}
