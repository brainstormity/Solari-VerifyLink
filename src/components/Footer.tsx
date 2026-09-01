'use client';

import Link from 'next/link';
import { ShieldCheck, ExternalLink, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#060709]/90 backdrop-blur-xl relative z-20 mt-auto py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-400">
        
        {/* Brand & Mission */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-zinc-900 border border-emerald-500/30 overflow-hidden flex items-center justify-center">
              <img
                src="/verifylink-logo.png"
                alt="VerifyLink Logo"
                className="w-4 h-4 object-contain rounded-md"
              />
            </div>
            <span className="font-extrabold text-white text-sm">VerifyLink</span>
          </div>
          <span className="hidden sm:inline text-zinc-600">•</span>
          <span className="text-zinc-500">
            Instant Zero-Trust Scam & Deceptive Link Inspector
          </span>
        </div>

        {/* Developed by brainstormity & Socials */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span>Developed by</span>
            <a
              href="https://x.com/brainstormity"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-white hover:text-emerald-400 transition-colors underline decoration-zinc-700 underline-offset-4 hover:decoration-emerald-400"
            >
              brainstormity
            </a>
          </div>

          <span className="text-zinc-700">•</span>

          <a
            href="https://x.com/brainstormity"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.06] px-3 py-1.5 rounded-xl"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5 fill-current">
              <g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g>
            </svg>
            <span>@brainstormity</span>
          </a>

          <a
            href="https://github.com/brainstormity/Solari-VerifyLink"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.06] px-3 py-1.5 rounded-xl"
          >
            <span>GitHub Repo</span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </a>
        </div>

      </div>
    </footer>
  );
}
