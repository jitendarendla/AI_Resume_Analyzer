import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'AI Resume Analyzer',
  description: 'AI-powered bulk resume analysis and candidate JD matching portal',
};

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_bGVuaWVudC1sZW9wYXJkLTkxLmNsZXJrLmFjY291bnRzLmRldiQ';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,600&family=JetBrains+Mono:wght@500;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-[#F8F5F1] text-[#2B241F] selection:bg-[#0047AB] selection:text-white" suppressHydrationWarning>
        <ClerkProvider
          publishableKey={publishableKey}
          appearance={{
            variables: {
              colorPrimary: '#0047AB',
              colorBackground: '#FFFFFF',
              borderRadius: '1.25rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            },
            elements: {
              card: 'shadow-2xl border border-[#E8E2D9] rounded-3xl bg-white p-6',
              headerTitle: 'font-black text-[#2B241F] font-heading text-xl',
              headerSubtitle: 'font-semibold text-[#60534A] text-xs',
              socialButtonsBlockButton: 'border border-[#E2D7CB] bg-[#FAF6F1] hover:bg-[#EFE7DE] text-[#2B241F] font-bold text-xs rounded-2xl py-2.5',
              formButtonPrimary: 'sleek-btn-primary w-full text-xs font-extrabold rounded-2xl py-3.5 shadow-md bg-gradient-to-r from-[#0F2C59] to-[#0047AB] hover:from-[#133870] hover:to-[#0056D6] border-none text-white cursor-pointer',
              formFieldInput: 'rounded-2xl border border-[#E2D7CB] bg-[#FAF6F1] focus:bg-white text-[#2B241F] font-bold text-xs py-3 px-4 focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 transition-all',
              footerActionLink: 'text-[#0047AB] font-black hover:underline text-xs',
              avatarBox: 'rounded-xl border border-blue-400/20 shadow-md',
            },
          }}
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
