'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, ShieldAlert, ShoppingBag, ShieldCheck, Sparkles, Loader2, X, Zap } from 'lucide-react';
import LiveProgressModal from './LiveProgressModal';

const SAMPLES = [
  {
    label: 'Official Store (Apple)',
    url: 'https://www.apple.com/shop',
    demoId: 'demo-safe-apple',
    icon: ShieldCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    tag: 'Verified Safe',
  },
  {
    label: 'Unverified Megastore',
    url: 'https://ecommerce-playground.lambdatest.io',
    demoId: 'demo-fake-store',
    icon: ShoppingBag,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/30',
    tag: 'Suspicious Checkout',
  },
  {
    label: 'Google Phishing Trap',
    url: 'https://testsafebrowsing.appspot.com/s/phishing.html',
    demoId: 'demo-phishing-threat',
    icon: ShieldAlert,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/30',
    tag: 'Phishing Threat',
  },
];

export default function ScanForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [step, setStep] = useState(0);

  const handleScan = async (targetUrl: string, demoId?: string) => {
    const trimmed = targetUrl.trim();
    if (!trimmed) return;
    setIsScanning(true);
    setStep(0);

    // Dynamic progress ticker
    const progressInterval = setInterval(() => {
      setStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 500);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed, demoId }),
      });

      const data = await res.json();
      
      clearInterval(progressInterval);
      setStep(5); // Complete

      if (data.id) {
        setTimeout(() => {
          router.push(`/report/${data.id}`);
        }, 400);
      } else {
        alert(data.error || "Scan failed");
        setIsScanning(false);
      }
    } catch (error) {
      clearInterval(progressInterval);
      alert("An unexpected error occurred during scan");
      setIsScanning(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 relative z-10">
      <LiveProgressModal isOpen={isScanning} currentStep={step} />
      
      {/* Search Input Box */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/40 via-cyan-500/30 to-emerald-500/40 rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition duration-500 group-focus-within:opacity-100" />
        
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScan(url);
          }}
          className="relative bg-zinc-950/90 border border-white/[0.12] focus-within:border-emerald-500/70 rounded-2xl md:rounded-3xl flex items-center p-2.5 md:p-3 shadow-2xl backdrop-blur-2xl transition-all"
        >
          <div className="pl-4 pr-3 text-zinc-400">
            <Search className="w-6 h-6 text-emerald-400" />
          </div>
          
          <input
            type="text"
            required
            placeholder="Paste any suspicious URL, payment link, or online store..."
            className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 py-3.5 px-2 outline-none text-base md:text-lg w-full font-medium"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            suppressHydrationWarning
          />

          {url && (
            <button
              type="button"
              onClick={() => setUrl('')}
              className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors mr-2"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <button
            type="submit"
            disabled={isScanning || !url.trim()}
            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black px-6 py-4 rounded-xl md:rounded-2xl flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="hidden sm:inline">Inspecting...</span>
              </>
            ) : (
              <>
                <span>Inspect Link</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Quick Test Demo Links */}
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase text-zinc-400 tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Try a live demonstration URL:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLES.map((sample) => {
            const Icon = sample.icon;
            return (
              <button
                key={sample.label}
                type="button"
                onClick={() => {
                  setUrl(sample.url);
                  handleScan(sample.url, sample.demoId);
                }}
                className={`flex flex-col items-start text-left p-3.5 rounded-2xl border ${sample.bg} bg-zinc-900/60 hover:bg-zinc-900/90 transition-all hover:scale-[1.02] active:scale-[0.98] group`}
              >
                <div className="flex items-center justify-between w-full mb-2 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className={`w-4 h-4 ${sample.color} shrink-0`} />
                    <span className="text-xs font-bold text-zinc-200 truncate">{sample.label}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 whitespace-nowrap shrink-0 inline-flex items-center justify-center text-center">
                    {sample.tag}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono truncate w-full group-hover:text-zinc-400 transition-colors">
                  {sample.url}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
