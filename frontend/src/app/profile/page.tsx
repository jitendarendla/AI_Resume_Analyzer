'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#2B241F] flex items-center justify-center p-4">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-4 border-[#0047AB] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-[#60534A]">Redirecting to Dashboard...</p>
      </div>
    </div>
  );
}
