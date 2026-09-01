'use client';

import { useState } from 'react';
import { Printer, Copy, Check, FileJson } from 'lucide-react';
import { ScanReport } from '@/lib/types';

interface ReportActionsProps {
  report: ScanReport;
}

export default function ReportActions({ report }: ReportActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyJson = async () => {
    try {
      const jsonStr = JSON.stringify(report, null, 2);
      await navigator.clipboard.writeText(jsonStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy JSON:', e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      {/* Copy Raw JSON */}
      <button
        type="button"
        onClick={handleCopyJson}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] transition-all shadow-sm group"
        title="Copy raw JSON telemetry and forensic records"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300">Copied!</span>
          </>
        ) : (
          <>
            <FileJson className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Copy JSON</span>
          </>
        )}
      </button>

      {/* Print / Save PDF */}
      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-200 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] hover:border-white/20 transition-all shadow-sm group"
        title="Print or Save PDF threat report dossier"
      >
        <Printer className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
        <span>Save PDF</span>
      </button>
    </div>
  );
}
