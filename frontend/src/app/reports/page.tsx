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
      setHistory((prev) => prev.filter((item) => (item.session_id || item.id) !== identifier));
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Failed to delete report.');
    }
  };

  const filteredHistory = history.filter((item) =>
    item.report_name?.toLowerCase().includes(searchQuery.toLowerCase())
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
                <FileSpreadsheet className="w-4 h-4" /> Excel Report Exports
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#2B241F]">Excel Candidate Reports Library</h1>
              <p className="text-xs font-semibold text-[#60534A]">Download structured candidate ranking sheets & ATS matching reports</p>
            </div>

            {/* Real-time Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#8C7E72] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search report title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF6F1] border border-[#E2D7CB] text-xs text-[#2B241F] placeholder-[#9A8D80] focus:outline-none focus:border-[#0F2C59] font-bold shadow-sm transition-all"
              />
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-white border border-[#E8E2D9] rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-[#FAF6F1] border-b border-[#E8E2D9] text-[11px] font-black uppercase text-[#60534A] tracking-wider">
                    <th className="p-4">Folder / Report Title</th>
                    <th className="p-4">Evaluated Resumes</th>
                    <th className="p-4">Created Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D9] text-xs font-semibold text-[#2B241F]">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-xs font-bold text-[#8C7E72]">
                        <div className="w-8 h-8 border-4 border-[#0047AB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        Loading reports library...
                      </td>
                    </tr>
                  ) : filteredHistory.length > 0 ? (
                    filteredHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-[#FAF6F1]/60 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7A3E65] flex items-center justify-center font-black shrink-0 border border-purple-100 shadow-sm">
                              <FileSpreadsheet className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-[#0F2C59] text-sm">{item.report_name}</p>
                              <p className="text-[11px] text-[#60534A] font-medium">Excel Format (.xlsx)</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-mono font-bold text-sm">
                          {item.resume_count} Candidates
                        </td>

                        <td className="p-4 text-[#60534A] flex items-center gap-1.5 pt-6">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDownload(item.session_id || item.id, item.report_name)}
                              className="sleek-btn-primary text-xs px-3 py-1.5 cursor-pointer shadow-md"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Excel</span>
                            </button>

                            <button
                              onClick={() => handleDeleteReport(item.session_id || item.id)}
                              className="p-2 rounded-xl bg-[#FAF6F1] hover:bg-rose-50 text-rose-600 transition-colors border border-[#E2D7CB]"
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
                      <td colSpan={4} className="p-12 text-center text-xs font-bold text-[#8C7E72] italic">
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
