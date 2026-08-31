'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, FileText, ScanLine } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const isScanner = pathname === '/';
  const isReports = pathname === '/reports';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#060709]/85 backdrop-blur-xl border-b border-white/[0.07] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-2">
        
        {/* Left: Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <div className="relative">
            <div className="absolute -inset-1 bg-emerald-500/30 rounded-xl blur-sm group-hover:bg-emerald-500/50 transition-all" />
            <div className="relative bg-zinc-900 border border-emerald-500/40 p-1.5 sm:p-2 rounded-xl text-emerald-400">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold tracking-tight text-base sm:text-lg text-white group-hover:text-emerald-400 transition-colors">
                VerifyLink
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold hidden xs:inline-block">
                v1.0
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium tracking-tight hidden md:inline-block">
              Zero-Trust Scam Inspector
            </span>
          </div>
        </Link>

        {/* Center: Interactive Nav Switcher */}
        <div className="flex items-center gap-1 bg-zinc-900/90 border border-white/[0.08] p-1 sm:p-1.5 rounded-xl sm:rounded-2xl shadow-inner shrink-0">
          <Link
            href="/"
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all duration-200 ${
              isScanner
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
            }`}
          >
            <ScanLine className={`w-3.5 h-3.5 ${isScanner ? 'text-zinc-950' : 'text-emerald-400'}`} />
            <span>Scanner</span>
          </Link>

          <Link
            href="/reports"
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all duration-200 ${
              isReports
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
            }`}
          >
            <FileText className={`w-3.5 h-3.5 ${isReports ? 'text-zinc-950' : 'text-amber-400'}`} />
            <span>My Reports</span>
          </Link>
        </div>

        {/* Right: Solari Status Beacon */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-zinc-900/80 border border-white/[0.08] text-[11px] font-mono text-zinc-400">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="hidden sm:inline">MicroVMs Online</span>
          </div>
        </div>

      </div>
    </header>
  );
}
