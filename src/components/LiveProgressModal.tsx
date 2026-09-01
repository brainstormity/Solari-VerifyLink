'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

export interface AiSwitchNotification {
  from?: string;
  to?: string;
  reason?: string;
}

interface LiveProgressModalProps {
  isOpen: boolean;
  currentStep: number;
  activeAiModel?: string;
  aiSwitchNotification?: AiSwitchNotification | null;
  stepStatusDetail?: string;
}

const STEPS = [
  { label: "Provisioning Ephemeral Solari Cloud Browser", sub: "Spinning up stealth chromium instance" },
  { label: "Bypassing Bot Detection & Extracting DOM", sub: "Intercepting redirects, scripts & forms" },
  { label: "Detonating in Solari Sandbox MicroVM", sub: "Running isolated DNS & WHOIS diagnostics" },
  { label: "AI Threat Reasoning", sub: "Evaluating 4 zero-trust security pillars" },
  { label: "Synthesizing Trust Audit Card", sub: "Finalizing cryptographic score & report" }
];

export default function LiveProgressModal({
  isOpen,
  currentStep,
  activeAiModel,
  aiSwitchNotification,
  stepStatusDetail,
}: LiveProgressModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-zinc-950/95 border border-white/[0.12] rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl overflow-hidden relative backdrop-blur-2xl"
        >
          {/* Top Accent Gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span>Zero-Trust MicroVM Inspection</span>
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Solari Ephemeral Execution Active
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              STEP {Math.min(5, currentStep + 1)}/5
            </span>
          </div>

          {/* AI Cascade Switch Notification Banner */}
          <AnimatePresence>
            {aiSwitchNotification && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3 shadow-lg shadow-amber-500/5"
              >
                <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold text-amber-200 flex items-center gap-2">
                    <span>Quota Cascade Triggered</span>
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500/20 font-mono">24h Cooldown Active</span>
                  </div>
                  <div className="text-[11px] text-amber-300/80 leading-relaxed font-sans">
                    {aiSwitchNotification.reason}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Progress List */}
          <div className="space-y-3.5">
            {STEPS.map((step, index) => {
              const isCompleted = currentStep > index;
              const isCurrent = currentStep === index;
              const isPending = currentStep < index;

              // Dynamic label for AI step
              let stepLabel = step.label;
              let stepSub = step.sub;

              if (index === 3) {
                if (activeAiModel) {
                  stepLabel = `AI Threat Reasoning: ${activeAiModel}`;
                }
                if (isCurrent && stepStatusDetail) {
                  stepSub = stepStatusDetail;
                }
              } else if (isCurrent && stepStatusDetail) {
                stepSub = stepStatusDetail;
              }

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={`flex items-start gap-3.5 p-3 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-white shadow-sm shadow-emerald-500/10'
                      : isCompleted
                      ? 'bg-zinc-900/40 border-white/[0.04] text-zinc-400'
                      : 'bg-transparent border-transparent text-zinc-600'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : isCurrent ? (
                      <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-zinc-800 flex items-center justify-center text-[10px] font-mono text-zinc-600">
                        {index + 1}
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <div className={`text-xs font-bold ${isCurrent ? 'text-emerald-300' : isCompleted ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        {stepLabel}
                      </div>
                      {index === 3 && activeAiModel && (
                        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                          {activeAiModel}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono">
                      {stepSub}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer Live Terminal Status */}
          <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Isolated Memory Sandbox</span>
            </div>
            <span>No data leaves microVM</span>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
