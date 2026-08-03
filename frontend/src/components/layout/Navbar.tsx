'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Menu, LogOut, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  collapsed: boolean;
  mobileOpen?: boolean;
  setMobileOpen?: (v: boolean) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export default function Navbar({ collapsed, mobileOpen, setMobileOpen }: NavbarProps) {
  const { user, logoutUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-[#090D16]/80 backdrop-blur-xl border-b border-white/10 transition-all duration-300 flex items-center left-0 ${
        collapsed ? 'md:left-20' : 'md:left-20 lg:left-64'
      }`}
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen && setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-slate-800/80 border border-white/10 text-slate-200 hover:bg-slate-700 md:hidden cursor-pointer transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5 text-cyan-400" />
          </button>
          
          <div className="flex items-center gap-2.5 md:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <span className="font-black text-xs text-white tracking-wider uppercase font-heading">AI RESUME</span>
          </div>
        </div>

        {/* Right User Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-cyan-500/30 text-[11px] font-extrabold text-cyan-300 shadow-md shadow-cyan-500/5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>AI Engine 100% Active</span>
          </div>

          {mounted && user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2.5 p-1.5 rounded-2xl bg-slate-800/80 border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer shadow-md"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
                </div>
                <span className="text-xs font-black text-slate-200 hidden sm:inline pr-1">
                  {user.full_name || user.name || 'Recruiter'}
                </span>
              </button>

              {/* User Menu Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in backdrop-blur-xl">
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-white/5 space-y-0.5">
                    <p className="text-xs font-black text-white truncate">{user.full_name || user.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 truncate">{user.email}</p>
                    {user.company && <p className="text-[10px] font-bold text-cyan-400 mt-1">{user.company}</p>}
                  </div>

                  <Link
                    href="/change-password"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
                  >
                    <KeyRound className="w-4 h-4 text-cyan-400" />
                    <span>Change Password</span>
                  </Link>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
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
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-xs font-black text-slate-300 hover:text-white transition-colors cursor-pointer px-3 py-2">
                Sign In
              </Link>
              <Link href="/register" className="sleek-btn-primary text-xs cursor-pointer px-3.5 py-2">
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
