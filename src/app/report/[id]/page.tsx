import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import TrustScoreGauge from '@/components/TrustScoreGauge';
import ScreenshotPreview from '@/components/ScreenshotPreview';
import SecurityPillars from '@/components/SecurityPillars';
import ShareButtons from '@/components/ShareButtons';
import { getReport } from '@/lib/db';
import { Clock, ShieldAlert, Zap, ArrowLeft, ExternalLink, ShieldCheck, AlertTriangle, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default async function ReportPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const report = await getReport(id);

  if (!report) {
    notFound();
  }

  const { overallScore, riskLevel, domain, timestamp, targetUrl, metrics, summary, redFlags, pillars, screenshotBase64 } = report;
  
  let riskColor = "text-emerald-400";
  let riskBg = "bg-emerald-500/10";
  let riskBorder = "border-emerald-500/30";
  let RiskIcon = ShieldCheck;
  
  if (riskLevel === "CRITICAL" || riskLevel === "DANGEROUS") {
    riskColor = "text-rose-400";
    riskBg = "bg-rose-500/10";
    riskBorder = "border-rose-500/30";
    RiskIcon = ShieldAlert;
  } else if (riskLevel === "SUSPICIOUS") {
    riskColor = "text-amber-400";
    riskBg = "bg-amber-500/10";
    riskBorder = "border-amber-500/30";
    RiskIcon = AlertTriangle;
  }

  return (
    <div className="min-h-screen bg-[#060709] text-zinc-100 font-sans selection:bg-emerald-500/30 relative overflow-x-hidden">
      {/* Ambient background lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-emerald-500/10 to-transparent blur-[140px] pointer-events-none" />

      <Navbar />
      
      <main className="pt-28 sm:pt-32 pb-20 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-8 sm:space-y-10 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] px-3.5 py-2 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Reports</span>
          </Link>

          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Audit ID: <span className="text-zinc-300 font-bold">{id.slice(0, 8)}</span></span>
          </div>
        </div>

        {/* Header Hero Section */}
        <div className="bg-zinc-900/80 border border-white/[0.08] rounded-3xl p-5 sm:p-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 sm:gap-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          {/* Top indicator stripe */}
          <div
            className={`absolute top-0 left-0 right-0 h-1.5 ${
              riskLevel === 'SAFE' ? 'bg-emerald-500' : riskLevel === 'SUSPICIOUS' ? 'bg-amber-500' : 'bg-rose-500'
            }`}
          />

          <div className="space-y-3 sm:space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] sm:text-xs font-black uppercase tracking-wider ${riskBg} ${riskBorder} ${riskColor}`}>
                <RiskIcon className="w-3.5 h-3.5" />
                <span>{riskLevel} RISK</span>
              </div>
              
              <div className="text-zinc-500 text-[11px] sm:text-xs font-mono flex items-center gap-1.5 bg-zinc-950/60 px-3 py-1 rounded-full border border-white/[0.04]">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(timestamp).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white break-all">
                {domain}
              </h1>
              
              <a
                href={targetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-emerald-400 text-xs sm:text-sm font-mono truncate max-w-full underline underline-offset-4 decoration-zinc-700 hover:decoration-emerald-400 transition-colors"
              >
                <span className="truncate">{targetUrl}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-2">
              <div className="flex items-center gap-2 text-emerald-400 text-[11px] sm:text-xs font-mono font-medium">
                <Zap className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Detonated in {(metrics.totalScanTimeMs / 1000).toFixed(1)}s in Solari MicroVM</span>
              </div>

              {report.analyzedBy && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-mono bg-cyan-500/10 border-cyan-500/25 text-cyan-300">
                  <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>AI: {report.analyzedBy}</span>
                </div>
              )}
            </div>

            {report.cascadeNotes && report.cascadeNotes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {report.cascadeNotes.map((note, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono text-zinc-400 bg-zinc-950/80 border border-white/[0.06] px-2.5 py-0.5 rounded-full"
                  >
                    {note}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="shrink-0 self-center md:self-center bg-zinc-950/80 p-3.5 sm:p-4 rounded-3xl border border-white/[0.06] shadow-inner">
            <TrustScoreGauge score={overallScore} />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Left Column: Summary & Red Flags */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-zinc-900/80 border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl space-y-5 sm:space-y-6">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-white mb-2.5 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  <span>AI Forensics Summary</span>
                </h2>
                <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed bg-zinc-950/60 p-3.5 sm:p-4 rounded-2xl border border-white/[0.04]">
                  {summary}
                </p>
              </div>
              
              {redFlags.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                    Detected Threat Flags ({redFlags.length})
                  </h3>
                  <ul className="space-y-2">
                    {redFlags.map((flag, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-xs text-rose-300 bg-rose-500/10 p-3 sm:p-3.5 rounded-xl border border-rose-500/20 font-medium leading-relaxed"
                      >
                        <span className="shrink-0 text-rose-400 font-bold">•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-zinc-900/80 border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl space-y-3.5">
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                Share Trust Audit
              </h3>
              <ShareButtons score={overallScore} domain={domain} />
            </div>
          </div>

          {/* Right Column: Screenshot & Pillars */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <ScreenshotPreview base64={screenshotBase64} />
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">Security Pillars Breakdown</h2>
                <span className="text-xs font-mono text-zinc-500 hidden xs:inline-block">4 Zero-Trust Vectors</span>
              </div>
              <SecurityPillars pillars={pillars} />
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
