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
  const atsScore = match.ats_score || 0;

  const candidateName = candidate.name || candidate.full_name || 'Candidate Record';

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'text-[#1E6B43] border-[#D4E8DC] bg-[#EAF5EF]';
    if (score >= 60) return 'text-[#92400E] border-[#FDE68A] bg-[#FEF3C7]';
    return 'text-[#991B1B] border-[#FCA5A5] bg-[#FEE2E2]';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#140F0C]/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white border border-[#E8E2D9] rounded-3xl shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300 scale-100 text-[#2B241F]">
        
        {/* Ambient Top Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0F2C59] via-[#0047AB] to-[#2563EB]"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#E8E2D9] bg-[#FAF6F1]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0F2C59] via-[#0047AB] to-[#2563EB] flex items-center justify-center font-black text-white text-xl shadow-md border border-white">
              {candidateName ? candidateName.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#2B241F] tracking-tight">{candidateName}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EAF5EF] border border-[#D4E8DC] text-[#1E6B43] uppercase tracking-wider">
                  Verified Candidate
                </span>
              </div>
              <p className="text-xs text-[#60534A] font-semibold mt-0.5">{candidate.file_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab Controls */}
            <div className="flex p-1 rounded-2xl bg-[#EFE7DE] border border-[#E2D7CB] text-xs font-black" suppressHydrationWarning>
              <button
                onClick={() => setActiveTab('parsed')}
                suppressHydrationWarning
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'parsed' ? 'bg-[#0F2C59] text-white shadow-md' : 'text-[#60534A] hover:text-[#2B241F]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Evaluation</span>
              </button>
              <button
                onClick={() => setActiveTab('text')}
                suppressHydrationWarning
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'text' ? 'bg-[#0F2C59] text-white shadow-md' : 'text-[#60534A] hover:text-[#2B241F]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Raw Text</span>
              </button>
            </div>

            <button
              onClick={onClose}
              suppressHydrationWarning
              className="p-2 rounded-xl bg-white border border-[#E2D7CB] text-[#60534A] hover:text-[#2B241F] transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-7 space-y-6 bg-white">
          {activeTab === 'parsed' ? (
            <>
              {/* Score KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className={`p-6 rounded-2xl border shadow-sm flex items-center justify-between ${getScoreBadgeColor(atsScore)}`}>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-black">ATS Match Evaluation Score</span>
                    <h3 className="text-4xl font-black tracking-tight mt-1">{atsScore.toFixed(1)}%</h3>
                    <p className="text-xs font-semibold opacity-90 mt-1">Calculated via AI Job Description semantic alignment</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl border-2 border-current flex items-center justify-center font-black text-xl shadow-inner shrink-0 bg-white/50">
                    {atsScore.toFixed(0)}%
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[#FAF6F1] border border-[#E2D7CB] space-y-3">
                  <span className="text-[11px] uppercase tracking-wider font-black text-[#60534A]">Key Metrics Summary</span>
                  <div className="grid grid-cols-2 gap-3 text-xs font-bold text-[#60534A]">
                    <div>
                      <span className="text-[#8C7E72] block text-[10px] uppercase">Experience</span>
                      <span className="text-[#2B241F] font-black text-base">{candidate.experience_years || 0} Yrs</span>
                    </div>
                    <div>
                      <span className="text-[#8C7E72] block text-[10px] uppercase">Total Skills</span>
                      <span className="text-[#0F2C59] font-black text-base">{candidate.skills?.length || 0} Extracted</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Candidate Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="p-6 rounded-2xl bg-[#FAF6F1] border border-[#E2D7CB] space-y-3">
                  <h4 className="text-sm font-black text-[#2B241F] uppercase tracking-wider">Contact Credentials</h4>
                  <div className="space-y-2 text-xs font-bold text-[#60534A]">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#0047AB]" />
                      <span>{candidate.email || 'No email provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#0047AB]" />
                      <span>{candidate.phone || 'No phone number provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#0047AB]" />
                      <span>{candidate.location || 'Location not specified'}</span>
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div className="p-6 rounded-2xl bg-[#FAF6F1] border border-[#E2D7CB] space-y-3">
                  <h4 className="text-sm font-black text-[#2B241F] uppercase tracking-wider">Education & Qualification</h4>
                  <div className="flex items-start gap-2.5 text-xs font-bold text-[#60534A]">
                    <GraduationCap className="w-5 h-5 text-[#0F2C59] shrink-0 mt-0.5" />
                    <span>{candidate.education || 'Degree qualification extracted from resume dossier'}</span>
                  </div>
                </div>
              </div>

              {/* Skills Extracted */}
              <div className="p-6 rounded-2xl bg-[#FAF6F1] border border-[#E2D7CB] space-y-3">
                <h4 className="text-sm font-black text-[#2B241F] uppercase tracking-wider">Extracted Technical Skills</h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {candidate.skills && candidate.skills.length > 0 ? (
                    candidate.skills.map((sk: string, i: number) => (
                      <span key={i} className="px-3 py-1 rounded-xl bg-white border border-[#E2D7CB] text-xs font-bold text-[#2B241F] shadow-2xs">
                        {sk}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#8C7E72] font-semibold">No skills extracted</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Raw Text View */
            <div className="p-6 rounded-2xl bg-[#FAF6F1] border border-[#E2D7CB] font-mono text-xs text-[#2B241F] whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">
              {candidate.raw_text || 'No raw text available for this candidate resume.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
