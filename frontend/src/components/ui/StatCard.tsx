'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  color?: 'indigo' | 'purple' | 'emerald' | 'cyan';
}

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'indigo' }: StatCardProps) {
  const colorStyles = {
    indigo: 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-blue-500/10',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-purple-500/10',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-cyan-500/10',
  };

  return (
    <div className="rounded-3xl bg-[#111827]/80 border border-white/10 p-6 shadow-xl backdrop-blur-xl hover:border-cyan-500/40 transform hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 group-hover:text-cyan-400 transition-colors font-heading">{title}</span>
        <div className={`p-3 rounded-2xl border ${colorStyles[color]} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-2.5 mt-1">
        <span className="text-3xl font-black text-white tracking-tight font-heading">{value}</span>
        {trend && <span className="text-xs font-extrabold text-emerald-400 font-mono tracking-wide">{trend}</span>}
      </div>

      {subtitle && <p className="text-xs font-semibold text-slate-400 mt-2.5">{subtitle}</p>}
    </div>
  );
}
