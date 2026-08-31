import Navbar from '@/components/Navbar';
import ReportsClient from './ReportsClient';
import { getAllReports } from '@/lib/db';
import { History, Plus } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const reports = await getAllReports();

  return (
    <div className="min-h-screen bg-[#060709] text-zinc-100 font-sans selection:bg-emerald-500/30 relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-amber-500/5 blur-[100px] pointer-events-none" />

      <Navbar />

      <main className="pt-28 sm:pt-32 pb-20 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-8 sm:space-y-10 relative z-10">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-5 sm:gap-6 border-b border-white/[0.08] pb-6 sm:pb-8">
          <div className="space-y-2 sm:space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-white/[0.08] text-[11px] sm:text-xs font-semibold text-zinc-400">
              <History className="w-3.5 h-3.5 text-emerald-400" />
              <span>Inspection History & Audit Vault</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">Reports</span>
            </h1>
            
            <p className="text-zinc-400 text-xs sm:text-sm md:text-base leading-relaxed">
              Browse previously executed zero-trust cloud browser forensics, isolated microVM network traces, and deep AI threat analyses.
            </p>
          </div>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Scan New URL</span>
          </Link>
        </div>

        {/* Client Reports Component with live search & filters */}
        <ReportsClient initialReports={reports} />
      </main>
    </div>
  );
}
