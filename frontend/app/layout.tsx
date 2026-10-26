import './globals.css';
import type { Metadata } from 'next';
import Navbar from './Navbar';
import { Lock, Cpu } from 'lucide-react';

export const metadata: Metadata = {
  title: 'PRAMAAN-AICTE | Bureau of Technical Education Regulation',
  description: 'AI-Powered Application Scrutiny, Document Authentication & Regulatory Compliance Suite for SIH Problem Statement ID26261',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased selection:bg-slate-900 selection:text-white">
        
        {/* Subtle Sovereign Indian Government Top Ribbon */}
        <div className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 text-[11px] text-slate-600">
          <div className="h-[2.5px] w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 tracking-wide">भारत सरकार</span>
              <span className="text-slate-300">|</span>
              <span className="font-medium text-slate-600">GOVERNMENT OF INDIA</span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="hidden sm:inline text-slate-500">Ministry of Education</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500 text-[10px]">
              <span className="hidden md:inline font-medium">All India Council for Technical Education (AICTE)</span>
              <span className="hidden md:inline text-slate-300">•</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[9px] font-semibold border border-slate-200">
                APH 2024–27
              </span>
            </div>
          </div>
        </div>

        <Navbar />
        
        <main className="flex-1">
          {children}
        </main>
        
        {/* Minimal Editorial Footer */}
        <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-sm text-xs text-slate-500 py-8 px-4 sm:px-6 lg:px-8 mt-16">
          <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center text-white text-xs font-bold font-mono">
                P
              </div>
              <div>
                <span className="font-semibold text-slate-800">PRAMAAN-AICTE</span>
                <span className="mx-2 text-slate-300">•</span>
                <span className="text-slate-500">Statutory Scrutiny & Approval System (SIH ID26261)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <Lock size={12} className="text-slate-700" />
                <span className="font-medium text-slate-700">SHA-256 Ledger Sealed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cpu size={12} className="text-slate-700" />
                <span className="font-medium text-slate-700">YOLOv8 + CLIP pgvector</span>
              </div>
              <span className="text-slate-300">|</span>
              <span>Approval Process Handbook 2024–27</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
