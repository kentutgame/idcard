'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Users, 
  Crown, 
  RotateCcw,
  Sparkles,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  UserCheck,
  Award
} from 'lucide-react';
import { Lomba, MultiMatch, PesertaRef, HasilJuara, StatusPesertaHeat } from '@/types/lomba';
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

  const [activeTab, setActiveTab] = useState<'matches' | 'roster_status'>('matches');
  const [filterRoster, setFilterRoster] = useState<'semua' | 'belum' | 'sudah' | 'lolos' | 'gugur'>('semua');

  // Menentukan pemenang tunggal di match tertentu (1 Lolos, sisanya otomatis Gugur)
  const handleSetMatchWinner = (matchId: string, winnerPesertaId: string) => {
    const updatedMatches = matches.map(m => {
      if (m.id !== matchId) return m;
      const updatedList = m.pesertaList.map(p => {
        const isWinner = p.peserta.id === winnerPesertaId;
        return {
          ...p,
          ranking: isWinner ? 1 : undefined,
          statusLolos: (isWinner ? 'lolos' : 'gugur') as StatusPesertaHeat
        };
      });
      return {
        ...m,
        status: 'completed' as const,
        pemenangId: winnerPesertaId,
        pesertaList: updatedList
      };
    });

    onUpdateLomba({
      ...lomba,
      status: 'berlangsung',
      multiMatches: updatedMatches
    });
  };

  // Toggle status lolos / gugur secara manual per peserta
  const handleToggleStatusLolos = (matchId: string, pesertaId: string, status: StatusPesertaHeat) => {
    const updatedMatches = matches.map(m => {
      if (m.id !== matchId) return m;
      const updatedList = m.pesertaList.map(p => {
        if (p.peserta.id !== pesertaId) return p;
        return {
          ...p,
          statusLolos: status
        };
      });
      return { ...m, pesertaList: updatedList };
    });

    onUpdateLomba({
      ...lomba,
      multiMatches: updatedMatches
    });
  };

  // Update skor / waktu peserta jika ada
  const handleUpdateParticipantSkor = (matchId: string, pesertaId: string, skor: number) => {
    const updatedMatches = matches.map(m => {
      if (m.id !== matchId) return m;
      const updatedList = m.pesertaList.map(p => {
        if (p.peserta.id !== pesertaId) return p;
        return { ...p, skor };
      });
      return { ...m, pesertaList: updatedList };
    });

    onUpdateLomba({
      ...lomba,
      multiMatches: updatedMatches
    });
  };

  // Tambah Pertandingan / Heat Baru
  const handleAddMatch = () => {
    const nextNum = matches.length + 1;
    const letter = String.fromCharCode(64 + nextNum);
    const newMatch: MultiMatch = {
      id: `match_custom_${Date.now()}`,
      namaMatch: `Pertandingan ${nextNum} (Heat ${letter})`,
      babak: 'Penyisihan',
      status: 'pending',
      pesertaList: []
    };

    onUpdateLomba({
      ...lomba,
      multiMatches: [...matches, newMatch]
    });
  };

  // Buat Babak Selanjutnya (Final) otomatis dari semua peserta yang berstatus LOLOS
  const handleCreateNextRoundFromWinners = () => {
    // Kumpulkan semua peserta unik yang lolos dari seluruh pertandingan
    const qualifiedMap = new Map<string, PesertaRef>();
    matches.forEach(m => {
      m.pesertaList.forEach(p => {
        if (p.statusLolos === 'lolos') {
          qualifiedMap.set(p.peserta.id, p.peserta);
        }
      });
    });

    const qualifiedList = Array.from(qualifiedMap.values());

    if (qualifiedList.length === 0) {
      alert('Belum ada peserta yang lolos! Silakan tentukan pemenang di pertandingan penyisihan terlebih dahulu.');
      return;
    }

    const finalMatch: MultiMatch = {
      id: `match_final_${Date.now()}`,
      namaMatch: `Babak Final (${qualifiedList.length} Peserta Lolos)`,
      babak: 'Final',
      status: 'pending',
      pesertaList: qualifiedList.map(p => ({
        peserta: p,
        skor: 0,
        statusLolos: 'belum'
      }))
    };

    onUpdateLomba({
      ...lomba,
      multiMatches: [...matches, finalMatch]
    });

    alert(`Berhasil membuat Babak Final dengan ${qualifiedList.length} peserta yang lolos!`);
  };

  // Hapus Pertandingan
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

  // Tambah Peserta ke Match tertentu
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
          { peserta: targetRef, skor: 0, statusLolos: 'belum' as const }
        ]
      };
    });

    onUpdateLomba({
      ...lomba,
      multiMatches: updatedMatches
    });
  };

  // Hapus Peserta dari Match tertentu
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

  // Hitung Status Real-Time Seluruh Peserta: Belum, Sudah, Lolos, Gugur
  const participantsStatusList = pesertaRefs.map(p => {
    // Cari status peserta di seluruh match
    let isPlayed = false;
    let isQualified = false;
    let isEliminated = false;
    let matchNames: string[] = [];

    matches.forEach(m => {
      const matchP = m.pesertaList.find(x => x.peserta.id === p.id);
      if (matchP) {
        matchNames.push(m.namaMatch);
        if (m.status === 'completed' || matchP.statusLolos === 'lolos' || matchP.statusLolos === 'gugur') {
          isPlayed = true;
        }
        if (matchP.statusLolos === 'lolos') {
          isQualified = true;
        } else if (matchP.statusLolos === 'gugur') {
          isEliminated = true;
        }
      }
    });

    let finalStatus: 'belum' | 'lolos' | 'gugur' | 'bermain' = 'belum';
    if (isQualified) {
      finalStatus = 'lolos';
    } else if (isEliminated) {
      finalStatus = 'gugur';
    } else if (isPlayed) {
      finalStatus = 'bermain';
    }

    return {
      peserta: p,
      status: finalStatus,
      isPlayed,
      matchNames
    };
  });

  const totalBelum = participantsStatusList.filter(x => !x.isPlayed).length;
  const totalSudah = participantsStatusList.filter(x => x.isPlayed).length;
  const totalLolos = participantsStatusList.filter(x => x.status === 'lolos').length;
  const totalGugur = participantsStatusList.filter(x => x.status === 'gugur').length;

  // Filter list untuk tab roster
  const filteredRoster = participantsStatusList.filter(x => {
    if (filterRoster === 'belum') return !x.isPlayed;
    if (filterRoster === 'sudah') return x.isPlayed;
    if (filterRoster === 'lolos') return x.status === 'lolos';
    if (filterRoster === 'gugur') return x.status === 'gugur';
    return true;
  });

  // Kunci Hasil Juara 1, 2, 3 ke Podium
  const handleLockPodium = (j1: PesertaRef | null, j2: PesertaRef | null, j3: PesertaRef | null) => {
    if (!j1) {
      alert('Pilih minimal Juara 1 untuk dikunci ke podium!');
      return;
    }

    const hasilJuara: HasilJuara = {
      juara1: j1,
      juara2: j2,
      juara3: j3
    };

    onUpdateLomba({
      ...lomba,
      status: 'selesai',
      hasilJuara
    });

    onFinishLomba();
  };

  // Reset Semua Pertandingan
  const handleResetAll = () => {
    if (confirm('Reset semua bagan pertandingan & status peserta ke awal?')) {
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
      {/* Top Banner: Ringkasan Status Peserta */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => {
            setActiveTab('roster_status');
            setFilterRoster('belum');
          }}
          className={`p-3.5 rounded-2xl border text-left transition ${
            filterRoster === 'belum' && activeTab === 'roster_status'
              ? 'bg-amber-500/20 border-amber-500 shadow'
              : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Belum Bermain
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
              {totalBelum}
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
            {totalBelum} {lomba.tipePeserta === 'kelompok' ? 'Tim' : 'Orang'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('roster_status');
            setFilterRoster('sudah');
          }}
          className={`p-3.5 rounded-2xl border text-left transition ${
            filterRoster === 'sudah' && activeTab === 'roster_status'
              ? 'bg-blue-500/20 border-blue-500 shadow'
              : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-400 font-bold flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" /> Sudah Bermain
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
              {totalSudah}
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
            {totalSudah} {lomba.tipePeserta === 'kelompok' ? 'Tim' : 'Orang'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('roster_status');
            setFilterRoster('lolos');
          }}
          className={`p-3.5 rounded-2xl border text-left transition ${
            filterRoster === 'lolos' && activeTab === 'roster_status'
              ? 'bg-emerald-500/20 border-emerald-500 shadow'
              : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Lolos Babak Lanjut
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
              {totalLolos}
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 block">
            {totalLolos} {lomba.tipePeserta === 'kelompok' ? 'Tim' : 'Orang'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('roster_status');
            setFilterRoster('gugur');
          }}
          className={`p-3.5 rounded-2xl border text-left transition ${
            filterRoster === 'gugur' && activeTab === 'roster_status'
              ? 'bg-rose-500/20 border-rose-500 shadow'
              : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-400 font-bold flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" /> Gugur / Tereliminasi
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
              {totalGugur}
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-rose-400 mt-1 block">
            {totalGugur} {lomba.tipePeserta === 'kelompok' ? 'Tim' : 'Orang'}
          </span>
        </button>
      </div>

      {/* Header Info & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/90 p-4 rounded-2xl border border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
              Sistem Eliminasi Heat & Lolos Babak ({matches.length} Pertandingan)
            </h3>
            <p className="text-xs text-slate-400">
              Pilih pemenang di tiap pertandingan untuk melaju ke babak berikutnya, yang kalah otomatis gugur
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('matches')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'matches'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pertandingan ({matches.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('roster_status');
                setFilterRoster('semua');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'roster_status'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Status Peserta ({pesertaRefs.length})
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddMatch}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl transition shadow"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Heat
          </button>

          {totalLolos > 0 && (
            <button
              type="button"
              onClick={handleCreateNextRoundFromWinners}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-bold rounded-xl transition shadow"
              title="Kumpulkan semua peserta lolos ke dalam 1 babak final"
            >
              <Sparkles className="w-3.5 h-3.5" /> Buat Babak Final ({totalLolos} Lolos)
            </button>
          )}

          <button
            type="button"
            onClick={handleResetAll}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-xl transition"
            title="Reset ke Awal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* VIEW 1: MATCHES LIST (SETIAP PERTANDINGAN / HEAT) */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
          {matches.map((match, mIdx) => {
            const hasWinner = match.pesertaList.some(p => p.statusLolos === 'lolos');
            const winnerPeserta = match.pesertaList.find(p => p.statusLolos === 'lolos')?.peserta;
            const isFinalMatch = match.babak === 'Final' || match.namaMatch.toLowerCase().includes('final');

            return (
              <div 
                key={match.id}
                className={`bg-slate-900 border rounded-2xl overflow-hidden shadow-xl transition ${
                  isFinalMatch 
                    ? 'border-amber-500/50 shadow-amber-500/10' 
                    : hasWinner 
                    ? 'border-emerald-500/40' 
                    : 'border-slate-800'
                }`}
              >
                {/* Match Header */}
                <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
                  isFinalMatch 
                    ? 'bg-gradient-to-r from-amber-950/40 via-slate-850 to-slate-850 border-amber-500/40'
                    : 'bg-slate-850 border-slate-800'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                      isFinalMatch 
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {mIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={match.namaMatch}
                      onChange={(e) => {
                        const updated = matches.map(m => m.id === match.id ? { ...m, namaMatch: e.target.value } : m);
                        onUpdateLomba({ ...lomba, multiMatches: updated });
                      }}
                      className="font-bold text-sm sm:text-base text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <span className="text-xs text-slate-400">
                      ({match.pesertaList.length} Peserta)
                    </span>
                    {hasWinner && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Lolos: {winnerPeserta?.nama}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Di Babak Final, berikan tombol Kunci Juara 1, 2, 3 */}
                    {isFinalMatch && (
                      <button
                        type="button"
                        onClick={() => {
                          const lolosList = match.pesertaList.filter(p => p.statusLolos === 'lolos').map(p => p.peserta);
                          const j1 = lolosList[0] || match.pesertaList[0]?.peserta || null;
                          const j2 = lolosList[1] || match.pesertaList[1]?.peserta || null;
                          const j3 = lolosList[2] || match.pesertaList[2]?.peserta || null;
                          handleLockPodium(j1, j2, j3);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs rounded-lg shadow transition"
                      >
                        <Crown className="w-3.5 h-3.5" /> Kunci Hasil Juara Final
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteMatch(match.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                      title="Hapus Pertandingan Ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Match Table / Cards */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3 w-12 text-center">No</th>
                        <th className="px-4 py-3">Nama {lomba.tipePeserta === 'kelompok' ? 'Tim' : 'Peserta'}</th>
                        <th className="px-4 py-3 w-28 text-center">Skor / Waktu</th>
                        <th className="px-4 py-3 text-center w-56">Status Hasil Pertandingan</th>
                        <th className="px-4 py-3 w-40 text-center">Tentukan Pemenang</th>
                        <th className="px-4 py-3 w-12 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {match.pesertaList.map((p, pIdx) => {
                        const isLolos = p.statusLolos === 'lolos';
                        const isGugur = p.statusLolos === 'gugur';

                        return (
                          <tr 
                            key={p.peserta.id} 
                            className={`transition ${
                              isLolos 
                                ? 'bg-emerald-950/30' 
                                : isGugur 
                                ? 'bg-rose-950/15 opacity-70' 
                                : 'hover:bg-slate-800/40'
                            }`}
                          >
                            <td className="px-4 py-3 text-center font-bold text-slate-400">
                              {pIdx + 1}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`font-bold text-sm block ${isLolos ? 'text-emerald-300' : 'text-white'}`}>
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
                                value={p.skor || ''}
                                onChange={(e) => handleUpdateParticipantSkor(match.id, p.peserta.id, parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-center font-mono font-bold text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatusLolos(match.id, p.peserta.id, isLolos ? 'belum' : 'lolos')}
                                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition ${
                                    isLolos
                                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                                      : 'bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-emerald-400 border border-slate-700'
                                  }`}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  {isLolos ? '👑 Lolos Babak Lanjut' : 'Lolos'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleStatusLolos(match.id, p.peserta.id, isGugur ? 'belum' : 'gugur')}
                                  className={`px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1 transition ${
                                    isGugur
                                      ? 'bg-rose-600 text-white shadow-md'
                                      : 'bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-rose-400 border border-slate-700'
                                  }`}
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  {isGugur ? '❌ Gugur' : 'Gugur'}
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleSetMatchWinner(match.id, p.peserta.id)}
                                className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs rounded-lg shadow transition flex items-center justify-center gap-1 mx-auto"
                                title="Pilih ini sebagai Juara 1 di match ini (otomatis loloskan dan gugurkan yang lain)"
                              >
                                <Award className="w-3.5 h-3.5 text-amber-300" /> Juara Heat Ini
                              </button>
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
                        );
                      })}
                      {match.pesertaList.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-500 text-xs italic">
                            Belum ada peserta di pertandingan ini. Tambahkan peserta di bawah ini:
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bottom: Tambah Peserta ke Match */}
                <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 text-xs flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold">Pilih Peserta untuk Pertandingan Ini:</span>
                    <select
                      onChange={(e) => {
                        handleAddPesertaToMatch(match.id, e.target.value);
                        e.target.value = '';
                      }}
                      defaultValue=""
                      className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="" disabled>+ Tambah Peserta...</option>
                      {pesertaRefs
                        .filter(ref => !match.pesertaList.some(p => p.peserta.id === ref.id))
                        .map(ref => (
                          <option key={ref.id} value={ref.id}>
                            {ref.nama}
                          </option>
                        ))}
                    </select>
                  </div>

                  <span className="text-[11px] text-slate-500">
                    Tips: Klik tombol <strong>&quot;Juara Heat Ini&quot;</strong> untuk meloloskan 1 pemenang secara otomatis.
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: DAFTAR STATUS PESERTA (BELUM, SUDAH, LOLOS, GUGUR) */}
      {activeTab === 'roster_status' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                Daftar & Rekapitulasi Status Peserta
              </h3>
              <p className="text-xs text-slate-400">
                Pantau siapa saja peserta yang belum main, sudah main, lolos ke babak selanjutnya, atau gugur
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-800 p-1 rounded-xl border border-slate-700">
              {[
                { id: 'semua', label: `Semua (${pesertaRefs.length})` },
                { id: 'belum', label: `⏳ Belum Main (${totalBelum})` },
                { id: 'sudah', label: `⚡ Sudah Main (${totalSudah})` },
                { id: 'lolos', label: `🟢 Lolos (${totalLolos})` },
                { id: 'gugur', label: `🔴 Gugur (${totalGugur})` }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterRoster(f.id as typeof filterRoster)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                    filterRoster === f.id
                      ? 'bg-red-600 text-white shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">No</th>
                  <th className="px-4 py-3">Nama {lomba.tipePeserta === 'kelompok' ? 'Tim' : 'Peserta'}</th>
                  <th className="px-4 py-3">Pertandingan / Heat Diikuti</th>
                  <th className="px-4 py-3 w-36 text-center">Status Bermain</th>
                  <th className="px-4 py-3 w-48 text-center">Status Kelolosan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRoster.map((item, idx) => (
                  <tr key={item.peserta.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3.5 text-center font-bold text-slate-500">
                      {idx + 1}
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
                    <td className="px-4 py-3.5 text-slate-300">
                      {item.matchNames.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {item.matchNames.map((mName, mIdx) => (
                            <span key={mIdx} className="px-2 py-0.5 bg-slate-800 rounded text-[11px] border border-slate-700">
                              {mName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Belum dimasukkan ke heat</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                        item.isPlayed 
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {item.isPlayed ? <UserCheck className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {item.isPlayed ? 'Sudah Bermain' : 'Belum Bermain'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {item.status === 'lolos' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Lolos Babak Lanjut 🏆
                        </span>
                      ) : item.status === 'gugur' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 inline-flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Gugur
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700 inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Menunggu Tanding
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredRoster.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500 italic">
                      Tidak ada data peserta untuk filter ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
