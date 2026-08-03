'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-[#090D16]/80 backdrop-blur-2xl border-b border-white/10 flex items-center">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Emblem */}
        <Link href="/dashboard" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 p-0.5 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20 border border-white/20">
            <img src="/logo.png" alt="AI Resume Analyzer Logo" className="w-full h-full object-contain rounded-lg" />
          </div>
          <span className="font-black text-sm sm:text-base text-white tracking-wider uppercase font-heading group-hover:text-cyan-300 transition-colors">
            AI RESUME ANALYZER
          </span>
        </Link>

        {/* Right AI Status Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-xs font-extrabold text-cyan-300 shadow-md shadow-cyan-500/5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>AI Engine Active</span>
        </div>
      </div>
    </header>
  );
}
