'use client';

import { SecurityPillarResult } from '@/lib/types';
import { CheckCircle2, AlertTriangle, XCircle, Shield, Globe, CreditCard, LayoutTemplate } from 'lucide-react';
import { motion } from 'framer-motion';

interface SecurityPillarsProps {
  pillars: {
    domainLegitimacy: SecurityPillarResult;
    brandSafety: SecurityPillarResult;
    paymentSecurity: SecurityPillarResult;
    uxPatterns: SecurityPillarResult;
  };
}

const PILLAR_CONFIG = {
  domainLegitimacy: { icon: Globe, label: "Domain Legitimacy" },
  brandSafety: { icon: Shield, label: "Brand Safety" },
  paymentSecurity: { icon: CreditCard, label: "Payment Security" },
  uxPatterns: { icon: LayoutTemplate, label: "UX Deception Patterns" },
};

export default function SecurityPillars({ pillars }: SecurityPillarsProps) {
  const pillarEntries = Object.entries(pillars) as [keyof typeof PILLAR_CONFIG, SecurityPillarResult][];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {pillarEntries.map(([key, result], index) => {
        const Config = PILLAR_CONFIG[key] || { icon: Shield, label: key };
        const isPass = result.status === 'pass';
        const isWarn = result.status === 'warning';
        
        let colorClass = 'text-rose-400';
        let bgClass = 'bg-rose-500/10 border-rose-500/20';
        let barColor = 'bg-rose-500';
        let statusLabel = 'FAIL';
        let Icon = XCircle;
        
        if (isPass) {
          colorClass = 'text-emerald-400';
          bgClass = 'bg-emerald-500/10 border-emerald-500/20';
          barColor = 'bg-emerald-500';
          statusLabel = 'PASS';
          Icon = CheckCircle2;
        } else if (isWarn) {
          colorClass = 'text-amber-400';
          bgClass = 'bg-amber-500/10 border-amber-500/20';
          barColor = 'bg-amber-500';
          statusLabel = 'WARN';
          Icon = AlertTriangle;
        }

        const percentage = Math.min(100, Math.max(0, (result.score / 25) * 100));

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className={`p-5 rounded-3xl border ${bgClass} bg-zinc-900/60 backdrop-blur-xl flex flex-col justify-between gap-4`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl bg-zinc-950/80 border border-white/[0.06] ${colorClass}`}>
                    <Config.icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-sm text-zinc-100">{Config.label}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md ${bgClass} ${colorClass}`}>
                    {statusLabel}
                  </span>
                  <span className={`text-sm font-black font-mono ${colorClass}`}>
                    {result.score}/25
                  </span>
                </div>
              </div>

              {/* Mini Score Bar */}
              <div className="w-full bg-zinc-950/80 h-1.5 rounded-full overflow-hidden border border-white/[0.04]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                  className={`h-full rounded-full ${barColor}`}
                />
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                {result.details}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
