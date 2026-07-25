'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  X,
  Sparkles,
  ArrowRight,
  FileSpreadsheet,
  Users,
  RotateCw,
  Download,
  Zap,
  Check
} from 'lucide-react';
import Link from 'next/link';

export default function UploadPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [reportName, setReportName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const { token } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) {
      const dropped = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...dropped]);
    }
  };

  const pollStatus = (sessionId: string) => {
    const interval = setInterval(async () => {
      try {
        const statusRes = await api.get(`/api/upload/status/${sessionId}`);
        const data = statusRes.data;

        if (data.total_files > 0) {
          const pct = Math.round((data.processed_files / data.total_files) * 100);
          setProgress(pct);
          setStatusMessage(`AI Processing Resumes: ${data.processed_files} / ${data.total_files} completed...`);
        }

        if (data.status?.toLowerCase() === 'completed' || (data.total_files > 0 && data.processed_files >= data.total_files)) {
          clearInterval(interval);
          setProgress(100);
          setUploading(false);
          setReanalyzing(false);
          setProcessedCount(data.total_files || files.length);
          setShowSuccessModal(true);
        }
      } catch (err) {
        clearInterval(interval);
        setUploading(false);
        setReanalyzing(false);
      }
    }, 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportName.trim()) {
      alert('Please enter a Campaign / Report Title (Required).');
      return;
    }

    if (!jobDescription.trim()) {
      alert('Please enter a target Job Description (Required).');
      return;
    }

    if (files.length === 0) {
      alert('Please select at least 1 resume file to upload.');
      return;
    }

    setUploading(true);
    setProgress(10);
    setStatusMessage('Securing and validating file signatures...');

    try {
      const formData = new FormData();
      formData.append('report_name', reportName.trim());
      formData.append('job_description', jobDescription.trim());

      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await api.post('/api/upload/resumes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const sessionId = response.data.session_id;
      setCurrentSessionId(sessionId);
      pollStatus(sessionId);

    } catch (err: any) {
      setUploading(false);
      alert(err.response?.data?.detail || 'Resume upload failed.');
    }
  };

  const handleReanalyze = async () => {
    if (!currentSessionId) return;
    setShowSuccessModal(false);
    setUploading(true);
    setReanalyzing(true);
    setProgress(0);
    setStatusMessage('Re-Analyzing all candidate resumes with AI...');

    try {
      const formData = new FormData();
      formData.append('job_description', jobDescription);
      const res = await api.post(`/api/upload/reanalyze/${currentSessionId}`, formData);
      pollStatus(res.data.session_id || currentSessionId);
    } catch (e: any) {
      setUploading(false);
      setReanalyzing(false);
      alert(e.response?.data?.detail || 'Re-analysis failed.');
    }
  };

  const handleDownloadExcel = async () => {
    if (!currentSessionId) return;
    try {
      const response = await api.get(`/api/reports/export/${currentSessionId}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${(reportName || 'Resume_Batch').replace(/ /g, '_')}_Report.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      setShowSuccessModal(false);
    } catch (e) {
      console.error('Download failed', e);
      alert('Failed to download Excel report. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#2B241F] flex font-sans" suppressHydrationWarning>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <Navbar collapsed={collapsed} />

        <main className="pt-20 p-8 space-y-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-7 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm relative overflow-hidden">
            <div>
              <div className="flex items-center gap-2 text-[#0047AB] font-bold text-xs tracking-wider uppercase mb-1">
                <UploadCloud className="w-4 h-4" /> Bulk Resume Processing Engine
              </div>
              <h1 className="text-2xl font-black text-[#2B241F] tracking-tight">Upload & Evaluate Candidate Resumes</h1>
              <p className="text-xs font-semibold text-[#60534A] mt-1">Extract ATS metrics, match skills against Job Description, and auto-export formatted reports</p>
            </div>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Left Side */}
            <div className="lg:col-span-2 p-7 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm space-y-5">
              <div>
                <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider mb-2">
                  Folder / Report Title <span className="text-rose-500 font-bold">* (Required)</span>
                </label>
                <input
                  type="text"
                  required
                  suppressHydrationWarning
                  placeholder="Enter Campaign / Report Title (Required)..."
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] text-xs rounded-2xl px-4 py-3 focus:outline-none focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 font-bold placeholder-[#9A8D80] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#2B241F] uppercase tracking-wider mb-2">
                  Target Job Description (JD) <span className="text-rose-500 font-bold">* (Required)</span>
                </label>
                <textarea
                  rows={4}
                  required
                  suppressHydrationWarning
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] text-xs rounded-2xl p-4 focus:outline-none focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 font-bold placeholder-[#9A8D80] transition-all"
                  placeholder="Paste target Job Description requirements here (Required)..."
                ></textarea>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`p-8 rounded-3xl border-2 border-dashed transition-all text-center space-y-4 ${
                  dragActive ? 'border-[#0F2C59] bg-[#EFE7DE]/50 scale-[1.01]' : 'border-[#E2D7CB] bg-[#FAF6F1]/50 hover:border-[#D6CCC0]'
                }`}
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EFE7DE] text-[#0F2C59] flex items-center justify-center border border-[#E2D7CB] shadow-sm">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#2B241F]">Drag & Drop Resumes or Folders Here</h3>
                  <p className="text-xs text-[#60534A] font-semibold mt-1">Supports PDF, DOCX, DOC, TXT (High concurrency batch processing)</p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <label className="px-5 py-2.5 rounded-2xl bg-[#0F2C59] hover:bg-[#0B2247] text-white font-black text-xs cursor-pointer transition-all shadow-md">
                    Select Files
                    <input type="file" multiple accept=".pdf,.docx,.doc,.txt" onChange={handleFileChange} className="hidden" suppressHydrationWarning />
                  </label>

                  <label className="px-5 py-2.5 rounded-2xl bg-[#EFE7DE] border border-[#E2D7CB] text-[#2B241F] font-black text-xs cursor-pointer hover:bg-[#E5DACD] transition-all">
                    Select Folder
                    {/* @ts-ignore */}
                    <input type="file" webkitdirectory="" directory="" multiple onChange={handleFolderChange} className="hidden" suppressHydrationWarning />
                  </label>
                </div>
              </div>
            </div>

            {/* Form Right Side: Queue & Actions */}
            <div className="p-7 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-[#F1ECE6] pb-3 mb-3">
                  <h3 className="text-sm font-black text-[#2B241F]">Upload Queue ({files.length})</h3>
                  {files.length > 0 && (
                    <button type="button" onClick={() => setFiles([])} className="text-xs text-rose-600 hover:underline font-bold">
                      Clear All
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {files.length > 0 ? (
                    files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF6F1] border border-[#E2D7CB] text-xs">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="w-4 h-4 text-[#0F2C59] shrink-0" />
                          <span className="truncate text-[#2B241F] font-extrabold">{f.name}</span>
                        </div>
                        <button type="button" onClick={() => removeFile(i)} className="text-[#8C7E72] hover:text-rose-600 ml-2">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-xs font-semibold text-[#8C7E72]">No files queued yet.</div>
                  )}
                </div>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#60534A]">
                    <span>{statusMessage}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-[#EFE7DE] rounded-full h-2.5 overflow-hidden">
                    <div className="bg-[#0F2C59] h-2.5 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || files.length === 0}
                className="sleek-btn-primary w-full py-3.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>{uploading ? 'Processing AI Extraction...' : 'Start AI Analysis'}</span>
              </button>
            </div>
          </form>

          {/* Web App Themed Analysis Completion Modal */}
          {showSuccessModal && (
            <div className="fixed inset-0 z-50 bg-[#140F0C]/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[#E8E2D9] text-[#2B241F] text-center space-y-6 transform transition-all duration-300 scale-100 relative overflow-hidden">
                <div className="h-1.5 w-full bg-[#0F2C59] absolute top-0 left-0"></div>

                {/* Styled Check Icon Header */}
                <div className="w-16 h-16 bg-[#EAF5EF] text-[#1E6B43] rounded-2xl flex items-center justify-center mx-auto border border-[#D4E8DC] shadow-sm">
                  <Check className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-[#2B241F] tracking-tight">Analysis Complete</h3>
                  <p className="text-xs text-[#60534A] font-semibold mt-2 leading-relaxed">
                    Successfully processed & evaluated <span className="font-black text-[#2B241F]">{processedCount} candidate resumes</span>. All ATS scores, skill matches, and exportable reports are ready.
                  </p>
                </div>

                {/* Metric Summary Pills */}
                <div className="p-4 rounded-2xl bg-[#FAF6F1] border border-[#E2D7CB] text-xs text-left grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E72] block">Report Title</span>
                    <span className="font-black text-[#2B241F] truncate block mt-0.5" title={reportName || 'Resume Report'}>
                      {reportName || 'Resume Report'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E72] block">Status</span>
                    <span className="font-black text-[#1E6B43] block mt-0.5">100% Completed</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-1">
                  {/* Convert & Download Excel Sheet Button (Closes Popup) */}
                  <button
                    onClick={handleDownloadExcel}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#1E6B43] hover:bg-[#185937] text-white font-black text-xs shadow-md shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Convert & Download Excel Sheet (.xlsx)</span>
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Re-Analyze Resumes Button */}
                    <button
                      onClick={handleReanalyze}
                      disabled={reanalyzing}
                      className="py-3 px-3 rounded-2xl bg-[#EFE7DE] hover:bg-[#E5DACD] text-[#2B241F] border border-[#E2D7CB] font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <RotateCw className={`w-3.5 h-3.5 text-[#0F2C59] ${reanalyzing ? 'animate-spin' : ''}`} />
                      <span>Re-Analyze Resumes</span>
                    </button>

                    {/* View Candidates Button */}
                    <Link
                      href="/candidates"
                      className="py-3 px-3 rounded-2xl bg-[#0F2C59] hover:bg-[#0B2247] text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>View Candidates</span>
                    </Link>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setFiles([]);
                    setReportName('');
                    setJobDescription('');
                  }}
                  className="text-xs text-[#8C7E72] hover:text-[#2B241F] font-bold pt-1 transition-colors block mx-auto"
                >
                  Close & Upload Another Batch
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
