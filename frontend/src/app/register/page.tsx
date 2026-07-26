'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignUp, useUser } from '@clerk/nextjs';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { isSignedIn, isLoaded } = useUser();
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && (isSignedIn || token)) {
      router.replace('/dashboard');
    }
  }, [isLoaded, isSignedIn, token, router]);

  if (!isLoaded) return null;

  if (isSignedIn || token) {
    return (
      <div className="min-h-screen bg-[#F8F5F1] text-[#2B241F] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#0047AB] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#60534A]">Redirecting to Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#2B241F] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="mb-6 text-center">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F2C59] via-[#0047AB] to-[#2563EB] p-1 flex items-center justify-center shrink-0 shadow-md border border-blue-400/30">
            <img src="/logo.png" alt="AI Resume Analyzer Logo Icon" className="w-full h-full object-contain rounded-xl" />
          </div>
        </Link>
      </div>

      <div className="flex items-center justify-center">
        <SignUp routing="hash" signInUrl="/login" fallbackRedirectUrl="/dashboard" />
      </div>
    </div>
  );
}
