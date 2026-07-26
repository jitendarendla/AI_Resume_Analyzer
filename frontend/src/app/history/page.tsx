'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { api } from '@/lib/api';
import { History, FileText, Download, Trash2, ExternalLink, Search } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const [collapsed, setCollapsed] = useState(false);
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
    <div className="min-h-screen bg-[#F8F5F1] text-[#2B241F] flex font-sans" suppressHydrationWarning>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-20 md:ml-64'}`}>
        <Navbar collapsed={collapsed} />

        <main className="pt-24 sm:pt-28 lg:pt-32 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm relative overflow-hidden">
            <div>
              <div className="flex items-center gap-2 text-[#0047AB] font-bold text-xs tracking-wider uppercase mb-1">
                <History className="w-4 h-4" /> Audit & Activity Logs
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#2B241F]">Upload & Download History</h1>
              <p className="text-xs font-semibold text-[#60534A]">Track all resume processing batches and generated Excel exports</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Real-time Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#8C7E72] absolute left-3.5 top-3" />
                <input
                  type="text"
                  suppressHydrationWarning
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF6F1] border border-[#E2D7CB] text-xs text-[#2B241F] placeholder-[#9A8D80] focus:outline-none focus:border-[#0F2C59] font-bold shadow-sm transition-all"
                />
              </div>

              {/* Tabs */}
              <div className="flex p-1 rounded-xl bg-[#F5EFEB] border border-[#E2D7CB] text-xs font-bold w-full sm:w-auto" suppressHydrationWarning>
                <button
                  onClick={() => setActiveTab('uploads')}
                  suppressHydrationWarning
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'uploads' ? 'bg-[#0F2C59] text-white shadow-md font-black' : 'text-[#60534A] hover:text-[#2B241F]'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Uploads ({filteredUploads.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('downloads')}
                  suppressHydrationWarning
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'downloads' ? 'bg-[#0F2C59] text-white shadow-md font-black' : 'text-[#60534A] hover:text-[#2B241F]'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>Downloads ({filteredDownloads.length})</span>
                </button>
              </div>
            </div>
          </div>

          {/* History Content */}
          <div className="bg-white border border-[#E8E2D9] rounded-3xl shadow-sm overflow-hidden">
            {activeTab === 'uploads' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-[#FAF6F1] border-b border-[#E8E2D9] text-[11px] font-black uppercase text-[#60534A] tracking-wider">
                      <th className="p-4">Report Batch Title</th>
                      <th className="p-4">Resumes Processed</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2D9] text-xs font-semibold text-[#2B241F]">
                    {filteredUploads.length > 0 ? (
                      filteredUploads.map((item) => (
                        <tr key={item.id} className="hover:bg-[#FAF6F1]/60 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0047AB] flex items-center justify-center font-black shrink-0 border border-blue-100">
                                <FileText className="w-4.5 h-4.5" />
                              </div>
                              <span className="font-bold text-[#0F2C59] text-sm">{item.report_name}</span>
                            </div>
                          </td>

                          <td className="p-4 font-mono font-bold">{item.resume_count} Resumes</td>

                          <td className="p-4 text-[#60534A]">
                            {new Date(item.created_at).toLocaleString()}
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/candidates?session_id=${item.session_id || item.id}`}
                                className="p-2 rounded-xl bg-[#FAF6F1] hover:bg-blue-50 text-[#0047AB] transition-colors border border-[#E2D7CB]"
                                title="View Candidates"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDeleteUploadRecord(item.id)}
                                className="p-2 rounded-xl bg-[#FAF6F1] hover:bg-rose-50 text-rose-600 transition-colors border border-[#E2D7CB]"
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
                        <td colSpan={4} className="p-12 text-center text-xs font-bold text-[#8C7E72] italic">
                          No upload history matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-[#FAF6F1] border-b border-[#E8E2D9] text-[11px] font-black uppercase text-[#60534A] tracking-wider">
                      <th className="p-4">Report Name</th>
                      <th className="p-4">Excel File Path</th>
                      <th className="p-4">Downloaded Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2D9] text-xs font-semibold text-[#2B241F]">
                    {filteredDownloads.length > 0 ? (
                      filteredDownloads.map((item) => (
                        <tr key={item.id} className="hover:bg-[#FAF6F1]/60 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7A3E65] flex items-center justify-center font-black shrink-0 border border-purple-100">
                                <Download className="w-4.5 h-4.5" />
                              </div>
                              <span className="font-bold text-[#0F2C59] text-sm">{item.report_name}</span>
                            </div>
                          </td>

                          <td className="p-4 font-mono text-xs text-[#60534A] truncate max-w-[200px]">
                            {item.excel_file}
                          </td>

                          <td className="p-4 text-[#60534A]">
                            {new Date(item.download_date).toLocaleString()}
                          </td>

                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteDownloadRecord(item.id)}
                              className="p-2 rounded-xl bg-[#FAF6F1] hover:bg-rose-50 text-rose-600 transition-colors border border-[#E2D7CB]"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-xs font-bold text-[#8C7E72] italic">
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
