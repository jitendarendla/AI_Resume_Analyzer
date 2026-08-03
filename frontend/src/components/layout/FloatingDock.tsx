'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  UploadCloud,
  Users,
  FileSpreadsheet,
  History,
  LogOut,
  KeyRound
} from 'lucide-react';

export default function FloatingDock() {
  const pathname = usePathname();
  const { user, logoutUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload', href: '/upload', icon: UploadCloud },
    { name: 'Candidates', href: '/candidates', icon: Users },
    { name: 'History', href: '/history', icon: History },
    { name: 'Reports', href: '/reports', icon: FileSpreadsheet },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center pointer-events-auto max-w-[95vw]" suppressHydrationWarning>
      <div className="flex items-center gap-2 p-2 rounded-full bg-[#111827]/90 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-cyan-500/10">
        {/* Brand Emblem */}
        <Link href="/dashboard" className="flex items-center pl-2 pr-3 py-1.5 rounded-full bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 transition-all gap-2 group cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 p-0.5 flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/20">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain rounded-full" />
          </div>
          <span className="text-xs font-black text-white tracking-wider font-heading hidden sm:inline group-hover:text-cyan-300 transition-colors uppercase">
            AI RESUME
          </span>
        </Link>

        <div className="h-5 w-[1px] bg-white/10 mx-0.5 hidden sm:block" />

        {/* Dock Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-3.5 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2 text-xs font-extrabold cursor-pointer group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white shadow-lg shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className={`hidden md:inline ${isActive ? 'font-black' : ''}`}>{item.name}</span>
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400"></span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="h-5 w-[1px] bg-white/10 mx-0.5" />

        {/* Profile Trigger & Dropdown */}
        {mounted && user ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
              </div>
              <span className="text-xs font-black text-slate-200 hidden lg:inline max-w-[100px] truncate">
                {user.full_name || user.name || 'Recruiter'}
              </span>
            </button>

            {showProfileMenu && (
              <div className="absolute bottom-14 right-0 w-64 bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 space-y-1 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-2">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-white/5 space-y-0.5">
                  <p className="text-xs font-black text-white truncate">{user.full_name || user.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 truncate">{user.email}</p>
                  {user.company && <p className="text-[10px] font-bold text-cyan-400 mt-1">{user.company}</p>}
                </div>

                <Link
                  href="/change-password"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
                >
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  <span>Change Password</span>
                </Link>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logoutUser();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="px-3.5 py-2 rounded-full bg-cyan-500 text-slate-950 font-black text-xs hover:bg-cyan-400 transition-all cursor-pointer">
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
