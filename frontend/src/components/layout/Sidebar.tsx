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
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { user, logoutUser } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Resumes', href: '/upload', icon: UploadCloud },
    { name: 'History', href: '/history', icon: History },
    { name: 'Candidates', href: '/candidates', icon: Users },
    { name: 'Reports', href: '/reports', icon: FileSpreadsheet },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  if (mounted && user?.is_admin) {
    navItems.push({ name: 'Admin Operations', href: '/admin', icon: ShieldCheck });
  }

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen bg-[#181310] text-[#EFE7DE] transition-all duration-300 flex flex-col justify-between shadow-2xl border-r border-[#2B231D] ${
        collapsed ? 'w-20' : 'w-64'
      }`}
      suppressHydrationWarning
    >
      <div>
        {/* Header Branding */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-[#2B231D] bg-[#140F0C]">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F2C59] via-[#0047AB] to-[#2563EB] p-1 flex items-center justify-center shrink-0 shadow-lg border border-blue-400/30">
              <img
                src="/logo.png"
                alt="AI Resume Analyzer Icon"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-black text-sm text-[#FAF6F1] tracking-wider leading-none uppercase font-sans">
                  AI RESUME
                </span>
                <span className="text-[10px] text-[#7FA9D1] font-black tracking-widest uppercase mt-1">
                  ANALYZER
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            suppressHydrationWarning
            className="p-1.5 rounded-xl bg-[#241D18] hover:bg-[#332A23] text-[#A3968A] hover:text-white transition-all border border-[#3A3027] shrink-0"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-extrabold text-xs transition-all ${
                  active
                    ? 'bg-gradient-to-r from-[#0F2C59] to-[#1E40AF] text-white shadow-lg shadow-blue-900/30 border border-blue-500/30 font-black'
                    : 'text-[#A3968A] hover:text-[#FAF6F1] hover:bg-[#241D18]'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-[#8C7E72]'}`} />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-[#2B231D] bg-[#140F0C]">
        {mounted && user ? (
          <div className="flex items-center justify-between p-2 rounded-2xl bg-[#241D18] border border-[#352B23]">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-[#0F2C59] text-white flex items-center justify-center font-black text-xs shrink-0 border border-blue-400/20">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              {!collapsed && (
                <div className="overflow-hidden">
                  <p className="text-xs font-black text-[#FAF6F1] truncate">{user.full_name || 'Recruiter'}</p>
                  <p className="text-[10px] font-bold text-[#8C7E72] truncate">{user.email}</p>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                onClick={logoutUser}
                title="Logout"
                suppressHydrationWarning
                className="p-1.5 rounded-lg text-[#8C7E72] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
