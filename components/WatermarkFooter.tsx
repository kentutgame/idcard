import React from 'react';
import Link from 'next/link';
import { Code2 } from 'lucide-react';

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function WatermarkFooter() {
  const instagramUrl = 'https://instagram.com/ewvlnxx';
  const dmUrl = 'https://ig.me/m/ewvlnxx';

  return (
    <footer className="w-full mt-auto border-t border-red-900/50 bg-[#120000]/95 backdrop-blur-md relative z-40 print:hidden">
      {/* Gold Top Accent Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-yellow-500/80 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col items-center justify-center text-center gap-3">
        {/* Creator / Watermark Badge */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-neutral-300">
          <span className="text-neutral-400">Website developed with</span>
          <span className="text-red-500 animate-pulse text-sm">❤️</span>
          <span className="text-neutral-400">by</span>

          <Link
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-red-900/40 border border-pink-500/40 hover:border-pink-400 text-pink-200 hover:text-white font-bold transition duration-200 shadow-sm hover:shadow-pink-500/20 hover:scale-105 active:scale-95 group"
          >
            <InstagramIcon className="w-3.5 h-3.5 text-pink-400 group-hover:text-pink-300 transition-transform group-hover:rotate-6" />
            <span className="tracking-wide">@ewvlnxx</span>
            <span className="text-[10px] text-pink-300/70 font-normal">on Instagram</span>
          </Link>
        </div>

        {/* Promo / Inquiries line */}
        <div className="flex items-center justify-center">
          <Link
            href={dmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-yellow-500/30 hover:border-yellow-400/70 text-xs text-yellow-300/90 hover:text-yellow-200 font-medium transition duration-200 shadow-inner group"
          >
            <Code2 className="w-3.5 h-3.5 text-yellow-400" />
            <span>Pembuatan website?</span>
            <span className="inline-flex items-center gap-1 font-bold text-yellow-400 underline underline-offset-2 decoration-yellow-400/50 group-hover:decoration-yellow-300">
              <InstagramIcon className="w-3 h-3 text-pink-400" />
              DM me on Instagram
            </span>
          </Link>
        </div>

        {/* Copyright notice */}
        <p className="text-[11px] text-red-200/40 mt-1">
          © 2026 <span className="text-yellow-400/70 font-semibold">IPPCW REBORN</span> Cimanggu Wates. All rights reserved.
        </p>
      </div>

      {/* Bottom Gold Stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-[#78350F] via-[#F59E0B] to-[#78350F]" />
    </footer>
  );
}
