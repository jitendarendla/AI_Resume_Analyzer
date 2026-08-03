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
  BarChart3,
  Filter,
  PieChart as PieChartIcon
} from 'lucide-react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Filters state
  const [selectedFolder, setSelectedFolder] = useState<string>('All Folders');
  const [selectedExpFolder, setSelectedExpFolder] = useState<string>('All Folders');
  const [barAnalysisMode, setBarAnalysisMode] = useState<'folder' | 'week'>('folder');

  const { token } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (token) {
      api.get('/api/reports/stats')
        .then((res) => setStats(res.data))
        .catch((err) => console.error('Failed to fetch dashboard stats:', err));
    }
  }, [token]);

  const COLORS = ['#0047AB', '#0F2C59', '#7A3E65', '#2563EB', '#3B82F6', '#8B5CF6'];

  // Prepare Skill Distribution based on selected folder filter
  const getSkillsData = () => {
    if (!stats || !stats.skills_by_folder) return [];
    const source = stats.skills_by_folder[selectedFolder] || stats.skills_distribution || {};
    return Object.entries(source).map(([name, count]) => ({
      name,
      count
    })).sort((a: any, b: any) => b.count - a.count);
  };

  // Prepare Experience Distribution based on selected folder filter
  const getExpData = () => {
    if (!stats || !stats.experience_by_folder) return [];
    const source = stats.experience_by_folder[selectedExpFolder] || stats.experience_distribution || {};
    return Object.entries(source).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Available folders for filter select
  const folderNamesList = stats?.folder_names || [];

  // Bar Chart Data (Folder-wise vs Week-wise)
  const barChartData = barAnalysisMode === 'week' 
    ? (stats?.weekly_trends || []) 
    : getSkillsData().slice(0, 7).map(item => ({ label: item.name, count: item.count }));

  const expData = getExpData();

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#2B241F] flex font-sans" suppressHydrationWarning>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className={`flex-1 transition-all duration-300 ml-0 ${collapsed ? 'md:ml-20' : 'md:ml-20 lg:ml-64'}`}>
        <Navbar collapsed={collapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <main className="pt-20 sm:pt-24 lg:pt-28 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
          {/* Welcome Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0F2C59] via-[#0047AB] to-[#2563EB] text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-2 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-blue-200 border border-white/15">
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                <span>AI Talent Dashboard</span>
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                Recruiter Analytics Hub
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-xl">
                Real-world synchronized processing, candidate matching, and PDF/DOCX resume evaluation logs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 relative z-10">
              <Link
                href="/upload"
                className="px-5 py-3 rounded-2xl bg-white text-[#0F2C59] hover:bg-[#FAF6F1] font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Resumes</span>
              </Link>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Processed Resumes"
              value={stats ? stats.total_resumes : '...'}
              trend="+12% this week"
              icon={Users}
              color="indigo"
            />

            <StatCard
              title="Upload Batches"
              value={stats ? stats.total_reports : '...'}
              trend="+5 new batches"
              icon={FileSpreadsheet}
              color="purple"
            />

            <StatCard
              title="Excel Downloads"
              value={stats ? stats.total_downloads : '...'}
              trend="Synchronized"
              icon={Download}
              color="emerald"
            />

            <StatCard
              title="AI System Status"
              value={stats ? stats.ai_processing_status : 'Active'}
              trend="100% Operational"
              icon={CheckCircle2}
              color="cyan"
            />
          </div>

          {/* Analytics Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Folder-Wise / Week-Wise Skill & Batch Distribution Bar Chart */}
            <div className="lg:col-span-2 p-4 sm:p-7 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#2B241F]">
                    {barAnalysisMode === 'week' ? 'Weekly Processing Trends' : 'Skill Distribution'}
                  </h3>
                  <p className="text-xs font-semibold text-[#60534A]">
                    {barAnalysisMode === 'week' ? 'Real-world UTC weekly resume processing count' : 'Top candidate skills extracted across batches'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Folder Filter Selector (Active when folder mode selected) */}
                  {barAnalysisMode === 'folder' && folderNamesList.length > 0 && (
                    <div className="flex items-center gap-1 bg-[#F5EFEB] border border-[#E2D7CB] rounded-xl px-2.5 py-1">
                      <Filter className="w-3 h-3 text-[#60534A]" />
                      <select
                        value={selectedFolder}
                        onChange={(e) => setSelectedFolder(e.target.value)}
                        className="bg-transparent text-[11px] font-black text-[#2B241F] focus:outline-none cursor-pointer max-w-[130px] truncate"
                      >
                        {folderNamesList.map((folder: string, idx: number) => (
                          <option key={idx} value={folder}>
                            {folder}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Mode Toggle: Folder-wise vs Week-wise */}
                  <div className="flex p-1 rounded-xl bg-[#F5EFEB] border border-[#E2D7CB] text-xs font-bold" suppressHydrationWarning>
                    <button
                      onClick={() => setBarAnalysisMode('folder')}
                      suppressHydrationWarning
                      className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                        barAnalysisMode === 'folder' ? 'bg-[#0F2C59] text-white shadow-md font-black' : 'text-[#60534A] hover:text-[#2B241F]'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Folder-Wise</span>
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
              </div>

              <div className="h-56 sm:h-64">
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
            <div className="p-4 sm:p-7 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm flex flex-col justify-between">
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
                        {folderNamesList.map((folder: string, idx: number) => (
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
            </div>
          </div>

          {/* Quick Actions & Recent Activity Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-4 sm:p-7 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black text-[#2B241F]">Recent Resume Sessions</h3>
                <Link href="/history" className="text-xs font-black text-[#0047AB] hover:underline flex items-center gap-1">
                  <span>View All</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#E8E2D9]">
                <table className="w-full text-left border-collapse min-w-[500px]">
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
                          <td className="p-3.5 text-[#60534A]">{formatLocalDateTime(upload.created_at)}</td>
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
            <div className="p-4 sm:p-7 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm space-y-4 flex flex-col justify-between">
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
