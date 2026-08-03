'use client';

import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Globe, Link2, GraduationCap, Briefcase, Award, CheckCircle, AlertTriangle, FileText, Sparkles, UserCheck } from 'lucide-react';

interface CandidateModalProps {
  candidate: any;
  onClose: () => void;
}

export default function CandidateModal({ candidate, onClose }: CandidateModalProps) {
  const [activeTab, setActiveTab] = useState<'parsed' | 'text'>('parsed');

  if (!candidate) return null;

  const match = candidate.match || {};
  const atsScore = match.ats_score || candidate.ats_score || 0;

  const candidateName = candidate.name || candidate.full_name || 'Candidate Record';

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-emerald-500/10';
    if (score >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/10 shadow-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10 shadow-rose-500/10';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090D16]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0F172A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300 scale-100 text-slate-100">
        
        {/* Ambient Top Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/10 bg-[#090D16]/80">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center font-black text-white text-xl shadow-lg border border-white/20">
              {candidateName ? candidateName.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight font-heading">{candidateName}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase tracking-wider">
                  Verified Candidate
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">{candidate.file_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab Controls */}
            <div className="flex p-1 rounded-2xl bg-slate-800/80 border border-white/10 text-xs font-black" suppressHydrationWarning>
              <button
                onClick={() => setActiveTab('parsed')}
                suppressHydrationWarning
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'parsed' ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Evaluation</span>
              </button>
              <button
                onClick={() => setActiveTab('text')}
                suppressHydrationWarning
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'text' ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Raw Text</span>
              </button>
            </div>

            <button
              onClick={onClose}
              suppressHydrationWarning
              className="p-2 rounded-xl bg-slate-800 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-7 space-y-6 bg-[#0F172A]">
          {activeTab === 'parsed' ? (
            <>
              {/* Score KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className={`p-6 rounded-2xl border shadow-xl flex items-center justify-between ${getScoreBadgeColor(atsScore)}`}>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-black font-heading">ATS Match Evaluation Score</span>
                    <h3 className="text-4xl font-black tracking-tight mt-1 font-heading">{atsScore.toFixed(1)}%</h3>
                    <p className="text-xs font-semibold opacity-90 mt-1">Calculated via AI Job Description semantic alignment</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl border-2 border-current flex items-center justify-center font-black text-xl shadow-inner shrink-0 bg-slate-900/50 font-mono">
                    {atsScore.toFixed(0)}%
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3 shadow-lg">
                  <span className="text-[11px] uppercase tracking-wider font-black text-slate-400 font-heading">Key Metrics Summary</span>
                  <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Experience</span>
                      <span className="text-white font-black text-base font-heading">{candidate.experience_years || 0} Yrs</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Total Skills</span>
                      <span className="text-cyan-400 font-black text-base font-heading">{candidate.skills?.length || 0} Extracted</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Candidate Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3 shadow-lg">
                  <h4 className="text-sm font-black text-white uppercase tracking-wider font-heading">Contact Credentials</h4>
                  <div className="space-y-2 text-xs font-bold text-slate-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-cyan-400" />
                      <span>{candidate.email || 'No email provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-cyan-400" />
                      <span>{candidate.phone || 'No phone number provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      <span>{candidate.location || 'Location not specified'}</span>
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3 shadow-lg">
                  <h4 className="text-sm font-black text-white uppercase tracking-wider font-heading">Education & Qualification</h4>
                  <div className="flex items-start gap-2.5 text-xs font-bold text-slate-300">
                    <GraduationCap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{candidate.education || 'Degree qualification extracted from resume dossier'}</span>
                  </div>
                </div>
              </div>

              {/* Skills Extracted */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3 shadow-lg">
                <h4 className="text-sm font-black text-white uppercase tracking-wider font-heading">Extracted Technical Skills</h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {candidate.skills && candidate.skills.length > 0 ? (
                    candidate.skills.map((sk: string, i: number) => (
                      <span key={i} className="px-3 py-1 rounded-xl bg-slate-800 border border-white/10 text-xs font-bold text-slate-200">
                        {sk}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 font-semibold">No skills extracted</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Raw Text View */
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">
              {candidate.raw_text || 'No raw text available for this candidate resume.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
