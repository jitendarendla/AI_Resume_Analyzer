'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { FileSpreadsheet, Download, Calendar, Trash2, Search } from 'lucide-react';

export default function ReportsPage() {
  const [collapsed, setCollapsed] = useState(false);
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
      fetchUploadHistory();
    } catch (e) {
      console.error(e);
    }
  };

  // Real-time Search Engine filtering
  const filteredHistory = history.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const nameMatch = (item.report_name || '').toLowerCase().includes(query);
    const dateMatch = new Date(item.created_at).toLocaleString().toLowerCase().includes(query);
    const countMatch = `${item.resume_count || ''}`.includes(query);
    return nameMatch || dateMatch || countMatch;
  });

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#2B241F] flex font-sans" suppressHydrationWarning>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <Navbar collapsed={collapsed} />

        <main className="pt-20 p-8 space-y-8 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-7 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-[#0047AB] font-bold text-xs tracking-wider uppercase mb-1">
                <FileSpreadsheet className="w-4 h-4" /> Excel Report Engine
              </div>
              <h1 className="text-2xl font-black text-[#2B241F]">Excel Candidate Export Center</h1>
              <p className="text-sm font-semibold text-[#60534A]">Download and manage formatted Excel reports with full candidate details</p>
            </div>

            {/* Realtime Search Engine Bar */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#8C7E72] absolute left-3.5 top-3" />
              <input
                type="text"
                suppressHydrationWarning
                placeholder="Search reports by folder or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF6F1] border border-[#E2D7CB] text-xs text-[#2B241F] placeholder-[#9A8D80] focus:outline-none focus:border-[#0F2C59] font-bold shadow-sm transition-all"
              />
            </div>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1ECE6] pb-4">
              <h3 className="text-lg font-black text-[#2B241F]">Available Excel Reports</h3>
              <span className="text-xs font-bold text-[#60534A]">{filteredHistory.length} Reports Found</span>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="py-12 text-center text-xs font-bold text-[#60534A]">
                  Loading generated Excel reports...
                </div>
              ) : filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF6F1] border border-[#E2D7CB] hover:border-[#D6CCC0] transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-[#EAF5EF] border border-[#D4E8DC] text-[#1E6B43] flex items-center justify-center font-bold shrink-0 shadow-sm">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-[#2B241F]">{item.report_name}</h4>
                        <div className="flex items-center gap-3 text-[11px] font-semibold text-[#60534A] mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#8C7E72]" />
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                          <span>•</span>
                          <span className="font-bold text-[#0F2C59]">{item.resume_count || 1} Candidate Resumes</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleDownload(item.session_id || item.id, item.report_name)}
                        className="px-4 py-2 rounded-xl bg-[#1E6B43] hover:bg-[#185937] text-white font-black text-xs shadow-sm flex items-center gap-1.5 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Excel</span>
                      </button>

                      <button
                        onClick={() => handleDeleteReport(item.id)}
                        className="p-2 rounded-xl bg-white border border-[#E2D7CB] text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs font-semibold text-[#8C7E72]">
                  No matching Excel reports found. Upload resumes to generate reports.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
