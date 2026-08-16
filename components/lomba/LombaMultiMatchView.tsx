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
  UserCheck,
  Award,
  X,
  Flag
} from 'lucide-react';
import { Lomba, HeatRound, MultiMatch, PesertaRef, HasilJuara, StatusPesertaHeat } from '@/types/lomba';
import { convertToPesertaRefs, generateInitialHeatRounds } from '@/lib/bracketUtils';

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

  // Inisialisasi heatRounds (Mendukung migrasi dari multiMatches lama jika ada)
  const heatRounds: HeatRound[] = lomba.heatRounds && lomba.heatRounds.length > 0
    ? lomba.heatRounds
    : lomba.multiMatches && lomba.multiMatches.length > 0
    ? [
        {
          id: `round_1_migrated`,
          nomorBabak: 1,
          namaBabak: 'Babak 1 (Penyisihan)',
          matches: lomba.multiMatches
        }
      ]
    : generateInitialHeatRounds(pesertaRefs);

  // Tab State: Babak Index (0 = Babak 1, 1 = Babak 2, dst) atau 'roster_status'
  const [activeRoundIndex, setActiveRoundIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'matches' | 'roster_status'>('matches');
  const [filterRoster, setFilterRoster] = useState<'semua' | 'belum' | 'sudah' | 'lolos' | 'gugur'>('semua');

  // Modal Draft Final Langsung (Tunjuk Juara 1, 2, 3, 4)
  const [isDraftFinalOpen, setIsDraftFinalOpen] = useState(false);
  const [draftJuara1Id, setDraftJuara1Id] = useState<string>(lomba.hasilJuara?.juara1?.id || '');
  const [draftJuara2Id, setDraftJuara2Id] = useState<string>(lomba.hasilJuara?.juara2?.id || '');
  const [draftJuara3Id, setDraftJuara3Id] = useState<string>(lomba.hasilJuara?.juara3?.id || '');
  const [draftJuaraHarapanId, setDraftJuaraHarapanId] = useState<string>(lomba.hasilJuara?.juaraHarapan?.id || '');

  // Babak Aktif Saat Ini
  const currentRound = heatRounds[activeRoundIndex] || heatRounds[0];

  // =========================================================================
  // HELPER PERHITUNGAN STATUS PESERTA PER BABAK
  // =========================================================================

  // 1. Peserta yang Lolos dari Babak Sebelumnya (Khusus Babak N > 1)
  // Untuk Babak 1, eligible adalah seluruh pesertaRefs
  const getEligibleForRound = (roundIdx: number): PesertaRef[] => {
    if (roundIdx === 0) {
      return pesertaRefs;
    }
    const prevRound = heatRounds[roundIdx - 1];
    if (!prevRound) return [];

    const qualifiedMap = new Map<string, PesertaRef>();
    prevRound.matches.forEach(m => {
      m.pesertaList.forEach(p => {
        if (p.statusLolos === 'lolos') {
          qualifiedMap.set(p.peserta.id, p.peserta);
        }
      });
    });
    return Array.from(qualifiedMap.values());
  };

  const eligibleForCurrentRound = getEligibleForRound(activeRoundIndex);

  // 2. Peserta yang SUDAH MASUK dalam match di Babak Aktif ini
  const participantIdsInCurrentRound = new Set<string>();
  currentRound.matches.forEach(m => {
    m.pesertaList.forEach(p => {
      participantIdsInCurrentRound.add(p.peserta.id);
    });
  });

  // 3. Peserta yang LOLOS dari Babak Aktif ini
  const qualifiedInCurrentRound: PesertaRef[] = [];
  const qualifiedCurrentIdSet = new Set<string>();
  currentRound.matches.forEach(m => {
    m.pesertaList.forEach(p => {
      if (p.statusLolos === 'lolos' && !qualifiedCurrentIdSet.has(p.peserta.id)) {
        qualifiedCurrentIdSet.add(p.peserta.id);
        qualifiedInCurrentRound.push(p.peserta);
      }
    });
  });

  // 4. Kumpulkan Peserta yang Lolos dari Babak Terakhir (Untuk Calon Finalis)
  const lastRound = heatRounds[heatRounds.length - 1];
  const finalistsList: PesertaRef[] = [];
  const finalistIdSet = new Set<string>();
  if (lastRound) {
    lastRound.matches.forEach(m => {
      m.pesertaList.forEach(p => {
        if (p.statusLolos === 'lolos' && !finalistIdSet.has(p.peserta.id)) {
          finalistIdSet.add(p.peserta.id);
          finalistsList.push(p.peserta);
        }
      });
    });
  }

  // =========================================================================
  // HANDLERS PERTANDINGAN
  // =========================================================================

  // Update Rounds
  const updateHeatRounds = (newRounds: HeatRound[]) => {
    onUpdateLomba({
      ...lomba,
      heatRounds: newRounds,
      multiMatches: newRounds[0]?.matches || []
    });
  };

  // Menentukan Pemenang di Match Tertentu (1 Lolos Babak Ini, Sisanya Gugur di Babak Ini)
  const handleSetMatchWinner = (matchId: string, winnerPesertaId: string) => {
    const updatedRounds = heatRounds.map((r, rIdx) => {
      if (rIdx !== activeRoundIndex) return r;
      const updatedMatches = r.matches.map(m => {
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
      return { ...r, matches: updatedMatches };
    });

    updateHeatRounds(updatedRounds);
  };

  // Toggle Lolos / Gugur Manual per peserta
  const handleToggleStatusLolos = (matchId: string, pesertaId: string, status: StatusPesertaHeat) => {
    const updatedRounds = heatRounds.map((r, rIdx) => {
      if (rIdx !== activeRoundIndex) return r;
      const updatedMatches = r.matches.map(m => {
        if (m.id !== matchId) return m;
        const updatedList = m.pesertaList.map(p => {
          if (p.peserta.id !== pesertaId) return p;
          return { ...p, statusLolos: status };
        });
        return { ...m, pesertaList: updatedList };
      });
      return { ...r, matches: updatedMatches };
    });

    updateHeatRounds(updatedRounds);
  };

  // Update skor / waktu
  const handleUpdateParticipantSkor = (matchId: string, pesertaId: string, skor: number) => {
    const updatedRounds = heatRounds.map((r, rIdx) => {
      if (rIdx !== activeRoundIndex) return r;
      const updatedMatches = r.matches.map(m => {
        if (m.id !== matchId) return m;
        const updatedList = m.pesertaList.map(p => {
          if (p.peserta.id !== pesertaId) return p;
          return { ...p, skor };
        });
        return { ...m, pesertaList: updatedList };
      });
      return { ...r, matches: updatedMatches };
    });

    updateHeatRounds(updatedRounds);
  };

  // Tambah Match / Heat Baru di Babak Aktif
  const handleAddMatch = () => {
    const nextNum = currentRound.matches.length + 1;
    const letter = String.fromCharCode(64 + nextNum);
    const newMatch: MultiMatch = {
      id: `match_b${activeRoundIndex + 1}_${Date.now()}_${nextNum}`,
      namaMatch: `Pertandingan ${nextNum} (Heat ${letter})`,
      babak: currentRound.namaBabak,
      status: 'pending',
      pesertaList: []
    };

    const updatedRounds = heatRounds.map((r, rIdx) => {
      if (rIdx !== activeRoundIndex) return r;
      return { ...r, matches: [...r.matches, newMatch] };
    });

    updateHeatRounds(updatedRounds);
  };

  // Hapus Match
  const handleDeleteMatch = (matchId: string) => {
    if (currentRound.matches.length <= 1) {
      alert('Minimal harus ada 1 pertandingan dalam babak ini!');
      return;
    }
    if (confirm('Hapus sesi pertandingan ini?')) {
      const updatedRounds = heatRounds.map((r, rIdx) => {
        if (rIdx !== activeRoundIndex) return r;
        return { ...r, matches: r.matches.filter(m => m.id !== matchId) };
      });
      updateHeatRounds(updatedRounds);
    }
  };

  // Tambah Peserta ke Match Tertentu di Babak Ini
  // (ATURAN KETAT: Peserta yang sudah masuk di match lain di babak ini TIDAK BISA dimasukkan lagi)
  const handleAddPesertaToMatch = (matchId: string, pesertaId: string) => {
    if (!pesertaId) return;

    // Cek apakah peserta sudah ada di match lain dalam babak ini
    if (participantIdsInCurrentRound.has(pesertaId)) {
      alert('Peserta ini sudah terdaftar di pertandingan lain dalam babak ini!');
      return;
    }

    const targetRef = eligibleForCurrentRound.find(p => p.id === pesertaId);
    if (!targetRef) return;

    const updatedRounds = heatRounds.map((r, rIdx) => {
      if (rIdx !== activeRoundIndex) return r;
      const updatedMatches = r.matches.map(m => {
        if (m.id !== matchId) return m;
        return {
          ...m,
          pesertaList: [
            ...m.pesertaList,
            { peserta: targetRef, skor: 0, statusLolos: 'belum' as const }
          ]
        };
      });
      return { ...r, matches: updatedMatches };
    });

    updateHeatRounds(updatedRounds);
  };

  // Hapus Peserta dari Match
  const handleRemovePesertaFromMatch = (matchId: string, pesertaId: string) => {
    const updatedRounds = heatRounds.map((r, rIdx) => {
      if (rIdx !== activeRoundIndex) return r;
      const updatedMatches = r.matches.map(m => {
        if (m.id !== matchId) return m;
        return {
          ...m,
          pesertaList: m.pesertaList.filter(p => p.peserta.id !== pesertaId)
        };
      });
      return { ...r, matches: updatedMatches };
    });

    updateHeatRounds(updatedRounds);
  };

  // =========================================================================
  // HANDLER BUAT BABAK BARU (BABAK 2, BABAK 3, DST.)
  // =========================================================================

  const handleCreateNextBabak = () => {
    // Cek peserta yang lolos dari babak aktif
    if (qualifiedInCurrentRound.length < 2) {
      alert(`Minimal butuh 2 peserta yang Lolos dari ${currentRound.namaBabak} untuk membuat babak selanjutnya! Tentukan pemenang heat terlebih dahulu.`);
      return;
    }

    const nextBabakNum = heatRounds.length + 1;
    const nextBabakName = `Babak ${nextBabakNum} (${qualifiedInCurrentRound.length} Peserta Lolos)`;

    // Bagi peserta lolos ke dalam heat awal di babak baru (misal heat isi 3-4)
    const groupSize = qualifiedInCurrentRound.length <= 4 ? qualifiedInCurrentRound.length : 4;
    const totalHeats = Math.ceil(qualifiedInCurrentRound.length / groupSize);
    const newMatches: MultiMatch[] = [];

    for (let i = 0; i < totalHeats; i++) {
      const chunk = qualifiedInCurrentRound.slice(i * groupSize, (i + 1) * groupSize);
      const letter = String.fromCharCode(65 + i);
      newMatches.push({
        id: `match_b${nextBabakNum}_${Date.now()}_${i + 1}`,
        namaMatch: `Pertandingan ${i + 1} (Heat ${letter})`,
        babak: nextBabakName,
        status: 'pending',
        pesertaList: chunk.map(p => ({
          peserta: p,
          skor: 0,
          statusLolos: 'belum'
        }))
      });
    }

    const newRound: HeatRound = {
      id: `round_${nextBabakNum}_${Date.now()}`,
      nomorBabak: nextBabakNum,
      namaBabak: nextBabakName,
      matches: newMatches
    };

    const updatedRounds = [...heatRounds, newRound];
    updateHeatRounds(updatedRounds);
    setActiveRoundIndex(updatedRounds.length - 1);
    setActiveTab('matches');

    alert(`Berhasil membuka ${nextBabakName}! ${qualifiedInCurrentRound.length} peserta yang lolos telah siap bertanding.`);
  };

  // Hapus Babak Terakhir
  const handleDeleteLastBabak = () => {
    if (heatRounds.length <= 1) {
      alert('Tidak bisa menghapus Babak 1!');
      return;
    }
    if (confirm(`Hapus ${heatRounds[heatRounds.length - 1].namaBabak}?`)) {
      const updated = heatRounds.slice(0, heatRounds.length - 1);
      updateHeatRounds(updated);
      setActiveRoundIndex(updated.length - 1);
    }
  };

  // =========================================================================
  // REKAP STATUS PESERTA (ROSTER MONITOR)
  // =========================================================================

  const participantsStatusList = pesertaRefs.map(p => {
    let highestRoundPlayed = 0;
    let highestRoundQualified = 0;
    let isEliminated = false;
    let eliminatedInRound = 0;
    let matchHistory: string[] = [];

    heatRounds.forEach(r => {
      r.matches.forEach(m => {
        const matchP = m.pesertaList.find(x => x.peserta.id === p.id);
        if (matchP) {
          matchHistory.push(`${r.namaBabak} - ${m.namaMatch}`);
          if (m.status === 'completed' || matchP.statusLolos === 'lolos' || matchP.statusLolos === 'gugur') {
            highestRoundPlayed = Math.max(highestRoundPlayed, r.nomorBabak);
          }
          if (matchP.statusLolos === 'lolos') {
            highestRoundQualified = Math.max(highestRoundQualified, r.nomorBabak);
          } else if (matchP.statusLolos === 'gugur') {
            isEliminated = true;
            eliminatedInRound = r.nomorBabak;
          }
        }
      });
    });

    // Hitung status di babak aktif
    const playedInActiveRound = currentRound.matches.some(m => m.pesertaList.some(x => x.peserta.id === p.id));
    const isEligibleInActiveRound = eligibleForCurrentRound.some(x => x.id === p.id);

    return {
      peserta: p,
      isEligibleInActiveRound,
      playedInActiveRound,
      highestRoundPlayed,
      highestRoundQualified,
      isEliminated,
      eliminatedInRound,
      matchHistory
    };
  });

  const totalBelumInActive = participantsStatusList.filter(x => x.isEligibleInActiveRound && !x.playedInActiveRound).length;
  const totalSudahInActive = participantsStatusList.filter(x => x.playedInActiveRound).length;
  const totalLolosInActive = qualifiedInCurrentRound.length;
  const totalGugurAll = participantsStatusList.filter(x => x.isEliminated).length;

  // Filter Roster List
  const filteredRoster = participantsStatusList.filter(x => {
    if (filterRoster === 'belum') return x.isEligibleInActiveRound && !x.playedInActiveRound;
    if (filterRoster === 'sudah') return x.playedInActiveRound;
    if (filterRoster === 'lolos') return qualifiedCurrentIdSet.has(x.peserta.id);
    if (filterRoster === 'gugur') return x.isEliminated;
    return true;
  });

  // =========================================================================
  // DRAFT PENENTUAN FINAL & PODIUM JUARA (JUARA 1, 2, 3, 4)
  // =========================================================================

  const handleOpenDraftFinal = () => {
    const candidates = finalistsList.length > 0 ? finalistsList : qualifiedInCurrentRound.length > 0 ? qualifiedInCurrentRound : pesertaRefs;
    if (!draftJuara1Id && candidates[0]) setDraftJuara1Id(candidates[0].id);
    if (!draftJuara2Id && candidates[1]) setDraftJuara2Id(candidates[1].id);
    if (!draftJuara3Id && candidates[2]) setDraftJuara3Id(candidates[2].id);
    if (!draftJuaraHarapanId && candidates[3]) setDraftJuaraHarapanId(candidates[3].id);
    setIsDraftFinalOpen(true);
  };

  const handleSaveDraftFinal = (e: React.FormEvent) => {
    e.preventDefault();

    if (!draftJuara1Id) {
      alert('Silakan pilih peserta untuk Juara 1!');
      return;
    }

    const j1 = pesertaRefs.find(p => p.id === draftJuara1Id) || null;
    const j2 = pesertaRefs.find(p => p.id === draftJuara2Id) || null;
    const j3 = pesertaRefs.find(p => p.id === draftJuara3Id) || null;
    const j4 = pesertaRefs.find(p => p.id === draftJuaraHarapanId) || null;

    const hasilJuara: HasilJuara = {
      juara1: j1,
      juara2: j2,
      juara3: j3,
      juaraHarapan: j4
    };

    onUpdateLomba({
      ...lomba,
      status: 'selesai',
      hasilJuara
    });

    setIsDraftFinalOpen(false);
    onFinishLomba();
  };

  // Reset Semua
  const handleResetAll = () => {
    if (confirm('Reset seluruh babak pertandingan dan status peserta kembali ke Babak 1?')) {
      const freshRounds = generateInitialHeatRounds(pesertaRefs);
      onUpdateLomba({
        ...lomba,
        status: 'draft',
        heatRounds: freshRounds,
        multiMatches: freshRounds[0]?.matches || [],
        hasilJuara: { juara1: null, juara2: null, juara3: null, juaraHarapan: null }
      });
      setActiveRoundIndex(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. ROOM / BABAK SELECTOR BAR (BABAK 1, BABAK 2, BABAK 3...) */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs font-black uppercase text-slate-400 flex items-center gap-1.5 shrink-0 mr-1">
            <Flag className="w-4 h-4 text-red-500" /> Pilih Babak:
          </span>

          {heatRounds.map((round, rIdx) => {
            const isCurrentActive = activeRoundIndex === rIdx && activeTab === 'matches';
            return (
              <button
                key={round.id || rIdx}
                type="button"
                onClick={() => {
                  setActiveRoundIndex(rIdx);
                  setActiveTab('matches');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
                  isCurrentActive
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 border border-slate-700'
                }`}
              >
                <span>🚩 {round.namaBabak}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/30 text-slate-200">
                  {round.matches.length} Heat
                </span>
              </button>
            );
          })}

          {/* Tombol Buat Babak Selanjutnya (Hanya aktif jika sudah ada yang lolos) */}
          <button
            type="button"
            onClick={handleCreateNextBabak}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition whitespace-nowrap shrink-0"
            title="Buka babak selanjutnya khusus untuk peserta yang lolos dari babak ini"
          >
            <Plus className="w-4 h-4" /> Buka Babak {heatRounds.length + 1} ({qualifiedInCurrentRound.length} Lolos)
          </button>

          {heatRounds.length > 1 && (
            <button
              type="button"
              onClick={handleDeleteLastBabak}
              className="p-2 text-slate-500 hover:text-red-400 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
              title="Hapus Babak Terakhir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tombol Draft Penentuan Juara Final (Juara 1, 2, 3, 4) */}
        <button
          type="button"
          onClick={handleOpenDraftFinal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 transition shrink-0"
        >
          <Crown className="w-4 h-4 text-slate-950" /> Draft Penentuan Juara Final 🏆
        </button>
      </div>

      {/* 2. RINGKASAN STATUS PESERTA DI BABAK AKTIF */}
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
              <Clock className="w-3.5 h-3.5" /> Belum Main di Babak Ini
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
              {totalBelumInActive}
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
            {totalBelumInActive} {lomba.tipePeserta === 'kelompok' ? 'Tim' : 'Orang'}
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
              <UserCheck className="w-3.5 h-3.5" /> Sudah Main di Babak Ini
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
              {totalSudahInActive}
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
            {totalSudahInActive} {lomba.tipePeserta === 'kelompok' ? 'Tim' : 'Orang'}
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
              <CheckCircle2 className="w-3.5 h-3.5" /> Lolos dari Babak Ini
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
              {totalLolosInActive}
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 block">
            {totalLolosInActive} {lomba.tipePeserta === 'kelompok' ? 'Tim' : 'Orang'}
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
              <XCircle className="w-3.5 h-3.5" /> Gugur (Total)
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
              {totalGugurAll}
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-rose-400 mt-1 block">
            {totalGugurAll} {lomba.tipePeserta === 'kelompok' ? 'Tim' : 'Orang'}
          </span>
        </button>
      </div>

      {/* 3. SUB-HEADER BABAK & TAB TOGGLE */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-850 p-4 rounded-2xl border border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-500/20 text-red-400 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
              {currentRound.namaBabak} — ({eligibleForCurrentRound.length} Peserta Berhak Main)
            </h3>
            <p className="text-xs text-slate-400">
              Peserta yang lolos atau sudah masuk di suatu pertandingan tidak akan muncul lagi di pertandingan lain dalam babak ini
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
              Daftar Heat ({currentRound.matches.length})
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
              <Users className="w-3.5 h-3.5" /> Monitor Status ({pesertaRefs.length})
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddMatch}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl transition shadow"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Heat
          </button>

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

      {/* VIEW 1: MATCHES LIST DI BABAK AKTIF */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
          {currentRound.matches.map((match, mIdx) => {
            const hasWinner = match.pesertaList.some(p => p.statusLolos === 'lolos');
            const winnerPeserta = match.pesertaList.find(p => p.statusLolos === 'lolos')?.peserta;

            // FILTER KETAT PESERTA YANG BISA DIPILIH UNTUK HEAT INI:
            // 1. Berhak main di babak ini (eligibleForCurrentRound)
            // 2. BELUM MASUK di pertandingan mana pun dalam babak ini (!participantIdsInCurrentRound)
            const availableForThisHeat = eligibleForCurrentRound.filter(ref => 
              !participantIdsInCurrentRound.has(ref.id) &&
              !match.pesertaList.some(p => p.peserta.id === ref.id)
            );

            return (
              <div 
                key={match.id}
                className={`bg-slate-900 border rounded-2xl overflow-hidden shadow-xl transition ${
                  hasWinner ? 'border-emerald-500/40' : 'border-slate-800'
                }`}
              >
                {/* Match Header */}
                <div className="p-4 bg-slate-850 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center bg-red-500/20 text-red-400">
                      {mIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={match.namaMatch}
                      onChange={(e) => {
                        const updatedRounds = heatRounds.map((r, rIdx) => {
                          if (rIdx !== activeRoundIndex) return r;
                          const updatedMatches = r.matches.map(m => m.id === match.id ? { ...m, namaMatch: e.target.value } : m);
                          return { ...r, matches: updatedMatches };
                        });
                        updateHeatRounds(updatedRounds);
                      }}
                      className="font-bold text-sm sm:text-base text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <span className="text-xs text-slate-400">
                      ({match.pesertaList.length} Peserta)
                    </span>
                    {hasWinner && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Lolos {currentRound.namaBabak}: {winnerPeserta?.nama}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteMatch(match.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                    title="Hapus Pertandingan Ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Match Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3 w-12 text-center">No</th>
                        <th className="px-4 py-3">Nama {lomba.tipePeserta === 'kelompok' ? 'Tim' : 'Peserta'}</th>
                        <th className="px-4 py-3 w-28 text-center">Skor / Waktu</th>
                        <th className="px-4 py-3 text-center w-56">Status Hasil Babak Ini</th>
                        <th className="px-4 py-3 w-44 text-center">Tentukan Pemenang</th>
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
                                  {isLolos ? `👑 Lolos Babak ${activeRoundIndex + 1}` : 'Lolos'}
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
                                title="Pilih ini sebagai Juara Heat (otomatis loloskan dan gugurkan yang lain di match ini)"
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
                            Belum ada peserta di pertandingan ini. Tambahkan peserta yang belum main di bawah ini:
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bottom: Tambah Peserta ke Match (FILTERED: HANYA YANG BELUM MASUK DI BABAK INI) */}
                <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 text-xs flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold">
                      Tambah Peserta (Sisa {availableForThisHeat.length} yang belum main di {currentRound.namaBabak}):
                    </span>
                    <select
                      onChange={(e) => {
                        handleAddPesertaToMatch(match.id, e.target.value);
                        e.target.value = '';
                      }}
                      defaultValue=""
                      className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="" disabled>+ Pilih Peserta Belum Main...</option>
                      {availableForThisHeat.map(ref => (
                        <option key={ref.id} value={ref.id}>
                          {ref.nama}
                        </option>
                      ))}
                    </select>
                    {availableForThisHeat.length === 0 && (
                      <span className="text-[11px] text-emerald-400 font-medium">
                        ✓ Semua peserta berhak main sudah terbagi ke dalam heat!
                      </span>
                    )}
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

      {/* VIEW 2: DAFTAR STATUS PESERTA BERDASARKAN BABAK */}
      {activeTab === 'roster_status' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                Monitor Rekapitulasi Status Peserta ({currentRound.namaBabak})
              </h3>
              <p className="text-xs text-slate-400">
                Pantau progres siapa saja peserta yang belum main di babak ini, lolos, atau gugur
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-800 p-1 rounded-xl border border-slate-700">
              {[
                { id: 'semua', label: `Semua (${pesertaRefs.length})` },
                { id: 'belum', label: `⏳ Belum Main Babak Ini (${totalBelumInActive})` },
                { id: 'sudah', label: `⚡ Sudah Main Babak Ini (${totalSudahInActive})` },
                { id: 'lolos', label: `🟢 Lolos Babak Ini (${totalLolosInActive})` },
                { id: 'gugur', label: `🔴 Gugur (${totalGugurAll})` }
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
                  <th className="px-4 py-3">Riwayat Pertandingan / Heat</th>
                  <th className="px-4 py-3 w-40 text-center">Status Babak Aktif</th>
                  <th className="px-4 py-3 w-52 text-center">Status Kelolosan Terakhir</th>
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
                      {item.matchHistory.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {item.matchHistory.map((mName, mIdx) => (
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
                      {item.isEligibleInActiveRound ? (
                        item.playedInActiveRound ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 inline-flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5" /> Sudah Bermain
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Belum Masuk Heat
                          </span>
                        )
                      ) : item.isEliminated ? (
                        <span className="text-rose-400 font-semibold text-xs">Gugur di Babak {item.eliminatedInRound}</span>
                      ) : (
                        <span className="text-slate-500 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {item.highestRoundQualified > 0 ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Lolos Babak {item.highestRoundQualified} 👑
                        </span>
                      ) : item.isEliminated ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 inline-flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Gugur di Babak {item.eliminatedInRound}
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

      {/* MODAL DRAFT PENENTUAN JUARA FINAL (JUARA 1, 2, 3, 4) */}
      {isDraftFinalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl text-white overflow-hidden my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-slate-950 border-b border-amber-400/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-950/20 rounded-xl">
                  <Crown className="w-6 h-6 text-slate-950" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">
                    Draft Penentuan Juara Final
                  </h3>
                  <p className="text-xs font-semibold text-slate-900/80">
                    Tunjuk langsung Juara 1, 2, 3, dan 4 untuk diterbitkan ke Podium
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDraftFinalOpen(false)}
                className="p-1.5 text-slate-950/80 hover:text-slate-950 bg-black/10 hover:bg-black/20 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveDraftFinal} className="p-6 space-y-5">
              {/* Info Peserta Finalis yang Lolos */}
              {finalistsList.length > 0 && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                  <span className="text-xs font-bold text-emerald-400 block mb-1">
                    👑 Peserta Finalis yang Lolos dari Babak Terakhir ({finalistsList.length} Peserta):
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {finalistsList.map(qp => (
                      <span key={qp.id} className="px-2.5 py-1 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-xs font-bold text-emerald-300">
                        {qp.nama}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Juara 1 (Emas) */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-amber-400">
                  🥇 JUARA 1 (EMAS / PERTAMA) <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={draftJuara1Id}
                  onChange={(e) => setDraftJuara1Id(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-amber-500/50 rounded-xl text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">-- Pilih Juara 1 --</option>
                  {pesertaRefs.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nama} {finalistIdSet.has(p.id) ? ' (👑 Finalis)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Form Juara 2 (Perak) */}
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                  🥈 JUARA 2 (PERAK / RUNNER UP)
                </label>
                <select
                  value={draftJuara2Id}
                  onChange={(e) => setDraftJuara2Id(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">-- Pilih Juara 2 (Opsional) --</option>
                  {pesertaRefs.filter(p => p.id !== draftJuara1Id).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nama} {finalistIdSet.has(p.id) ? ' (👑 Finalis)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Form Juara 3 (Perunggu) */}
              <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-2xl space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-amber-600">
                  🥉 JUARA 3 (PERUNGGU)
                </label>
                <select
                  value={draftJuara3Id}
                  onChange={(e) => setDraftJuara3Id(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-amber-800/50 rounded-xl text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">-- Pilih Juara 3 (Opsional) --</option>
                  {pesertaRefs.filter(p => p.id !== draftJuara1Id && p.id !== draftJuara2Id).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nama} {finalistIdSet.has(p.id) ? ' (👑 Finalis)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Form Juara 4 (Harapan) */}
              <div className="p-4 bg-purple-950/20 border border-purple-800/40 rounded-2xl space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-purple-400">
                  🎖️ JUARA 4 (HARAPAN)
                </label>
                <select
                  value={draftJuaraHarapanId}
                  onChange={(e) => setDraftJuaraHarapanId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-purple-800/50 rounded-xl text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Pilih Juara 4 / Harapan (Opsional) --</option>
                  {pesertaRefs.filter(p => p.id !== draftJuara1Id && p.id !== draftJuara2Id && p.id !== draftJuara3Id).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nama} {finalistIdSet.has(p.id) ? ' (👑 Finalis)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDraftFinalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition"
                >
                  <Sparkles className="w-4 h-4" /> Kunci & Terbitkan ke Podium
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
