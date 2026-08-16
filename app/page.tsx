import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Download, Users, Award, Image as ImageIcon } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-red-600 selection:text-white flex flex-col justify-between">
      {/* Top Decoration Bar */}
      <div className="h-2 w-full bg-gradient-to-r from-red-600 via-amber-400 to-red-600"></div>

      {/* Header / Nav */}
      <nav className="max-w-7xl mx-auto px-6 py-6 w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-500 p-0.5 flex items-center justify-center shadow-lg shadow-red-900/40">
            <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center font-black text-amber-400 text-sm">
              17
            </div>
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-wider block">
              IPPCW REBORN
            </span>
            <span className="text-xs text-red-400 font-semibold tracking-wide">
              Cimanggu Wates
            </span>
          </div>
        </div>

        <Link
          href="/panitia"
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-900/30 transition flex items-center gap-2 border border-red-500/50"
        >
          <span>Buka Studio</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-12 text-center flex flex-col items-center justify-center">
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/70 border border-red-700/60 text-red-300 text-xs font-bold uppercase tracking-widest mb-6 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Generator Resmi ID Card 17 Agustus</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-none mb-6">
          Kartu Tanda Panitia <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-300 to-white">
            IPPCW REBORN
          </span>
        </h1>

        <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto font-normal leading-relaxed mb-8">
          Buat kartu panitia 17-an resmi Cimanggu Wates berukuran standar KTP/ID Card. Dilengkapi kustomisasi foto, tema Merah Putih & Emas, serta export kualitas cetak HD.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/panitia"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-red-900/50 hover:shadow-amber-500/30 active:scale-[0.98] transition flex items-center justify-center gap-3 border border-amber-300/40"
          >
            <span>Buat Kartu Sekarang</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Features Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 text-left w-full">
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-700/50 flex items-center justify-center text-red-400 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm mb-1">Rasio Pas Ukuran KTP</h3>
            <p className="text-xs text-neutral-400">
              Didesain presisi sesuai standar CR80 (54x86 mm) siap dicetak dan dimasukkan ke tali lanyard ID card.
            </p>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-700/50 flex items-center justify-center text-amber-400 mb-3">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm mb-1">Kustomisasi Foto Interaktif</h3>
            <p className="text-xs text-neutral-400">
              Upload foto wajah panitia, perbesar/perkecil (zoom) dan geser posisi dengan mudah langsung di browser.
            </p>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm mb-1">Export HD & Supabase Ready</h3>
            <p className="text-xs text-neutral-400">
              Unduh gambar format PNG beresolusi tinggi 300 DPI dan simpan riwayat kartu ke database Supabase.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-6 text-center text-xs text-neutral-500">
        <p>© 2026 IPPCW REBORN - Cimanggu Wates. Dirgahayu Republik Indonesia Ke-81.</p>
      </footer>
    </div>
  );
}
