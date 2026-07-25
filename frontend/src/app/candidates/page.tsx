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
      console.error('Failed to fetch folder list', e);
    }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/analysis/candidates', {
        params: {
          search,
          report_name: selectedFolder,
          min_ats_score: minAts,
          sort_by: sortBy,
          sort_order: sortOrder,
          page,
          limit: 15,
        },
      });
      setCandidates(res.data.candidates || []);
      setTotalPages(res.data.total_pages || Math.ceil((res.data.total || 0) / 15) || 1);
      setTotalCount(res.data.total || res.data.total_count || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <span className="px-2.5 py-1 rounded-full bg-[#EAF5EF] border border-[#D4E8DC] text-[#1E6B43] font-black text-xs">High ({score}%)</span>;
    if (score >= 60) return <span className="px-2.5 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] font-black text-xs">Medium ({score}%)</span>;
    return <span className="px-2.5 py-1 rounded-full bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] font-black text-xs">Low ({score}%)</span>;
  };

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#2B241F] flex font-sans" suppressHydrationWarning>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <Navbar collapsed={collapsed} searchQuery={search} setSearchQuery={setSearch} />

        <main className="pt-20 p-8 space-y-6 max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-7 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-[#0047AB] font-bold text-xs tracking-wider uppercase mb-1">
                <Users className="w-4 h-4" /> Candidate Analysis Engine
              </div>
              <h1 className="text-2xl font-black text-[#2B241F]">Candidates Ranking & JD Match Hub</h1>
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

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Folder Selector Dropdown */}
              <div className="flex items-center gap-2 bg-[#FAF6F1] border border-[#E2D7CB] rounded-xl px-3 py-2">
                <FolderKanban className="w-4 h-4 text-[#7A3E65] shrink-0" />
                <span className="text-xs text-[#60534A] font-bold hidden sm:inline">Folder:</span>
                <select
                  value={selectedFolder}
                  onChange={(e) => {
                    setSelectedFolder(e.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent text-xs text-[#2B241F] font-black focus:outline-none cursor-pointer max-w-[150px] truncate"
                >
                  {availableFolders.map((folder, idx) => (
                    <option key={idx} value={folder}>
                      {folder}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min ATS Score */}
              <div className="flex items-center gap-2 bg-[#FAF6F1] border border-[#E2D7CB] rounded-xl px-3 py-2 text-xs font-bold text-[#60534A]">
                <Filter className="w-3.5 h-3.5 text-[#8C7E72]" />
                <span>Min ATS:</span>
                <select
                  value={minAts}
                  onChange={(e) => {
                    setMinAts(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-transparent font-black focus:outline-none text-[#2B241F]"
                >
                  <option value={0}>All Scores</option>
                  <option value={50}>50%+</option>
                  <option value={70}>70%+</option>
                  <option value={85}>85%+</option>
                </select>
              </div>

              {/* Sort dropdown */}
              <div className="flex items-center gap-2 bg-[#FAF6F1] border border-[#E2D7CB] rounded-xl px-3 py-2 text-xs font-bold text-[#60534A]">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#8C7E72]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent font-black focus:outline-none text-[#2B241F]"
                >
                  <option value="ats_score">Sort by ATS Score</option>
                  <option value="name">Sort by Name</option>
                  <option value="experience">Sort by Experience</option>
                </select>
              </div>
            </div>
          </div>

          {/* Candidates Data Table */}
          <div className="p-7 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#2B241F]">
                <thead className="text-xs uppercase bg-[#F5EFEB] text-[#60534A] border-b border-[#E8E2D9] font-black">
                  <tr>
                    <th className="py-3.5 px-4">Candidate Name</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4">Experience</th>
                    <th className="py-3.5 px-4">Skills Extracted</th>
                    <th className="py-3.5 px-4">ATS Match</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1ECE6] font-semibold text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#60534A] font-bold">
                        Loading candidate evaluations...
                      </td>
                    </tr>
                  ) : candidates.length > 0 ? (
                    candidates.map((cand) => {
                      const match = cand.match || {};
                      const score = match.ats_score || 0;
                      const candidateName = cand.name || cand.full_name || 'Candidate Record';
                      return (
                        <tr key={cand.id} className="hover:bg-[#FAF6F1] transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-black text-[#2B241F]">{candidateName}</div>
                            <div className="text-[11px] text-[#8C7E72] font-mono mt-0.5">{cand.file_name}</div>
                          </td>
                          <td className="py-4 px-4 text-[#60534A]">
                            <div>{cand.email || 'N/A'}</div>
                            <div className="text-[#8C7E72] text-[11px]">{cand.phone || cand.location || ''}</div>
                          </td>
                          <td className="py-4 px-4 font-bold text-[#2B241F]">{cand.experience_years || 0} Yrs</td>
                          <td className="py-4 px-4 max-w-xs">
                            <div className="flex flex-wrap gap-1">
                              {cand.skills && cand.skills.length > 0 ? (
                                cand.skills.slice(0, 4).map((sk: string, i: number) => (
                                  <span key={i} className="px-2 py-0.5 rounded-md bg-[#F5EFEB] border border-[#E2D7CB] text-[11px] font-bold text-[#2B241F]">
                                    {sk}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[#9A8D80]">No skills listed</span>
                              )}
                              {cand.skills && cand.skills.length > 4 && (
                                <span className="text-[10px] text-[#8C7E72] font-bold pt-0.5">+{cand.skills.length - 4} more</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">{getScoreBadge(score)}</td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => setSelectedCandidate(cand)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#EFE7DE] border border-[#E2D7CB] text-[#0F2C59] font-black text-xs hover:bg-[#E5DACD] transition-all flex items-center gap-1 ml-auto"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Dossier</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#60534A] font-semibold">
                        No candidates found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#F1ECE6] pt-4 mt-4 text-xs font-semibold text-[#60534A]">
                <span>Showing page {page} of {totalPages} ({totalCount} total candidates)</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 rounded-xl bg-[#F5EFEB] border border-[#E2D7CB] disabled:opacity-50 font-bold"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 rounded-xl bg-[#F5EFEB] border border-[#E2D7CB] disabled:opacity-50 font-bold"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}
