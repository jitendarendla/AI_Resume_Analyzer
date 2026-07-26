import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { AuthProvider } from '@/context/AuthContext';
import Metadata from 'next';

export const metadata = {
  title: 'AI Resume Analyzer',
  description: 'AI-powered bulk resume analysis and candidate JD matching portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,600&family=JetBrains+Mono:wght@500;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-[#F8F5F1] text-[#2B241F] selection:bg-[#0047AB] selection:text-white" suppressHydrationWarning>
        <ClerkProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
