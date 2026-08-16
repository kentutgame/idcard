'use client';

import React, { forwardRef } from 'react';
import Image from 'next/image';
import { PanitiaData } from '../types/panitia';

interface IdCardPreviewProps {
  data: PanitiaData;
  scale?: number;
}

// ─── SHARED: Logo transparan asli tanpa mix-blend-mode ───────────────────────
function CardLogo() {
  return (
    <div
      className="relative mb-1"
      style={{ width: '160px', height: '64px' }}
    >
      <Image
        src="/logo.png"
        alt="IPPCW REBORN"
        fill
        className="object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
        priority
      />
    </div>
  );
}

// ─── SHARED: Photo placeholder ─────────────────────────────────────────────────
function PhotoInner({
  photoUrl,
  photoScale,
  photoPosition,
  name,
}: {
  photoUrl: string;
  photoScale: number;
  photoPosition: { x: number; y: number };
  name: string;
}) {
  if (photoUrl) {
    return (
      <div
        className="w-full h-full"
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
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <svg viewBox="0 0 80 80" className="w-16 h-16 opacity-30" fill="#555">
        <circle cx="40" cy="26" r="14" />
        <ellipse cx="40" cy="64" rx="24" ry="16" />
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEMA 1: MERAH KLASIK — Header merah, badan putih, footer merah gelap
// ═══════════════════════════════════════════════════════════════════════════════
function Theme1({
  name, photoUrl, photoScale, photoPosition, cardNumber,
}: { name: string; photoUrl: string; photoScale: number; photoPosition: {x:number;y:number}; cardNumber: string }) {
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#fff' }}>

      {/* Outer border gold */}
      <div className="absolute inset-0 rounded-[20px] z-40 pointer-events-none"
        style={{ border: '4px solid #B8860B' }} />
      {/* Inner thin red border */}
      <div className="absolute inset-[4px] rounded-[17px] z-40 pointer-events-none"
        style={{ border: '1.5px solid rgba(185,28,28,0.5)' }} />

      {/* Corner ornaments */}
      <div className="absolute top-2 left-2 w-5 h-5 z-40 pointer-events-none"
        style={{ borderTop: '2px solid #B8860B', borderLeft: '2px solid #B8860B', borderRadius: '3px 0 0 0' }} />
      <div className="absolute top-2 right-2 w-5 h-5 z-40 pointer-events-none"
        style={{ borderTop: '2px solid #B8860B', borderRight: '2px solid #B8860B', borderRadius: '0 3px 0 0' }} />
      <div className="absolute bottom-2 left-2 w-5 h-5 z-40 pointer-events-none"
        style={{ borderBottom: '2px solid #B8860B', borderLeft: '2px solid #B8860B', borderRadius: '0 0 0 3px' }} />
      <div className="absolute bottom-2 right-2 w-5 h-5 z-40 pointer-events-none"
        style={{ borderBottom: '2px solid #B8860B', borderRight: '2px solid #B8860B', borderRadius: '0 0 3px 0' }} />

      {/* ── HEADER ── */}
      <div className="relative flex-none flex flex-col items-center justify-start pt-5 px-4"
        style={{
          height: '215px',
          background: 'linear-gradient(170deg, #7F1D1D 0%, #DC2626 50%, #B91C1C 100%)',
        }}>
        {/* gold stripe top */}
        <div className="absolute top-0 left-0 right-0 rounded-t-[17px]"
          style={{ height: '5px', background: 'linear-gradient(90deg,#78350F,#D97706,#FCD34D,#D97706,#78350F)' }} />
        {/* diagonal subtle */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent 0,transparent 10px,#fff 10px,#fff 12px)' }} />
        {/* gold stripe bottom */}
        <div className="absolute bottom-0 left-0 right-0"
          style={{ height: '5px', background: 'linear-gradient(90deg,#78350F,#D97706,#FCD34D,#D97706,#78350F)' }} />

        {/* LOGO */}
        <CardLogo />

        <p className="text-[10px] font-bold tracking-[0.22em] uppercase mt-0.5"
          style={{ color: '#FDE68A', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
          Cimanggu Wates
        </p>
        <div className="mt-1.5 flex items-center gap-1.5 px-3 py-[2px] rounded-full"
          style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(253,230,138,0.4)', zIndex: 10 }}>
          <span style={{ color: '#FCD34D', fontSize: '8px', fontWeight: 900, letterSpacing: '0.15em' }}>
            ★ HUT RI KE-81 ★
          </span>
        </div>
      </div>

      {/* ── BODY ── white */}
      <div className="relative flex-1 bg-white flex flex-col items-center justify-start pt-[124px]">
        {/* faint vertical stripes left/right */}
        <div className="absolute inset-y-0 left-0 w-1.5 bg-red-600/10" />
        <div className="absolute inset-y-0 right-0 w-1.5 bg-red-600/10" />

        {/* PHOTO — bigger & shifted downward */}
        <div className="absolute -top-[52px] flex items-center justify-center z-10">
          <div className="rounded-full p-[4px] shadow-2xl"
            style={{ background: 'linear-gradient(135deg,#D97706,#FCD34D,#B8860B)', width: '168px', height: '168px' }}>
            <div className="w-full h-full rounded-full bg-white p-[3px]">
              <div className="w-full h-full rounded-full overflow-hidden"
                style={{ border: '3.5px solid #DC2626' }}>
                <PhotoInner photoUrl={photoUrl} photoScale={photoScale} photoPosition={photoPosition} name={name} />
              </div>
            </div>
          </div>
        </div>

        {/* NAME */}
        <div className="w-full px-5 mt-1">
          <div className="w-full py-2.5 px-3 rounded-xl text-center shadow-sm"
            style={{ background: 'linear-gradient(135deg,#FEF2F2,#FFF)', border: '2px solid #DC2626' }}>
            <h2 className="font-black uppercase leading-tight text-red-900 tracking-wide"
              style={{ fontSize: name.length > 22 ? '12px' : name.length > 16 ? '15px' : '17px' }}>
              {name || 'NAMA PANITIA'}
            </h2>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="relative flex-none flex flex-col items-center justify-center gap-2"
        style={{ height: '118px', background: 'linear-gradient(160deg,#450A0A 0%,#7F1D1D 60%,#450A0A 100%)' }}>
        <div className="absolute top-0 left-0 right-0"
          style={{ height: '5px', background: 'linear-gradient(90deg,#78350F,#D97706,#FCD34D,#D97706,#78350F)' }} />
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent 0,transparent 10px,#fff 10px,#fff 12px)' }} />

        <div className="flex items-center gap-2.5 px-8 py-2 rounded-full shadow-lg"
          style={{ background: 'linear-gradient(135deg,#D97706,#FCD34D,#D97706)', border: '2px solid rgba(255,255,255,0.4)' }}>
          <span style={{ color: '#7F1D1D', fontSize: '11px' }}>★</span>
          <span style={{ fontWeight: 900, fontSize: '16px', letterSpacing: '0.12em', color: '#7F1D1D', textTransform: 'uppercase' }}>PANITIA</span>
          <span style={{ color: '#7F1D1D', fontSize: '11px' }}>★</span>
        </div>

        <div className="flex items-center justify-between w-full px-5">
          <p style={{ fontSize: '9px', fontFamily: 'monospace', color: 'rgba(253,230,138,0.6)' }}>{cardNumber}</p>
          <div className="flex overflow-hidden rounded-[2px]" style={{ width: '22px', height: '14px', border: '1px solid rgba(252,211,77,0.5)' }}>
            <div style={{ flex: 1, background: '#DC2626' }} />
            <div style={{ flex: 1, background: '#fff' }} />
          </div>
          <p style={{ fontSize: '9px', fontWeight: 900, color: '#FCD34D' }}>2026</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEMA 2: DARK PATRIOT — Background hitam, aksen merah & emas
// ═══════════════════════════════════════════════════════════════════════════════
function Theme2({
  name, photoUrl, photoScale, photoPosition, cardNumber,
}: { name: string; photoUrl: string; photoScale: number; photoPosition: {x:number;y:number}; cardNumber: string }) {
  return (
    <div className="absolute inset-0 flex flex-col"
      style={{ background: 'linear-gradient(160deg,#0A0A0A 0%,#181818 100%)' }}>

      {/* Red outer border */}
      <div className="absolute inset-0 rounded-[20px] z-40 pointer-events-none"
        style={{ border: '4px solid #DC2626' }} />
      {/* Gold inner */}
      <div className="absolute inset-[4px] rounded-[17px] z-40 pointer-events-none"
        style={{ border: '1.5px solid rgba(252,211,77,0.4)' }} />

      {/* Red left/right accent bars */}
      <div className="absolute z-20 pointer-events-none"
        style={{ top: '6px', bottom: '6px', left: '4px', width: '5px', borderRadius: '4px', background: 'linear-gradient(180deg,#DC2626,#7F1D1D)' }} />
      <div className="absolute z-20 pointer-events-none"
        style={{ top: '6px', bottom: '6px', right: '4px', width: '5px', borderRadius: '4px', background: 'linear-gradient(180deg,#DC2626,#7F1D1D)' }} />

      {/* ── HEADER ── very dark red */}
      <div className="relative flex-none flex flex-col items-center justify-start pt-5 px-6 z-10"
        style={{ height: '215px', background: 'linear-gradient(170deg,#1A0000 0%,#2D0000 50%,#1A0000 100%)' }}>
        <div className="absolute top-0 left-0 right-0 rounded-t-[17px]"
          style={{ height: '4px', background: '#DC2626' }} />
        <div className="absolute top-[4px] left-0 right-0"
          style={{ height: '2px', background: 'linear-gradient(90deg,transparent,#D97706,transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0"
          style={{ height: '3px', background: '#DC2626' }} />
        {/* grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.15) 1px,transparent 1px)', backgroundSize: '20px 20px' }} />

        {/* LOGO */}
        <CardLogo />

        <p className="text-[10px] font-bold tracking-[0.22em] uppercase mt-0.5 text-red-400">
          Cimanggu Wates
        </p>
        <div className="mt-1.5 flex items-center gap-1.5 px-3 py-[2px] rounded-full"
          style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.5)', zIndex: 10 }}>
          <span style={{ color: '#FCA5A5', fontSize: '8px', fontWeight: 900, letterSpacing: '0.15em' }}>
            ★ HUT RI KE-81 ★
          </span>
        </div>
      </div>

      {/* ── BODY ── dark */}
      <div className="relative flex-1 flex flex-col items-center justify-start pt-[124px] z-10"
        style={{ background: 'linear-gradient(180deg,#111 0%,#0D0D0D 100%)' }}>

        {/* PHOTO — bigger */}
        <div className="absolute -top-[52px] z-10">
          <div className="rounded-full p-[4px] shadow-2xl"
            style={{ background: 'linear-gradient(135deg,#DC2626,#D97706,#DC2626)', width: '168px', height: '168px' }}>
            <div className="w-full h-full rounded-full p-[3px]" style={{ background: '#111' }}>
              <div className="w-full h-full rounded-full overflow-hidden"
                style={{ border: '2.5px solid #7F1D1D' }}>
                <PhotoInner photoUrl={photoUrl} photoScale={photoScale} photoPosition={photoPosition} name={name} />
              </div>
            </div>
          </div>
        </div>

        {/* NAME */}
        <div className="w-full px-5 mt-1">
          <div className="w-full py-2.5 px-3 rounded-xl text-center shadow-sm"
            style={{ background: 'rgba(127,29,29,0.3)', border: '1.5px solid rgba(220,38,38,0.6)' }}>
            <h2 className="font-black uppercase leading-tight text-white tracking-wide"
              style={{ fontSize: name.length > 22 ? '12px' : name.length > 16 ? '15px' : '17px', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
              {name || 'NAMA PANITIA'}
            </h2>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="relative flex-none flex flex-col items-center justify-center gap-2 z-10"
        style={{ height: '118px', background: 'linear-gradient(160deg,#0A0A0A 0%,#1A0000 100%)' }}>
        <div className="absolute top-0 left-0 right-0" style={{ height: '3px', background: '#DC2626' }} />
        <div className="absolute top-[3px] left-0 right-0"
          style={{ height: '2px', background: 'linear-gradient(90deg,transparent,#D97706,transparent)' }} />

        <div className="flex items-center gap-2.5 px-8 py-2 rounded-full"
          style={{ border: '1.5px solid #DC2626' }}>
          <span style={{ color: '#EF4444', fontSize: '11px' }}>★</span>
          <span style={{ fontWeight: 900, fontSize: '16px', letterSpacing: '0.12em', color: '#fff', textTransform: 'uppercase' }}>PANITIA</span>
          <span style={{ color: '#EF4444', fontSize: '11px' }}>★</span>
        </div>

        <div className="flex items-center justify-between w-full px-5">
          <p style={{ fontSize: '9px', fontFamily: 'monospace', color: '#6B7280' }}>{cardNumber}</p>
          <div className="flex overflow-hidden rounded-[2px]" style={{ width: '22px', height: '14px', border: '1px solid rgba(220,38,38,0.6)' }}>
            <div style={{ flex: 1, background: '#DC2626' }} />
            <div style={{ flex: 1, background: '#fff' }} />
          </div>
          <p style={{ fontSize: '9px', fontWeight: 900, color: '#D97706' }}>2026</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEMA 3: PUTIH BERSIH MODERN — Putih dominan, header putih+logo, footer merah
// ═══════════════════════════════════════════════════════════════════════════════
function Theme3({
  name, photoUrl, photoScale, photoPosition, cardNumber,
}: { name: string; photoUrl: string; photoScale: number; photoPosition: {x:number;y:number}; cardNumber: string }) {
  return (
    <div className="absolute inset-0 flex flex-col bg-white">

      {/* Red outer border thick */}
      <div className="absolute inset-0 rounded-[20px] z-40 pointer-events-none"
        style={{ border: '5px solid #DC2626' }} />
      <div className="absolute inset-[5px] rounded-[17px] z-40 pointer-events-none"
        style={{ border: '2px solid #FCD34D' }} />

      {/* ── HEADER — White + red stripes ── */}
      <div className="relative flex-none flex flex-col items-center justify-start pt-6 px-4 bg-white"
        style={{ height: '215px' }}>
        {/* Red top block */}
        <div className="absolute top-0 left-0 right-0 rounded-t-[16px]"
          style={{ height: '10px', background: '#DC2626' }} />
        <div className="absolute top-[10px] left-0 right-0"
          style={{ height: '3px', background: '#FCD34D' }} />
        <div className="absolute bottom-0 left-0 right-0"
          style={{ height: '5px', background: '#DC2626' }} />
        <div className="absolute bottom-[5px] left-0 right-0"
          style={{ height: '2px', background: '#FCD34D' }} />

        {/* LOGO on white */}
        <CardLogo />

        <p className="text-[10px] font-black tracking-[0.2em] uppercase mt-0.5 text-red-700">
          Cimanggu Wates
        </p>
        <div className="mt-1.5 flex items-center gap-1.5 px-3 py-[2px] rounded-full"
          style={{ background: '#FEF2F2', border: '1px solid #FECACA', zIndex: 10 }}>
          <span style={{ color: '#DC2626', fontSize: '8px', fontWeight: 900, letterSpacing: '0.15em' }}>
            ★ HUT RI KE-81 ★
          </span>
        </div>
      </div>

      {/* ── BODY ── clean white */}
      <div className="relative flex-1 bg-white flex flex-col items-center justify-start pt-[124px]">
        {/* faint dot watermark */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle,#DC2626 1px,transparent 1px)', backgroundSize: '18px 18px' }} />

        {/* PHOTO — bigger */}
        <div className="absolute -top-[52px] z-10">
          <div className="rounded-full shadow-2xl shadow-red-200"
            style={{ background: 'linear-gradient(135deg,#D97706,#FCD34D,#D97706)', padding: '4px', width: '168px', height: '168px' }}>
            <div className="w-full h-full rounded-full bg-white" style={{ padding: '3px' }}>
              <div className="w-full h-full rounded-full overflow-hidden"
                style={{ border: '3.5px solid #DC2626' }}>
                <PhotoInner photoUrl={photoUrl} photoScale={photoScale} photoPosition={photoPosition} name={name} />
              </div>
            </div>
          </div>
        </div>

        {/* NAME */}
        <div className="w-full px-5 mt-1">
          <div className="w-full py-2.5 px-3 rounded-xl text-center shadow-sm"
            style={{ background: 'linear-gradient(135deg,#FEF2F2,#FFF5F5)', border: '2.5px solid #DC2626' }}>
            <h2 className="font-black uppercase leading-tight text-red-900 tracking-wide"
              style={{ fontSize: name.length > 22 ? '12px' : name.length > 16 ? '15px' : '17px' }}>
              {name || 'NAMA PANITIA'}
            </h2>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── Red solid premium */}
      <div className="relative flex-none flex flex-col items-center justify-center gap-2"
        style={{ height: '118px', background: 'linear-gradient(160deg,#7F1D1D 0%,#DC2626 50%,#B91C1C 100%)' }}>
        <div className="absolute top-0 left-0 right-0"
          style={{ height: '2px', background: '#FCD34D' }} />
        <div className="absolute top-[2px] left-0 right-0"
          style={{ height: '3px', background: '#FCD34D', opacity: 0.5 }} />
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent 0,transparent 10px,#fff 10px,#fff 12px)' }} />

        <div className="flex items-center gap-2.5 px-8 py-2 rounded-full shadow-lg"
          style={{ background: 'linear-gradient(135deg,#D97706,#FCD34D,#D97706)', border: '2px solid rgba(255,255,255,0.5)' }}>
          <span style={{ color: '#7F1D1D', fontSize: '11px' }}>★</span>
          <span style={{ fontWeight: 900, fontSize: '16px', letterSpacing: '0.12em', color: '#7F1D1D', textTransform: 'uppercase' }}>PANITIA</span>
          <span style={{ color: '#7F1D1D', fontSize: '11px' }}>★</span>
        </div>

        <div className="flex items-center justify-between w-full px-5">
          <p style={{ fontSize: '9px', fontFamily: 'monospace', color: 'rgba(253,230,138,0.65)' }}>{cardNumber}</p>
          <div className="flex overflow-hidden rounded-[2px]" style={{ width: '22px', height: '14px', border: '1px solid rgba(252,211,77,0.5)' }}>
            <div style={{ flex: 1, background: '#DC2626', borderRight: '1px solid rgba(255,255,255,0.3)' }} />
            <div style={{ flex: 1, background: '#fff' }} />
          </div>
          <p style={{ fontSize: '9px', fontWeight: 900, color: '#FCD34D' }}>2026</p>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export const IdCardPreview = forwardRef<HTMLDivElement, IdCardPreviewProps>(
  ({ data, scale = 1 }, ref) => {
    const {
      name = 'NAMA LENGKAP',
      photoUrl = '',
      photoScale = 1,
      photoPosition = { x: 0, y: 0 },
      cardNumber = 'IPPCW-2026-017',
      themeVariant = 'gold_modern',
    } = data;

    const props = { name, photoUrl, photoScale, photoPosition, cardNumber };

    return (
      <div
        ref={ref}
        id="id-card-element"
        style={{
          width: '360px',
          height: '570px',
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {themeVariant === 'gold_modern' && <Theme1 {...props} />}
        {themeVariant === 'dark_patriot' && <Theme2 {...props} />}
        {themeVariant === 'classic' && <Theme3 {...props} />}
      </div>
    );
  }
);

IdCardPreview.displayName = 'IdCardPreview';
