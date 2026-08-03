'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import FloatingDock from '@/components/layout/FloatingDock';
import CandidateModal from '@/components/ui/CandidateModal';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  FolderKanban,
  ListFilter
} from 'lucide-react';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minAts, setMinAts] = useState(0);
  const [sortBy, setSortBy] = useState('ats_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedFolder, setSelectedFolder] = useState('All Folders');
  const [availableFolders, setAvailableFolders] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
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
  }, [token, search, minAts, sortBy, sortOrder, selectedFolder, page, pageSize]);

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
        limit: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      if (search) params.search = search;
      if (minAts > 0) params.min_ats_score = minAts;
      if (selectedFolder && selectedFolder !== 'All Folders') {
        params.report_name = selectedFolder;
      }

      const response = await api.get('/api/analysis/candidates', { params });
      setCandidates(response.data.candidates || []);
      setTotalPages(response.data.total_pages || 1);
      setTotalCount(response.data.total_count || response.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch candidates', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans pb-32" suppressHydrationWarning>
      <Navbar />

      <main className="pt-20 sm:pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/80 to-slate-900 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xs tracking-wider uppercase mb-1">
              <Users className="w-4 h-4 text-cyan-400 animate-pulse" /> Candidate Directory
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-heading">
              Candidate Dossiers & Ranking ({totalCount} Total)
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-1">
              Search, filter folder-wise, and inspect parsed candidate resumes
            </p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#111827]/80 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate name, email, or skills..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900/80 border border-white/10 text-xs text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 font-bold placeholder-slate-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
            {/* Folder Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 flex-1 sm:flex-initial">
              <FolderKanban className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="text-xs text-slate-400 font-bold hidden sm:inline">Folder:</span>
              <select
                value={selectedFolder}
                onChange={(e) => {
                  setSelectedFolder(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs text-slate-200 font-black focus:outline-none cursor-pointer w-full sm:max-w-[150px] truncate"
              >
                {availableFolders.map((folder: string, idx: number) => (
                  <option key={idx} value={folder} className="bg-slate-900 text-white">
                    {folder}
                  </option>
                ))}
              </select>
            </div>

            {/* Min ATS Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2">
              <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-xs text-slate-400 font-bold hidden sm:inline">Min ATS:</span>
              <select
                value={minAts}
                onChange={(e) => {
                  setMinAts(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-transparent text-xs text-slate-200 font-black focus:outline-none cursor-pointer"
              >
                <option value={0} className="bg-slate-900 text-white">All Scores</option>
                <option value={50} className="bg-slate-900 text-white">50%+</option>
                <option value={70} className="bg-slate-900 text-white">70%+</option>
                <option value={85} className="bg-slate-900 text-white">85%+</option>
              </select>
            </div>

            {/* Sort By Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 flex-1 sm:flex-initial">
              <ArrowUpDown className="w-4 h-4 text-emerald-400 shrink-0" />
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sb, so] = e.target.value.split('-');
                  setSortBy(sb);
                  setSortOrder(so as 'asc' | 'desc');
                }}
                className="bg-transparent text-xs text-slate-200 font-black focus:outline-none cursor-pointer w-full"
              >
                <option value="ats_score-desc" className="bg-slate-900 text-white">ATS Score (High to Low)</option>
                <option value="ats_score-asc" className="bg-slate-900 text-white">ATS Score (Low to High)</option>
                <option value="experience-desc" className="bg-slate-900 text-white">Experience (High to Low)</option>
                <option value="name-asc" className="bg-slate-900 text-white">Name (A-Z)</option>
              </select>
            </div>

            {/* Show Per Page Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2">
              <ListFilter className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-slate-400 font-bold hidden sm:inline">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-transparent text-xs text-slate-200 font-black focus:outline-none cursor-pointer"
              >
                <option value={10} className="bg-slate-900 text-white">10</option>
                <option value={25} className="bg-slate-900 text-white">25</option>
                <option value={50} className="bg-slate-900 text-white">50</option>
                <option value={100} className="bg-slate-900 text-white">100</option>
                <option value={5000} className="bg-slate-900 text-white">Show All</option>
              </select>
            </div>
          </div>
        </div>

        {/* Candidates Table */}
        <div className="bg-[#111827]/80 border border-white/10 rounded-3xl shadow-xl backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-900/80 border-b border-white/10 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="p-4">Rank / Candidate</th>
                  <th className="p-4">Folder Batch</th>
                  <th className="p-4 text-center">ATS Match Score</th>
                  <th className="p-4">Experience & Education</th>
                  <th className="p-4">Key Skills</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-semibold text-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-xs font-bold text-slate-400">
                      <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      Loading candidate records...
                    </td>
                  </tr>
                ) : candidates.length > 0 ? (
                  candidates.map((candidate, idx) => (
                    <tr key={candidate.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-black text-xs shrink-0 border border-cyan-500/20 font-mono">
                            #{idx + 1 + (page - 1) * pageSize}
                          </span>
                          <div>
                            <p className="font-bold text-white text-sm">{candidate.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium truncate max-w-[140px] sm:max-w-none">{candidate.email || 'No email specified'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-bold text-purple-300">
                        <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[11px]">
                          {candidate.folder_name || 'General Batch'}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span className="px-3 py-1.5 rounded-full font-mono font-black text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
                          {candidate.ats_score}%
                        </span>
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-slate-200">{candidate.experience_years} Years Exp</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{candidate.education || 'Degree Not Specified'}</p>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {candidate.skills && candidate.skills.slice(0, 3).map((sk: string, sIdx: number) => (
                            <span key={sIdx} className="px-2 py-0.5 rounded-md bg-slate-900/80 border border-white/10 text-[10px] font-bold text-slate-300">
                              {sk}
                            </span>
                          ))}
                          {candidate.skills && candidate.skills.length > 3 && (
                            <span className="text-[10px] font-black text-cyan-400 self-center">+{candidate.skills.length - 3}</span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedCandidate(candidate)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-slate-200 hover:bg-slate-700 hover:text-white font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          <span>View Dossier</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-xs font-bold text-slate-500 italic">
                      No candidates found matching filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="p-4 bg-slate-900/80 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-slate-400">
              <span>Showing Page {page} of {totalPages} ({totalCount} Total Candidates)</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-slate-200 hover:bg-slate-700 disabled:opacity-50 font-black cursor-pointer"
                >
                  Previous
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-slate-200 hover:bg-slate-700 disabled:opacity-50 font-black cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Candidate Dossier Detail Modal */}
      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}

      <FloatingDock />
    </div>
  );
}
