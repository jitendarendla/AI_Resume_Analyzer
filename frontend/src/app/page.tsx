'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
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
  LogIn,
  Layers,
  Lock,
  RotateCw,
  Play,
  FileText,
  Check,
  ChevronDown,
  ChevronUp,
  Award,
  X,
  Mail,
  User,
  Building,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus
} from 'lucide-react';

export default function HomePage() {
  const { user, token, loginUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Pop-up Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const openLoginModal = () => {
    setError('');
    setSuccess('');
    setAuthTab('login');
    setAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setError('');
    setSuccess('');
    setAuthTab('register');
    setAuthModalOpen(true);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { email, password });
      loginUser(response.data);
      setAuthModalOpen(false);
      router.push('/dashboard');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg || JSON.stringify(d)).join(', '));
      } else {
        setError('Invalid email or password credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password entry.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/register', {
        name,
        email,
        company,
        password,
      });
      setSuccess(response.data.message || 'Account created successfully! Please sign in.');
      setTimeout(() => {
        setAuthTab('login');
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg || JSON.stringify(d)).join(', '));
      } else {
        setError('Registration failed. Please check details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      q: "How fast is the AI Resume Analyzer parsing engine?",
      a: "The engine uses a sub-second non-blocking parser with regex fallback, processing each candidate resume in under 5 milliseconds (<46ms for a batch of 50 resumes)."
    },
    {
      q: "Does the system support bulk folder and ZIP uploads?",
      a: "Yes! You can drag & drop entire folder hierarchies or multi-file batches containing PDF, DOCX, DOC, and TXT resumes directly into the upload portal."
    },
    {
      q: "How does Job Description (JD) ATS matching work?",
      a: "Our algorithm compares candidate extracted skills, work experience, and keyword relevance against your required JD, computing an exact ATS Match Score (%) and highlighting missing skill gaps."
    },
    {
      q: "Can I export formatted candidate reports to Excel?",
      a: "Absolutely. With 1 click, you can generate and download formatted `.xlsx` spreadsheets containing candidate contact details, skills, education, and ATS scores."
    },
    {
      q: "Is candidate data protected against malware?",
      a: "Yes. Every file uploaded undergoes binary header signature verification to detect and quarantine disguised malware executables (.exe disguised as .pdf)."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#2B241F] font-sans selection:bg-[#0047AB] selection:text-white" suppressHydrationWarning>
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
            {mounted && token ? (
              <Link href="/dashboard" className="sleek-btn-primary text-sm py-4 px-8 shadow-xl w-full sm:w-auto">
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="sleek-btn-primary text-sm py-4 px-8 shadow-xl w-full sm:w-auto cursor-pointer"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={openRegisterModal}
                  className="sleek-btn-secondary text-sm py-4 px-8 w-full sm:w-auto cursor-pointer"
                >
                  <span>Create Recruiter Account</span>
                </button>
              </>
            )}
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
          <span className="text-xs font-black uppercase tracking-wider text-[#0047AB]">High-Speed Intelligence</span>
          <h2 className="text-3xl font-black text-[#2B241F]">Built for Modern Recruiters</h2>
          <p className="text-xs font-semibold text-[#60534A] max-w-lg mx-auto">Streamline bulk resume evaluation with automated skill matching and folder-based candidate management.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="sleek-card p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EFE7DE] text-[#0F2C59] flex items-center justify-center border border-[#E2D7CB]">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#2B241F]">Bulk Drag & Drop Uploads</h3>
            <p className="text-xs font-semibold text-[#60534A] leading-relaxed">
              Batch parse PDF, DOCX, and TXT files instantly without waiting. Handles folder trees seamlessly.
            </p>
          </div>

          <div className="sleek-card p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF5EF] text-[#1E6B43] flex items-center justify-center border border-[#D4E8DC]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#2B241F]">Automated Skill & ATS Match</h3>
            <p className="text-xs font-semibold text-[#60534A] leading-relaxed">
              Compare candidate credentials against target JDs. Ranks candidates by high, medium, or low suitability.
            </p>
          </div>

          <div className="sleek-card p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F4EBF0] text-[#7A3E65] flex items-center justify-center border border-[#E6D4DF]">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#2B241F]">1-Click Excel Export</h3>
            <p className="text-xs font-semibold text-[#60534A] leading-relaxed">
              Download clean, pre-formatted `.xlsx` reports with candidate scores, contacts, and skills for hiring managers.
            </p>
          </div>
        </div>
      </section>

      {/* 4-Step Workflow Section */}
      <section id="how-it-works" className="py-20 bg-[#FAF6F1] border-t border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#0047AB]">Effortless Workflow</span>
            <h2 className="text-3xl font-black text-[#2B241F]">4 Steps to Perfect Hires</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-3">
              <span className="text-xs font-black text-[#0047AB] bg-[#EFE7DE] px-3 py-1 rounded-full">STEP 01</span>
              <h4 className="text-base font-black text-[#2B241F]">Upload Resumes</h4>
              <p className="text-xs font-semibold text-[#60534A]">Drag & drop candidate CVs or entire application folders.</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-3">
              <span className="text-xs font-black text-[#0047AB] bg-[#EFE7DE] px-3 py-1 rounded-full">STEP 02</span>
              <h4 className="text-base font-black text-[#2B241F]">Input Target JD</h4>
              <p className="text-xs font-semibold text-[#60534A]">Paste job requirements to run instant ATS match evaluation.</p>
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
            <button
              type="button"
              onClick={openRegisterModal}
              className="px-8 py-4 rounded-2xl bg-white text-[#0F2C59] font-black text-sm shadow-xl hover:bg-blue-50 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Start Evaluating Candidates</span>
              <ArrowRight className="w-4 h-4" />
            </button>
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

      {/* Interactive Pop-up Auth Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#140F0C]/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[#E8E2D9] text-[#2B241F] space-y-6 relative">
            {/* Modal Close Button */}
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute right-6 top-6 text-[#8C7E72] hover:text-[#2B241F] transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Brand */}
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F2C59] via-[#0047AB] to-[#2563EB] p-1 flex items-center justify-center mx-auto shadow-md border border-blue-400/30">
                <img src="/logo.png" alt="AI Resume Analyzer Logo Icon" className="w-full h-full object-contain rounded-xl" />
              </div>
              <h3 className="text-2xl font-black text-[#2B241F] tracking-tight">
                {authTab === 'login' ? 'Recruiter Sign In' : 'Create Recruiter Account'}
              </h3>
              <p className="text-xs font-semibold text-[#60534A]">
                {authTab === 'login' ? 'Access your Candidate Evaluation Dashboard' : 'Start bulk resume parsing & JD matching'}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex p-1 rounded-2xl bg-[#FAF6F1] border border-[#E2D7CB] text-xs font-black">
              <button
                type="button"
                onClick={() => { setAuthTab('login'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 rounded-xl transition-all ${
                  authTab === 'login' ? 'bg-white text-[#0F2C59] shadow-sm' : 'text-[#8C7E72] hover:text-[#2B241F]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab('register'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 rounded-xl transition-all ${
                  authTab === 'register' ? 'bg-white text-[#0F2C59] shadow-sm' : 'text-[#8C7E72] hover:text-[#2B241F]'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Feedback Alerts */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Sign In Form */}
            {authTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#2B241F] font-black uppercase tracking-wider mb-2">Work Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
                    <input
                      type="email"
                      required
                      placeholder="recruiter@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 font-bold placeholder-[#9A8D80]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[#2B241F] font-black uppercase tracking-wider">Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] rounded-2xl pl-10 pr-10 py-3 focus:outline-none focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 font-bold placeholder-[#9A8D80]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72] hover:text-[#2B241F] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="sleek-btn-primary w-full py-3.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'Signing In...' : 'Sign In to Dashboard'}</span>
                </button>
              </form>
            ) : (
              /* Create Account Form */
              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#2B241F] font-black uppercase tracking-wider mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#0F2C59] font-bold placeholder-[#9A8D80]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#2B241F] font-black uppercase tracking-wider mb-1.5">Work Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
                    <input
                      type="email"
                      required
                      placeholder="recruiter@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#0F2C59] font-bold placeholder-[#9A8D80]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#2B241F] font-black uppercase tracking-wider mb-1.5">Company / Organization</label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
                    <input
                      type="text"
                      required
                      placeholder="Recruitment Agency / Company Name..."
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#0F2C59] font-bold placeholder-[#9A8D80]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#2B241F] font-black uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] rounded-2xl pl-10 pr-10 py-2.5 focus:outline-none focus:border-[#0F2C59] font-bold placeholder-[#9A8D80]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72] hover:text-[#2B241F]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[#2B241F] font-black uppercase tracking-wider mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#FAF6F1] border border-[#E2D7CB] text-[#2B241F] rounded-2xl pl-10 pr-10 py-2.5 focus:outline-none focus:border-[#0F2C59] font-bold placeholder-[#9A8D80]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C7E72] hover:text-[#2B241F]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="sleek-btn-primary w-full py-3.5 mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
