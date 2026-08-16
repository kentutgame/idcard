'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Swords, 
  Users, 
  Play, 
  Edit3, 
  Crown,
  Printer
} from 'lucide-react';
import { Lomba } from '@/types/lomba';
import { LombaBracketView } from './LombaBracketView';
import { LombaMassalView } from './LombaMassalView';
import { LombaMultiMatchView } from './LombaMultiMatchView';
import { LombaPodium } from './LombaPodium';
import { LombaPrintPreviewModal } from './LombaPrintPreviewModal';

interface LombaDetailViewProps {
  lomba: Lomba;
  onBack: () => void;
  onUpdateLomba: (updated: Lomba) => void;
  onEditLomba: () => void;
}

export const LombaDetailView: React.FC<LombaDetailViewProps> = ({
  lomba,
  onBack,
  onUpdateLomba,
  onEditLomba
}) => {
  const [activeTab, setActiveTab] = useState<'match' | 'peserta' | 'podium'>('match');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const handleStartCompetition = () => {
    onUpdateLomba({
      ...lomba,
      status: 'berlangsung'
    });
    setActiveTab('match');
  };

  const handleFinishLomba = () => {
    setActiveTab('podium');
  };

  const totalPesertaCount = lomba.tipePeserta === 'kelompok' 
    ? lomba.daftarTim.reduce((acc, t) => acc + (t.anggota.length || 0), 0)
    : lomba.pesertaIndividu.length;

  const totalEntityCount = lomba.tipePeserta === 'kelompok' 
    ? lomba.daftarTim.length 
    : lomba.pesertaIndividu.length;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Info Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10 border-b border-slate-800 pb-5">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Lomba
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            {lomba.status === 'draft' && (
              <button
                type="button"
                onClick={handleStartCompetition}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/20 transition"
              >
                <Play className="w-4 h-4" /> Mulai Pertandingan
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsPreviewModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs rounded-xl border border-amber-500/40 transition"
              title="Pratinjau & Cetak Laporan 3 Lembar HVS"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" /> Cetak / Unduh (3 Lembar)
            </button>
            <button
              type="button"
              onClick={onEditLomba}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" /> Edit Lomba / Peserta
            </button>
          </div>
        </div>

        {/* Title and Badges */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {/* Category Badge */}
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                lomba.kategori === 'anak-anak'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : lomba.kategori === 'remaja'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : lomba.kategori === 'ibu-ibu'
                  ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                Kategori {lomba.kategori}
              </span>

              {/* Tipe Peserta */}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {lomba.tipePeserta === 'kelompok' ? `Kelompok (${totalEntityCount} Tim)` : `Individu (${totalEntityCount} Peserta)`}
              </span>

              {/* Format Tanding */}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-amber-400 border border-slate-700">
                {lomba.formatTanding === 'bracket' 
                  ? 'Format Bracket (Vs)' 
                  : lomba.formatTanding === 'multi_match'
                  ? 'Format Multi-Peserta / Poin'
                  : 'Format Sekaligus (Massal)'}
              </span>

              {/* Status Lomba */}
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                lomba.status === 'selesai'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : lomba.status === 'berlangsung'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-700/60 text-slate-400 border border-slate-600'
              }`}>
                {lomba.status === 'selesai' ? '🏆 Selesai' : lomba.status === 'berlangsung' ? '⚡ Berlangsung' : '📝 Draft'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {lomba.judul}
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700">
            <div>
              <span className="block text-[10px] uppercase text-slate-500 font-bold">Total Partisipan</span>
              <span className="font-bold text-white text-sm">{totalPesertaCount} Orang</span>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <span className="block text-[10px] uppercase text-slate-500 font-bold">Total Unit</span>
              <span className="font-bold text-white text-sm">{totalEntityCount} {lomba.tipePeserta === 'kelompok' ? 'Tim' : 'Peserta'}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-t border-slate-800 pt-4 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('match')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'match'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
            }`}
          >
            <Swords className="w-4 h-4" />
            {lomba.formatTanding === 'bracket' 
              ? 'Bagan / Pertandingan' 
              : lomba.formatTanding === 'multi_match'
              ? 'Arena Multi-Game & Poin'
              : 'Arena Skor Massal'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('peserta')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'peserta'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
            }`}
          >
            <Users className="w-4 h-4" />
            Daftar Peserta & Tim ({totalEntityCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('podium')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'podium'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-400" />
            Podium & Pemenang
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'match' && (
        <div>
          {lomba.formatTanding === 'bracket' ? (
            <LombaBracketView 
              lomba={lomba} 
              onUpdateLomba={onUpdateLomba} 
              onFinishLomba={handleFinishLomba}
            />
          ) : lomba.formatTanding === 'multi_match' ? (
            <LombaMultiMatchView
              lomba={lomba}
              onUpdateLomba={onUpdateLomba}
              onFinishLomba={handleFinishLomba}
            />
          ) : (
            <LombaMassalView 
              lomba={lomba} 
              onUpdateLomba={onUpdateLomba}
              onFinishLomba={handleFinishLomba}
            />
          )}
        </div>
      )}

      {activeTab === 'peserta' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div>
              <h3 className="font-bold text-white text-base">
                Komposisi Peserta Lomba ({totalEntityCount} {lomba.tipePeserta === 'kelompok' ? 'Tim' : 'Peserta'})
              </h3>
              <p className="text-xs text-slate-400">
                Data terdaftar untuk {lomba.judul}
              </p>
            </div>
            <button
              type="button"
              onClick={onEditLomba}
              className="text-xs font-semibold px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" /> Kelola Peserta
            </button>
          </div>

          {lomba.tipePeserta === 'kelompok' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {lomba.daftarTim.map((tim, idx) => (
                <div 
                  key={tim.id || idx}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2.5 shadow-lg"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      {tim.namaTim}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {tim.anggota.length} Anggota
                    </span>
                  </div>

                  <div className="space-y-1">
                    {tim.anggota.map((a, aIdx) => (
                      <div key={aIdx} className="text-xs text-slate-300 flex items-center gap-2">
                        <span className="text-slate-500 text-[10px] w-3">{aIdx + 1}.</span>
                        <span>{a}</span>
                      </div>
                    ))}
                    {tim.anggota.length === 0 && (
                      <span className="text-xs text-slate-500 italic">Belum ada nama anggota</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {lomba.pesertaIndividu.map((peserta, idx) => (
                <div 
                  key={peserta.id || idx}
                  className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3 shadow"
                >
                  <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-xs text-white truncate">{peserta.nama}</h5>
                    <span className="text-[10px] text-slate-400 block">Peserta Individu</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'podium' && (
        <LombaPodium lomba={lomba} />
      )}

      {/* Modal Preview Cetak 3 Lembar */}
      <LombaPrintPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        lomba={lomba}
      />
    </div>
  );
};
