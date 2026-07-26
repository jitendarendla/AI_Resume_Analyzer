'use client';

import React from 'react';
import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
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
        <SignIn routing="hash" signUpUrl="/register" fallbackRedirectUrl="/dashboard" />
      </div>
    </div>
  );
}
