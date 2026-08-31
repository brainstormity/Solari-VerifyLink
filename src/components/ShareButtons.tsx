'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonsProps {
  score: number;
  domain: string;
}

export default function ShareButtons({ score, domain }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getShareText = () => {
    return `Just audited ${domain} with @VerifyLink (powered by @getsolari microVMs). Trust Score: ${score}/100. Check the full safety report: ${window.location.href}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
      <button
        onClick={handleTwitterShare}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 rounded-xl transition-all text-xs sm:text-sm font-bold border border-white/[0.08] hover:border-white/[0.16] shadow-sm"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5 fill-current">
          <g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g>
        </svg>
        <span>Share on X</span>
      </button>
      <button
        onClick={handleCopy}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 rounded-xl transition-all text-xs sm:text-sm font-bold border border-white/[0.08] hover:border-white/[0.16] shadow-sm"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400">Copied Link!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-zinc-400" />
            <span>Copy Link</span>
          </>
        )}
      </button>
    </div>
  );
}
