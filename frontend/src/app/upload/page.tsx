'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import FloatingDock from '@/components/layout/FloatingDock';
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
  const [mobileOpen, setMobileOpen] = useState(false);
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

    if (e.dataTransfer.items) {
      const droppedFiles: File[] = [];
      const items = Array.from(e.dataTransfer.items);

      items.forEach((item) => {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) droppedFiles.push(file);
        }
      });

      if (droppedFiles.length > 0) {
        setFiles((prev) => [...prev, ...droppedFiles]);
      }
    } else if (e.dataTransfer.files) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const pollStatus = async (sessionId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/api/upload/status/${sessionId}`);
        const data = res.data;

        const total = data.total_files || 1;
        const done = data.processed_files || 0;
        const calculatedProgress = Math.min(Math.round((done / total) * 100), 99);

        setProgress(calculatedProgress);
        setProcessedCount(done);

        if (data.status === 'PROCESSING') {
          setStatusMessage(`Processing resumes with AI models (${done}/${total})...`);
        } else if (data.status === 'COMPLETED') {
          clearInterval(interval);
          setProgress(100);
          setStatusMessage('Analysis complete! All candidate profiles extracted.');
          setUploading(false);
          setReanalyzing(false);
          setShowSuccessModal(true);
        } else if (data.status === 'FAILED') {
          clearInterval(interval);
          setUploading(false);
          setReanalyzing(false);
          alert('Processing failed. Please check file formats.');
        }
      } catch (err) {
        console.error('Polling error', err);
      }
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportName.trim()) {
      alert('Please enter a Campaign / Report Title.');
      return;
    }
    if (!jobDescription.trim()) {
      alert('Please enter or paste the target Job Description (JD).');
      return;
    }
    if (files.length === 0) {
      alert('Please upload at least 1 candidate resume PDF or DOCX file.');
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
      a.download = `${reportName.replace(/\s+/g, '_')}_Report.xlsx`;
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
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans pb-32" suppressHydrationWarning>
      <Navbar />

      <main className="pt-24 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
        {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/80 to-slate-900 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xs tracking-wider uppercase mb-1">
                <UploadCloud className="w-4 h-4 text-cyan-400 animate-pulse" /> Bulk Resume Processing Engine
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-heading">Upload & Evaluate Candidate Resumes</h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-1">Extract ATS metrics, match skills against Job Description, and auto-export formatted reports</p>
            </div>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Left Side */}
            <div className="lg:col-span-2 p-5 sm:p-7 rounded-3xl bg-[#111827]/80 border border-white/10 shadow-xl backdrop-blur-xl space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-200 uppercase tracking-wider mb-2 font-heading">
                  Folder / Report Title <span className="text-rose-400 font-bold">* (Required)</span>
                </label>
                <input
                  type="text"
                  required
                  suppressHydrationWarning
                  placeholder="Enter Campaign / Report Title (Required)..."
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className="w-full bg-slate-900/80 border border-white/10 text-white text-xs rounded-2xl px-4 py-3.5 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 font-bold placeholder-slate-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-200 uppercase tracking-wider mb-2 font-heading">
                  Target Job Description (JD) <span className="text-rose-400 font-bold">* (Required)</span>
                </label>
                <textarea
                  rows={4}
                  required
                  suppressHydrationWarning
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full bg-slate-900/80 border border-white/10 text-white text-xs rounded-2xl p-4 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 font-bold placeholder-slate-500 transition-all"
                  placeholder="Paste target Job Description requirements here (Required)..."
                ></textarea>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all ${
                  dragActive ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/15 bg-slate-900/50 hover:bg-slate-900/80'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-3 border border-cyan-500/20 shadow-md">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <p className="text-sm sm:text-base font-black text-white font-heading">Drag & Drop Resume Files or Folders Here</p>
                <p className="text-xs font-medium text-slate-400 mt-1 mb-5">Supports PDF & DOCX formats (Up to 100+ files per batch)</p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <label className="sleek-btn-primary text-xs cursor-pointer w-full sm:w-auto shadow-lg shadow-cyan-500/20">
                    <span>Select Individual Files</span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.docx,.doc"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  <label className="px-5 py-3 rounded-2xl bg-slate-800 border border-white/10 text-slate-200 hover:bg-slate-700 font-extrabold text-xs transition-all cursor-pointer w-full sm:w-auto text-center">
                    <span>Upload Entire Folder</span>
                    <input
                      type="file"
                      // @ts-ignore
                      webkitdirectory="true"
                      directory="true"
                      multiple
                      onChange={handleFolderChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-slate-200">
                    <span>Queued Files ({files.length})</span>
                    <button
                      type="button"
                      onClick={() => setFiles([])}
                      className="text-rose-400 hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-2">
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/10 text-xs font-medium"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span className="truncate text-slate-200 font-semibold">{file.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || files.length === 0}
                className="sleek-btn-primary w-full text-xs font-black py-4 cursor-pointer disabled:opacity-50 shadow-xl shadow-cyan-500/20"
              >
                {uploading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Evaluating Candidate Resumes...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    <Sparkles className="w-4 h-4 text-cyan-200" />
                    <span>Run AI Resume Evaluation Engine</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </div>

            {/* Sidebar Guide */}
            <div className="p-5 sm:p-7 rounded-3xl bg-[#111827]/80 border border-white/10 shadow-xl backdrop-blur-xl space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-white font-heading mb-3">AI Resume Match Engine Guide</h3>
                <div className="space-y-3 text-xs text-slate-400">
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
                    <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-200">High Concurrency Parsing</p>
                      <p className="text-[11px]">Extracts skills, experience years, education & ATS match scores.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-200">Auto Excel Generation</p>
                      <p className="text-[11px]">Instant exportable Excel sheet with match percentages and rankings.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
                    <Users className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-200">Folder-Wise Tracking</p>
                      <p className="text-[11px]">All uploaded batches are stored by Folder Title for instant access.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10">
                <p className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Verified Supported Formats</span>
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">.pdf, .docx, .doc (Unlimited files per folder)</p>
              </div>
            </div>
          </form>

          {/* Progress & Success Modal */}
          {uploading && (
            <div className="fixed inset-0 z-50 bg-[#090D16]/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/20 shadow-lg">
                  <RotateCw className="w-8 h-8 animate-spin" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-heading">Processing Resumes with AI</h3>
                  <p className="text-xs font-bold text-slate-400 mt-1">{statusMessage}</p>
                </div>

                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs font-mono font-black text-cyan-400">{progress}% Completed</p>
              </div>
            </div>
          )}

          {showSuccessModal && (
            <div className="fixed inset-0 z-50 bg-[#090D16]/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-in fade-in zoom-in">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg">
                  <CheckCircle className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-white font-heading">Resume Processing Complete!</h3>
                  <p className="text-xs font-bold text-slate-400 mt-1">
                    Successfully parsed <span className="text-emerald-400 font-mono font-black">{processedCount}</span> candidate profiles into <span className="text-cyan-400 font-black">{reportName}</span> folder.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={handleDownloadExcel}
                    className="sleek-btn-primary w-full text-xs font-black py-3.5 cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Excel Report (.xlsx)</span>
                  </button>

                  <button
                    onClick={handleReanalyze}
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-800 border border-white/10 text-slate-200 hover:bg-slate-700 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>Re-Analyze with New Requirements</span>
                  </button>

                  <Link
                    href={`/candidates?session_id=${currentSessionId}`}
                    className="block text-xs font-black text-cyan-400 hover:underline pt-2"
                  >
                    View Candidates & Match Breakdown →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </main>
      <FloatingDock />
    </div>
  );
}
