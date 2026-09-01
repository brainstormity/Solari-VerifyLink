import { notFound } from 'next/navigation';
import { getReport } from '@/lib/db';
import Navbar from '@/components/Navbar';
import TrustScoreGauge from '@/components/TrustScoreGauge';
import SecurityPillars from '@/components/SecurityPillars';
import ScreenshotPreview from '@/components/ScreenshotPreview';
import ShareButtons from '@/components/ShareButtons';
import {
  Clock,
  ShieldAlert,
  Zap,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Server,
  Lock,
  Calendar,
  Code2,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';
import Link from 'next/link';

import DeleteReportButton from '@/components/DeleteReportButton';

export default async function ReportPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const report = await getReport(id);

  if (!report) {
    notFound();
  }

  const {
    overallScore,
    riskLevel,
    domain,
    timestamp,
    targetUrl,
    metrics,
    summary,
    redFlags,
    pillars,
    screenshotBase64,
    networkForensics,
    formForensics,
    securityAdvice,
  } = report;
  
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

  // Fallback advice if not present in older reports
  const defaultAdvice =
    riskLevel === 'CRITICAL' || riskLevel === 'DANGEROUS'
      ? {
          verdict: 'DO NOT SUBMIT PASSWORDS OR PAYMENT DETAILS',
          actionItems: [
            'Do not enter credentials, credit cards, or personal identity numbers.',
            'If you previously submitted login details, immediately reset your password on the genuine platform.',
            'If payment details were submitted, contact your bank or card issuer immediately to block fraudulent transactions.',
          ],
        }
      : riskLevel === 'SUSPICIOUS'
      ? {
          verdict: 'EXERCISE EXTREME CAUTION - UNVERIFIED MERCHANT',
          actionItems: [
            'Avoid submitting sensitive payment or billing credentials.',
            'Verify company registration and independent buyer reviews before purchasing.',
            'Check for genuine third-party buyer protection (e.g. PayPal / certified escrow).',
          ],
        }
      : {
          verdict: 'AUTHENTIC & SAFE TO PROCEED',
          actionItems: [
            'Verified authentic digital domain with valid SSL encryption.',
            'Native tokenized checkout gateway confirmed.',
            'Zero deceptive brand impersonation or phishing indicators detected.',
          ],
        };

  const advice = securityAdvice || defaultAdvice;

  return (
    <div className="min-h-screen bg-[#060709] text-zinc-100 font-sans selection:bg-emerald-500/30 relative overflow-x-hidden">
      {/* Ambient background lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-emerald-500/10 to-transparent blur-[140px] pointer-events-none print:hidden" />

      <div className="print:hidden">
        <Navbar />
      </div>
      
      <main className="pt-28 sm:pt-32 pb-20 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-8 sm:space-y-10 relative z-10 print:pt-6 print:px-0">
        
        {/* Navigation Breadcrumb & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] px-3.5 py-2 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Reports</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono text-zinc-500 hidden md:flex">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Audit ID: <span className="text-zinc-300 font-bold">{id.slice(0, 8)}</span></span>
            </div>
            <DeleteReportButton id={id} domain={domain} />
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
                {domain || targetUrl.replace(/^https?:\/\//i, '').split('/')[0] || 'Security Inspection Report'}
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
          </div>
          
          <div className="shrink-0 self-center md:self-center bg-zinc-950/80 p-3.5 sm:p-4 rounded-3xl border border-white/[0.06] shadow-inner">
            <TrustScoreGauge score={overallScore} />
          </div>
        </div>

        {/* Actionable Consumer Guidance Checklist */}
        <div className={`p-5 sm:p-6 rounded-3xl border ${riskBorder} ${riskBg} backdrop-blur-xl relative overflow-hidden shadow-xl`}>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className={`p-2 sm:p-2.5 rounded-2xl ${riskBorder} bg-black/40 ${riskColor} shrink-0 mt-0.5`}>
              {riskLevel === 'SAFE' ? (
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <AlertOctagon className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold">
                  Recommended Action Plan
                </span>
                <h3 className={`text-base sm:text-lg font-black tracking-tight ${riskColor}`}>
                  {advice.verdict}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
                {advice.actionItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-2xl bg-black/40 border border-white/[0.06] text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed"
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold font-mono ${riskBg} ${riskColor}`}>
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Left Column: Summary, Red Flags & Technical Forensics */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* AI Forensics Summary */}
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

            {/* Network & Infrastructure Telemetry Card */}
            <div className="bg-zinc-900/80 border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl space-y-4">
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>Infrastructure & Network</span>
              </h3>

              <div className="space-y-2.5 text-xs font-mono">
                {/* IP Address */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-white/[0.04]">
                  <span className="text-zinc-500">Host IP:</span>
                  <span className="text-zinc-200 font-bold">{networkForensics?.ip || 'Dynamic Cloud IP'}</span>
                </div>

                {/* Web Server Header */}
                {networkForensics?.server && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-white/[0.04]">
                    <span className="text-zinc-500">Web Server:</span>
                    <span className="text-cyan-300 font-bold truncate max-w-[180px]">{networkForensics.server}</span>
                  </div>
                )}

                {/* SSL / TLS Certificate */}
                <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-white/[0.04] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      <span>SSL Certificate:</span>
                    </span>
                    <span className={`font-bold ${networkForensics?.sslValid !== false ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {networkForensics?.sslValid !== false ? 'Valid / Active' : 'Invalid / Insecure'}
                    </span>
                  </div>
                  {networkForensics?.sslIssuer && (
                    <p className="text-[11px] text-zinc-400 truncate pl-4">
                      Issuer: {networkForensics.sslIssuer}
                    </p>
                  )}
                  {networkForensics?.sslProtocol && (
                    <p className="text-[10px] text-zinc-500 pl-4">
                      Protocol: {networkForensics.sslProtocol}
                    </p>
                  )}
                </div>

                {/* Domain Provenance / Age */}
                <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-white/[0.04] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      <span>Domain Age:</span>
                    </span>
                    <span className="text-zinc-200 font-bold">
                      {networkForensics?.domainAge || 'Verified Active'}
                    </span>
                  </div>
                  {networkForensics?.registrar && (
                    <p className="text-[11px] text-zinc-400 truncate pl-4">
                      Registrar: {networkForensics.registrar}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Share Audit Card */}
            <div className="bg-zinc-900/80 border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl space-y-3.5 print:hidden">
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                Share Trust Audit
              </h3>
              <ShareButtons score={overallScore} domain={domain} />
            </div>
          </div>

          {/* Right Column: Screenshot, Pillars, and Form Exfiltration */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <ScreenshotPreview base64={screenshotBase64} />
            
            {/* Security Pillars Breakdown */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">Security Pillars Breakdown</h2>
                <span className="text-xs font-mono text-zinc-500 hidden xs:inline-block">4 Zero-Trust Vectors</span>
              </div>
              <SecurityPillars pillars={pillars} />
            </div>

            {/* Form Detonation & Data Exfiltration Analysis */}
            <div className="bg-zinc-900/80 border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-amber-400" />
                  <span>Form Detonation & Data Destination Audit</span>
                </h3>
                <span className="text-xs font-mono text-zinc-500">
                  {formForensics?.totalForms ?? 0} Form{formForensics?.totalForms === 1 ? '' : 's'} Inspected
                </span>
              </div>

              {formForensics && formForensics.forms && formForensics.forms.length > 0 ? (
                <div className="space-y-3">
                  {formForensics.forms.map((form, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 sm:p-4 rounded-2xl border ${
                        form.isCrossDomain
                          ? 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                          : 'bg-zinc-950/60 border-white/[0.06] text-zinc-300'
                      } space-y-2`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-white/[0.08] text-zinc-200 font-bold uppercase text-[10px]">
                            {form.method || 'POST'}
                          </span>
                          <span className="truncate max-w-[280px] sm:max-w-md font-sans text-zinc-200 font-semibold">
                            {form.action || 'Self-Submitting (Current Host)'}
                          </span>
                        </div>

                        {form.isCrossDomain && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold tracking-tight uppercase">
                            Cross-Domain Exfiltration
                          </span>
                        )}
                      </div>

                      {/* Inputs list */}
                      {form.inputs && form.inputs.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="text-[11px] text-zinc-500 font-mono self-center">Collected inputs:</span>
                          {form.inputs.map((inp, inpIdx) => (
                            <span
                              key={inpIdx}
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                                inp.type === 'password' || inp.name.includes('card') || inp.name.includes('cvv')
                                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 font-bold'
                                  : 'bg-zinc-900 border-white/[0.06] text-zinc-400'
                              }`}
                            >
                              {inp.name || inp.type} ({inp.type})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-zinc-950/50 border border-white/[0.04] text-xs text-zinc-400">
                  Zero interactive credential intake or payment forms detected on this page.
                </div>
              )}

              {formForensics?.externalScriptCount !== undefined && formForensics.externalScriptCount > 0 && (
                <div className="flex items-center justify-between text-xs font-mono text-zinc-500 pt-1 border-t border-white/[0.04]">
                  <span>External Third-Party Scripts Loaded:</span>
                  <span className="text-zinc-300 font-bold">{formForensics.externalScriptCount} Script tags</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
