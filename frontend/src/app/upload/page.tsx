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
    <div className="min-h-screen bg-[#F8F5F1] text-[#2B241F] flex font-sans" suppressHydrationWarning>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-20 md:ml-64'}`}>
        <Navbar collapsed={collapsed} />

        <main className="pt-24 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm relative overflow-hidden">
            <div>
              <div className="flex items-center gap-2 text-[#0047AB] font-bold text-xs tracking-wider uppercase mb-1">
                <UploadCloud className="w-4 h-4" /> Bulk Resume Processing Engine
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#2B241F] tracking-tight">Upload & Evaluate Candidate Resumes</h1>
              <p className="text-xs font-semibold text-[#60534A] mt-1">Extract ATS metrics, match skills against Job Description, and auto-export formatted reports</p>
            </div>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Left Side */}
            <div className="lg:col-span-2 p-5 sm:p-7 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm space-y-5">
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
                className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all ${
                  dragActive ? 'border-[#0047AB] bg-blue-50/50' : 'border-[#E2D7CB] bg-[#FAF6F1]/50 hover:bg-[#FAF6F1]'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0047AB] flex items-center justify-center mx-auto mb-3 border border-blue-100 shadow-sm">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-black text-[#2B241F]">Drag & Drop Resume Files or Folders Here</p>
                <p className="text-xs font-medium text-[#60534A] mt-1 mb-4">Supports PDF & DOCX formats (Up to 100+ files per batch)</p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <label className="sleek-btn-primary text-xs cursor-pointer">
                    <span>Select Individual Files</span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.docx,.doc"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  <label className="sleek-btn-secondary text-xs cursor-pointer">
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
                  <div className="flex items-center justify-between text-xs font-black text-[#2B241F]">
                    <span>Queued Files ({files.length})</span>
                    <button
                      type="button"
                      onClick={() => setFiles([])}
                      className="text-rose-600 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-2">
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF6F1] border border-[#E2D7CB] text-xs font-medium"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-[#0047AB] shrink-0" />
                          <span className="truncate text-[#2B241F] font-semibold">{file.name}</span>
                          <span className="text-[10px] text-[#60534A]">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-[#8C7E72] hover:text-rose-600 p-1"
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
                className="sleek-btn-primary w-full text-xs font-black py-4 cursor-pointer disabled:opacity-50"
              >
                {uploading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Evaluating Candidate Resumes...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    <Sparkles className="w-4 h-4 text-blue-200" />
                    <span>Run AI Resume Evaluation Engine</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </div>

            {/* Sidebar Guide */}
            <div className="p-5 sm:p-7 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-[#2B241F] mb-3">AI Resume Match Engine Guide</h3>
                <div className="space-y-3 text-xs text-[#60534A]">
                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#FAF6F1] border border-[#E8E2D9]">
                    <Zap className="w-4 h-4 text-[#0047AB] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#2B241F]">High Concurrency Parsing</p>
                      <p className="text-[11px]">Extracts skills, experience years, education & ATS match scores.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#FAF6F1] border border-[#E8E2D9]">
                    <FileSpreadsheet className="w-4 h-4 text-[#1E6B43] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#2B241F]">Auto Excel Generation</p>
                      <p className="text-[11px]">Instant exportable Excel sheet with match percentages and rankings.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#FAF6F1] border border-[#E8E2D9]">
                    <Users className="w-4 h-4 text-[#7A3E65] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#2B241F]">Folder-Wise Tracking</p>
                      <p className="text-[11px]">All uploaded batches are stored by Folder Title for instant access.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF6F1] border border-[#E8E2D9]">
                <p className="text-[11px] font-bold text-[#2B241F] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#0047AB]" />
                  <span>Verified Supported Formats</span>
                </p>
                <p className="text-[10px] text-[#60534A] font-medium mt-0.5">.pdf, .docx, .doc (Unlimited files per folder)</p>
              </div>
            </div>
          </form>
        </main>
      </div>

      {/* Progress & Success Modal */}
      {uploading && (
        <div className="fixed inset-0 z-50 bg-[#0F2C59]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E2D9] rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0047AB] flex items-center justify-center mx-auto border border-blue-100 shadow-md">
              <RotateCw className="w-7 h-7 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#2B241F]">Processing Resumes with AI</h3>
              <p className="text-xs font-bold text-[#60534A] mt-1">{statusMessage}</p>
            </div>

            <div className="w-full bg-[#FAF6F1] h-3 rounded-full overflow-hidden border border-[#E2D7CB]">
              <div
                className="bg-gradient-to-r from-[#0F2C59] to-[#0047AB] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs font-mono font-black text-[#0047AB]">{progress}% Completed</p>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-[#0F2C59]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E2D9] rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-in fade-in zoom-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#1E6B43] flex items-center justify-center mx-auto border border-emerald-100 shadow-md">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-[#2B241F]">Resume Processing Complete!</h3>
              <p className="text-xs font-bold text-[#60534A] mt-1">
                Successfully parsed <span className="text-[#1E6B43] font-mono font-black">{processedCount}</span> candidate profiles into <span className="text-[#0F2C59] font-black">{reportName}</span> folder.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleDownloadExcel}
                className="sleek-btn-primary w-full text-xs font-black py-3.5 cursor-pointer shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Download Excel Report (.xlsx)</span>
              </button>

              <button
                onClick={handleReanalyze}
                className="sleek-btn-secondary w-full text-xs font-black py-3.5 cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
                <span>Re-Analyze with New Requirements</span>
              </button>

              <Link
                href={`/candidates?session_id=${currentSessionId}`}
                className="block text-xs font-black text-[#0047AB] hover:underline pt-2"
              >
                View Candidates & Match Breakdown →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
