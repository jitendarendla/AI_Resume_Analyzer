'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { formatLocalDateTime } from '@/lib/dateUtils';
import { FileSpreadsheet, Download, Calendar, Trash2, Search } from 'lucide-react';

export default function ReportsPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchUploadHistory();
    }
  }, [token]);

  const fetchUploadHistory = async () => {
    try {
      const res = await api.get('/api/reports/history/uploads');
      setHistory(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (identifier: string, reportName: string) => {
    try {
      const response = await api.get(`/api/reports/export/${identifier}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${reportName.replace(/ /g, '_')}_Report.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (e) {
      console.error('Download failed', e);
      alert('Failed to download Excel report. Please try again.');
    }
  };

  const handleDeleteReport = async (identifier: string) => {
    if (!confirm('Are you sure you want to delete this generated Excel report?')) return;
    try {
      await api.delete(`/api/reports/export/${identifier}`);
      setHistory((prev) => prev.filter((item) => (item.session_id || item.id) !== identifier));
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Failed to delete report.');
    }
  };

  const filteredHistory = history.filter((item) =>
    item.report_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex font-sans" suppressHydrationWarning>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className={`flex-1 transition-all duration-300 ml-0 ${collapsed ? 'md:ml-20' : 'md:ml-20 lg:ml-64'}`}>
        <Navbar collapsed={collapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <main className="pt-20 sm:pt-24 lg:pt-28 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/80 to-slate-900 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xs tracking-wider uppercase mb-1">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400 animate-pulse" /> Excel Report Exports
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-heading">Excel Candidate Reports Library</h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-1">Download structured candidate ranking sheets & ATS matching reports</p>
            </div>

            {/* Real-time Search */}
            <div className="relative w-full sm:w-64 relative z-10">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search report title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-bold shadow-sm transition-all"
              />
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-[#111827]/80 border border-white/10 rounded-3xl shadow-xl backdrop-blur-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[550px]">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-white/10 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="p-4">Folder / Report Title</th>
                    <th className="p-4">Evaluated Resumes</th>
                    <th className="p-4">Created Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-semibold text-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-xs font-bold text-slate-400">
                        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        Loading reports library...
                      </td>
                    </tr>
                  ) : filteredHistory.length > 0 ? (
                    filteredHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-black shrink-0 border border-purple-500/20 shadow-sm">
                              <FileSpreadsheet className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{item.report_name}</p>
                              <p className="text-[11px] text-slate-400 font-medium">Excel Format (.xlsx)</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-mono font-bold text-sm text-cyan-300">
                          {item.resume_count} Candidates
                        </td>

                        <td className="p-4 text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatLocalDateTime(item.created_at)}</span>
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDownload(item.session_id || item.id, item.report_name)}
                              className="sleek-btn-primary text-xs px-3 py-1.5 cursor-pointer shadow-md shadow-cyan-500/10"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Excel</span>
                            </button>

                            <button
                              onClick={() => handleDeleteReport(item.session_id || item.id)}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-colors border border-white/10 cursor-pointer"
                              title="Delete Generated Report"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-xs font-bold text-slate-500 italic">
                        No generated Excel reports found. Upload resumes to generate reports!
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
