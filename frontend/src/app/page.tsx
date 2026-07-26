'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs';
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
      a: 'You can upload up to 20 resumes simultaneously per batch. Higher volume uploads are automatically queued for background processing.',
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
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
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
            <Show when="signed-in">
              <div className="flex items-center gap-3">
                <UserButton showName />
                <Link
                  href="/dashboard"
                  className="sleek-btn-primary text-xs"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Open Dashboard</span>
                </Link>
              </div>
            </Show>

            <Show when="signed-out">
              <div className="flex items-center gap-3">
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="text-xs font-black text-[#60534A] hover:text-[#2B241F] transition-colors hidden sm:block cursor-pointer"
                  >
                    Sign In
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button
                    type="button"
                    className="sleek-btn-primary cursor-pointer text-xs"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </SignUpButton>
              </div>
            </Show>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-20 relative overflow-hidden bg-gradient-to-b from-[#F8F5F1] via-[#FAF6F1] to-[#EFE7DE]">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EFE7DE] border border-[#E2D7CB] text-[#0F2C59] text-xs font-black uppercase tracking-wider shadow-sm">
            <Sparkles className="w-4 h-4 text-[#0047AB]" />
            <span>Next-Gen Resume Parsing Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-[#2B241F] tracking-tight leading-tight">
            AI-Powered Bulk <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-[#0F2C59] via-[#0047AB] to-[#2563EB] bg-clip-text text-transparent">
              Resume Analyzer
            </span> & ATS Matcher
          </h1>

          <p className="text-base sm:text-lg text-[#60534A] max-w-2xl mx-auto font-semibold leading-relaxed">
            Upload hundreds of candidate CVs in seconds. Extract 100% accurate skills, contact details, education, work experience, and generate instant Job Description match scoring reports.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Show when="signed-in">
              <Link href="/dashboard" className="sleek-btn-primary text-sm py-4 px-8 shadow-xl w-full sm:w-auto">
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Show>

            <Show when="signed-out">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <SignUpButton mode="modal">
                  <button
                    type="button"
                    className="sleek-btn-primary text-sm py-4 px-8 shadow-xl w-full sm:w-auto cursor-pointer"
                  >
                    <span>Get Started Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </SignUpButton>

                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="sleek-btn-secondary text-sm py-4 px-8 w-full sm:w-auto cursor-pointer"
                  >
                    <span>Recruiter Sign In</span>
                  </button>
                </SignInButton>
              </div>
            </Show>
          </div>

          {/* Quick Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-bold text-[#60534A]">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#1E6B43]" /> Sub-5ms CV Speed</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#1E6B43]" /> 100% Skill Overlap</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#1E6B43]" /> Formatted Excel Reports</span>
          </div>
        </div>
      </section>

      {/* Metrics Counter Bar */}
      <section className="py-12 bg-white border-y border-[#E8E2D9]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-black text-[#0047AB]">&lt;5 ms</div>
            <div className="text-xs font-bold text-[#60534A] mt-1">Average Parsing Speed</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-[#1E6B43]">99.8%</div>
            <div className="text-xs font-bold text-[#60534A] mt-1">Skill Extraction Precision</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-[#7A3E65]">100%</div>
            <div className="text-xs font-bold text-[#60534A] mt-1">Malware Binary Quarantined</div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-[#0047AB]">Core Platform Capabilities</span>
          <h2 className="text-3xl font-black text-[#2B241F]">Built for Modern Talent Acquisition</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="sleek-card p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0F2C59] text-white flex items-center justify-center shadow-md">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#2B241F]">Bulk CV Parsing</h3>
            <p className="text-xs font-semibold text-[#60534A] leading-relaxed">
              Upload PDF, DOCX, and image resumes in bulk. Automatic text normalization and contact details extraction.
            </p>
          </div>

          <div className="sleek-card p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0047AB] text-white flex items-center justify-center shadow-md">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#2B241F]">AI Job Description Matcher</h3>
            <p className="text-xs font-semibold text-[#60534A] leading-relaxed">
              Paste target Job Description requirements and instantly rank candidate resumes by skill match percentage.
            </p>
          </div>

          <div className="sleek-card p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1E6B43] text-white flex items-center justify-center shadow-md">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#2B241F]">Formatted Excel Reports</h3>
            <p className="text-xs font-semibold text-[#60534A] leading-relaxed">
              Generate formatted Excel dossiers with ATS scores, missing skills, candidate contacts, and experience badges.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#EFE7DE] border-y border-[#E2D7CB]">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#0047AB]">Workflow Overview</span>
            <h2 className="text-3xl font-black text-[#2B241F]">4 Simple Steps to Evaluate Talent</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-3">
              <span className="text-xs font-black text-[#0047AB] bg-[#EFE7DE] px-3 py-1 rounded-full">STEP 01</span>
              <h4 className="text-base font-black text-[#2B241F]">Upload Files</h4>
              <p className="text-xs font-semibold text-[#60534A]">Drag & drop candidate CVs (PDF, DOCX, PNG, JPG).</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-3">
              <span className="text-xs font-black text-[#0047AB] bg-[#EFE7DE] px-3 py-1 rounded-full">STEP 02</span>
              <h4 className="text-base font-black text-[#2B241F]">Input Target JD</h4>
              <p className="text-xs font-semibold text-[#60534A]">Paste job requirements & required skill criteria.</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-3">
              <span className="text-xs font-black text-[#0047AB] bg-[#EFE7DE] px-3 py-1 rounded-full">STEP 03</span>
              <h4 className="text-base font-black text-[#2B241F]">Review Rankings</h4>
              <p className="text-xs font-semibold text-[#60534A]">Filter candidates by ATS score, skills, and experience level.</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-3">
              <span className="text-xs font-black text-[#0047AB] bg-[#EFE7DE] px-3 py-1 rounded-full">STEP 04</span>
              <h4 className="text-base font-black text-[#2B241F]">Export & Share</h4>
              <p className="text-xs font-semibold text-[#60534A]">Export candidate dossiers to Excel spreadsheets in 1 click.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-6 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-[#0047AB]">Frequently Asked Questions</span>
          <h2 className="text-3xl font-black text-[#2B241F]">Everything You Need to Know</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-2xl bg-white border border-[#E8E2D9] overflow-hidden shadow-sm transition-all">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-6 flex items-center justify-between font-black text-sm text-[#2B241F] hover:bg-[#FAF6F1]"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 text-[#0047AB]" /> : <ChevronDown className="w-4 h-4 text-[#8C7E72]" />}
              </button>

              {openFaq === idx && (
                <div className="px-6 pb-6 text-xs font-semibold text-[#60534A] leading-relaxed border-t border-[#F1ECE6] pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 bg-gradient-to-tr from-[#0F2C59] via-[#0047AB] to-[#2563EB] text-white text-center">
        <div className="max-w-3xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Ready to Accelerate Your Hiring?</h2>
          <p className="text-xs sm:text-sm font-medium text-blue-100 max-w-lg mx-auto">
            Join recruiters saving 20+ hours every week with AI-powered resume analysis.
          </p>
          <div className="pt-4">
            <Show when="signed-in">
              <Link href="/dashboard" className="px-8 py-4 rounded-2xl bg-white text-[#0F2C59] font-black text-sm shadow-xl hover:bg-blue-50 transition-all inline-flex items-center gap-2 cursor-pointer font-heading">
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Show>
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="px-8 py-4 rounded-2xl bg-white text-[#0F2C59] font-black text-sm shadow-xl hover:bg-blue-50 transition-all inline-flex items-center gap-2 cursor-pointer font-heading"
                >
                  <span>Start Evaluating Candidates</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </SignUpButton>
            </Show>
          </div>
        </div>
      </section>

      {/* Official Footer */}
      <footer className="py-12 bg-[#FAF6F1] border-t border-[#E8E2D9] text-xs font-bold text-[#60534A]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0F2C59] via-[#0047AB] to-[#2563EB] p-1 flex items-center justify-center shrink-0 border border-blue-400/30">
              <img src="/logo.png" alt="AI Resume Analyzer Logo Icon" className="w-full h-full object-contain rounded" />
            </div>
            <span className="font-black text-[#2B241F] tracking-wider uppercase">AI RESUME ANALYZER</span>
          </div>

          <p>© {new Date().getFullYear()} AI Resume Analyzer Engine. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-[#0F2C59]">Features</a>
            <a href="#faq" className="hover:text-[#0F2C59]">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
