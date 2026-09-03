'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import {
  Server,
  Shield,
  Activity,
  Globe,
  Database,
  Cpu,
  HardDrive,
  Trash2,
  Users,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Lock,
  Plus,
  X,
  FileText,
  Clock,
  UserX
} from 'lucide-react';

interface ServerHealth {
  server_status: string;
  timestamp: number;
  environment: {
    python_version: string;
    os_platform: string;
    process_id: number;
    active_threads: number;
  };
  load_balancer: {
    mode: string;
    active_node_pid: number;
    max_concurrent_upload_workers: number;
    health_status: string;
  };
  database: {
    engine: string;
    connection_status: string;
  };
  system_resources: {
    cpu_usage_percent: number;
    ram_used_mb: number;
    ram_total_mb: number;
    ram_usage_percent: number;
    disk_total_gb: number;
    disk_free_gb: number;
  };
}

interface CORSConfig {
  allowed_origins: string[];
  allow_credentials: boolean;
  allowed_methods: string[];
  allowed_headers: string[];
  max_age_seconds: number;
  security_policy: string;
}

interface SystemStats {
  total_recruiters: number;
  total_candidates: number;
  total_upload_sessions: number;
  total_audit_logs: number;
  storage_usage_mb: {
    uploads_folder: number;
    reports_folder: number;
    quarantine_folder: number;
    total_storage_mb: number;
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'health' | 'cors' | 'maintenance' | 'recruiters' | 'audit'>('health');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [health, setHealth] = useState<ServerHealth | null>(null);
  const [cors, setCors] = useState<CORSConfig | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  const [newCorsDomain, setNewCorsDomain] = useState('');
  const [corsOriginsList, setCorsOriginsList] = useState<string[]>([]);
  const [savingCors, setSavingCors] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState<string | null>(null);

  const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();

    if (!token) {
      router.push('/login');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      const [healthRes, corsRes, statsRes, recRes, logsRes] = await Promise.all([
        fetch(`${apiBase}/api/admin/server-health`, { headers }),
        fetch(`${apiBase}/api/admin/cors-config`, { headers }),
        fetch(`${apiBase}/api/admin/system-stats`, { headers }),
        fetch(`${apiBase}/api/admin/recruiters`, { headers }),
        fetch(`${apiBase}/api/admin/audit-logs?limit=50`, { headers })
      ]);

      if (healthRes.status === 403 || healthRes.status === 401) {
        setError('Admin access required. You must log in as an administrator account.');
        setLoading(false);
        return;
      }

      if (healthRes.ok) setHealth(await healthRes.json());
      if (corsRes.ok) {
        const corsData = await corsRes.json();
        setCors(corsData);
        setCorsOriginsList(corsData.allowed_origins || []);
      }
      if (statsRes.ok) setStats(await statsRes.json());
      if (recRes.ok) setRecruiters(await recRes.json());
      if (logsRes.ok) setAuditLogs(await logsRes.json());
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Admin Management API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAddDomain = () => {
    if (!newCorsDomain.trim()) return;
    const domain = newCorsDomain.trim().replace(/\/+$/, '');
    if (!corsOriginsList.includes(domain)) {
      setCorsOriginsList([...corsOriginsList, domain]);
    }
    setNewCorsDomain('');
  };

  const handleRemoveDomain = (domain: string) => {
    setCorsOriginsList(corsOriginsList.filter((d) => d !== domain));
  };

  const handleSaveCORS = async () => {
    setSavingCors(true);
    const token = getAuthToken();
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      const res = await fetch(`${apiBase}/api/admin/cors-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ origins: corsOriginsList })
      });

      if (res.ok) {
        const data = await res.json();
        alert('CORS configuration updated successfully!');
        if (data.active_allowed_origins) setCorsOriginsList(data.active_allowed_origins);
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.detail || 'Failed to update CORS configuration'}`);
      }
    } catch (err: any) {
      alert(`Error updating CORS: ${err.message}`);
    } finally {
      setSavingCors(false);
    }
  };

