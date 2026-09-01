'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, ShieldAlert, ShoppingBag, ShieldCheck, Sparkles, Loader2, X, AlertCircle, Cpu } from 'lucide-react';
import LiveProgressModal, { AiSwitchNotification } from './LiveProgressModal';

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

interface EngineStatus {
  activeProvider: string;
  targetModel: string;
  cascadeStatus: Array<{
    model: string;
    isReady: boolean;
    remainingHours: number;
  }>;
}

export default function ScanForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [step, setStep] = useState(0);
  const [activeAiModel, setActiveAiModel] = useState<string | undefined>();
  const [aiSwitchNotification, setAiSwitchNotification] = useState<AiSwitchNotification | null>(null);
  const [stepStatusDetail, setStepStatusDetail] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [engineStatus, setEngineStatus] = useState<EngineStatus | null>(null);

  // Fetch real-time active model & 24h quota cooldowns on mount
  useEffect(() => {
    fetch('/api/model-status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.targetModel) {
          setEngineStatus(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleScan = async (targetUrl: string, demoId?: string) => {
    const trimmed = targetUrl.trim();
    if (!trimmed) return;
    setErrorMessage(null);
    setIsScanning(true);
    setStep(0);
    setActiveAiModel(undefined);
    setAiSwitchNotification(null);
    setStepStatusDetail(undefined);

    try {
      const res = await fetch('/api/scan?stream=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed, demoId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.error || 'Scan failed due to an API error. Please check your configuration.');
        setIsScanning(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (!reader) {
        throw new Error('Streaming response reader unavailable');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6));

              if (event.type === 'step') {
                setStep(event.step);
                if (event.label) setStepStatusDetail(event.label);
              } else if (event.type === 'ai_evaluating') {
                setStep(3);
                if (event.model) setActiveAiModel(event.model);
                if (event.label) setStepStatusDetail(event.label);
              } else if (event.type === 'ai_switch') {
                setStep(3);
                if (event.model) setActiveAiModel(event.model);
                setAiSwitchNotification({
                  from: event.previousModel,
                  to: event.model,
                  reason: event.reason || event.label,
                });
                if (event.label) setStepStatusDetail(event.label);
              } else if (event.type === 'ai_skip') {
                setStepStatusDetail(event.label);
              } else if (event.type === 'done') {
                setStep(5);
                setTimeout(() => {
                  router.push(`/report/${event.id}`);
                }, 600);
                return;
              } else if (event.type === 'error') {
                setErrorMessage(event.error || 'Scan failed unexpectedly.');
                setIsScanning(false);
                return;
              }
            } catch (err) {
              console.warn('Failed to parse SSE line:', err);
            }
          }
        }
      }
    } catch (error: any) {
      setErrorMessage(error?.message || 'An unexpected network error occurred during scan.');
      setIsScanning(false);
    }
  };

  // Helper label for target model
  const getTargetModelBadge = () => {
    if (!engineStatus) return null;
    const { targetModel, cascadeStatus } = engineStatus;

    const cooldownModels = cascadeStatus.filter((s) => !s.isReady);
    const hasCooldown = cooldownModels.length > 0;

    let displayModel = targetModel;
    if (targetModel.includes('3.7')) displayModel = 'Gemini 3.7 Flash';
    else if (targetModel.includes('3.6')) displayModel = 'Gemini 3.6 Flash';
    else if (targetModel.includes('3.5')) displayModel = 'Gemini 3.5 Flash';
    else if (targetModel.includes('deepseek')) displayModel = 'DeepSeek V4';

    return (
      <div className="flex items-center justify-center gap-2 text-xs font-mono text-zinc-400">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/80 border border-white/[0.08] backdrop-blur-md">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Target AI:</span>
          <span className="text-cyan-300 font-bold">{displayModel}</span>
          {hasCooldown && (
            <span className="ml-1 text-[10px] text-amber-400/90 font-medium">
              ({cooldownModels[0].model.replace('gemini-', 'G')} in 24h cooldown)
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 relative z-10">
      <LiveProgressModal
        isOpen={isScanning}
        currentStep={step}
        activeAiModel={activeAiModel}
        aiSwitchNotification={aiSwitchNotification}
        stepStatusDetail={stepStatusDetail}
      />

      {/* Graceful Error Banner */}
      {errorMessage && (
        <div className="bg-rose-950/70 border border-rose-500/40 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-3 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-rose-200">API Execution Issue</h4>
              <p className="text-xs sm:text-sm text-rose-300/90 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-200 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Target Model Status Indicator */}
      {getTargetModelBadge()}

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
