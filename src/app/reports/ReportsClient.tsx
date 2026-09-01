'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ScanReport } from '@/lib/types';
import { Search, ShieldAlert, ShieldCheck, AlertTriangle, ArrowUpRight, Clock, Zap, Filter, ArrowRight, Globe2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface ReportsClientProps {
  initialReports: ScanReport[];
}

export default function ReportsClient({ initialReports }: ReportsClientProps) {
  const [reports, setReports] = useState<ScanReport[]>(initialReports);
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [reportToDelete, setReportToDelete] = useState<ScanReport | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/report/${reportToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== reportToDelete.id));
        setReportToDelete(null);
      } else {
        alert('Failed to delete report.');
      }
    } catch (e) {
      alert('Error deleting report.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.domain.toLowerCase().includes(search.toLowerCase()) ||
      report.targetUrl.toLowerCase().includes(search.toLowerCase()) ||
      report.summary.toLowerCase().includes(search.toLowerCase());

    const matchesRisk = filterRisk === 'ALL' || report.riskLevel === filterRisk;

    return matchesSearch && matchesRisk;
  });

  // Calculate high-level stats
  const totalCount = reports.length;
  const criticalCount = reports.filter(r => r.riskLevel === 'CRITICAL' || r.riskLevel === 'DANGEROUS').length;
  const safeCount = reports.filter(r => r.riskLevel === 'SAFE').length;
  const suspiciousCount = reports.filter(r => r.riskLevel === 'SUSPICIOUS').length;

  const getRiskTheme = (risk: string) => {
    switch (risk) {
      case 'SAFE':
        return {
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          glow: 'group-hover:border-emerald-500/40',
          accent: 'bg-emerald-500',
          icon: ShieldCheck,
        };
      case 'SUSPICIOUS':
        return {
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          glow: 'group-hover:border-amber-500/40',
          accent: 'bg-amber-500',
          icon: AlertTriangle,
        };
      case 'DANGEROUS':
      case 'CRITICAL':
      default:
        return {
          badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          glow: 'group-hover:border-rose-500/40',
          accent: 'bg-rose-500',
          icon: ShieldAlert,
        };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 30) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="space-y-6 sm:space-y-10">
      
      {/* Stats KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-zinc-900/60 border border-white/[0.08] p-3.5 sm:p-4 rounded-2xl backdrop-blur-md">
          <div className="text-zinc-500 text-[10px] sm:text-xs font-mono uppercase tracking-wider mb-0.5 sm:mb-1">Total Inspected</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">{totalCount}</div>
        </div>
        <div className="bg-zinc-900/60 border border-emerald-500/20 p-3.5 sm:p-4 rounded-2xl backdrop-blur-md">
          <div className="text-emerald-400 text-[10px] sm:text-xs font-mono uppercase tracking-wider mb-0.5 sm:mb-1">Safe Verified</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-emerald-400">{safeCount}</div>
        </div>
        <div className="bg-zinc-900/60 border border-amber-500/20 p-3.5 sm:p-4 rounded-2xl backdrop-blur-md">
          <div className="text-amber-400 text-[10px] sm:text-xs font-mono uppercase tracking-wider mb-0.5 sm:mb-1">Suspicious Deals</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-amber-400">{suspiciousCount}</div>
        </div>
        <div className="bg-zinc-900/60 border border-rose-500/20 p-3.5 sm:p-4 rounded-2xl backdrop-blur-md">
          <div className="text-rose-400 text-[10px] sm:text-xs font-mono uppercase tracking-wider mb-0.5 sm:mb-1">High Risk Threats</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-rose-400">{criticalCount}</div>
        </div>
      </div>

      {/* Search & Filter Header Bar */}
      <div className="bg-zinc-900/80 border border-white/[0.08] p-2.5 sm:p-3 rounded-2xl backdrop-blur-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-2xl">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search domains, URLs, threat summaries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950/80 border border-white/[0.08] rounded-xl pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            suppressHydrationWarning
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { key: 'ALL', label: 'All Audits' },
            { key: 'SAFE', label: 'Safe' },
            { key: 'SUSPICIOUS', label: 'Suspicious' },
            { key: 'CRITICAL', label: 'Critical' }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilterRisk(item.key)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap inline-flex items-center justify-center ${
                filterRisk === item.key
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border border-white/[0.06] hover:bg-zinc-800/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List / Grid */}
      {filteredReports.length === 0 ? (
        <div className="text-center py-16 sm:py-24 border border-white/[0.08] rounded-3xl bg-zinc-900/30 backdrop-blur-xl space-y-4 px-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-zinc-800/80 border border-white/10 flex items-center justify-center mx-auto text-zinc-500 shadow-inner">
            <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-zinc-200">No inspection reports found</h3>
            <p className="text-zinc-500 text-xs sm:text-sm max-w-md mx-auto">
              {search || filterRisk !== 'ALL'
                ? 'Try resetting your search query or adjusting your risk filter.'
                : 'No links have been audited yet. Submit a URL to trigger your first zero-trust inspection.'}
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20"
          >
            <span>Launch Link Scanner</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <AnimatePresence>
            {filteredReports.map((report, idx) => {
              const theme = getRiskTheme(report.riskLevel);
              const ThemeIcon = theme.icon;
              const scoreClass = getScoreColor(report.overallScore);

              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`group bg-zinc-900/70 hover:bg-zinc-900/95 border border-white/[0.08] ${theme.glow} rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-black/60 relative overflow-hidden backdrop-blur-xl`}
                >
                  {/* Top neon indicator stripe */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${theme.accent}`} />

                  <div className="space-y-3 sm:space-y-4">
                    {/* Header Row: Risk Badge & Score Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full border text-[10px] sm:text-xs font-black tracking-wider uppercase whitespace-nowrap text-center ${theme.badge}`}
                      >
                        <ThemeIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                        <span>{report.riskLevel}</span>
                      </div>

                      <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full border text-[11px] sm:text-xs font-black font-mono tracking-tight whitespace-nowrap text-center ${scoreClass}`}>
                        SCORE {report.overallScore}/100
                      </div>
                    </div>

                    {/* Domain & URL Section */}
                    <div className="space-y-0.5 sm:space-y-1">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Globe2 className="w-4 h-4 text-zinc-500 shrink-0" />
                        <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-emerald-400 transition-colors truncate">
                          {report.domain || report.targetUrl.replace(/^https?:\/\//i, '').split('/')[0] || 'Target Domain'}
                        </h3>
                      </div>
                      <p className="text-zinc-500 text-[11px] sm:text-xs truncate font-mono pl-5 sm:pl-6" title={report.targetUrl}>
                        {report.targetUrl}
                      </p>
                    </div>

                    {/* AI Summary Excerpt */}
                    <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed line-clamp-3 bg-zinc-950/40 p-3 sm:p-3.5 rounded-xl border border-white/[0.04]">
                      {report.summary}
                    </p>

                    {/* Red flags snippet if any */}
                    {report.redFlags && report.redFlags.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-rose-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                        <span className="truncate">{report.redFlags.length} Threat Flag{report.redFlags.length > 1 ? 's' : ''} Identified</span>
                      </div>
                    )}
                  </div>

                  {/* Footer Meta & Action */}
                  <div className="pt-4 sm:pt-5 mt-4 sm:mt-5 border-t border-white/[0.06] flex items-center justify-between text-[11px] sm:text-xs text-zinc-500">
                    <div className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{new Date(report.timestamp).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setReportToDelete(report);
                        }}
                        className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-rose-300 hover:bg-rose-500/10 px-2.5 sm:px-3 py-1.5 rounded-lg border border-white/[0.06] hover:border-rose-500/25 transition-all text-xs font-semibold group/btn"
                        title="Delete report"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400 group-hover/btn:scale-110 transition-transform" />
                        <span>Delete</span>
                      </button>

                      <Link
                        href={`/report/${report.id}`}
                        className="inline-flex items-center gap-1 text-zinc-300 hover:text-emerald-400 font-bold group-hover:translate-x-1 transition-all text-xs bg-white/[0.04] hover:bg-emerald-500/10 px-2.5 sm:px-3 py-1.5 rounded-lg border border-white/[0.06] hover:border-emerald-500/30"
                      >
                        <span>Full Audit</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationModal
        isOpen={Boolean(reportToDelete)}
        targetDomain={reportToDelete?.domain || ''}
        onClose={() => setReportToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
