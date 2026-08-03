'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import FloatingDock from '@/components/layout/FloatingDock';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { formatLocalDateTime } from '@/lib/dateUtils';
import {
  FileSpreadsheet,
  Users,
  Download,
  Sparkles,
  ArrowUpRight,
  UploadCloud,
  CheckCircle2,
  Calendar,
  BarChart3,
  Filter,
  PieChart as PieChartIcon,
  ChevronRight,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [barAnalysisMode, setBarAnalysisMode] = useState<'date' | 'week'>('date');
  const [selectedExpFolder, setSelectedExpFolder] = useState<string>('All Folders');

  const { token } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/reports/stats');
      setStats(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const expByFolderDict = stats?.exp_by_folder || {};
  const folderNamesList = Object.keys(expByFolderDict);

  const activeExpObj = expByFolderDict[selectedExpFolder] || stats?.experience_distribution || {};

  const expData = Object.keys(activeExpObj).length > 0
    ? Object.entries(activeExpObj).map(([name, value]) => ({ name, value: Number(value) || 0 }))
    : [];

  const barChartData = barAnalysisMode === 'date'
    ? (stats?.date_wise_trends || [])
    : (stats?.week_wise_trends || []);

  const COLORS = ['#06B6D4', '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans pb-32" suppressHydrationWarning>
      <Navbar />

      <main className="pt-24 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Studio Hero Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950/60 to-slate-950 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-cyan-500/30 text-xs font-extrabold text-cyan-300 shadow-lg">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Next-Gen Talent Studio</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-heading leading-tight">
              Talent Intelligence Studio
            </h1>

            <p className="text-sm sm:text-base font-semibold text-slate-400">
              Bulk resume evaluation, real-world candidate scoring, and instant JD match reporting.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/upload"
                className="sleek-btn-primary text-xs cursor-pointer shadow-xl shadow-cyan-500/20"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload New Batch</span>
              </Link>

              <Link
                href="/candidates"
                className="px-5 py-3 rounded-2xl bg-slate-800/80 border border-white/10 text-slate-200 hover:bg-slate-700 hover:text-white font-black text-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-cyan-400" />
                <span>View All Candidates</span>
              </Link>
            </div>
          </div>

          {/* Quick Studio Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10 relative z-10">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block font-heading">Total Resumes</span>
              <span className="text-2xl font-black text-white font-mono">{stats?.total_resumes ?? 0}</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block font-heading">Upload Batches</span>
              <span className="text-2xl font-black text-cyan-400 font-mono">{stats?.total_reports ?? 0}</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block font-heading">Excel Exports</span>
              <span className="text-2xl font-black text-purple-400 font-mono">{stats?.total_downloads ?? 0}</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block font-heading">AI Engine</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">100% Active</span>
            </div>
          </div>
        </div>

        {/* Studio Horizontal Candidate & Session Reels */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg sm:text-xl font-black text-white font-heading">Recent Batch Reels</h2>
            </div>

            <Link href="/history" className="text-xs font-black text-cyan-400 hover:underline flex items-center gap-1">
              <span>View History Log</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stats?.recent_uploads && stats.recent_uploads.length > 0 ? (
              stats.recent_uploads.map((upload: any) => (
                <div
                  key={upload.id}
                  className="p-6 rounded-3xl bg-[#111827]/80 border border-white/10 shadow-xl backdrop-blur-xl hover:border-cyan-500/40 transition-all duration-300 group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono font-black text-cyan-400">
                        {upload.resume_count} Resumes
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {formatLocalDateTime(upload.created_at)}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors font-heading truncate">
                      {upload.report_name}
                    </h3>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Batch Evaluation Dossier</span>
                    <Link
                      href={`/candidates?session_id=${upload.session_id || upload.id}`}
                      className="p-2 rounded-xl bg-slate-800 text-cyan-400 hover:bg-cyan-500/20 transition-all cursor-pointer"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 rounded-3xl bg-[#111827]/80 border border-white/10 text-center text-xs font-bold text-slate-500 italic">
                No recent upload batches found. Click Upload New Batch to start analyzing resumes!
              </div>
            )}
          </div>
        </div>

        {/* Studio Analytics Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Graph: Date-Wise and Week-Wise Toggle */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#111827]/80 border border-white/10 shadow-xl backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base sm:text-lg font-black text-white font-heading">
                    {barAnalysisMode === 'date' ? 'Date-Wise Upload Volume' : 'Week-Wise Analysis'}
                  </h3>
                </div>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  {barAnalysisMode === 'date' ? 'Daily candidate uploads over the last 10 days' : 'Weekly volume breakdown across 4 weeks'}
                </p>
              </div>

              {/* Date-wise vs Week-wise Toggle Buttons */}
              <div className="flex p-1 rounded-2xl bg-slate-800/80 border border-white/10 text-xs font-bold shrink-0 self-start sm:self-auto" suppressHydrationWarning>
                <button
                  onClick={() => setBarAnalysisMode('date')}
                  suppressHydrationWarning
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    barAnalysisMode === 'date' ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Date-Wise</span>
                </button>
                <button
                  onClick={() => setBarAnalysisMode('week')}
                  suppressHydrationWarning
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    barAnalysisMode === 'week' ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Week-Wise</span>
                </button>
              </div>
            </div>

            <div className="h-60 sm:h-64">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '14px', color: '#F8FAFC', fontWeight: 'bold' }} />
                    <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06B6D4" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full bg-slate-800/40 rounded-2xl animate-pulse"></div>
              )}
            </div>
          </div>

          {/* Folder-Wise Experience Breakdown Pie Chart */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#111827]/80 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base sm:text-lg font-black text-white font-heading">Experience Breakdown</h3>
                </div>

                {/* Folder Filter Selector for Experience */}
                {folderNamesList.length > 0 && (
                  <div className="flex items-center gap-1 bg-slate-800/80 border border-white/10 rounded-xl px-2.5 py-1">
                    <Filter className="w-3 h-3 text-cyan-400" />
                    <select
                      value={selectedExpFolder}
                      onChange={(e) => setSelectedExpFolder(e.target.value)}
                      className="bg-transparent text-[11px] font-black text-slate-200 focus:outline-none cursor-pointer max-w-[120px] truncate"
                    >
                      {folderNamesList.map((folder: string, idx: number) => (
                        <option key={idx} value={folder} className="bg-slate-900 text-white">
                          {folder}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-400 mb-4">
                Experience level distribution across candidates
              </p>

              <div className="h-44 flex items-center justify-center">
                {mounted && expData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expData}
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {expData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#F8FAFC', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs font-bold text-slate-500 italic">No candidate experience data available</div>
                )}
              </div>
            </div>

            {/* Pie Chart Legend */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/10">
              {expData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="text-[11px] font-bold text-slate-400 truncate">{item.name}: <span className="text-white font-black">{item.value}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <FloatingDock />
    </div>
  );
}
