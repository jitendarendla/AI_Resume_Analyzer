'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import CandidateModal from '@/components/ui/CandidateModal';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  FolderKanban
} from 'lucide-react';

export default function CandidatesPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minAts, setMinAts] = useState(0);
  const [sortBy, setSortBy] = useState('ats_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedFolder, setSelectedFolder] = useState('All Folders');
  const [availableFolders, setAvailableFolders] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);

  const { token } = useAuth();

  useEffect(() => {
    fetchFolders();
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchCandidates();
    }
  }, [token, search, minAts, sortBy, sortOrder, selectedFolder, page]);

  const fetchFolders = async () => {
    try {
      const res = await api.get('/api/reports/history/uploads');
      const history = res.data || [];
      const names = Array.from(new Set(history.map((h: any) => h.report_name).filter(Boolean))) as string[];
      setAvailableFolders(['All Folders', ...names]);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 10,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      if (search) params.search = search;
      if (minAts > 0) params.min_ats = minAts;
      if (selectedFolder && selectedFolder !== 'All Folders') {
        params.folder_name = selectedFolder;
      }

      const response = await api.get('/api/analysis/candidates', { params });
      setCandidates(response.data.candidates || []);
      setTotalPages(response.data.total_pages || 1);
      setTotalCount(response.data.total_count || 0);
    } catch (err) {
      console.error('Failed to fetch candidates', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#2B241F] flex font-sans" suppressHydrationWarning>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className={`flex-1 transition-all duration-300 ml-0 ${collapsed ? 'md:ml-20' : 'md:ml-20 lg:ml-64'}`}>
        <Navbar collapsed={collapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <main className="pt-20 sm:pt-24 lg:pt-28 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-7 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm relative overflow-hidden">
            <div>
              <div className="flex items-center gap-2 text-[#0047AB] font-bold text-xs tracking-wider uppercase mb-1">
                <Users className="w-4 h-4" /> Candidate Analysis Engine
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#2B241F]">Candidates Ranking & JD Match Hub</h1>
              <p className="text-xs font-semibold text-[#60534A]">Search, filter, and inspect parsed candidate dossiers folder-wise</p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
              <input
                type="text"
                placeholder="Search candidate name, email, or skills..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-xs text-[#2B241F] pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-[#0F2C59] font-bold placeholder-[#9A8D80]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
              {/* Folder Selector Dropdown */}
              <div className="flex items-center gap-1.5 bg-[#FAF6F1] border border-[#E2D7CB] rounded-xl px-2.5 py-2 flex-1 sm:flex-initial">
                <FolderKanban className="w-4 h-4 text-[#7A3E65] shrink-0" />
                <span className="text-xs text-[#60534A] font-bold hidden sm:inline">Folder:</span>
                <select
                  value={selectedFolder}
                  onChange={(e) => {
                    setSelectedFolder(e.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent text-xs text-[#2B241F] font-black focus:outline-none cursor-pointer w-full sm:max-w-[150px] truncate"
                >
                  {availableFolders.map((folder, idx) => (
                    <option key={idx} value={folder}>
                      {folder}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min ATS Filter */}
              <div className="flex items-center gap-1.5 bg-[#FAF6F1] border border-[#E2D7CB] rounded-xl px-2.5 py-2">
                <Filter className="w-4 h-4 text-[#0047AB] shrink-0" />
                <span className="text-xs text-[#60534A] font-bold hidden sm:inline">Min ATS:</span>
                <select
                  value={minAts}
                  onChange={(e) => {
                    setMinAts(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-transparent text-xs text-[#2B241F] font-black focus:outline-none cursor-pointer"
                >
                  <option value={0}>All Scores</option>
                  <option value={50}>50%+</option>
                  <option value={70}>70%+</option>
                  <option value={85}>85%+</option>
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 bg-[#FAF6F1] border border-[#E2D7CB] rounded-xl px-2.5 py-2 flex-1 sm:flex-initial">
                <ArrowUpDown className="w-4 h-4 text-[#1E6B43] shrink-0" />
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sb, so] = e.target.value.split('-');
                    setSortBy(sb);
                    setSortOrder(so as 'asc' | 'desc');
                  }}
                  className="bg-transparent text-xs text-[#2B241F] font-black focus:outline-none cursor-pointer w-full"
                >
                  <option value="ats_score-desc font-black">ATS Score (High to Low)</option>
                  <option value="ats_score-asc">ATS Score (Low to High)</option>
                  <option value="experience_years-desc">Experience (High to Low)</option>
                  <option value="name-asc">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Candidates Table */}
          <div className="bg-white border border-[#E8E2D9] rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-[#FAF6F1] border-b border-[#E8E2D9] text-[11px] font-black uppercase text-[#60534A] tracking-wider">
                    <th className="p-4">Rank / Candidate</th>
                    <th className="p-4">Folder Batch</th>
                    <th className="p-4 text-center">ATS Match Score</th>
                    <th className="p-4">Experience & Education</th>
                    <th className="p-4">Key Skills</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D9] text-xs font-semibold text-[#2B241F]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-xs font-bold text-[#8C7E72]">
                        <div className="w-8 h-8 border-4 border-[#0047AB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        Loading candidate records...
                      </td>
                    </tr>
                  ) : candidates.length > 0 ? (
                    candidates.map((candidate, idx) => (
                      <tr key={candidate.id} className="hover:bg-[#FAF6F1]/60 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-xl bg-blue-50 text-[#0047AB] flex items-center justify-center font-black text-xs shrink-0 border border-blue-100 font-mono">
                              #{idx + 1 + (page - 1) * 10}
                            </span>
                            <div>
                              <p className="font-bold text-[#0F2C59] text-sm">{candidate.name}</p>
                              <p className="text-[11px] text-[#60534A] font-medium truncate max-w-[140px] sm:max-w-none">{candidate.email || 'No email specified'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-bold text-[#7A3E65]">
                          <span className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-100 text-[11px]">
                            {candidate.folder_name || 'General Batch'}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <span className="px-3 py-1.5 rounded-full font-mono font-black text-xs bg-emerald-50 text-[#1E6B43] border border-emerald-200">
                            {candidate.ats_score}%
                          </span>
                        </td>

                        <td className="p-4">
                          <p className="font-bold">{candidate.experience_years} Years Exp</p>
                          <p className="text-[11px] text-[#60534A] truncate max-w-[180px]">{candidate.education || 'Degree Not Specified'}</p>
                        </td>

                        <td className="p-4">
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {candidate.skills && candidate.skills.slice(0, 3).map((sk: string, sIdx: number) => (
                              <span key={sIdx} className="px-2 py-0.5 rounded-md bg-[#FAF6F1] border border-[#E2D7CB] text-[10px] font-bold text-[#60534A]">
                                {sk}
                              </span>
                            ))}
                            {candidate.skills && candidate.skills.length > 3 && (
                              <span className="text-[10px] font-black text-[#0047AB] self-center">+{candidate.skills.length - 3}</span>
                            )}
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedCandidate(candidate)}
                            className="sleek-btn-secondary text-xs px-3 py-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Dossier</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-xs font-bold text-[#8C7E72] italic">
                        No candidates found matching filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div className="p-4 bg-[#FAF6F1] border-t border-[#E8E2D9] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-[#60534A]">
                <span>Showing Page {page} of {totalPages} ({totalCount} Total Candidates)</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#E2D7CB] disabled:opacity-50 font-black cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#E2D7CB] disabled:opacity-50 font-black cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Candidate Dossier Detail Modal */}
      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}
