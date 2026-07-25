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
      alert(err.response?.data?.detail || 'Failed to remove download record.');
    }
  };

  // Real-time Search Engine filtering
  const filteredUploads = uploadLogs.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = (item.report_name || '').toLowerCase().includes(q);
    const dateMatch = new Date(item.created_at).toLocaleString().toLowerCase().includes(q);
    const countMatch = `${item.resume_count || ''}`.includes(q);
    return nameMatch || dateMatch || countMatch;
  });

  const filteredDownloads = downloadLogs.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = (item.report_name || '').toLowerCase().includes(q);
    const dateMatch = new Date(item.downloaded_at).toLocaleString().toLowerCase().includes(q);
    const countMatch = `${item.candidate_count || ''}`.includes(q);
    return nameMatch || dateMatch || countMatch;
  });

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#2B241F] flex font-sans" suppressHydrationWarning>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <Navbar collapsed={collapsed} />

        <main className="pt-20 p-8 space-y-6 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-7 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-[#0047AB] font-bold text-xs tracking-wider uppercase mb-1">
                <History className="w-4 h-4" /> Recruiter Audit Trail
              </div>
              <h1 className="text-2xl font-black text-[#2B241F]">Upload & Download History</h1>
              <p className="text-sm font-semibold text-[#60534A]">Isolated audit logs for your recruiter account</p>
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

          {/* History List */}
          <div className="p-7 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm">
            {activeTab === 'uploads' ? (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-[#2B241F] uppercase tracking-wider border-b border-[#F1ECE6] pb-3">
                  Upload Campaign Sessions ({filteredUploads.length})
                </h3>
                {filteredUploads.length > 0 ? (
                  filteredUploads.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF6F1] border border-[#E2D7CB] hover:border-[#D6CCC0] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#EFE7DE] text-[#0F2C59] flex items-center justify-center font-bold shrink-0 border border-[#E2D7CB]">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-black text-[#2B241F] text-sm">{item.report_name}</div>
                          <div className="text-[11px] font-semibold text-[#60534A]">
                            {new Date(item.created_at).toLocaleString()} • <span className="font-bold text-[#0F2C59]">{item.resume_count} Resumes</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Link
                          href="/candidates"
                          className="px-3.5 py-1.5 rounded-xl bg-[#EFE7DE] border border-[#E2D7CB] text-[#0F2C59] font-black text-xs hover:bg-[#E5DACD] transition-all flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Candidates</span>
                        </Link>
                        <button
                          onClick={() => handleDeleteUploadRecord(item.id)}
                          className="p-2 rounded-xl bg-white border border-[#E2D7CB] text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Log"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-xs font-semibold text-[#8C7E72]">No upload history logs found.</div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-[#2B241F] uppercase tracking-wider border-b border-[#F1ECE6] pb-3">
                  Report Export Downloads ({filteredDownloads.length})
                </h3>
                {filteredDownloads.length > 0 ? (
                  filteredDownloads.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF6F1] border border-[#E2D7CB] hover:border-[#D6CCC0] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#EAF5EF] border border-[#D4E8DC] text-[#1E6B43] flex items-center justify-center font-bold shrink-0">
                          <Download className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-black text-[#2B241F] text-sm">{item.report_name}</div>
                          <div className="text-[11px] font-semibold text-[#60534A]">
                            {new Date(item.download_date).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleDeleteDownloadRecord(item.id)}
                          className="p-2 rounded-xl bg-white border border-[#E2D7CB] text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Log"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-xs font-semibold text-[#8C7E72]">No report download history logs found.</div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
