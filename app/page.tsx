import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Download, User, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen text-white font-sans selection:bg-yellow-400 selection:text-red-900 flex flex-col justify-between"
      style={{ background: 'linear-gradient(160deg, #160000 0%, #2A0000 50%, #160000 100%)' }}>

      {/* Top Gold Stripe */}
      <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg, #78350F, #F59E0B, #FBBF24, #F59E0B, #78350F)' }}></div>

      {/* Header / Nav */}
      <nav className="max-w-7xl mx-auto px-6 py-5 w-full flex items-center justify-between border-b border-red-900/40">
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-12">
            <Image src="/logo.png" alt="IPPCW REBORN" fill className="object-contain drop-shadow" priority />
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-wider block">
              IPPCW REBORN
            </span>
            <span className="text-xs font-bold tracking-widest uppercase text-yellow-400">
              Cimanggu Wates
            </span>
          </div>
        </div>

        <Link
          href="/panitia"
          className="px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition flex items-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #F5C518, #FFD700)',
            color: '#3B0F6F',
            border: '2px solid rgba(255,255,255,0.4)',
            boxShadow: '0 4px 20px rgba(245,197,24,0.35)',
          }}
        >
          <span>Buka Studio</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16 text-center flex flex-col items-center justify-center flex-1">
        {/* Logo Hero */}
        <div className="relative w-64 h-24 mb-6 drop-shadow-2xl">
          <Image src="/logo.png" alt="IPPCW REBORN" fill className="object-contain" priority />
        </div>

        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-5"
          style={{ background: 'rgba(127,29,29,0.3)', borderColor: 'rgba(245,197,24,0.4)', color: '#F5C518' }}>
          <Sparkles className="w-3.5 h-3.5" style={{ color: '#F5C518' }} />
          <span>Generator Resmi ID Card 17 Agustus</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight leading-tight mb-4">
          Kartu Tanda Panitia
          <br />
          <span style={{
            background: 'linear-gradient(90deg, #EF4444, #F5C518, #FFD700)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            HUT RI KE-81
          </span>
        </h1>

        <p className="text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed mb-10 text-red-200/70">
          Buat kartu panitia 17-an resmi <strong className="text-yellow-400">Cimanggu Wates</strong> berukuran standar KTP/ID Card.
          Kustomisasi foto, 3 pilihan tema Merah Putih elegan, dan download langsung resolusi tinggi siap cetak.
        </p>

        {/* CTA Button */}
        <Link
          href="/panitia"
          className="px-10 py-4 rounded-2xl font-black text-base uppercase tracking-widest active:scale-[0.98] transition flex items-center justify-center gap-3"
          style={{
            background: 'linear-gradient(135deg, #F5C518 0%, #FFD700 60%, #F5C518 100%)',
            color: '#3B0F6F',
            border: '2px solid rgba(255,255,255,0.2)',
            boxShadow: '0 6px 30px rgba(245,197,24,0.45), 0 0 60px rgba(245,197,24,0.15)',
          }}
        >
          <span>Buat Kartu Sekarang</span>
          <ArrowRight className="w-5 h-5" />
        </Link>

        {/* Features Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-16 text-left w-full">
          <div className="rounded-2xl p-5" style={{ background: 'rgba(127,29,29,0.2)', border: '1px solid rgba(185,28,28,0.4)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: 'rgba(127,29,29,0.4)', border: '1px solid rgba(245,197,24,0.4)' }}>
              <ShieldCheck className="w-5 h-5 text-yellow-400" />
            </div>
            <h3 className="font-bold text-white text-sm mb-1">Rasio Pas Ukuran KTP</h3>
            <p className="text-xs text-red-200/60">
              Didesain presisi sesuai standar CR80 (54x86 mm), siap dicetak dan dimasukkan ke tali lanyard ID card.
            </p>
          </div>

          <div className="rounded-2xl p-5" style={{ background: 'rgba(127,29,29,0.2)', border: '1px solid rgba(185,28,28,0.4)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: 'rgba(127,29,29,0.4)', border: '1px solid rgba(245,197,24,0.4)' }}>
              <ImageIcon className="w-5 h-5 text-yellow-400" />
            </div>
            <h3 className="font-bold text-white text-sm mb-1">Kustomisasi Foto Interaktif</h3>
            <p className="text-xs text-red-200/60">
              Upload foto panitia, zoom in/out dan geser posisi secara interaktif langsung di browser.
            </p>
          </div>

          <div className="rounded-2xl p-5" style={{ background: 'rgba(127,29,29,0.2)', border: '1px solid rgba(185,28,28,0.4)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: 'rgba(127,29,29,0.4)', border: '1px solid rgba(245,197,24,0.4)' }}>
              <Download className="w-5 h-5 text-yellow-400" />
            </div>
            <h3 className="font-bold text-white text-sm mb-1">Export HD Siap Cetak</h3>
            <p className="text-xs text-red-200/60">
              Unduh kartu panitia dalam format gambar PNG resolusi tinggi (3x pixel ratio) yang jernih dan tajam saat diprint.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-5 text-center text-xs border-red-900/40 text-red-300/40">
        <p>© 2026 <span className="text-yellow-400 font-bold">IPPCW REBORN</span> – Cimanggu Wates. Dirgahayu Republik Indonesia Ke-81. 🇮🇩</p>
      </footer>

      {/* Bottom Gold Stripe */}
      <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #78350F, #F59E0B, #FBBF24, #F59E0B, #78350F)' }}></div>
    </div>
  );
}
