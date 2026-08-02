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
      className={`fixed top-0 right-0 z-30 h-16 bg-[#FAF6F1]/90 backdrop-blur-md border-b border-[#E8E2D9] transition-all duration-300 flex items-center left-0 ${
        collapsed ? 'md:left-20' : 'md:left-20 lg:left-64'
      }`}
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen && setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-[#EFE7DE] border border-[#E2D7CB] text-[#2B241F] hover:bg-[#E6DCF2] md:hidden cursor-pointer transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5 text-[#0F2C59]" />
          </button>
          
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0F2C59] to-[#0047AB] p-0.5 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain rounded" />
            </div>
            <span className="font-black text-xs text-[#2B241F] tracking-wider uppercase font-sans">AI RESUME</span>
          </div>
        </div>

        {/* Right User Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE7DE] border border-[#E2D7CB] text-[11px] font-extrabold text-[#60534A]">
            <Sparkles className="w-3.5 h-3.5 text-[#0047AB]" />
            <span>AI Engine Active</span>
          </div>

          {mounted && user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2.5 p-1.5 rounded-2xl bg-[#EFE7DE] border border-[#E2D7CB] hover:bg-[#E8DDD0] transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-[#0F2C59] text-white flex items-center justify-center font-black text-xs shadow-sm">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
                </div>
                <span className="text-xs font-black text-[#2B241F] hidden sm:inline pr-1">
                  {user.full_name || user.name || 'Recruiter'}
                </span>
              </button>

              {/* User Menu Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-[#E8E2D9] rounded-2xl shadow-xl p-2 z-50 space-y-1 animate-in fade-in">
                  <div className="p-3 bg-[#FAF6F1] rounded-xl border border-[#E8E2D9]">
                    <p className="text-xs font-black text-[#2B241F] truncate">{user.full_name || user.name}</p>
                    <p className="text-[10px] font-bold text-[#60534A] truncate">{user.email}</p>
                    {user.company && <p className="text-[10px] font-semibold text-[#0047AB] mt-0.5">{user.company}</p>}
                  </div>

                  <Link
                    href="/change-password"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[#2B241F] hover:bg-[#FAF6F1] transition-colors"
                  >
                    <KeyRound className="w-4 h-4 text-[#0047AB]" />
                    <span>Change Password</span>
                  </Link>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logoutUser();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-xs font-black text-[#60534A] hover:text-[#2B241F] transition-colors cursor-pointer px-2 sm:px-3 py-2">
                Sign In
              </Link>
              <Link href="/register" className="sleek-btn-primary text-xs cursor-pointer px-3 py-2">
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
