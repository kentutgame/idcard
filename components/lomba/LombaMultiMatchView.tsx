'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Users, 
  ArrowUpDown, 
  Crown, 
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';
import { Lomba, MultiMatch, HasilJuara } from '@/types/lomba';
import { convertToPesertaRefs, generateInitialMultiMatches } from '@/lib/bracketUtils';

interface LombaMultiMatchViewProps {
  lomba: Lomba;
  onUpdateLomba: (updated: Lomba) => void;
  onFinishLomba: () => void;
}

export const LombaMultiMatchView: React.FC<LombaMultiMatchViewProps> = ({
  lomba,
  onUpdateLomba,
  onFinishLomba
}) => {
  const pesertaRefs = convertToPesertaRefs(lomba.tipePeserta, lomba.daftarTim, lomba.pesertaIndividu);

  // Inisialisasi matches jika belum ada
  const matches: MultiMatch[] = lomba.multiMatches && lomba.multiMatches.length > 0
    ? lomba.multiMatches
    : generateInitialMultiMatches(pesertaRefs);

  const [activeTab, setActiveTab] = useState<'matches' | 'leaderboard'>('matches');

  // Update specific match data
  const handleUpdateMatchParticipant = (
    matchId: string, 
    pesertaId: string, 
    field: 'skor' | 'poin' | 'catatan' | 'ranking', 
    val: number | string | undefined
  ) => {
    const updatedMatches = matches.map(m => {
      if (m.id !== matchId) return m;
      const updatedList = m.pesertaList.map(p => {
        if (p.peserta.id !== pesertaId) return p;
        return {
          ...p,
          [field]: val
        };
      });
      return { ...m, pesertaList: updatedList };
    });

    onUpdateLomba({
      ...lomba,
      multiMatches: updatedMatches
    });
  };

  // Add new match
  const handleAddMatch = () => {
    const nextNum = matches.length + 1;
    const letter = String.fromCharCode(64 + nextNum);
    const newMatch: MultiMatch = {
      id: `match_custom_${Date.now()}`,
      namaMatch: `Pertandingan ${nextNum} (Heat / Grup ${letter})`,
      status: 'pending',
      pesertaList: []
    };

    onUpdateLomba({
      ...lomba,
      multiMatches: [...matches, newMatch]
    });
  };

  // Delete match
  const handleDeleteMatch = (matchId: string) => {
    if (matches.length <= 1) {
      alert('Minimal harus ada 1 pertandingan!');
      return;
    }
    if (confirm('Hapus sesi pertandingan ini?')) {
      const updated = matches.filter(m => m.id !== matchId);
      onUpdateLomba({
        ...lomba,
        multiMatches: updated
      });
    }
  };

  // Quick Sort match participants by score or points
  const handleSortMatch = (matchId: string, sortBy: 'skor' | 'poin') => {
    const updatedMatches = matches.map(m => {
      if (m.id !== matchId) return m;
      const sorted = [...m.pesertaList].sort((a, b) => b[sortBy] - a[sortBy]);
      // Auto assign ranking 1, 2, 3...
      const withRank = sorted.map((p, idx) => ({
        ...p,
        ranking: idx + 1,
        // Preset default points jika sortBy skor: Juara 1 = 100, Juara 2 = 75, Juara 3 = 50, dst.
        poin: p.poin > 0 ? p.poin : idx === 0 ? 100 : idx === 1 ? 75 : idx === 2 ? 50 : 25
      }));
      return { ...m, pesertaList: withRank, status: 'completed' as const };
    });

    onUpdateLomba({
      ...lomba,
      multiMatches: updatedMatches
    });
  };

  // Tambah peserta ke dalam pertandingan tertentu
  const handleAddPesertaToMatch = (matchId: string, pesertaId: string) => {
    if (!pesertaId) return;
    const targetRef = pesertaRefs.find(p => p.id === pesertaId);
    if (!targetRef) return;

    const updatedMatches = matches.map(m => {
      if (m.id !== matchId) return m;
      if (m.pesertaList.some(p => p.peserta.id === pesertaId)) return m;
      return {
        ...m,
        pesertaList: [
          ...m.pesertaList,
          { peserta: targetRef, skor: 0, poin: 0 }
        ]
      };
    });

    onUpdateLomba({
      ...lomba,
      multiMatches: updatedMatches
    });
  };

  // Hapus peserta dari pertandingan tertentu
  const handleRemovePesertaFromMatch = (matchId: string, pesertaId: string) => {
    const updatedMatches = matches.map(m => {
      if (m.id !== matchId) return m;
      return {
        ...m,
        pesertaList: m.pesertaList.filter(p => p.peserta.id !== pesertaId)
      };
    });

    onUpdateLomba({
      ...lomba,
      multiMatches: updatedMatches
    });
  };

  // Hitung Klasemen / Total Poin Semua Peserta
  const leaderboard = pesertaRefs.map(p => {
    let totalPoin = 0;
    let totalSkor = 0;
    let mainCount = 0;

    matches.forEach(m => {
      const matchP = m.pesertaList.find(x => x.peserta.id === p.id);
      if (matchP) {
        totalPoin += matchP.poin || 0;
        totalSkor += matchP.skor || 0;
        mainCount += 1;
      }
    });

    return {
      peserta: p,
      totalPoin,
      totalSkor,
      mainCount
    };
  }).sort((a, b) => b.totalPoin - a.totalPoin || b.totalSkor - a.totalSkor);

  // Kunci Hasil Juara berdasarkan Klasemen Poin
  const handleLockPodiumFromLeaderboard = () => {
    if (leaderboard.length < 2) return;

    const hasilJuara: HasilJuara = {
      juara1: leaderboard[0]?.peserta || null,
      juara2: leaderboard[1]?.peserta || null,
      juara3: leaderboard[2]?.peserta || null
    };

    onUpdateLomba({
      ...lomba,
      status: 'selesai',
      hasilJuara
    });

    onFinishLomba();
  };

  // Reset Semua Poin
  const handleResetAll = () => {
    if (confirm('Reset semua pertandingan dan perolehan poin ke awal?')) {
      const freshMatches = generateInitialMultiMatches(pesertaRefs);
      onUpdateLomba({
        ...lomba,
        status: 'draft',
        multiMatches: freshMatches,
        hasilJuara: { juara1: null, juara2: null, juara3: null }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
              Format Multi-Peserta per Game ({matches.length} Pertandingan)
            </h3>
            <p className="text-xs text-slate-400">
              Setiap pertandingan dapat diikuti oleh lebih dari 2 peserta dengan perolehan poin kustom dari panitia
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('matches')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                activeTab === 'matches'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daftar Pertandingan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Crown className="w-3.5 h-3.5" /> Klasemen Poin
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddMatch}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition shadow"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Pertandingan
          </button>

          <button
            type="button"
            onClick={handleResetAll}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition"
            title="Reset Poin"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* VIEW 1: MATCHES LIST (PER GAME / HEAT) */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
          {matches.map((match, mIdx) => (
            <div 
              key={match.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
            >
              {/* Match Header */}
              <div className="p-4 bg-slate-850 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center">
                    {mIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={match.namaMatch}
                    onChange={(e) => {
                      const updated = matches.map(m => m.id === match.id ? { ...m, namaMatch: e.target.value } : m);
                      onUpdateLomba({ ...lomba, multiMatches: updated });
                    }}
                    className="font-bold text-sm sm:text-base text-white bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <span className="text-xs text-slate-400">
                    ({match.pesertaList.length} Peserta)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSortMatch(match.id, 'skor')}
                    className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 transition"
                    title="Urutkan ranking & isi poin otomatis berdasarkan skor"
                  >
                    <ArrowUpDown className="w-3 h-3" /> Auto Poin Ranking
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteMatch(match.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                    title="Hapus Pertandingan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Match Participants Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-2.5 w-12 text-center">Rank</th>
                      <th className="px-4 py-2.5">Nama {lomba.tipePeserta === 'kelompok' ? 'Tim' : 'Peserta'}</th>
                      <th className="px-4 py-2.5 w-28 text-center">Skor / Waktu</th>
                      <th className="px-4 py-2.5 w-28 text-center text-amber-400">Perolehan Poin ⭐</th>
                      <th className="px-4 py-2.5">Catatan Wasit</th>
                      <th className="px-4 py-2.5 w-12 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {match.pesertaList.map((p, pIdx) => (
                      <tr key={p.peserta.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            min={1}
                            value={p.ranking || ''}
                            onChange={(e) => handleUpdateMatchParticipant(match.id, p.peserta.id, 'ranking', parseInt(e.target.value) || undefined)}
                            placeholder={`${pIdx + 1}`}
                            className="w-10 text-center font-bold text-xs py-1 bg-slate-800 border border-slate-700 rounded-md text-amber-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-sm text-white block">
                            {p.peserta.nama}
                          </span>
                          {p.peserta.detailAnggota && p.peserta.detailAnggota.length > 0 && (
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Users className="w-3 h-3 text-red-400" />
                              {p.peserta.detailAnggota.join(', ')}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            value={p.skor}
                            onChange={(e) => handleUpdateMatchParticipant(match.id, p.peserta.id, 'skor', parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-center font-mono font-bold text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            value={p.poin}
                            onChange={(e) => handleUpdateMatchParticipant(match.id, p.peserta.id, 'poin', parseFloat(e.target.value) || 0)}
                            placeholder="Poin"
                            className="w-20 px-2 py-1 bg-amber-950/30 border border-amber-500/50 rounded-lg text-center font-mono font-bold text-xs text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={p.catatan || ''}
                            onChange={(e) => handleUpdateMatchParticipant(match.id, p.peserta.id, 'catatan', e.target.value)}
                            placeholder="Catatan pertandingan..."
                            className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemovePesertaFromMatch(match.id, p.peserta.id)}
                            className="text-slate-500 hover:text-red-400 p-1"
                            title="Keluarkan dari pertandingan ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {match.pesertaList.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-slate-500 text-xs italic">
                          Belum ada peserta di pertandingan ini. Tambahkan peserta di bawah ini:
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bottom: Quick Add Participant Selector */}
              <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 text-xs flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-semibold">Tambah Peserta ke Match Ini:</span>
                  <select
                    onChange={(e) => {
                      handleAddPesertaToMatch(match.id, e.target.value);
                      e.target.value = '';
                    }}
                    defaultValue=""
                    className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="" disabled>+ Pilih Peserta / Tim...</option>
                    {pesertaRefs
                      .filter(ref => !match.pesertaList.some(p => p.peserta.id === ref.id))
                      .map(ref => (
                        <option key={ref.id} value={ref.id}>
                          {ref.nama}
                        </option>
                      ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    // Isi semua peserta yang belum masuk ke match ini
                    const remaining = pesertaRefs.filter(ref => !match.pesertaList.some(p => p.peserta.id === ref.id));
                    if (remaining.length > 0) {
                      const updated = matches.map(m => {
                        if (m.id !== match.id) return m;
                        return {
                          ...m,
                          pesertaList: [
                            ...m.pesertaList,
                            ...remaining.map(r => ({ peserta: r, skor: 0, poin: 0 }))
                          ]
                        };
                      });
                      onUpdateLomba({ ...lomba, multiMatches: updated });
                    }
                  }}
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  Masukkan Semua Peserta
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: LEADERBOARD / KLASEMEN TOTAL POIN */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                Klasemen Akumulasi Poin Keseluruhan
              </h3>
              <p className="text-xs text-slate-400">
                Peringkat diurutkan otomatis dari total perolehan poin tertinggi
              </p>
            </div>

            <button
              type="button"
              onClick={handleLockPodiumFromLeaderboard}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition"
            >
              <Sparkles className="w-4 h-4" /> Kunci Hasil Juara 1, 2, 3
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 w-16 text-center">Peringkat</th>
                  <th className="px-4 py-3">Nama {lomba.tipePeserta === 'kelompok' ? 'Tim' : 'Peserta'}</th>
                  <th className="px-4 py-3 w-28 text-center">Jumlah Tanding</th>
                  <th className="px-4 py-3 w-32 text-center">Total Skor</th>
                  <th className="px-4 py-3 w-36 text-center text-amber-400 font-extrabold">Total Poin ⭐</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {leaderboard.map((item, idx) => (
                  <tr 
                    key={item.peserta.id}
                    className={`hover:bg-slate-800/50 transition ${
                      idx === 0 
                        ? 'bg-amber-950/20 font-bold text-white' 
                        : idx === 1 
                        ? 'bg-slate-800/30 font-semibold text-slate-200' 
                        : idx === 2 
                        ? 'bg-orange-950/15' 
                        : ''
                    }`}
                  >
                    <td className="px-4 py-3.5 text-center font-bold text-sm">
                      {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `${idx + 1}`}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-sm text-white block">
                        {item.peserta.nama}
                      </span>
                      {item.peserta.detailAnggota && item.peserta.detailAnggota.length > 0 && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3 text-red-400" />
                          {item.peserta.detailAnggota.join(', ')}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center text-slate-400">
                      {item.mainCount} Kali
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono text-slate-300">
                      {item.totalSkor}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-black text-sm text-amber-300">
                      {item.totalPoin} Poin
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
