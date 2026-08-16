'use client';

import React, { useState } from 'react';
import { 
  Trophy, 
  ArrowUpDown, 
  CheckCircle2, 
  Users
} from 'lucide-react';
import { Lomba, PesertaRef, HasilJuara } from '@/types/lomba';
import { convertToPesertaRefs } from '@/lib/bracketUtils';

interface LombaMassalViewProps {
  lomba: Lomba;
  onUpdateLomba: (updated: Lomba) => void;
  onFinishLomba: () => void;
}

interface PesertaScoreItem {
  peserta: PesertaRef;
  skor: number;
  catatan: string;
  rankManual?: number; // 1, 2, 3
}

export const LombaMassalView: React.FC<LombaMassalViewProps> = ({
  lomba,
  onUpdateLomba,
  onFinishLomba
}) => {
  const pesertaRefs = convertToPesertaRefs(lomba.tipePeserta, lomba.daftarTim, lomba.pesertaIndividu);

  // Initialize scoring items
  const [items, setItems] = useState<PesertaScoreItem[]>(() => {
    return pesertaRefs.map((p) => {
      let currentScore = 0;
      let currentNote = '';
      if (lomba.tipePeserta === 'kelompok') {
        const t = lomba.daftarTim.find(x => x.id === p.id);
        currentScore = t?.skor || 0;
        currentNote = t?.catatan || '';
      } else {
        const ind = lomba.pesertaIndividu.find(x => x.id === p.id);
        currentScore = ind?.skor || 0;
        currentNote = ind?.catatan || '';
      }

      // Check current podium status
      let rankManual: number | undefined;
      if (lomba.hasilJuara.juara1?.id === p.id) rankManual = 1;
      if (lomba.hasilJuara.juara2?.id === p.id) rankManual = 2;
      if (lomba.hasilJuara.juara3?.id === p.id) rankManual = 3;

      return {
        peserta: p,
        skor: currentScore,
        catatan: currentNote,
        rankManual
      };
    });
  });

  const handleUpdateScore = (id: string, score: number) => {
    setItems(items.map(item => item.peserta.id === id ? { ...item, skor: score } : item));
  };

  const handleUpdateNote = (id: string, note: string) => {
    setItems(items.map(item => item.peserta.id === id ? { ...item, catatan: note } : item));
  };

  const handleSetRank = (id: string, rank: 1 | 2 | 3 | null) => {
    setItems(items.map(item => {
      if (item.peserta.id === id) {
        return { ...item, rankManual: item.rankManual === rank ? undefined : rank || undefined };
      }
      // Jika rank sudah diambil orang lain, lepas dari orang lain tersebut
      if (rank !== null && item.rankManual === rank) {
        return { ...item, rankManual: undefined };
      }
      return item;
    }));
  };

  // Urutkan berdasarkan skor tertinggi otomatis
  const handleSortByScore = () => {
    const sorted = [...items].sort((a, b) => b.skor - a.skor);
    // Otomatis assign juara 1, 2, 3
    const withRank = sorted.map((it, idx) => ({
      ...it,
      rankManual: idx === 0 ? 1 : idx === 1 ? 2 : idx === 2 ? 3 : undefined
    }));
    setItems(withRank);
  };

  // Simpan hasil lomba massal
  const handleSaveResult = () => {
    const juara1Item = items.find(i => i.rankManual === 1);
    const juara2Item = items.find(i => i.rankManual === 2);
    const juara3Item = items.find(i => i.rankManual === 3);

    const hasilJuara: HasilJuara = {
      juara1: juara1Item?.peserta || null,
      juara2: juara2Item?.peserta || null,
      juara3: juara3Item?.peserta || null
    };

    // Update list di lomba
    let updatedTim = [...lomba.daftarTim];
    let updatedIndividu = [...lomba.pesertaIndividu];

    if (lomba.tipePeserta === 'kelompok') {
      updatedTim = updatedTim.map(t => {
        const it = items.find(i => i.peserta.id === t.id);
        return it ? { ...t, skor: it.skor, catatan: it.catatan, ranking: it.rankManual } : t;
      });
    } else {
      updatedIndividu = updatedIndividu.map(ind => {
        const it = items.find(i => i.peserta.id === ind.id);
        return it ? { ...ind, skor: it.skor, catatan: it.catatan, ranking: it.rankManual } : ind;
      });
    }

    const updatedLomba: Lomba = {
      ...lomba,
      status: juara1Item ? 'selesai' : 'berlangsung',
      daftarTim: updatedTim,
      pesertaIndividu: updatedIndividu,
      hasilJuara
    };

    onUpdateLomba(updatedLomba);

    if (juara1Item) {
      onFinishLomba();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base">
              Mode Sekaligus / Massal ({items.length} Peserta)
            </h3>
            <p className="text-xs text-slate-400">
              Input perolehan poin/waktu peserta sekaligus, lalu tentukan Juara 1, 2, dan 3
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSortByScore}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-amber-300 text-xs font-semibold rounded-lg transition"
            title="Urutkan ranking otomatis dari skor tertinggi"
          >
            <ArrowUpDown className="w-3.5 h-3.5" /> Urutkan Skor Tertinggi
          </button>
          <button
            type="button"
            onClick={handleSaveResult}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Simpan & Kunci Juara
          </button>
        </div>
      </div>

      {/* Table / List Scoring Peserta */}
      <div className="bg-slate-850 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800 text-slate-400 uppercase tracking-wider font-bold text-[11px] border-b border-slate-700">
              <tr>
                <th className="px-4 py-3 w-12 text-center">No</th>
                <th className="px-4 py-3">Nama {lomba.tipePeserta === 'kelompok' ? 'Tim & Anggota' : 'Peserta'}</th>
                <th className="px-4 py-3 w-32 text-center">Skor / Poin</th>
                <th className="px-4 py-3">Catatan Panitia / Waktu</th>
                <th className="px-4 py-3 w-48 text-center">Tetapkan Juara</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {items.map((item, idx) => (
                <tr 
                  key={item.peserta.id}
                  className={`hover:bg-slate-800/50 transition ${
                    item.rankManual === 1 
                      ? 'bg-amber-950/20' 
                      : item.rankManual === 2 
                      ? 'bg-slate-800/40' 
                      : item.rankManual === 3 
                      ? 'bg-orange-950/20' 
                      : ''
                  }`}
                >
                  <td className="px-4 py-3.5 text-center font-bold text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-sm text-white flex items-center gap-1.5">
                      {item.peserta.nama}
                      {item.rankManual === 1 && <span className="text-base" title="Juara 1">🥇</span>}
                      {item.rankManual === 2 && <span className="text-base" title="Juara 2">🥈</span>}
                      {item.rankManual === 3 && <span className="text-base" title="Juara 3">🥉</span>}
                    </div>
                    {item.peserta.detailAnggota && item.peserta.detailAnggota.length > 0 && (
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Users className="w-3 h-3 text-red-400" />
                        {item.peserta.detailAnggota.join(', ')}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <input
                      type="number"
                      value={item.skor}
                      onChange={(e) => handleUpdateScore(item.peserta.id, parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-center font-mono font-bold text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <input
                      type="text"
                      value={item.catatan}
                      onChange={(e) => handleUpdateNote(item.peserta.id, e.target.value)}
                      placeholder="Contoh: Waktu 1 menit 12 detik"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSetRank(item.peserta.id, 1)}
                        className={`px-2 py-1 rounded text-xs font-bold transition ${
                          item.rankManual === 1
                            ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                            : 'bg-slate-800 text-amber-400 hover:bg-amber-400/20 border border-amber-500/30'
                        }`}
                        title="Tetapkan Juara 1"
                      >
                        🥇 1
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetRank(item.peserta.id, 2)}
                        className={`px-2 py-1 rounded text-xs font-bold transition ${
                          item.rankManual === 2
                            ? 'bg-slate-200 text-slate-950 shadow-md ring-2 ring-slate-100'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-200/20 border border-slate-500/30'
                        }`}
                        title="Tetapkan Juara 2"
                      >
                        🥈 2
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetRank(item.peserta.id, 3)}
                        className={`px-2 py-1 rounded text-xs font-bold transition ${
                          item.rankManual === 3
                            ? 'bg-amber-700 text-white shadow-md ring-2 ring-amber-600'
                            : 'bg-slate-800 text-amber-600 hover:bg-amber-700/20 border border-amber-700/30'
                        }`}
                        title="Tetapkan Juara 3"
                      >
                        🥉 3
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
