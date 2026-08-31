import Navbar from '@/components/Navbar';
import ScanForm from '@/components/ScanForm';
import Link from 'next/link';
import { History, ArrowRight, ShieldCheck, Cpu, Globe, CreditCard, LayoutTemplate, Zap, Lock } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#060709] text-zinc-100 font-sans selection:bg-emerald-500/30 relative overflow-x-hidden">
      <Navbar />
      
      <main className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center justify-center">
        {/* Background Ambient Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[350px] sm:h-[450px] bg-gradient-to-b from-emerald-500/15 via-emerald-500/5 to-transparent blur-[120px] sm:blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-96 right-1/4 w-[300px] sm:w-[500px] h-[200px] sm:h-[300px] bg-amber-500/10 blur-[100px] sm:blur-[120px] rounded-full pointer-events-none" />

        {/* Hero Header */}
        <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12 relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] sm:text-xs font-mono font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SOLARI MICROVM CLUSTER ONLINE</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.1]">
            Verify before you <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              trust the link.
            </span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed px-2">
            Spins up an ephemeral, isolated <strong className="text-zinc-200">Solari Cloud Browser</strong> and <strong className="text-zinc-200">Sandbox MicroVM</strong> to detonate suspicious URLs, inspect fake checkouts, and generate an AI Trust Audit Card in seconds.
          </p>
        </div>

        {/* Scanner Form */}
        <ScanForm />

        {/* Link to reports dashboard */}
        <div className="mt-10 sm:mt-12 relative z-10">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-white/[0.08] text-xs font-bold text-zinc-300 hover:text-emerald-400 transition-all shadow-xl hover:border-emerald-500/30"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>View Past Reports</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          </Link>
        </div>

        {/* Architecture & Feature Pillars Grid */}
        <div className="mt-20 sm:mt-28 w-full border-t border-white/[0.08] pt-16 sm:pt-20 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-2">
            <h2 className="text-xs font-mono uppercase font-bold text-emerald-400 tracking-widest">
              Zero-Trust Architecture
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-white">
              4 Pillars of Deep Threat Forensics
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-zinc-900/60 border border-white/[0.08] p-5 sm:p-6 rounded-3xl backdrop-blur-xl hover:border-emerald-500/30 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Domain Legitimacy</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Evaluates domain age, DNS resolution records, WHOIS registrant credibility, and typosquatting risk.
              </p>
            </div>

            <div className="bg-zinc-900/60 border border-white/[0.08] p-5 sm:p-6 rounded-3xl backdrop-blur-xl hover:border-emerald-500/30 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Brand Safety</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Detects deceptive logos, brand impersonation vectors, and phishing traps mimicking reputable institutions.
              </p>
            </div>

            <div className="bg-zinc-900/60 border border-white/[0.08] p-5 sm:p-6 rounded-3xl backdrop-blur-xl hover:border-emerald-500/30 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Payment Security</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Inspects checkout forms, embedded iframes, unencrypted credit card fields, and fake Stripe/PayPal gateways.
              </p>
            </div>

            <div className="bg-zinc-900/60 border border-white/[0.08] p-5 sm:p-6 rounded-3xl backdrop-blur-xl hover:border-emerald-500/30 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <LayoutTemplate className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">UX Deception</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Flags dark patterns, artificial urgency countdown timers, fake stock counters, and aggressive popup redirect traps.
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
