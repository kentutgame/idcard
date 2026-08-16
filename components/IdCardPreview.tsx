'use client';

import React, { forwardRef } from 'react';
import { PanitiaData } from '../types/panitia';
import { Award, ShieldCheck, Sparkles } from 'lucide-react';

interface IdCardPreviewProps {
  data: PanitiaData;
  scale?: number;
}

export const IdCardPreview = forwardRef<HTMLDivElement, IdCardPreviewProps>(
  ({ data, scale = 1 }, ref) => {
    const {
      name = 'NAMA LENGKAP',
      role = 'PANITIA',
      division = 'Umum',
      photoUrl,
      photoScale = 1,
      photoPosition = { x: 0, y: 0 },
      cardNumber = 'IPPCW-2026-017',
      themeVariant = 'gold_modern',
    } = data;

    // Theme configuration
    const isDark = themeVariant === 'dark_elegance';
    const isClassic = themeVariant === 'classic';

    return (
      <div
        ref={ref}
        id="id-card-element"
        style={{
          width: '360px',
          height: '570px',
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
        }}
        className={`relative overflow-hidden rounded-[24px] shadow-2xl transition-all duration-300 select-none flex flex-col justify-between ${
          isDark
            ? 'bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-white border-2 border-amber-400/60'
            : isClassic
            ? 'bg-gradient-to-b from-red-600 via-red-700 to-red-900 text-white border-2 border-red-500'
            : 'bg-gradient-to-b from-white via-neutral-50 to-neutral-100 text-zinc-900 border-2 border-amber-400'
        }`}
      >
        {/* Background Decorative Elements */}
        {/* Top Arc Red Header */}
        <div className="absolute top-0 left-0 right-0 h-44 overflow-hidden pointer-events-none">
          <div className="absolute -top-12 -left-10 -right-10 h-48 bg-gradient-to-r from-red-700 via-red-600 to-red-800 rounded-b-[60%] shadow-lg border-b-4 border-amber-400">
            {/* Subtle Batik/Wave Graphic Accent */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-200 via-transparent to-transparent"></div>
            {/* Indonesian flag strip */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300"></div>
          </div>
        </div>

        {/* Bottom Arc Red Footer */}
        <div className="absolute bottom-0 left-0 right-0 h-28 overflow-hidden pointer-events-none">
          <div className="absolute -bottom-10 -left-6 -right-6 h-32 bg-gradient-to-r from-zinc-900 via-neutral-900 to-zinc-950 rounded-t-[50%] border-t-2 border-amber-400/80">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-white to-red-600"></div>
          </div>
        </div>

        {/* Outer Corner Ornaments (Gold Corners) */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400 rounded-tl-sm pointer-events-none"></div>
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400 rounded-tr-sm pointer-events-none"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400 rounded-bl-sm pointer-events-none"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400 rounded-br-sm pointer-events-none"></div>

        {/* TOP SECTION: HEADER */}
        <div className="relative z-10 pt-4 px-4 text-center">
          {/* Badge 17 Agustus */}
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-amber-300/40 text-[10px] font-bold text-amber-300 tracking-widest uppercase mb-1 shadow-sm">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>DIRGAHAYU REPUBLIK INDONESIA</span>
            <Sparkles className="w-3 h-3 text-amber-400" />
          </div>

          {/* Title Header */}
          <h1 className="text-2xl font-black tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-sans uppercase">
            IPPCW REBORN
          </h1>
          <p className="text-xs font-semibold tracking-widest text-amber-200 uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            Cimanggu Wates
          </p>
        </div>

        {/* MIDDLE SECTION: PHOTO */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center px-4">
          {/* Photo Frame Container */}
          <div className="relative">
            {/* Outer Glow & Gold Ring */}
            <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-amber-500 via-red-500 to-yellow-300 opacity-90 blur-[2px] animate-pulse"></div>
            
            {/* Double Border Ring */}
            <div className="relative w-44 h-44 rounded-full p-1.5 bg-gradient-to-b from-amber-300 via-amber-500 to-yellow-600 shadow-2xl">
              <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900 border-2 border-white relative">
                {photoUrl ? (
                  <div
                    className="w-full h-full relative cursor-grab active:cursor-grabbing"
                    style={{
                      transform: `translate(${photoPosition.x}px, ${photoPosition.y}px) scale(${photoScale})`,
                      transformOrigin: 'center center',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoUrl}
                      alt={name}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-950 text-neutral-400 p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-neutral-800/80 flex items-center justify-center text-amber-400 mb-2 border border-neutral-700">
                      <Award className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-medium text-neutral-300">Belum ada foto</span>
                    <span className="text-[9px] text-neutral-500">Klik 'Upload Foto'</span>
                  </div>
                )}
              </div>
            </div>

            {/* Badge Icon Overlay */}
            <div className="absolute -bottom-1 right-2 bg-gradient-to-r from-red-600 to-red-700 text-amber-300 border-2 border-amber-400 p-1.5 rounded-full shadow-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          {/* NAME DISPLAY */}
          <div className="mt-4 text-center w-full px-2">
            <div className="inline-block max-w-full">
              <h2
                className={`font-extrabold uppercase tracking-wide line-clamp-2 px-3 py-1 rounded-lg ${
                  isDark
                    ? 'text-amber-300 text-lg drop-shadow'
                    : 'text-zinc-900 text-lg bg-white/80 backdrop-blur-sm border border-neutral-200 shadow-sm'
                }`}
                style={{
                  wordBreak: 'break-word',
                  fontSize: name.length > 20 ? '14px' : name.length > 15 ? '16px' : '18px',
                }}
              >
                {name || 'NAMA PANITIA'}
              </h2>
            </div>

            {/* DIVISION / SUB-ROLE IF PRESENT */}
            {division && division !== 'Umum' && (
              <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest mt-0.5">
                Divisi: <span className="text-red-600 font-bold">{division}</span>
              </p>
            )}
          </div>
        </div>

        {/* BOTTOM SECTION: ROLE BADGE & FOOTER INFO */}
        <div className="relative z-10 pb-4 px-4 text-center">
          {/* Main Role Ribbon (PANITIA) */}
          <div className="relative mx-auto inline-block">
            <div className="px-8 py-1.5 rounded-full bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white font-black tracking-widest text-base uppercase shadow-lg border-2 border-amber-300 flex items-center justify-center gap-2">
              <span className="text-amber-300">★</span>
              <span>{role || 'PANITIA'}</span>
              <span className="text-amber-300">★</span>
            </div>
          </div>

          {/* Card Meta details */}
          <div className="mt-3 flex items-center justify-between text-[9px] text-neutral-400 px-3 font-mono">
            <div className="flex flex-col text-left">
              <span className="text-neutral-500 font-sans">NO. IDENTITAS</span>
              <span className="font-bold text-neutral-300">{cardNumber}</span>
            </div>

            {/* Mini Decorative QR Graphic */}
            <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded border border-neutral-700">
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5 p-0.5 bg-white rounded-[2px]">
                <div className="bg-black rounded-[0.5px]"></div>
                <div className="bg-black rounded-[0.5px]"></div>
                <div className="bg-black rounded-[0.5px]"></div>
                <div className="bg-red-600 rounded-[0.5px]"></div>
              </div>
              <span className="text-[8px] tracking-tight font-sans text-amber-200/90 font-semibold">
                HUT RI KE-81
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

IdCardPreview.displayName = 'IdCardPreview';
