'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Printer, 
  Sparkles, 
  Award,
  FileText,
  Eye
} from 'lucide-react';
import { Lomba } from '@/types/lomba';
import { LombaPrintPreviewModal } from './LombaPrintPreviewModal';

interface LombaPodiumProps {
  lomba: Lomba;
}

export const LombaPodium: React.FC<LombaPodiumProps> = ({ lomba }) => {
  const { hasilJuara } = lomba;
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Efek confetti selebrasi saat dibuka
  useEffect(() => {
    if (hasilJuara.juara1) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.error('Confetti error:', err);
      }
    }
  }, [hasilJuara.juara1]);

  const handlePrint = () => {
    window.print();
  };

  const handleTriggerConfetti = () => {
    try {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 }
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (!hasilJuara.juara1 && !hasilJuara.juara2 && !hasilJuara.juara3) {
    return (
      <div className="text-center py-16 px-4 bg-slate-800/40 border border-slate-700/80 rounded-2xl">
        <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">Podium Juara Belum Ditentukan</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
          Selesaikan pertandingan di tab &quot;Bagan / Pertandingan&quot; atau tetapkan pemenang untuk menampilkan panggung podium juara 1, 2, dan 3.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Pengumuman & Cetak */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-red-900/50 via-slate-900 to-amber-950/40 p-5 rounded-2xl border border-amber-500/30 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
            <Crown className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              PENGUMUMAN RESMI PEMENANG
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {lomba.judul}
            </h2>
            <p className="text-xs text-slate-300">
              Kategori: <span className="font-semibold capitalize text-red-400">{lomba.kategori}</span> • Tipe: <span className="font-semibold capitalize">{lomba.tipePeserta}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleTriggerConfetti}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition"
          >
            <Sparkles className="w-4 h-4" /> Selebrasi 🎉
          </button>
          
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40 shadow transition"
          >
            <Eye className="w-4 h-4 text-amber-400" /> Pratinjau 3 Lembar
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition"
          >
            <Printer className="w-4 h-4" /> Cetak / Unduh PDF (3 Lembar)
          </button>
        </div>
      </div>

      {/* Visual Podium 3D (Juara 2 - Juara 1 - Juara 3) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-end justify-center gap-4 sm:gap-6 pt-8 pb-4">
          
          {/* JUARA 2 (Perak - Kiri) */}
          <div className="w-full md:w-1/3 flex flex-col items-center order-2 md:order-1">
            <div className="mb-3 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 border-4 border-slate-300 flex items-center justify-center shadow-lg shadow-slate-400/20 mx-auto">
                <Medal className="w-8 h-8 sm:w-10 sm:h-10 text-slate-800" />
              </div>
              <div className="mt-3">
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-300 text-slate-900 tracking-wider">
                  Juara 2 (Perak)
                </span>
                <h4 className="font-bold text-base sm:text-lg text-white mt-1">
                  {hasilJuara.juara2?.nama || '-'}
                </h4>
                {hasilJuara.juara2?.detailAnggota && hasilJuara.juara2.detailAnggota.length > 0 && (
                  <p className="text-xs text-slate-400 mt-0.5 max-w-[200px] mx-auto truncate">
                    {hasilJuara.juara2.detailAnggota.join(', ')}
                  </p>
                )}
              </div>
            </div>
            {/* Podium Box 2 */}
            <div className="w-full h-36 sm:h-48 bg-gradient-to-t from-slate-800 to-slate-700/80 border-t-4 border-slate-300 rounded-t-2xl flex flex-col items-center justify-center shadow-lg">
              <span className="text-4xl sm:text-6xl font-black text-slate-400">2</span>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-1">Runner Up</span>
            </div>
          </div>

          {/* JUARA 1 (Emas - Tengah - Paling Tinggi) */}
          <div className="w-full md:w-1/3 flex flex-col items-center order-1 md:order-2 -mt-6 md:-mt-10">
            <div className="mb-3 text-center">
              <div className="relative">
                <Crown className="w-8 h-8 text-amber-400 absolute -top-7 left-1/2 -translate-x-1/2 animate-bounce" />
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 border-4 border-amber-300 flex items-center justify-center shadow-xl shadow-amber-500/40 mx-auto">
                  <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-slate-950" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 tracking-wider shadow-md">
                  🏆 JUARA 1 (EMAS)
                </span>
                <h4 className="font-extrabold text-lg sm:text-2xl text-amber-300 mt-1.5">
                  {hasilJuara.juara1?.nama || '-'}
                </h4>
                {hasilJuara.juara1?.detailAnggota && hasilJuara.juara1.detailAnggota.length > 0 && (
                  <p className="text-xs text-amber-200/80 mt-0.5 max-w-[220px] mx-auto">
                    Anggota: {hasilJuara.juara1.detailAnggota.join(', ')}
                  </p>
                )}
              </div>
            </div>
            {/* Podium Box 1 */}
            <div className="w-full h-48 sm:h-64 bg-gradient-to-t from-amber-900/60 via-amber-700/40 to-amber-600/60 border-t-4 border-amber-400 rounded-t-2xl flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-amber-400/10 animate-pulse pointer-events-none" />
              <span className="text-6xl sm:text-8xl font-black text-amber-300 drop-shadow-md">1</span>
              <span className="text-sm font-black text-amber-200 uppercase tracking-widest mt-1">CHAMPION</span>
            </div>
          </div>

          {/* JUARA 3 (Perunggu - Kanan) */}
          <div className="w-full md:w-1/3 flex flex-col items-center order-3">
            <div className="mb-3 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-700 to-orange-800 border-4 border-amber-600 flex items-center justify-center shadow-lg shadow-amber-800/30 mx-auto">
                <Award className="w-8 h-8 sm:w-10 sm:h-10 text-amber-100" />
              </div>
              <div className="mt-3">
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-700 text-amber-100 tracking-wider">
                  Juara 3 (Perunggu)
                </span>
                <h4 className="font-bold text-base sm:text-lg text-white mt-1">
                  {hasilJuara.juara3?.nama || '-'}
                </h4>
                {hasilJuara.juara3?.detailAnggota && hasilJuara.juara3.detailAnggota.length > 0 && (
                  <p className="text-xs text-slate-400 mt-0.5 max-w-[200px] mx-auto truncate">
                    {hasilJuara.juara3.detailAnggota.join(', ')}
                  </p>
                )}
              </div>
            </div>
            {/* Podium Box 3 */}
            <div className="w-full h-28 sm:h-36 bg-gradient-to-t from-slate-800 to-amber-950/60 border-t-4 border-amber-700 rounded-t-2xl flex flex-col items-center justify-center shadow-lg">
              <span className="text-4xl sm:text-6xl font-black text-amber-700">3</span>
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest mt-1">Juara 3</span>
            </div>
          </div>

        </div>
      </div>

      {/* Lembar Rekap Hasil (Print-Friendly) */}
      <div className="bg-slate-850 border border-slate-700/80 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-700 pb-3">
          <Award className="w-5 h-5 text-red-500" />
          Rekapitulasi Berita Acara Pemenang Lomba
        </h3>

        <div className={`grid gap-4 ${hasilJuara.juaraHarapan ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
            <span className="text-xs font-bold text-amber-400">JUARA I (PERTAMA)</span>
            <p className="text-base font-bold text-white">{hasilJuara.juara1?.nama || '-'}</p>
            {hasilJuara.juara1?.detailAnggota && (
              <p className="text-xs text-slate-400">Anggota: {hasilJuara.juara1.detailAnggota.join(', ')}</p>
            )}
          </div>

          <div className="p-4 bg-slate-700/30 border border-slate-600/40 rounded-xl space-y-1">
            <span className="text-xs font-bold text-slate-300">JUARA II (KEDUA)</span>
            <p className="text-base font-bold text-white">{hasilJuara.juara2?.nama || '-'}</p>
            {hasilJuara.juara2?.detailAnggota && (
              <p className="text-xs text-slate-400">Anggota: {hasilJuara.juara2.detailAnggota.join(', ')}</p>
            )}
          </div>

          <div className="p-4 bg-amber-900/20 border border-amber-700/30 rounded-xl space-y-1">
            <span className="text-xs font-bold text-amber-600">JUARA III (KETIGA)</span>
            <p className="text-base font-bold text-white">{hasilJuara.juara3?.nama || '-'}</p>
            {hasilJuara.juara3?.detailAnggota && (
              <p className="text-xs text-slate-400">Anggota: {hasilJuara.juara3.detailAnggota.join(', ')}</p>
            )}
          </div>

          {hasilJuara.juaraHarapan && (
            <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-1">
              <span className="text-xs font-bold text-purple-400">JUARA IV (HARAPAN)</span>
              <p className="text-base font-bold text-white">{hasilJuara.juaraHarapan?.nama || '-'}</p>
              {hasilJuara.juaraHarapan?.detailAnggota && (
                <p className="text-xs text-slate-400">Anggota: {hasilJuara.juaraHarapan.detailAnggota.join(', ')}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Preview Cetak 3 Lembar */}
      <LombaPrintPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        lomba={lomba}
      />
    </div>
  );
};
