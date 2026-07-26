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
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-20 md:ml-64'}`}>
        <Navbar collapsed={collapsed} />

        <main className="pt-20 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
          {/* Header banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm relative overflow-hidden">
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 text-[#0047AB] font-black text-xs tracking-wider uppercase">
                <Sparkles className="w-4 h-4" /> AI Resume Analyzer
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#2B241F] tracking-tight">Recruiter Dashboard</h1>
              <p className="text-xs font-semibold text-[#60534A]">Real-time candidate evaluation & Job Description matching insights</p>
            </div>
            <div className="flex items-center gap-3 relative z-10 self-start sm:self-auto">
              <Link
                href="/upload"
                className="sleek-btn-primary text-xs"
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
            <div className="lg:col-span-2 p-5 sm:p-7 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#0F2C59]" />
                    <h3 className="text-base sm:text-lg font-black text-[#2B241F]">
                      {barAnalysisMode === 'date' ? 'Date-Wise Upload Volume' : 'Week-Wise Analysis'}
                    </h3>
                  </div>
                  <p className="text-xs font-semibold text-[#60534A] mt-0.5">
                    {barAnalysisMode === 'date' ? 'Daily candidate uploads over the last 10 days' : 'Weekly volume breakdown across 4 weeks'}
                  </p>
                </div>

                {/* Date-wise vs Week-wise Toggle Buttons */}
                <div className="flex p-1 rounded-2xl bg-[#F5EFEB] border border-[#E2D7CB] text-xs font-bold shrink-0 self-start sm:self-auto" suppressHydrationWarning>
                  <button
                    onClick={() => setBarAnalysisMode('date')}
                    suppressHydrationWarning
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                      barAnalysisMode === 'date' ? 'bg-[#0F2C59] text-white shadow-md font-black' : 'text-[#60534A] hover:text-[#2B241F]'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Date-Wise</span>
                  </button>
                  <button
                    onClick={() => setBarAnalysisMode('week')}
                    suppressHydrationWarning
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
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
                      <XAxis dataKey="label" stroke="#60534A" fontSize={11} tickLine={false} />
                      <YAxis stroke="#60534A" fontSize={11} tickLine={false} />
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
            <div className="p-5 sm:p-7 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-[#0F2C59]" />
                    <h3 className="text-base sm:text-lg font-black text-[#2B241F]">Experience Breakdown</h3>
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
                <p className="text-xs font-semibold text-[#60534A] mb-4">
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
                        <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E8E2D9', borderRadius: '12px', color: '#2B241F', fontWeight: 'bold' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-xs font-bold text-[#8C7E72] italic">No candidate experience data available</div>
                  )}
                </div>
              </div>

              {/* Pie Chart Legend */}
              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-[#E8E2D9]">
                {expData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="text-[11px] font-bold text-[#60534A] truncate">{item.name}: <span className="text-[#2B241F] font-black">{item.value}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Activity Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 sm:p-7 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black text-[#2B241F]">Recent Resume Sessions</h3>
                <Link href="/history" className="text-xs font-black text-[#0047AB] hover:underline flex items-center gap-1">
                  <span>View All</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#E8E2D9]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF6F1] border-b border-[#E8E2D9] text-[11px] font-black uppercase text-[#60534A] tracking-wider">
                      <th className="p-3.5">Report Batch Name</th>
                      <th className="p-3.5">Resumes Evaluated</th>
                      <th className="p-3.5">Created Date</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2D9] text-xs font-semibold text-[#2B241F]">
                    {stats?.recent_uploads && stats.recent_uploads.length > 0 ? (
                      stats.recent_uploads.map((upload: any) => (
                        <tr key={upload.id} className="hover:bg-[#FAF6F1]/60 transition-colors">
                          <td className="p-3.5 font-bold text-[#0F2C59]">{upload.report_name}</td>
                          <td className="p-3.5 font-mono">{upload.resume_count} candidates</td>
                          <td className="p-3.5 text-[#60534A]">{new Date(upload.created_at).toLocaleDateString()}</td>
                          <td className="p-3.5 text-right">
                            <Link
                              href={`/candidates?session_id=${upload.session_id || upload.id}`}
                              className="text-xs font-black text-[#0047AB] hover:underline"
                            >
                              View Candidates →
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-xs font-bold text-[#8C7E72] italic">
                          No recent upload sessions found. Start by uploading resumes!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="p-5 sm:p-7 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#2B241F] mb-1">Quick Actions</h3>
                <p className="text-xs font-semibold text-[#60534A] mb-4">Common recruiter operations & report exports</p>

                <div className="space-y-3">
                  <Link
                    href="/upload"
                    className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF6F1] border border-[#E8E2D9] hover:border-[#0047AB] hover:bg-white transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0047AB] flex items-center justify-center font-black">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#2B241F] group-hover:text-[#0047AB]">Bulk Resume Match</p>
                        <p className="text-[10px] font-medium text-[#60534A]">Evaluate resumes against Job Description</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#8C7E72] group-hover:text-[#0047AB]" />
                  </Link>

                  <Link
                    href="/reports"
                    className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF6F1] border border-[#E8E2D9] hover:border-[#0047AB] hover:bg-white transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7A3E65] flex items-center justify-center font-black">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#2B241F] group-hover:text-[#0047AB]">Download Excel Reports</p>
                        <p className="text-[10px] font-medium text-[#60534A]">Export candidate match scores to Excel</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#8C7E72] group-hover:text-[#0047AB]" />
                  </Link>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0F2C59] to-[#0047AB] text-white space-y-1">
                <p className="text-xs font-black flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                  <span>AI Engine 100% Operational</span>
                </p>
                <p className="text-[10px] text-blue-100 font-medium">Fast parallel analysis active across PDF & DOCX resumes</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
