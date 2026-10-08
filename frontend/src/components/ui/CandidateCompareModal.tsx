'use client';

import React from 'react';
import { Check, X, GitCompareArrows } from 'lucide-react';

interface CandidateCompareModalProps {
  candidates: any[];
  onClose: () => void;
}

const unavailable = 'Unavailable';

function valueOrUnavailable(value: unknown) {
  if (value === null || value === undefined || value === '') return unavailable;
  return value;
}

function renderList(values: unknown) {
  if (!Array.isArray(values) || values.length === 0) {
    return <span className="text-slate-500">{unavailable}</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((item, index) => (
        <span
          key={`${String(item)}-${index}`}
          className="px-2.5 py-1 rounded-lg bg-slate-800 border border-white/10 text-[11px] font-bold text-slate-200"
        >
          {String(item)}
        </span>
      ))}
    </div>
  );
}

function getMatch(candidate: any) {
  return candidate?.match || {
    ats_score: candidate?.ats_score,
    skill_match_pct: candidate?.skill_match_pct,
    matched_skills: candidate?.matched_skills,
    missing_skills: candidate?.missing_skills,
  };
}

export default function CandidateCompareModal({
  candidates,
  onClose,
}: CandidateCompareModalProps) {
  if (candidates.length !== 2) return null;

  const left = candidates[0];
  const right = candidates[1];
  const leftMatch = getMatch(left);
  const rightMatch = getMatch(right);

  const rows = [
    {
      label: 'Name',
      left: valueOrUnavailable(left.name),
      right: valueOrUnavailable(right.name),
    },
    {
      label: 'Experience',
      left:
        left.experience_years !== undefined && left.experience_years !== null
          ? `${left.experience_years} Years`
          : unavailable,
      right:
        right.experience_years !== undefined && right.experience_years !== null
          ? `${right.experience_years} Years`
          : unavailable,
    },
    {
      label: 'ATS Score',
      left:
        leftMatch?.ats_score !== undefined && leftMatch?.ats_score !== null
          ? `${leftMatch.ats_score}%`
          : unavailable,
      right:
        rightMatch?.ats_score !== undefined && rightMatch?.ats_score !== null
          ? `${rightMatch.ats_score}%`
          : unavailable,
    },
    {
      label: 'Skills',
      left: renderList(left.skills),
      right: renderList(right.skills),
    },
    {
      label: 'Matched Skills',
      left: renderList(leftMatch?.matched_skills),
      right: renderList(rightMatch?.matched_skills),
    },
    {
      label: 'Missing Skills',
      left: renderList(leftMatch?.missing_skills),
      right: renderList(rightMatch?.missing_skills),
    },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#090D16]/85 backdrop-blur-md">
      <div className="relative w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-3xl bg-[#0F172A] border border-white/10 shadow-2xl text-slate-100 flex flex-col">
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600" />

        <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-white/10 bg-[#090D16]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <GitCompareArrows className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">Compare Applicants</h2>
              <p className="text-xs text-slate-400 font-semibold">
                Side-by-side comparison of the selected candidates
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close comparison"
            className="p-2 rounded-xl bg-slate-800 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="bg-slate-900/90">
                  <th className="w-44 p-4 text-left text-[11px] uppercase tracking-wider text-slate-500 font-black border-b border-white/10">
                    Comparison
                  </th>
                  {[left, right].map((candidate) => (
                    <th
                      key={candidate.id}
                      className="p-4 text-left border-b border-white/10 border-l border-white/10"
                    >
                      <p className="text-sm font-black text-white">
                        {valueOrUnavailable(candidate.name)}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {valueOrUnavailable(candidate.file_name)}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-white/5 last:border-b-0">
                    <th className="p-4 align-top text-left text-[11px] uppercase tracking-wider text-slate-500 font-black bg-slate-900/60">
                      {row.label}
                    </th>
                    <td className="p-4 align-top text-xs font-semibold text-slate-200 border-l border-white/5">
                      {typeof row.left === 'string' ? (
                        <span className={row.left === unavailable ? 'text-slate-500' : 'text-slate-200'}>
                          {row.left}
                        </span>
                      ) : (
                        row.left
                      )}
                    </td>
                    <td className="p-4 align-top text-xs font-semibold text-slate-200 border-l border-white/5">
                      {typeof row.right === 'string' ? (
                        <span className={row.right === unavailable ? 'text-slate-500' : 'text-slate-200'}>
                          {row.right}
                        </span>
                      ) : (
                        row.right
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            Missing match information is displayed as “Unavailable” instead of causing an error.
          </div>
        </div>
      </div>
    </div>
  );
}
