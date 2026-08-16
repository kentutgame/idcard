'use client';

import React, { useState } from 'react';
import { 
  Trophy, 
  Swords, 
  RotateCcw, 
  Shuffle, 
  Crown, 
  Users, 
  Info,
  GripVertical,
  ArrowLeftRight,
  Move,
  Check
} from 'lucide-react';
import { Match, PesertaRef, Lomba } from '@/types/lomba';
import { 
  updateMatchWinner, 
  generateSingleEliminationBracket, 
  convertToPesertaRefs,
  swapBracketSlots 
} from '@/lib/bracketUtils';

interface LombaBracketViewProps {
  lomba: Lomba;
  onUpdateLomba: (updated: Lomba) => void;
  onFinishLomba: () => void;
}

interface DraggedSlotInfo {
  matchId: string;
  slot: 'A' | 'B';
  roundIndex: number;
  peserta: PesertaRef | null;
}

export const LombaBracketView: React.FC<LombaBracketViewProps> = ({
  lomba,
  onUpdateLomba,
  onFinishLomba
}) => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [skorA, setSkorA] = useState<number>(0);
  const [skorB, setSkorB] = useState<number>(0);
  const [catatan, setCatatan] = useState<string>('');

  // Drag & Drop State
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [draggedSlot, setDraggedSlot] = useState<DraggedSlotInfo | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{ matchId: string; slot: 'A' | 'B' } | null>(null);
  const [swapToast, setSwapToast] = useState<string | null>(null);

  // Manual Swap Modal State
  const [manualSwapSource, setManualSwapSource] = useState<{ matchId: string; slot: 'A' | 'B'; peserta: PesertaRef } | null>(null);

  const rounds = lomba.rounds || [];

  const showToast = (msg: string) => {
    setSwapToast(msg);
    setTimeout(() => setSwapToast(null), 3000);
  };

  // Handler Shuffle Peserta di Babak 1 jika masih awal
  const handleShuffle = () => {
    if (confirm('Acak susunan bagan pertandingan dari awal?')) {
      const pesertaRefs = convertToPesertaRefs(lomba.tipePeserta, lomba.daftarTim, lomba.pesertaIndividu);
      const shuffled = [...pesertaRefs].sort(() => Math.random() - 0.5);
      const newRounds = generateSingleEliminationBracket(shuffled);
      
      onUpdateLomba({
        ...lomba,
        status: 'berlangsung',
        rounds: newRounds,
        hasilJuara: { juara1: null, juara2: null, juara3: null }
      });
      showToast('Bagan berhasil diacak ulang!');
    }
  };

  // DRAG AND DROP HANDLERS
  const handleDragStart = (
    e: React.DragEvent,
    matchId: string,
    slot: 'A' | 'B',
    roundIndex: number,
    peserta: PesertaRef | null
  ) => {
    if (!peserta) return;
    setDraggedSlot({ matchId, slot, roundIndex, peserta });
    e.dataTransfer.setData('text/plain', JSON.stringify({ matchId, slot }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, matchId: string, slot: 'A' | 'B') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOverTarget || dragOverTarget.matchId !== matchId || dragOverTarget.slot !== slot) {
      setDragOverTarget({ matchId, slot });
    }
  };

  const handleDragLeave = () => {
    setDragOverTarget(null);
  };

  const handleDrop = (
    e: React.DragEvent,
    targetMatchId: string,
    targetSlot: 'A' | 'B'
  ) => {
    e.preventDefault();
    setDragOverTarget(null);

    if (!draggedSlot) return;

    // Cegah drop pada slot yang sama persis
    if (draggedSlot.matchId === targetMatchId && draggedSlot.slot === targetSlot) {
      setDraggedSlot(null);
      return;
    }

    // Lakukan Swap
    const updatedRounds = swapBracketSlots(
      lomba.rounds,
      draggedSlot.matchId,
      draggedSlot.slot,
      targetMatchId,
      targetSlot
    );

    const updatedLomba: Lomba = {
      ...lomba,
      rounds: updatedRounds
    };

    onUpdateLomba(updatedLomba);
    showToast(`Berhasil menukar posisi bagan!`);
    setDraggedSlot(null);
  };

  // Handler Manual Swap via Modal/Klik
  const handlePerformManualSwap = (targetMatchId: string, targetSlot: 'A' | 'B') => {
    if (!manualSwapSource) return;

    const updatedRounds = swapBracketSlots(
      lomba.rounds,
      manualSwapSource.matchId,
      manualSwapSource.slot,
      targetMatchId,
      targetSlot
    );

    onUpdateLomba({
      ...lomba,
      rounds: updatedRounds
    });

    showToast(`Posisi bagan ${manualSwapSource.peserta.nama} berhasil dipindahkan!`);
    setManualSwapSource(null);
  };

  // Buka modal scoring untuk match
  const handleOpenScoreModal = (match: Match) => {
    if (!match.pesertaA && !match.pesertaB) return;
    setSelectedMatch(match);
    setSkorA(match.skorA || 0);
    setSkorB(match.skorB || 0);
    setCatatan(match.catatan || '');
  };

  // Pilih pemenang langsung
  const handleSetWinner = (match: Match, winner: PesertaRef) => {
    const updatedRounds = updateMatchWinner(
      lomba.rounds,
      match.id,
      winner.id,
      match.skorA,
      match.skorB,
      match.catatan
    );

    const isFinalRound = match.roundIndex === lomba.rounds.length - 1;
    let newHasilJuara = { ...lomba.hasilJuara };

    if (isFinalRound) {
      const runnerUp = match.pesertaA?.id === winner.id ? match.pesertaB : match.pesertaA;
      newHasilJuara = {
        ...newHasilJuara,
        juara1: winner,
        juara2: runnerUp || null
      };
    }

    const updatedLomba: Lomba = {
      ...lomba,
      status: isFinalRound ? 'selesai' : 'berlangsung',
      rounds: updatedRounds,
      hasilJuara: newHasilJuara
    };

    onUpdateLomba(updatedLomba);
    if (isFinalRound) {
      onFinishLomba();
    }
  };

  // Simpan skor dari modal
  const handleSaveScoreModal = (winnerId: string | null) => {
    if (!selectedMatch) return;

    const updatedRounds = updateMatchWinner(
      lomba.rounds,
      selectedMatch.id,
      winnerId,
      skorA,
      skorB,
      catatan
    );

    const isFinalRound = selectedMatch.roundIndex === lomba.rounds.length - 1;
    let newHasilJuara = { ...lomba.hasilJuara };

    if (isFinalRound && winnerId) {
      const winner = selectedMatch.pesertaA?.id === winnerId ? selectedMatch.pesertaA : selectedMatch.pesertaB;
      const runnerUp = selectedMatch.pesertaA?.id === winnerId ? selectedMatch.pesertaB : selectedMatch.pesertaA;
      newHasilJuara = {
        ...newHasilJuara,
        juara1: winner || null,
        juara2: runnerUp || null
      };
    }

    const updatedLomba: Lomba = {
      ...lomba,
      status: isFinalRound && winnerId ? 'selesai' : 'berlangsung',
      rounds: updatedRounds,
      hasilJuara: newHasilJuara
    };

    onUpdateLomba(updatedLomba);
    setSelectedMatch(null);

    if (isFinalRound && winnerId) {
      onFinishLomba();
    }
  };

  // Reset keseluruhan turnamen
  const handleResetBracket = () => {
    if (confirm('Reset semua skor dan hasil pertandingan turnamen ini ke awal?')) {
      const pesertaRefs = convertToPesertaRefs(lomba.tipePeserta, lomba.daftarTim, lomba.pesertaIndividu);
      const newRounds = generateSingleEliminationBracket(pesertaRefs);
      onUpdateLomba({
        ...lomba,
        status: 'draft',
        rounds: newRounds,
        hasilJuara: { juara1: null, juara2: null, juara3: null }
      });
      showToast('Bagan berhasil direset!');
    }
  };

  if (rounds.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-800/50 border border-slate-700 rounded-2xl">
        <Info className="w-10 h-10 text-amber-400 mx-auto mb-2" />
        <h4 className="text-base font-bold text-white">Bagan Pertandingan Belum Dibuat</h4>
        <p className="text-xs text-slate-400 mt-1">
          Tambahkan minimal 2 peserta atau tim untuk mengaktifkan bagan turnamen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Floating Toast Notification */}
      {swapToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce border border-emerald-400">
          <Check className="w-4 h-4" />
          <span>{swapToast}</span>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-500/20 text-red-400 rounded-lg">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
              Bagan Turnamen Eliminasi ({rounds.length} Babak)
              {isEditMode && (
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Mode Drag / Edit Bagan Aktif 🔀
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              {isEditMode 
                ? 'Tahan dan geser (drag & drop) kotak tim/peserta untuk menukar lawan atau klik tombol tukar lawan'
                : 'Klik pemenang untuk meloloskan ke babak selanjutnya, atau aktifkan mode drag untuk mengubah susunan lawan'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Toggle Button */}
          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
              isEditMode 
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                : 'bg-slate-700 hover:bg-slate-600 text-amber-300 border-slate-600'
            }`}
          >
            <Move className="w-3.5 h-3.5" />
            {isEditMode ? 'Selesai Edit Bagan' : 'Kustomisasi / Drag Bagan'}
          </button>

          <button
            type="button"
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition"
            title="Acak bagan pertandingan babak pertama"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-400" /> Acak Posisi
          </button>
          <button
            type="button"
            onClick={handleResetBracket}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-red-300 text-xs font-semibold rounded-lg transition"
            title="Reset semua skor"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Bagan
          </button>
        </div>
      </div>

      {/* Info Tip Banner */}
      <div className="p-3 bg-slate-900/90 border border-red-500/20 rounded-xl flex items-center justify-between text-xs text-slate-300 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-base">💡</span>
          <span>
            <strong>Tips Panitia:</strong> Anda bisa <strong>men-drag (geser & lepas)</strong> kartu nama tim antar slot untuk menukar lawan jika terjadi salah bagan, atau klik ikon <strong>⇄</strong> di samping nama.
          </span>
        </div>
        {!isEditMode && (
          <button
            type="button"
            onClick={() => setIsEditMode(true)}
            className="text-xs font-bold text-amber-400 hover:underline shrink-0"
          >
            Aktifkan Drag →
          </button>
        )}
      </div>

      {/* Mobile Swipe Hint */}
      <div className="sm:hidden flex items-center justify-center gap-1.5 text-[11px] text-amber-300 font-semibold py-2 px-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
        <span>👉 Geser (swipe) layar ke samping untuk melihat babak selanjutnya</span>
      </div>

      {/* Bracket Visualizer (Horizontal Scrollable Tree) */}
      <div className="overflow-x-auto pb-6 scroll-smooth touch-pan-x">
        <div className="inline-flex gap-4 sm:gap-8 min-w-full p-1 sm:p-2 items-stretch">
          {rounds.map((round, rIdx) => {
            const isFinal = rIdx === rounds.length - 1;
            const isSemi = rIdx === rounds.length - 2;

            return (
              <div 
                key={rIdx} 
                className="flex-1 min-w-[260px] sm:min-w-[300px] max-w-[340px] flex flex-col space-y-4"
              >
                {/* Header Round */}
                <div className={`p-2.5 rounded-xl border text-center font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 ${
                  isFinal 
                    ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/10'
                    : isSemi
                    ? 'bg-red-500/15 border-red-500/40 text-red-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}>
                  {isFinal && <Crown className="w-4 h-4 text-amber-400" />}
                  <span>{round.nama}</span>
                </div>

                {/* Match Cards */}
                <div className="flex-1 flex flex-col justify-around gap-6">
                  {round.matches.map((match, mIdx) => {
                    const isCompleted = match.status === 'completed' && match.pemenangId !== null;
                    const winnerIsA = match.pemenangId === match.pesertaA?.id;
                    const winnerIsB = match.pemenangId === match.pesertaB?.id;

                    const isDragOverSlotA = dragOverTarget?.matchId === match.id && dragOverTarget.slot === 'A';
                    const isDragOverSlotB = dragOverTarget?.matchId === match.id && dragOverTarget.slot === 'B';

                    const isBeingDraggedA = draggedSlot?.matchId === match.id && draggedSlot.slot === 'A';
                    const isBeingDraggedB = draggedSlot?.matchId === match.id && draggedSlot.slot === 'B';

                    return (
                      <div
                        key={match.id || mIdx}
                        className={`relative rounded-xl border transition duration-200 overflow-hidden shadow-lg ${
                          isFinal
                            ? 'bg-slate-850 border-amber-500/40 hover:border-amber-400 ring-1 ring-amber-500/20'
                            : 'bg-slate-850 border-slate-700/90 hover:border-red-500/60'
                        }`}
                      >
                        {/* Match Title Bar */}
                        <div className="px-3 py-1.5 bg-slate-800/90 border-b border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-300">{match.namaBabak}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isCompleted
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : match.status === 'ongoing'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-slate-700 text-slate-400'
                          }`}>
                            {isCompleted ? 'Selesai' : match.status === 'ongoing' ? 'Tanding' : 'Menunggu'}
                          </span>
                        </div>

                        {/* Peserta Slot A */}
                        <div 
                          draggable={Boolean(match.pesertaA)}
                          onDragStart={(e) => handleDragStart(e, match.id, 'A', rIdx, match.pesertaA)}
                          onDragOver={(e) => handleDragOver(e, match.id, 'A')}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, match.id, 'A')}
                          className={`p-3 border-b border-slate-700/50 flex items-center justify-between gap-2 transition select-none ${
                            isDragOverSlotA 
                              ? 'bg-amber-500/30 border-2 border-dashed border-amber-400 scale-[1.02]' 
                              : isBeingDraggedA
                              ? 'opacity-40 border-2 border-dashed border-slate-500'
                              : winnerIsA 
                              ? 'bg-emerald-950/40 text-emerald-300 font-bold' 
                              : isCompleted 
                              ? 'opacity-60 bg-slate-900/30' 
                              : 'bg-slate-900/50'
                          } ${match.pesertaA ? 'cursor-grab active:cursor-grabbing hover:bg-slate-800/80' : ''}`}
                        >
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            {match.pesertaA && (
                              <GripVertical className="w-3.5 h-3.5 text-slate-500 hover:text-amber-400 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                {winnerIsA && <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                                <span className="text-xs truncate block font-medium">
                                  {match.pesertaA ? match.pesertaA.nama : '(Slot Kosong)'}
                                </span>
                              </div>
                              {match.pesertaA?.detailAnggota && match.pesertaA.detailAnggota.length > 0 && (
                                <p className="text-[10px] text-slate-400 truncate mt-0.5 flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {match.pesertaA.detailAnggota.join(', ')}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Tombol Swap Cepat */}
                            {match.pesertaA && (
                              <button
                                type="button"
                                onClick={() => setManualSwapSource({ matchId: match.id, slot: 'A', peserta: match.pesertaA! })}
                                className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition"
                                title="Tukar posisi dengan tim lain"
                              >
                                <ArrowLeftRight className="w-3 h-3" />
                              </button>
                            )}

                            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-white">
                              {match.skorA || 0}
                            </span>

                            {match.pesertaA && match.pesertaB && !isEditMode && (
                              <button
                                type="button"
                                onClick={() => handleSetWinner(match, match.pesertaA!)}
                                className={`text-[10px] px-2 py-1 rounded font-bold transition ${
                                  winnerIsA 
                                    ? 'bg-emerald-500 text-black shadow' 
                                    : 'bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 border border-slate-700'
                                }`}
                                title="Pilih sebagai pemenang"
                              >
                                {winnerIsA ? 'Menang ✓' : 'Menang'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Peserta Slot B */}
                        <div 
                          draggable={Boolean(match.pesertaB)}
                          onDragStart={(e) => handleDragStart(e, match.id, 'B', rIdx, match.pesertaB)}
                          onDragOver={(e) => handleDragOver(e, match.id, 'B')}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, match.id, 'B')}
                          className={`p-3 flex items-center justify-between gap-2 transition select-none ${
                            isDragOverSlotB 
                              ? 'bg-amber-500/30 border-2 border-dashed border-amber-400 scale-[1.02]' 
                              : isBeingDraggedB
                              ? 'opacity-40 border-2 border-dashed border-slate-500'
                              : winnerIsB 
                              ? 'bg-emerald-950/40 text-emerald-300 font-bold' 
                              : isCompleted 
                              ? 'opacity-60 bg-slate-900/30' 
                              : 'bg-slate-900/50'
                          } ${match.pesertaB ? 'cursor-grab active:cursor-grabbing hover:bg-slate-800/80' : ''}`}
                        >
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            {match.pesertaB && (
                              <GripVertical className="w-3.5 h-3.5 text-slate-500 hover:text-amber-400 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                {winnerIsB && <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                                <span className="text-xs truncate block font-medium">
                                  {match.pesertaB ? match.pesertaB.nama : '(Slot Kosong)'}
                                </span>
                              </div>
                              {match.pesertaB?.detailAnggota && match.pesertaB.detailAnggota.length > 0 && (
                                <p className="text-[10px] text-slate-400 truncate mt-0.5 flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {match.pesertaB.detailAnggota.join(', ')}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Tombol Swap Cepat */}
                            {match.pesertaB && (
                              <button
                                type="button"
                                onClick={() => setManualSwapSource({ matchId: match.id, slot: 'B', peserta: match.pesertaB! })}
                                className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition"
                                title="Tukar posisi dengan tim lain"
                              >
                                <ArrowLeftRight className="w-3 h-3" />
                              </button>
                            )}

                            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-white">
                              {match.skorB || 0}
                            </span>

                            {match.pesertaA && match.pesertaB && !isEditMode && (
                              <button
                                type="button"
                                onClick={() => handleSetWinner(match, match.pesertaB!)}
                                className={`text-[10px] px-2 py-1 rounded font-bold transition ${
                                  winnerIsB 
                                    ? 'bg-emerald-500 text-black shadow' 
                                    : 'bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 border border-slate-700'
                                }`}
                                title="Pilih sebagai pemenang"
                              >
                                {winnerIsB ? 'Menang ✓' : 'Menang'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Match Footer / Scoring button */}
                        <div className="px-3 py-1.5 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 italic truncate max-w-[150px]">
                            {match.catatan || (isCompleted ? 'Pertandingan selesai' : 'Siap bertanding')}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenScoreModal(match)}
                            disabled={!match.pesertaA || !match.pesertaB}
                            className="text-xs text-red-400 hover:text-red-300 font-semibold disabled:opacity-30 disabled:pointer-events-none"
                          >
                            Input Skor / Catatan
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Manual Swap Selector */}
      {manualSwapSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2 text-amber-400">
                <ArrowLeftRight className="w-5 h-5" />
                Pilih Lawan / Slot Target untuk Ditukar
              </h3>
              <button
                type="button"
                onClick={() => setManualSwapSource(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs">
              Menukar posisi untuk: <strong className="text-white text-sm block mt-0.5">{manualSwapSource.peserta.nama}</strong>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              <span className="text-xs text-slate-400 font-semibold block mb-1">
                Pilih slot tujuan pertukaran:
              </span>

              {rounds[0]?.matches.map((m) => (
                <div key={m.id} className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 space-y-1.5 text-xs">
                  <span className="font-bold text-slate-400 text-[11px] block">{m.namaBabak}</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={m.id === manualSwapSource.matchId && manualSwapSource.slot === 'A'}
                      onClick={() => handlePerformManualSwap(m.id, 'A')}
                      className="p-2 bg-slate-900 hover:bg-red-600 disabled:opacity-40 disabled:hover:bg-slate-900 rounded-lg text-left transition truncate font-medium"
                    >
                      Slot Atas: {m.pesertaA ? m.pesertaA.nama : '(Kosong)'}
                    </button>
                    <button
                      type="button"
                      disabled={m.id === manualSwapSource.matchId && manualSwapSource.slot === 'B'}
                      onClick={() => handlePerformManualSwap(m.id, 'B')}
                      className="p-2 bg-slate-900 hover:bg-red-600 disabled:opacity-40 disabled:hover:bg-slate-900 rounded-lg text-left transition truncate font-medium"
                    >
                      Slot Bawah: {m.pesertaB ? m.pesertaB.nama : '(Kosong)'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setManualSwapSource(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Match Scoring */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-white space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Swords className="w-4 h-4 text-red-400" />
                Catatan Skor Pertandingan
              </h3>
              <button
                type="button"
                onClick={() => setSelectedMatch(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="text-center font-semibold text-xs text-amber-400 uppercase tracking-wider">
              {selectedMatch.namaBabak}
            </div>

            {/* Duel Score Board */}
            <div className="grid grid-cols-5 gap-2 items-center text-center">
              {/* Peserta A */}
              <div className="col-span-2 space-y-2">
                <span className="font-bold text-sm text-slate-100 block truncate">
                  {selectedMatch.pesertaA?.nama || 'Peserta A'}
                </span>
                <input
                  type="number"
                  min={0}
                  value={skorA}
                  onChange={(e) => setSkorA(parseInt(e.target.value) || 0)}
                  className="w-20 mx-auto text-center font-mono text-2xl font-bold py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSaveScoreModal(selectedMatch.pesertaA?.id || null)}
                  className="w-full py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white transition"
                >
                  Pemenang A
                </button>
              </div>

              <div className="col-span-1 font-bold text-slate-500 text-lg">VS</div>

              {/* Peserta B */}
              <div className="col-span-2 space-y-2">
                <span className="font-bold text-sm text-slate-100 block truncate">
                  {selectedMatch.pesertaB?.nama || 'Peserta B'}
                </span>
                <input
                  type="number"
                  min={0}
                  value={skorB}
                  onChange={(e) => setSkorB(parseInt(e.target.value) || 0)}
                  className="w-20 mx-auto text-center font-mono text-2xl font-bold py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSaveScoreModal(selectedMatch.pesertaB?.id || null)}
                  className="w-full py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white transition"
                >
                  Pemenang B
                </button>
              </div>
            </div>

            {/* Catatan Tambahan Wasit / Panitia */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Catatan Wasit / Pertandingan (opsional):</label>
              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Menang tipis babak penalti / waktu 2:15"
                className="w-full text-xs px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Tombol Simpan */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleSaveScoreModal(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg"
              >
                Simpan Skor Saja (Belum Ada Pemenang)
              </button>
              <button
                type="button"
                onClick={() => setSelectedMatch(null)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
