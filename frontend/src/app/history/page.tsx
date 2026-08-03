'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { api } from '@/lib/api';
import { formatLocalDateTime } from '@/lib/dateUtils';
import { History, FileText, Download, Trash2, ExternalLink, Search } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'uploads' | 'downloads'>('uploads');
  const [uploadLogs, setUploadLogs] = useState<any[]>([]);
  const [downloadLogs, setDownloadLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchUploadLogs();
    fetchDownloadLogs();
  }, []);

  const fetchUploadLogs = () => {
    api.get('/api/reports/history/uploads')
      .then((res) => setUploadLogs(res.data))
      .catch((e) => console.error(e));
  };

  const fetchDownloadLogs = () => {
    api.get('/api/reports/history/downloads')
      .then((res) => setDownloadLogs(res.data))
      .catch((e) => console.error(e));
  };

  const handleDeleteUploadRecord = async (id: number) => {
    if (!confirm('Are you sure you want to remove this upload history log?')) return;
    try {
      await api.delete(`/api/reports/history/uploads/${id}`);
      setUploadLogs((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to remove history record.');
    }
  };

  const handleDeleteDownloadRecord = async (id: number) => {
    if (!confirm('Are you sure you want to remove this download history record?')) return;
    try {
      await api.delete(`/api/reports/history/downloads/${id}`);
      setDownloadLogs((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to remove history record.');
    }
  };

  const filteredUploads = uploadLogs.filter(log =>
    log.report_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDownloads = downloadLogs.filter(log =>
    log.report_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.excel_file?.toLowerCase().includes(searchQuery.toLowerCase())
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
                <History className="w-4 h-4 text-cyan-400 animate-pulse" /> Audit & Activity Logs
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-heading">Upload & Download History</h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-1">Track all resume processing batches and generated Excel exports</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10">
              {/* Real-time Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  suppressHydrationWarning
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-bold shadow-sm transition-all"
                />
              </div>

              {/* Tabs */}
              <div className="flex p-1 rounded-xl bg-slate-800/80 border border-white/10 text-xs font-bold w-full sm:w-auto" suppressHydrationWarning>
                <button
                  onClick={() => setActiveTab('uploads')}
                  suppressHydrationWarning
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'uploads' ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Uploads ({filteredUploads.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('downloads')}
                  suppressHydrationWarning
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'downloads' ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>Downloads ({filteredDownloads.length})</span>
                </button>
              </div>
            </div>
          </div>

          {/* History Content */}
          <div className="bg-[#111827]/80 border border-white/10 rounded-3xl shadow-xl backdrop-blur-xl overflow-hidden">
            {activeTab === 'uploads' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[550px]">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-white/10 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="p-4">Report Batch Title</th>
                      <th className="p-4">Resumes Processed</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs font-semibold text-slate-200">
                    {filteredUploads.length > 0 ? (
                      filteredUploads.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-black shrink-0 border border-cyan-500/20">
                                <FileText className="w-4.5 h-4.5" />
                              </div>
                              <span className="font-bold text-white text-sm">{item.report_name}</span>
                            </div>
                          </td>

                          <td className="p-4 font-mono font-bold text-slate-200">{item.resume_count} Resumes</td>

                          <td className="p-4 text-slate-400">
                            {formatLocalDateTime(item.created_at)}
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/candidates?session_id=${item.session_id || item.id}`}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 transition-colors border border-white/10"
                                title="View Candidates"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDeleteUploadRecord(item.id)}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-colors border border-white/10 cursor-pointer"
                                title="Delete Log"
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
                          No upload history matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[550px]">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-white/10 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="p-4">Report Name</th>
                      <th className="p-4">Excel File Path</th>
                      <th className="p-4">Downloaded Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs font-semibold text-slate-200">
                    {filteredDownloads.length > 0 ? (
                      filteredDownloads.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-black shrink-0 border border-purple-500/20">
                                <Download className="w-4.5 h-4.5" />
                              </div>
                              <span className="font-bold text-white text-sm">{item.report_name}</span>
                            </div>
                          </td>

                          <td className="p-4 font-mono text-xs text-slate-400 truncate max-w-[200px]">
                            {item.excel_file}
                          </td>

                          <td className="p-4 text-slate-400">
                            {formatLocalDateTime(item.download_date)}
                          </td>

                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteDownloadRecord(item.id)}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-colors border border-white/10 cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-xs font-bold text-slate-500 italic">
                          No download history matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
