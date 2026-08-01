'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  UploadCloud,
  FileSpreadsheet,
  Users,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Search,
  Database,
  Download,
  Star,
  ChevronRight,
  UserCheck,
  Layers,
  Lock,
  RotateCw,
  Play,
  FileText,
  Check,
  ChevronDown,
  ChevronUp,
  Award,
} from 'lucide-react';

export default function HomePage() {
  const { user, token } = useAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const faqs = [
    {
      q: 'How does the AI Resume Parsing engine work?',
      a: 'Our engine extracts text from PDF, DOCX, and image resumes, normalizing candidate details (skills, contact, education, experience) into structured data and comparing them against target Job Descriptions using vector similarity.',
    },
    {
      q: 'Is there a limit on bulk file uploads?',
      a: 'You can upload up to 100+ resumes simultaneously per batch. Higher volume uploads are automatically queued for background processing.',
    },
    {
      q: 'Can I export candidates to Excel reports?',
      a: 'Yes! Instant 1-click export generates formatted XLSX reports complete with ATS match percentages, skill breakdown, and candidate contact info.',
    },
    {
      q: 'How secure is candidate data?',
      a: 'All files are processed through isolated sandboxes with strict file validation and virus scanning to ensure zero malware or data exposure.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#2B241F] font-sans relative overflow-x-hidden">
      {/* Top Sticky Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#FAF6F1]/90 backdrop-blur-md border-b border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F2C59] via-[#0047AB] to-[#2563EB] p-1 flex items-center justify-center shrink-0 shadow-md border border-blue-400/30">
              <img src="/logo.png" alt="AI Resume Analyzer Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm text-[#2B241F] tracking-wider leading-none uppercase font-sans">
                AI RESUME
              </span>
              <span className="text-[10px] text-[#0047AB] font-black tracking-widest uppercase mt-0.5">
                ANALYZER
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#60534A]">
            <a href="#features" className="hover:text-[#0F2C59] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#0F2C59] transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-[#0F2C59] transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            {mounted && (user || token) ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="sleek-btn-primary text-xs"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Open Dashboard</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-xs font-black text-[#60534A] hover:text-[#2B241F] transition-colors hidden sm:block cursor-pointer"
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  className="sleek-btn-primary cursor-pointer text-xs"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 sm:pt-40 pb-20 px-4 sm:px-6 max-w-7xl mx-auto text-center space-y-8 relative">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EFE7DE] border border-[#E2D7CB] text-xs font-extrabold text-[#0047AB] shadow-sm">
          <Sparkles className="w-4 h-4 text-[#0047AB]" />
          <span>Enterprise Bulk Candidate Evaluation Engine</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#2B241F] tracking-tight leading-tight max-w-4xl mx-auto">
          AI-Powered Bulk <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-[#0F2C59] via-[#0047AB] to-[#2563EB] bg-clip-text text-transparent">
            Resume Analyzer
          </span> & ATS Matcher
        </h1>

        <p className="text-base sm:text-lg text-[#60534A] max-w-2xl mx-auto font-semibold leading-relaxed">
          Upload hundreds of candidate CVs in seconds. Extract 100% accurate skills, contact details, education, work experience, and generate instant Job Description match scoring reports.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {mounted && (user || token) ? (
            <Link href="/dashboard" className="sleek-btn-primary text-sm py-4 px-8 shadow-xl w-full sm:w-auto">
              <span>Go to Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link
                href="/register"
                className="sleek-btn-primary text-sm py-4 px-8 shadow-xl w-full sm:w-auto cursor-pointer"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/login"
                className="sleek-btn-secondary text-sm py-4 px-8 w-full sm:w-auto cursor-pointer"
              >
                <span>Recruiter Sign In</span>
              </Link>
            </div>
          )}
        </div>

        {/* Feature Badges */}
        <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-xs font-bold text-[#60534A]">
          <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-sm flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1E6B43]" />
            <span>PDF & DOCX Support</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-sm flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-[#0047AB]" />
            <span>1-Click Excel Export</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-sm flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#7A3E65]" />
            <span>100% Multi-Tenant Data</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-sm flex items-center justify-center gap-2">
            <Award className="w-4 h-4 text-[#0F2C59]" />
            <span>ATS Match Scoring</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-white border-y border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-[#0047AB]">High Concurrency Feature Suite</div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#2B241F]">Built Specifically for Modern Recruiters</h2>
            <p className="text-xs sm:text-sm font-semibold text-[#60534A] max-w-xl mx-auto">Automate candidate shortlisting with intelligent JD matching and exportable Excel dossiers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF6F1] border border-[#E8E2D9] space-y-4 hover:border-[#0047AB] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0047AB] flex items-center justify-center border border-blue-100 shadow-sm">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#2B241F]">Bulk Folder Uploads</h3>
              <p className="text-xs text-[#60534A] leading-relaxed">
                Drag and drop entire folders of candidate resumes in PDF or DOCX format. High concurrency workers parse files in parallel.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF6F1] border border-[#E8E2D9] space-y-4 hover:border-[#0047AB] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#7A3E65] flex items-center justify-center border border-purple-100 shadow-sm">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#2B241F]">Instant ATS Ranking</h3>
              <p className="text-xs text-[#60534A] leading-relaxed">
                Compare candidate skill sets, work experience years, and qualifications directly against target Job Descriptions with percentage match scores.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF6F1] border border-[#E8E2D9] space-y-4 hover:border-[#0047AB] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#1E6B43] flex items-center justify-center border border-emerald-100 shadow-sm">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#2B241F]">Export to Excel</h3>
              <p className="text-xs text-[#60534A] leading-relaxed">
                Generate structured 1-click formatted Excel reports (.xlsx) containing candidate rankings, missing skills, and contact profiles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="text-xs font-black uppercase tracking-wider text-[#0047AB]">Streamlined Workflow</div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#2B241F]">Evaluate Resumes in 3 Simple Steps</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm relative">
            <span className="text-4xl font-black text-[#0047AB]/20 font-mono absolute top-4 right-6">01</span>
            <h4 className="text-base font-black text-[#2B241F] mb-2">Upload Candidate Batch</h4>
            <p className="text-xs text-[#60534A]">Upload individual resume files or select an entire folder of candidate documents.</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm relative">
            <span className="text-4xl font-black text-[#0047AB]/20 font-mono absolute top-4 right-6">02</span>
            <h4 className="text-base font-black text-[#2B241F] mb-2">Enter Job Description</h4>
            <p className="text-xs text-[#60534A]">Paste target Job Description requirements to run intelligent skill matching.</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] shadow-sm relative">
            <span className="text-4xl font-black text-[#0047AB]/20 font-mono absolute top-4 right-6">03</span>
            <h4 className="text-base font-black text-[#2B241F] mb-2">Inspect & Export Report</h4>
            <p className="text-xs text-[#60534A]">View candidate ranking dossiers and download formatted Excel report sheets.</p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20 px-4 sm:px-6 bg-white border-t border-[#E8E2D9]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[#2B241F]">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm font-semibold text-[#60534A]">Everything you need to know about the AI Resume Analyzer</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-[#E8E2D9] rounded-2xl overflow-hidden transition-all bg-[#FAF6F1]"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-black text-sm text-[#2B241F] cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-[#0047AB] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#8C7E72] shrink-0" />
                  )}
                </button>

                {openFaq === idx && (
                  <div className="p-5 pt-0 text-xs font-medium text-[#60534A] leading-relaxed border-t border-[#E8E2D9]/60">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-[#E8E2D9] bg-[#FAF6F1] text-xs font-semibold text-[#60534A]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#0F2C59] p-0.5 flex items-center justify-center text-white font-black text-[10px]">
              AI
            </div>
            <span className="font-black text-[#2B241F]">AI Resume Analyzer Portal</span>
          </div>
          <p>© {new Date().getFullYear()} AI Resume Analyzer. Multi-tenant Recruiter Enterprise System.</p>
        </div>
      </footer>
    </div>
  );
}
