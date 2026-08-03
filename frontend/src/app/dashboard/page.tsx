'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import StatCard from '@/components/ui/StatCard';
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
  PieChart as PieChartIcon
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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex font-sans" suppressHydrationWarning>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className={`flex-1 transition-all duration-300 ml-0 ${collapsed ? 'md:ml-20' : 'md:ml-20 lg:ml-64'}`}>
        <Navbar collapsed={collapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <main className="pt-20 sm:pt-24 lg:pt-28 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
          {/* Header banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/80 to-slate-900 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xs tracking-wider uppercase">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" /> AI Talent Analytics Engine
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-heading">
                Recruiter Dashboard
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-400 max-w-xl">
                Real-time candidate evaluation & Job Description matching insights with local timezone synchronization.
              </p>
            </div>
            <div className="flex items-center gap-3 relative z-10 self-start sm:self-auto">
              <Link
                href="/upload"
                className="sleek-btn-primary text-xs cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Resumes</span>
              </Link>
            </div>
          </div>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Total Resumes Analyzed"
              value={stats?.total_resumes ?? 0}
              subtitle="Uploaded candidate records"
              icon={Users}
              color="indigo"
            />
            <StatCard
              title="Total Generated Reports"
              value={stats?.total_reports ?? 0}
              subtitle="Completed JD match sessions"
              icon={FileSpreadsheet}
              color="purple"
            />
            <StatCard
              title="Total Excel Downloads"
              value={stats?.total_downloads ?? 0}
              subtitle="Exported candidate reports"
              icon={Download}
              color="emerald"
            />
            <StatCard
              title="AI Engine Status"
              value={stats?.ai_processing_status || "Operational"}
              subtitle="High concurrency background workers"
              icon={CheckCircle2}
              color="cyan"
            />
          </div>

          {/* Analytics Charts Row: Date/Week Bar Graph & Folder-Wise Experience Pie Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar Graph: Date-Wise and Week-Wise Toggle */}
            <div className="lg:col-span-2 p-5 sm:p-7 rounded-3xl bg-[#111827]/80 border border-white/10 shadow-xl backdrop-blur-xl">
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
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      barAnalysisMode === 'date' ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Date-Wise</span>
                  </button>
                  <button
                    onClick={() => setBarAnalysisMode('week')}
                    suppressHydrationWarning
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      barAnalysisMode === 'week' ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Week-Wise</span>
                  </button>
                </div>
              </div>

              <div className="h-56 sm:h-64">
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
            <div className="p-5 sm:p-7 rounded-3xl bg-[#111827]/80 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col justify-between">
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

          {/* Quick Actions & Recent Activity Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 sm:p-7 rounded-3xl bg-[#111827]/80 border border-white/10 shadow-xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black text-white font-heading">Recent Resume Sessions</h3>
                <Link href="/history" className="text-xs font-black text-cyan-400 hover:underline flex items-center gap-1">
                  <span>View All</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-white/10 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="p-3.5">Report Batch Name</th>
                      <th className="p-3.5">Resumes Evaluated</th>
                      <th className="p-3.5">Created Date</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs font-semibold text-slate-200">
                    {stats?.recent_uploads && stats.recent_uploads.length > 0 ? (
                      stats.recent_uploads.map((upload: any) => (
                        <tr key={upload.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-3.5 font-bold text-cyan-300">{upload.report_name}</td>
                          <td className="p-3.5 font-mono">{upload.resume_count} candidates</td>
                          <td className="p-3.5 text-slate-400">{formatLocalDateTime(upload.created_at)}</td>
                          <td className="p-3.5 text-right">
                            <Link
                              href={`/candidates?session_id=${upload.session_id || upload.id}`}
                              className="text-xs font-black text-cyan-400 hover:underline"
                            >
                              View Candidates →
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-xs font-bold text-slate-500 italic">
                          No recent upload sessions found. Start by uploading resumes!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="p-5 sm:p-7 rounded-3xl bg-[#111827]/80 border border-white/10 shadow-xl backdrop-blur-xl space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white font-heading mb-1">Quick Actions</h3>
                <p className="text-xs font-semibold text-slate-400 mb-4">Common recruiter operations & report exports</p>

                <div className="space-y-3">
                  <Link
                    href="/upload"
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/40 hover:bg-slate-800/80 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-black border border-cyan-500/20">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white group-hover:text-cyan-400">Bulk Resume Match</p>
                        <p className="text-[10px] font-medium text-slate-400">Evaluate resumes against Job Description</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
                  </Link>

                  <Link
                    href="/reports"
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/40 hover:bg-slate-800/80 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-black border border-purple-500/20">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white group-hover:text-purple-400">Download Excel Reports</p>
                        <p className="text-[10px] font-medium text-slate-400">Export candidate match scores to Excel</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
                  </Link>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-cyan-500/30 text-white space-y-1 shadow-lg">
                <p className="text-xs font-black flex items-center gap-1.5 text-cyan-300">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>AI Engine 100% Operational</span>
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Fast parallel analysis active across PDF & DOCX resumes</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
