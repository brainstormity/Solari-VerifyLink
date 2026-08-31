'use client';

import { Shield, Lock } from 'lucide-react';

interface ScreenshotPreviewProps {
  base64: string;
}

export default function ScreenshotPreview({ base64 }: ScreenshotPreviewProps) {
  const imageSrc = base64
    ? base64.startsWith('data:')
      ? base64
      : `data:image/jpeg;base64,${base64}`
    : '';

  return (
    <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl bg-zinc-950/90 group backdrop-blur-2xl">
      {/* Browser Chrome Header */}
      <div className="bg-zinc-900/90 px-4 py-3 border-b border-white/[0.06] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[11px] font-mono text-zinc-500 pl-2 hidden sm:inline-block">
            isolated-chromium-session
          </span>
        </div>

        <div className="bg-zinc-950/90 border border-white/[0.06] rounded-xl px-3 py-1 text-[11px] text-zinc-400 font-mono flex items-center gap-1.5 truncate max-w-xs">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span className="truncate">Solari Cloud Browser Viewport</span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Stealth Mode</span>
        </div>
      </div>
      
      {/* Viewport Content */}
      <div className="relative aspect-[16/10] bg-[#090a0f] overflow-hidden flex items-center justify-center">
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt="Sandboxed site screenshot" 
            className="w-full h-auto max-h-full object-contain object-top transition-transform duration-300 group-hover:scale-[1.01]"
          />
        ) : (
          <div className="text-center space-y-2 text-zinc-500 font-mono text-xs p-8">
            <Shield className="w-8 h-8 text-zinc-700 mx-auto" />
            <p>No visual snapshot captured for this host</p>
          </div>
        )}
      </div>
    </div>
  );
}