  const handleRunCleanup = async () => {
    if (!confirm('Are you sure you want to purge quarantine storage and expired report files?')) return;
    const token = getAuthToken();
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      const res = await fetch(`${apiBase}/api/admin/maintenance/cleanup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setMaintenanceMsg(data.message);
        fetchAdminData();
      }
    } catch (err: any) {
      alert(`Cleanup failed: ${err.message}`);
    }
  };

  const handleDeleteRecruiter = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete recruiter account '${name}'?`)) return;
    const token = getAuthToken();
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      const res = await fetch(`${apiBase}/api/admin/recruiters/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchAdminData();
      } else {
        const errData = await res.json();
        alert(errData.detail || 'Failed to delete recruiter.');
      }
    } catch (err: any) {
      alert(`Deletion error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white font-heading tracking-tight flex items-center gap-2">
                  Server Control & Load Balancer
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase tracking-widest">
                    Production Operational
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Real-time Server Management, Cluster Metrics, CORS Security Policies & Maintenance
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {error ? (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-semibold flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        ) : null}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 text-xs font-bold">
          <button
            onClick={() => setActiveTab('health')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'health' ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Server Health & Load Balancer</span>
          </button>

          <button
            onClick={() => setActiveTab('cors')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'cors' ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>CORS Security Policies</span>
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'maintenance' ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Server Maintenance & Storage</span>
          </button>

          <button
            onClick={() => setActiveTab('recruiters')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'recruiters' ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Recruiter Accounts ({recruiters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'audit' ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Audit Logs ({auditLogs.length})</span>
          </button>
        </div>

        {/* Tab 1: Server Health & Load Balancer */}
        {activeTab === 'health' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Load Balancer Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-white/10 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white font-heading">
                      Load Balancer & Cluster Controller Status
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      {health?.load_balancer.mode || 'Multi-Worker Process Cluster Mode'}
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2 w-fit">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {health?.load_balancer.health_status || 'Cluster Operational'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/5 text-xs font-bold text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Active Worker Node PID</span>
                  <span className="text-white font-black text-sm font-heading">{health?.environment.process_id || '20332'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Concurrent Upload Threads</span>
                  <span className="text-cyan-300 font-black text-sm font-heading">
                    {health?.load_balancer.max_concurrent_upload_workers || 4} Workers Max
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Active Process Threads</span>
                  <span className="text-white font-black text-sm font-heading">{health?.environment.active_threads || 12} Threads</span>
                </div>
              </div>
            </div>

            {/* Metrics Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* CPU Usage Card */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-cyan-400 uppercase tracking-wider font-heading flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    Server CPU Load
                  </span>
                  <span className="text-lg font-black text-white font-heading">
                    {health?.system_resources.cpu_usage_percent || 0}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, health?.system_resources.cpu_usage_percent || 0)}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-400 font-semibold">
                  Multi-core processing utilization across active worker processes.
                </p>
              </div>

              {/* Memory RAM Card */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-purple-400 uppercase tracking-wider font-heading flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    RAM Utilization
                  </span>
                  <span className="text-lg font-black text-white font-heading">
                    {health?.system_resources.ram_used_mb || 0} MB
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, health?.system_resources.ram_usage_percent || 0)}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-400 font-semibold">
                  Total RAM Capacity: {health?.system_resources.ram_total_mb || '16384'} MB ({health?.system_resources.ram_usage_percent || 0}%)
                </p>
              </div>

              {/* Database Status Card */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wider font-heading flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    PostgreSQL Database
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase">
                    {health?.database.connection_status || 'connected'}
                  </span>
                </div>
                <div className="pt-2 text-xs font-bold text-slate-300 space-y-2 border-t border-white/5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Database Engine:</span>
                    <span className="text-white">{health?.database.engine || 'PostgreSQL'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">OS Platform:</span>
                    <span className="text-white">{health?.environment.os_platform || 'Windows/Linux'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: CORS Security Policies */}
        {activeTab === 'cors' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-6 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-white font-heading flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    Cross-Origin Resource Sharing (CORS) Configuration
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    Manage allowed origins, domain preflight controls, and API access security policies.
                  </p>
                </div>

                <button
                  onClick={handleSaveCORS}
                  disabled={savingCors}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  {savingCors ? 'Saving Changes...' : 'Save CORS Configuration'}
                </button>
              </div>

              {/* Add New Domain Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://your-frontend-domain.com"
                  value={newCorsDomain}
                  onChange={(e) => setNewCorsDomain(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleAddDomain}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-bold text-cyan-400 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Origin</span>
                </button>
              </div>

              {/* Active Allowed Origins */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Active Allowed Domains ({corsOriginsList.length})
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {corsOriginsList.map((domain, i) => (
                    <div
                      key={i}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-2"
                    >
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{domain}</span>
                      <button
                        onClick={() => handleRemoveDomain(domain)}
                        className="text-slate-500 hover:text-rose-400 transition-colors ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Policy Specs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5 text-xs font-bold text-slate-300">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                  <span className="text-slate-500 block text-[10px] uppercase">Credentials Policy</span>
                  <span className="text-emerald-400 font-bold">Access-Control-Allow-Credentials: true</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                  <span className="text-slate-500 block text-[10px] uppercase">Preflight Cache Max Age</span>
                  <span className="text-cyan-300 font-bold">86,400 Seconds (24 Hours)</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                  <span className="text-slate-500 block text-[10px] uppercase">Allowed HTTP Methods</span>
                  <span className="text-purple-300 font-bold">GET, POST, PUT, DELETE, OPTIONS, PATCH</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Server Maintenance & Storage */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-6 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-white font-heading flex items-center gap-2">
                    <Trash2 className="w-5 h-5 text-rose-400" />
                    Storage & Maintenance Operations
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    Purge quarantined files, temporary upload caches, and expired Excel reports to optimize server storage.
                  </p>
                </div>

                <button
                  onClick={handleRunCleanup}
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-black transition-all shadow-md shadow-rose-500/20 cursor-pointer flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Purge Quarantine & Storage</span>
                </button>
              </div>

              {maintenanceMsg ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{maintenanceMsg}</span>
                </div>
              ) : null}

              {/* Storage Allocation Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 text-xs font-bold text-slate-300">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-white/5 space-y-1">
                  <span className="text-slate-500 block text-[10px] uppercase">Uploads Directory</span>
                  <span className="text-white font-black text-base font-heading">
                    {stats?.storage_usage_mb.uploads_folder || 0} MB
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/80 border border-white/5 space-y-1">
                  <span className="text-slate-500 block text-[10px] uppercase">Reports Directory</span>
                  <span className="text-white font-black text-base font-heading">
                    {stats?.storage_usage_mb.reports_folder || 0} MB
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/80 border border-white/5 space-y-1">
                  <span className="text-slate-500 block text-[10px] uppercase">Quarantine Directory</span>
                  <span className="text-rose-400 font-black text-base font-heading">
                    {stats?.storage_usage_mb.quarantine_folder || 0} MB
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/80 border border-white/5 space-y-1">
                  <span className="text-slate-500 block text-[10px] uppercase">Total Storage Usage</span>
                  <span className="text-cyan-300 font-black text-base font-heading">
                    {stats?.storage_usage_mb.total_storage_mb || 0} MB
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Recruiter Accounts */}
        {activeTab === 'recruiters' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4 shadow-lg">
              <h3 className="text-base font-black text-white font-heading flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                Registered Recruiter Accounts ({recruiters.length})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-bold border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                      <th className="py-3 px-4">Recruiter Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Upload Sessions</th>
                      <th className="py-3 px-4">Total Candidates</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    {recruiters.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-black text-white">{r.name}</td>
                        <td className="py-3.5 px-4 text-cyan-400">{r.email}</td>
                        <td className="py-3.5 px-4 text-slate-300">{r.company || 'N/A'}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-extrabold ${
                            r.is_admin ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {r.is_admin ? 'Admin' : 'Recruiter'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold">{r.upload_sessions}</td>
                        <td className="py-3.5 px-4 font-bold text-cyan-300">{r.total_candidates}</td>
                        <td className="py-3.5 px-4 text-right">
                          {!r.is_admin && (
                            <button
                              onClick={() => handleDeleteRecruiter(r.id, r.name)}
                              className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Security Audit Logs */}
        {activeTab === 'audit' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4 shadow-lg">
              <h3 className="text-base font-black text-white font-heading flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Security Audit Log Stream
              </h3>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {auditLogs.map((log: any) => (
                  <div key={log.id} className="p-3.5 rounded-xl bg-slate-800/60 border border-white/5 text-xs font-bold text-slate-300 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-white block font-extrabold">{log.action}</span>
                      <span className="text-slate-500 text-[10px] flex items-center gap-2">
                        <span>IP: {log.ip_address}</span>
                        <span>•</span>
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 text-[10px] font-mono">
                      Log #{log.id.substring(0, 8)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
