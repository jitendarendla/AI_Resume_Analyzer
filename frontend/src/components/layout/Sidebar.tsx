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
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (v: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user, logoutUser } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
      if (window.innerWidth >= 768 && setMobileOpen) {
        setMobileOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setCollapsed, setMobileOpen]);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Resumes', href: '/upload', icon: UploadCloud },
    { name: 'History', href: '/history', icon: History },
    { name: 'Candidates', href: '/candidates', icon: Users },
    { name: 'Reports', href: '/reports', icon: FileSpreadsheet },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#090D16]/80 backdrop-blur-md md:hidden transition-opacity"
          onClick={() => setMobileOpen && setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-[#0F172A]/90 backdrop-blur-2xl text-slate-200 transition-all duration-300 flex flex-col justify-between shadow-2xl border-r border-white/10 ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${
          collapsed ? 'md:w-20' : 'md:w-64'
        }`}
        suppressHydrationWarning
      >
        <div>
          {/* Header Branding */}
          <div className={`h-20 flex items-center border-b border-white/10 bg-[#090D16]/60 transition-all ${
            collapsed ? 'justify-between md:justify-center px-4 md:px-2 gap-1.5' : 'justify-between px-5'
          }`}>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Link href="/dashboard" className="flex items-center shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 p-0.5 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20 border border-white/20">
                  <img
                    src="/logo.png"
                    alt="AI Resume Analyzer Icon"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
              </Link>
              {(!collapsed || mobileOpen) && (
                <div className="flex flex-col">
                  <span className="font-black text-sm text-white tracking-wider leading-none uppercase font-heading">
                    AI RESUME
                  </span>
                  <span className="text-[10px] text-cyan-400 font-black tracking-widest uppercase mt-1">
                    ANALYZER
                  </span>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white md:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 rounded-xl bg-slate-800/80 border border-white/10 text-slate-400 hover:text-cyan-400 cursor-pointer transition-colors"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen && setMobileOpen(false)}
                  className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all duration-200 group font-extrabold text-xs cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-purple-600/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                  } ${collapsed && !mobileOpen ? 'justify-center px-0' : ''}`}
                  title={collapsed ? item.name : ''}
                >
                  <div className={`p-2 rounded-xl transition-all ${
                    isActive ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30' : 'bg-slate-800/80 text-slate-400 group-hover:text-cyan-400 group-hover:bg-slate-800'
                  }`}>
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  {(!collapsed || mobileOpen) && (
                    <span className="truncate">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer User Info & Logout */}
        <div className="p-3 border-t border-white/10 bg-[#090D16]/60">
          {mounted && user && (!collapsed || mobileOpen) && (
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-white/5 mb-2 overflow-hidden">
              <p className="text-xs font-black text-white truncate">{user.full_name || user.name}</p>
              <p className="text-[10px] font-bold text-slate-400 truncate">{user.email}</p>
            </div>
          )}

          <button
            onClick={logoutUser}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all cursor-pointer border border-transparent ${
              collapsed && !mobileOpen ? 'justify-center px-0' : ''
            }`}
            title="Sign Out"
          >
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <LogOut className="w-4 h-4 shrink-0" />
            </div>
            {(!collapsed || mobileOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
