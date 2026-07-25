'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import StatCard from '@/components/ui/StatCard';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { ShieldCheck, Users, HardDrive, ShieldAlert, Trash2, Calendar, Lock } from 'lucide-react';

export default function AdminPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchAdminData();
    }
  }, [token]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [recRes, logRes, statRes] = await Promise.all([
        api.get('/api/admin/recruiters'),
        api.get('/api/admin/audit-logs'),
        api.get('/api/admin/system-stats'),
      ]);
      setRecruiters(recRes.data);
      setAuditLogs(logRes.data);
      setSystemStats(statRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteRecruiter = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recruiter account?')) return;
    try {
      await api.delete(`/api/admin/recruiters/${id}`);
      fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete recruiter.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <Navbar collapsed={collapsed} />

        <main className="pt-20 p-8 space-y-8 max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
                <ShieldCheck className="w-4 h-4" /> System Administration
              </div>
              <h1 className="text-2xl font-black text-white">Admin Operations & Security Logs</h1>
              <p className="text-sm text-slate-400">Manage recruiter accounts, inspect security audit trails & storage</p>
            </div>
          </div>

          {/* System Stats KPI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Registered Recruiters"
              value={systemStats?.total_recruiters ?? 0}
              icon={Users}
              color="indigo"
            />
            <StatCard
              title="Total Parsed Candidates"
              value={systemStats?.total_candidates ?? 0}
              icon={ShieldCheck}
              color="purple"
            />
            <StatCard
              title="Storage Disk Usage"
              value={`${systemStats?.storage_usage_mb?.total_storage_mb ?? 0} MB`}
              subtitle="Resumes, Excel reports & Quarantine"
              icon={HardDrive}
              color="emerald"
            />
          </div>

          {/* Recruiters Directory Table */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
            <h3 className="text-base font-bold text-white mb-4">Recruiter Account Directory</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Recruiter</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Campaigns</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recruiters.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-white">{r.name}</p>
                        <p className="text-xs text-slate-400">{r.email}</p>
                      </td>
                      <td className="py-3 px-4">{r.company}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${r.is_admin ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-400'}`}>
                          {r.is_admin ? 'Admin' : 'Recruiter'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{r.upload_sessions} Uploads</td>
                      <td className="py-3 px-4 text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        {!r.is_admin && (
                          <button onClick={() => deleteRecruiter(r.id)} className="text-slate-500 hover:text-rose-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Security Audit Logs Table */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
            <h3 className="text-base font-bold text-white mb-4">Enterprise Security Audit Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">User Agent</th>
                    <th className="py-3 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">{log.action}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-400">{log.ip_address}</td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-500 max-w-xs truncate">{log.user_agent}</td>
                      <td className="py-3 px-4 text-right text-xs text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
