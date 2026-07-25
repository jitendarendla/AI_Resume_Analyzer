'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import StatCard from '@/components/ui/StatCard';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
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

  const COLORS = ['#0F2C59', '#0047AB', '#7FA9D1', '#10B981'];

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#2B241F] flex font-sans" suppressHydrationWarning>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <Navbar collapsed={collapsed} />

        <main className="pt-20 p-8 space-y-8 max-w-7xl mx-auto">
          {/* Header banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-[#0047AB] font-black text-xs tracking-wider uppercase mb-1">
                <Sparkles className="w-4 h-4" /> AI Resume Analyzer
              </div>
              <h1 className="text-3xl font-black text-[#2B241F] tracking-tight">Recruiter Dashboard</h1>
              <p className="text-xs font-semibold text-[#60534A] mt-1">Real-time candidate evaluation & Job Description matching insights</p>
            </div>
            <div className="flex items-center gap-3 relative z-10">
              <Link
                href="/upload"
                className="sleek-btn-primary"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Resumes</span>
              </Link>
            </div>
          </div>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="lg:col-span-2 p-7 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#0F2C59]" />
                    <h3 className="text-lg font-black text-[#2B241F]">
                      {barAnalysisMode === 'date' ? 'Date-Wise Upload Volume' : 'Week-Wise Analysis'}
                    </h3>
                  </div>
                  <p className="text-xs font-semibold text-[#60534A] mt-0.5">
                    {barAnalysisMode === 'date' ? 'Daily candidate uploads over the last 10 days' : 'Weekly volume breakdown across 4 weeks'}
                  </p>
                </div>

                {/* Date-wise vs Week-wise Toggle Buttons */}
                <div className="flex p-1 rounded-2xl bg-[#F5EFEB] border border-[#E2D7CB] text-xs font-bold shrink-0" suppressHydrationWarning>
                  <button
                    onClick={() => setBarAnalysisMode('date')}
                    suppressHydrationWarning
                    className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                      barAnalysisMode === 'date' ? 'bg-[#0F2C59] text-white shadow-md font-black' : 'text-[#60534A] hover:text-[#2B241F]'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Date-Wise</span>
                  </button>
                  <button
                    onClick={() => setBarAnalysisMode('week')}
                    suppressHydrationWarning
                    className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                      barAnalysisMode === 'week' ? 'bg-[#0F2C59] text-white shadow-md font-black' : 'text-[#60534A] hover:text-[#2B241F]'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Week-Wise</span>
                  </button>
                </div>
              </div>

              <div className="h-64">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <XAxis dataKey="label" stroke="#60534A" fontSize={12} tickLine={false} />
                      <YAxis stroke="#60534A" fontSize={12} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E8E2D9', borderRadius: '14px', color: '#2B241F', fontWeight: 'bold' }} />
                      <Bar dataKey="count" fill="#0F2C59" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full bg-[#F5EFEB] rounded-2xl animate-pulse"></div>
                )}
              </div>
            </div>

            {/* Folder-Wise Experience Breakdown Pie Chart */}
            <div className="p-7 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-[#0F2C59]" />
                    <h3 className="text-lg font-black text-[#2B241F]">Experience Breakdown</h3>
                  </div>

                  {/* Folder Filter Selector for Experience */}
                  {folderNamesList.length > 0 && (
                    <div className="flex items-center gap-1 bg-[#F5EFEB] border border-[#E2D7CB] rounded-xl px-2.5 py-1">
                      <Filter className="w-3 h-3 text-[#60534A]" />
                      <select
                        value={selectedExpFolder}
                        onChange={(e) => setSelectedExpFolder(e.target.value)}
                        className="bg-transparent text-[11px] font-black text-[#2B241F] focus:outline-none cursor-pointer max-w-[120px] truncate"
                      >
                        {folderNamesList.map((folder, idx) => (
                          <option key={idx} value={folder}>
                            {folder}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold text-[#60534A]">
                  {selectedExpFolder === 'All Folders' ? 'Candidate seniority across all folders' : `Seniority in "${selectedExpFolder}"`}
                </p>
              </div>

              <div className="h-56 my-2">
                {mounted && expData.some((d: any) => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                        {expData.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E8E2D9', borderRadius: '14px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs font-semibold text-[#60534A] text-center px-4">
                    No candidate experience data for {selectedExpFolder}.
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-center gap-3 text-xs font-bold text-[#2B241F]">
                {expData.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full Width Recent Upload History Table */}
          <div className="p-7 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-black text-[#2B241F]">Recent Upload History</h3>
                <p className="text-xs font-semibold text-[#60534A]">Latest completed candidate parsing campaigns</p>
              </div>
              <Link href="/history" className="text-xs font-bold text-[#0047AB] hover:underline flex items-center gap-1">
                <span>View All History</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#2B241F]">
                <thead className="text-xs uppercase bg-[#F5EFEB] text-[#60534A] border-b border-[#E8E2D9] font-black">
                  <tr>
                    <th className="py-3.5 px-4">Folder / Report Name</th>
                    <th className="py-3.5 px-4">Resumes Uploaded</th>
                    <th className="py-3.5 px-4">Upload Date</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1ECE6] font-semibold text-xs">
                  {stats?.recent_uploads && stats.recent_uploads.length > 0 ? (
                    stats.recent_uploads.map((item: any) => (
                      <tr key={item.id} className="hover:bg-[#FAF6F1] transition-colors">
                        <td className="py-4 px-4 font-black text-[#2B241F]">{item.report_name}</td>
                        <td className="py-4 px-4 text-[#60534A]">{item.resume_count} Files Parsed</td>
                        <td className="py-4 px-4 text-[#60534A]">{new Date(item.created_at).toLocaleString()}</td>
                        <td className="py-4 px-4 text-right">
                          <Link href="/candidates" className="text-xs text-[#0047AB] font-bold hover:underline">
                            Open Candidates
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs font-semibold text-[#60534A]">
                        No recent upload campaigns found. Upload resumes to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
