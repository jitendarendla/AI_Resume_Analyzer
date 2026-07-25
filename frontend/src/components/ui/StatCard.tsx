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
    indigo: 'bg-[#EFE7DE] text-[#0F2C59] border-[#E2D7CB] shadow-sm',
    purple: 'bg-[#F4EBF0] text-[#7A3E65] border-[#E6D4DF] shadow-sm',
    emerald: 'bg-[#EAF5EF] text-[#1E6B43] border-[#D4E8DC] shadow-sm',
    cyan: 'bg-[#EBF3FA] text-[#1E4E7A] border-[#D6E5F3] shadow-sm',
  };

  return (
    <div className="rounded-2xl bg-white border border-[#E8E2D9] p-6 shadow-sm hover:shadow-xl hover:border-[#D6CCC0] transform hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-black uppercase tracking-wider text-[#60534A] group-hover:text-[#0F2C59] transition-colors">{title}</span>
        <div className={`p-3 rounded-2xl border ${colorStyles[color]} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-3xl font-black text-[#2B241F] tracking-tight">{value}</span>
        {trend && <span className="text-xs font-extrabold text-[#1E6B43] font-mono">{trend}</span>}
      </div>

      {subtitle && <p className="text-xs font-semibold text-[#60534A] mt-2">{subtitle}</p>}
    </div>
  );
}
