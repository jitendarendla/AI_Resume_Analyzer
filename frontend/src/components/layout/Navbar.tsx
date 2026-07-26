'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs';

interface NavbarProps {
  collapsed: boolean;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export default function Navbar({ collapsed }: NavbarProps) {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-[#FAF6F1]/90 backdrop-blur-md border-b border-[#E8E2D9] transition-all duration-300 flex items-center justify-end px-6 ${
        collapsed ? 'left-20' : 'left-64'
      }`}
      suppressHydrationWarning
    >
      {/* Right User Controls */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE7DE] border border-[#E2D7CB] text-[11px] font-extrabold text-[#60534A]">
          <Sparkles className="w-3.5 h-3.5 text-[#0047AB]" />
          <span>AI Engine Active</span>
        </div>

        {/* Clerk Auth Controls */}
        <Show when="signed-out">
          <div className="flex items-center gap-2">
            <SignInButton mode="modal">
              <button className="text-xs font-black text-[#60534A] hover:text-[#2B241F] transition-colors cursor-pointer px-3 py-2">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="sleek-btn-primary text-xs cursor-pointer">
                Create Account
              </button>
            </SignUpButton>
          </div>
        </Show>

        <Show when="signed-in">
          <div className="flex items-center gap-3">
            <UserButton showName />
          </div>
        </Show>

        {/* Recruiter Profile Pill */}
        <Link href="/profile" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity" suppressHydrationWarning>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0F2C59] to-[#1E40AF] flex items-center justify-center font-black text-white text-sm shadow-md border border-blue-400/20">
            {mounted && user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'R'}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-black text-[#2B241F] leading-tight">{mounted && user?.full_name ? user.full_name : 'Recruiter'}</p>
            <p className="text-[10px] font-extrabold text-[#60534A]">{mounted && user?.company ? user.company : 'Recruitment Portal'}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#8C7E72] hidden sm:block" />
        </Link>
      </div>
    </header>
  );
}
