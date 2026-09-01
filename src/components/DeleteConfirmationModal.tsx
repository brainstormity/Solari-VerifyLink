'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  targetDomain: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  targetDomain,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmationModalProps) {
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
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="bg-zinc-950/95 border border-rose-500/30 rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl overflow-hidden relative backdrop-blur-2xl"
        >
          {/* Top Rose Accent Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-rose-500/15 blur-[60px] rounded-full pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-start gap-4 mb-5">
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shrink-0 mt-0.5 shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Delete Security Report?
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Are you sure you want to permanently delete the audit record for{' '}
                <span className="text-rose-300 font-mono font-semibold break-all">
                  {targetDomain}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isDeleting}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/[0.08] bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-all disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isDeleting}
              onClick={onConfirm}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/30 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Report</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
