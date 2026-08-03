'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Command } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-[#090D16]/60 backdrop-blur-xl border-b border-white/5 flex items-center px-4 sm:px-8">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        {/* Brand Emblem */}
        <Link href="/dashboard" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 p-0.5 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20 border border-white/20">
            <img src="/logo.png" alt="AI Resume Analyzer Logo" className="w-full h-full object-contain rounded-lg" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xs sm:text-sm text-white tracking-wider uppercase font-heading group-hover:text-cyan-300 transition-colors">
              AI RESUME STUDIO
            </span>
            <span className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">
              Recruiter Command Hub
            </span>
          </div>
        </Link>

        {/* Center AI Engine Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-xs font-extrabold text-cyan-300 shadow-md shadow-cyan-500/5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Talent Intelligence Engine Active</span>
        </div>

        {/* Right Studio Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-white/10 text-xs font-bold text-slate-300">
            <Command className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline font-mono">Press Dock to Switch</span>
          </div>
        </div>
      </div>
    </header>
  );
}
