'use client';

import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  FileText,
  BadgeCheck,
  Zap,
  User
} from 'lucide-react';

interface CandidateModalProps {
  candidate: any;
  onClose: () => void;
}

export default function CandidateModal({ candidate, onClose }: CandidateModalProps) {
  const [activeTab, setActiveTab] = useState<'parsed' | 'text'>('parsed');

  if (!candidate) return null;

  const candidateName = candidate.name || 'Candidate Record';
  const email = candidate.email || 'No email specified';
  const phone = candidate.phone || 'No phone number specified';
  const location = candidate.location || 'Location not specified';
  const experienceYears = candidate.experience_years || 0;
  const skills = candidate.skills || [];

  // Derive Technology/Title matching Excel report logic
  const getTechnologyTitle = (cand: any) => {
    if (cand.technology_title && cand.technology_title !== 'Software Engineer') {
      return cand.technology_title;
    }
    const skillsLower = (cand.skills || []).map((s: string) => String(s).toLowerCase());
    const hasJava = skillsLower.some((s: string) => s.includes('java'));
    const hasGo = skillsLower.some((s: string) => s === 'go' || s === 'golang');
    const hasPython = skillsLower.some((s: string) => s.includes('python'));
    const hasNet = skillsLower.some((s: string) => s === '.net' || s === 'c#');
    const hasCloud = skillsLower.some((s: string) => ['aws', 'azure', 'gcp', 'docker', 'kubernetes'].includes(s));
    const hasData = skillsLower.some((s: string) => ['spark', 'snowflake', 'hadoop', 'kafka'].includes(s));

    if (hasJava && hasCloud) return 'Senior Java / Cloud Developer';
    if (hasJava) return 'Senior Java Developer';
    if (hasGo) return 'Senior Golang Developer';
    if (hasNet && hasCloud) return 'Senior .NET / Cloud Developer';
    if (hasNet) return 'Senior .NET Developer';
    if (hasPython) return 'Python Developer';
    if (hasData) return 'Data Engineer';
    if (hasCloud) return 'Cloud / DevOps Engineer';
    return cand.technology_title || 'Software Engineer';
  };

  const techTitle = getTechnologyTitle(candidate);

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
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3" />
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
                <span>Candidate Dossier</span>
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
              {/* Candidate Excel Match Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Contact Credentials Card */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3.5 shadow-lg">
                  <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider font-heading flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    Contact & Identification
                  </h4>
                  
                  <div className="space-y-2.5 text-xs font-bold text-slate-300">
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-slate-200 font-semibold">{email}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-slate-200 font-semibold">{phone}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-slate-200 font-semibold">{location}</span>
                    </div>
                  </div>
                </div>

                {/* Technology & Role Title Card */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3.5 shadow-lg">
                  <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider font-heading flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-cyan-400" />
                    Technology & Professional Role
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Technology / Title</span>
                      <span className="text-cyan-300 font-black text-base font-heading bg-cyan-500/10 px-3 py-1 rounded-xl border border-cyan-500/20 inline-block mt-1">
                        {techTitle}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1 text-xs font-bold text-slate-300 border-t border-white/5">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Experience</span>
                        <span className="text-white font-black text-sm font-heading">{experienceYears} Yrs</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Extracted Skills</span>
                        <span className="text-cyan-400 font-black text-sm font-heading">{skills.length} Total</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Technical Skills Card */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider font-heading flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    Extracted Technical Skills ({skills.length})
                  </h4>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {skills && skills.length > 0 ? (
                    skills.map((sk: string, i: number) => (
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
