'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { UserProfile, useUser } from '@clerk/nextjs';
import {
  User,
  ShieldCheck,
  Building,
  Mail,
  FileText,
  Users,
  Download,
  Award,
  Sparkles
} from 'lucide-react';

export default function ProfilePage() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const { user: clerkUser, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/reports/stats');
      setStats(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const displayName = (mounted && isLoaded && clerkUser?.fullName) || user?.full_name || user?.name || 'Recruiter';
  const displayEmail = (mounted && isLoaded && clerkUser?.primaryEmailAddress?.emailAddress) || user?.email || 'recruiter@company.com';
  const displayCompany = user?.company || 'Recruitment Agency';
  const avatarUrl = (mounted && isLoaded && clerkUser?.imageUrl) || user?.avatar_url;

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#2B241F] flex font-sans" suppressHydrationWarning>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <Navbar collapsed={collapsed} />

        <main className="pt-24 p-8 space-y-8 max-w-7xl mx-auto">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 rounded-3xl bg-gradient-to-r from-[#0F2C59] via-[#0047AB] to-[#2563EB] text-white shadow-xl">
            <div className="flex items-center gap-6">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white/40 shadow-lg shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-black text-3xl border border-white/30 shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black font-heading">{displayName}</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-400/20 border border-blue-300/30 text-[11px] font-black uppercase tracking-wider text-blue-100 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Recruiter</span>
                  </span>
                </div>
                <p className="text-xs text-blue-100 font-medium flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {displayEmail}</span>
                  <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> {displayCompany}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
              <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-200 block">ACCOUNT TYPE</span>
                <span className="text-xs font-black">Enterprise Recruiter</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0047AB] flex items-center justify-center font-black shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-[#0047AB] font-mono">{stats?.total_candidates ?? 0}</p>
                <p className="text-xs font-bold text-[#60534A]">Total Resumes Evaluated</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#1E6B43] flex items-center justify-center font-black shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-[#1E6B43] font-mono">{stats?.total_sessions ?? 0}</p>
                <p className="text-xs font-bold text-[#60534A]">JD Match Sessions</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#7A3E65] flex items-center justify-center font-black shrink-0">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-[#7A3E65] font-mono">{stats?.total_exports ?? 0}</p>
                <p className="text-xs font-bold text-[#60534A]">Excel Reports Generated</p>
              </div>
            </div>
          </div>

          {/* Clerk Official User Profile Manager */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0047AB]" />
              <h2 className="text-lg font-black text-[#2B241F] font-heading">Security & Account Settings</h2>
            </div>

            <div className="flex justify-center w-full overflow-hidden rounded-3xl border border-[#E8E2D9] shadow-xl bg-white">
              <UserProfile
                routing="hash"
                appearance={{
                  elements: {
                    rootBox: 'w-full shadow-none border-none',
                    cardBox: 'w-full shadow-none border-none rounded-3xl bg-white',
                    navbar: 'border-r border-[#E8E2D9] bg-[#FAF6F1]',
                    navbarButton: 'font-bold text-xs text-[#60534A] hover:text-[#0F2C59] transition-colors',
                    navbarButton__active: 'font-black text-[#0047AB] bg-white shadow-sm',
                    headerTitle: 'font-black text-[#2B241F] font-heading text-lg',
                    formButtonPrimary: 'sleek-btn-primary text-xs cursor-pointer',
                    formFieldInput: 'rounded-xl border border-[#E2D7CB] bg-[#FAF6F1] text-xs font-semibold',
                  }
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
