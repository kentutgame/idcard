import { BracketRound, Match, PesertaRef, TimPeserta, PesertaIndividu, TipePeserta } from '@/types/lomba';

/**
 * Mengubah daftar Tim atau Peserta Individu menjadi format seragam PesertaRef
 */
export function convertToPesertaRefs(
  tipe: TipePeserta,
  daftarTim: TimPeserta[],
  pesertaIndividu: PesertaIndividu[]
): PesertaRef[] {
  if (tipe === 'kelompok') {
    return daftarTim.map(t => ({
      id: t.id,
      nama: t.namaTim,
      detailAnggota: t.anggota,
      tipe: 'kelompok'
    }));
  } else {
    return pesertaIndividu.map(p => ({
      id: p.id,
      nama: p.nama,
      tipe: 'individu'
    }));
  }
}

/**
 * Generate sistem Single Elimination Bracket berdasarkan daftar peserta
 */
export function generateSingleEliminationBracket(pesertaList: PesertaRef[]): BracketRound[] {
  if (pesertaList.length < 2) {
    return [];
  }

  // Hitung jumlah slot pangkat 2 terdekat (2, 4, 8, 16, 32)
  const count = pesertaList.length;
  let power = 2;
  while (power < count) {
    power *= 2;
  }

  const numRounds = Math.log2(power);
  const rounds: BracketRound[] = [];

  // Tentukan nama round
  function getRoundName(roundIdx: number, totalRounds: number): string {
    const fromEnd = totalRounds - roundIdx;
    if (fromEnd === 1) return 'Final';
    if (fromEnd === 2) return 'Semifinal';
    if (fromEnd === 3) return 'Perempat Final';
    if (fromEnd === 4) return 'Babak 16 Besar';
    return `Babak ${roundIdx + 1}`;
  }

  // Siapkan slot peserta awal (bisa BYE jika count < power)
  const seededList: (PesertaRef | null)[] = [...pesertaList];
  while (seededList.length < power) {
    seededList.push(null); // BYE
  }

  // Build struktur matches round per round
  let currentMatchesCount = power / 2;

  for (let r = 0; r < numRounds; r++) {
    const matches: Match[] = [];
    const roundName = getRoundName(r, numRounds);

    for (let m = 0; m < currentMatchesCount; m++) {
      const matchId = `r${r}_m${m}_${Date.now().toString(36)}`;
      let pA: PesertaRef | null = null;
      let pB: PesertaRef | null = null;
      let pemenangId: string | null = null;
      let status: 'pending' | 'ongoing' | 'completed' = 'pending';

      if (r === 0) {
        pA = seededList[m * 2] || null;
        pB = seededList[m * 2 + 1] || null;

        // Jika salah satu BYE, yang satunya langsung otomatis menang
        if (pA && !pB) {
          pemenangId = pA.id;
          status = 'completed';
        } else if (!pA && pB) {
          pemenangId = pB.id;
          status = 'completed';
        }
      }

      matches.push({
        id: matchId,
        roundIndex: r,
        matchIndex: m,
        namaBabak: `${roundName} ${currentMatchesCount > 1 ? `#${m + 1}` : ''}`.trim(),
        pesertaA: pA,
        pesertaB: pB,
        skorA: 0,
        skorB: 0,
        pemenangId: pemenangId,
        status: status
      });
    }

    rounds.push({
      nama: roundName,
      roundIndex: r,
      matches: matches
    });

    currentMatchesCount /= 2;
  }

  // Hubungkan nextMatchId dan nextMatchSlot
  for (let r = 0; r < rounds.length - 1; r++) {
    const currentRound = rounds[r];
    const nextRound = rounds[r + 1];

    for (let m = 0; m < currentRound.matches.length; m++) {
      const targetMatchIndex = Math.floor(m / 2);
      const targetSlot = m % 2 === 0 ? 'A' : 'B';
      const targetMatch = nextRound.matches[targetMatchIndex];

      if (targetMatch) {
        currentRound.matches[m].nextMatchId = targetMatch.id;
        currentRound.matches[m].nextMatchSlot = targetSlot;

        // Jika match babak 1 ada yang auto win karena BYE, propagasikan ke targetMatch
        const currentMatch = currentRound.matches[m];
        if (currentMatch.status === 'completed' && currentMatch.pemenangId) {
          const winner = currentMatch.pesertaA?.id === currentMatch.pemenangId
            ? currentMatch.pesertaA
            : currentMatch.pesertaB;
          if (winner) {
            if (targetSlot === 'A') targetMatch.pesertaA = winner;
            else targetMatch.pesertaB = winner;
          }
        }
      }
    }
  }

  return rounds;
}

/**
 * Update hasil skor atau pemenang pada match tertentu dan propagasi pemenang ke match selanjutnya
 */
export function updateMatchWinner(
  rounds: BracketRound[],
  matchId: string,
  pemenangId: string | null,
  skorA: number,
  skorB: number,
  catatan?: string
): BracketRound[] {
  const updatedRounds = JSON.parse(JSON.stringify(rounds)) as BracketRound[];

  let targetMatch: Match | null = null;
  let targetRoundIdx = -1;

  // Cari match yang diupdate
  for (let r = 0; r < updatedRounds.length; r++) {
    const found = updatedRounds[r].matches.find(m => m.id === matchId);
    if (found) {
      targetMatch = found;
      targetRoundIdx = r;
      break;
    }
  }

  if (!targetMatch) return rounds;

  // Update target match
  targetMatch.skorA = skorA;
  targetMatch.skorB = skorB;
  targetMatch.pemenangId = pemenangId;
  targetMatch.catatan = catatan || targetMatch.catatan;
  targetMatch.status = pemenangId ? 'completed' : 'ongoing';

  // Temukan pemenang object PesertaRef
  const winnerObj = pemenangId === targetMatch.pesertaA?.id
    ? targetMatch.pesertaA
    : pemenangId === targetMatch.pesertaB?.id
    ? targetMatch.pesertaB
    : null;

  // Jika ada next match, propagasi winner ke match berikutnya
  if (targetMatch.nextMatchId && targetMatch.nextMatchSlot && targetRoundIdx < updatedRounds.length - 1) {
    const nextRound = updatedRounds[targetRoundIdx + 1];
    const nextMatch = nextRound.matches.find(m => m.id === targetMatch!.nextMatchId);

    if (nextMatch) {
      if (targetMatch.nextMatchSlot === 'A') {
        nextMatch.pesertaA = winnerObj;
      } else {
        nextMatch.pesertaB = winnerObj;
      }
      // Jika pemenang berubah dan next match sebelumnya sudah punya pemenang yang tidak valid, reset
      if (nextMatch.pemenangId && nextMatch.pesertaA?.id !== nextMatch.pemenangId && nextMatch.pesertaB?.id !== nextMatch.pemenangId) {
        nextMatch.pemenangId = null;
        nextMatch.status = 'pending';
      }
    }
  }

  return updatedRounds;
}

/**
 * Menukar (Swap/Drag & Drop) posisi dua slot peserta dalam bagan
 */
export function swapBracketSlots(
  rounds: BracketRound[],
  sourceMatchId: string,
  sourceSlot: 'A' | 'B',
  targetMatchId: string,
  targetSlot: 'A' | 'B'
): BracketRound[] {
  const updatedRounds = JSON.parse(JSON.stringify(rounds)) as BracketRound[];

  let sourceMatch: Match | null = null;
  let targetMatch: Match | null = null;

  for (const round of updatedRounds) {
    for (const match of round.matches) {
      if (match.id === sourceMatchId) sourceMatch = match;
      if (match.id === targetMatchId) targetMatch = match;
    }
  }

  if (!sourceMatch || !targetMatch) return rounds;

  // Dapatkan peserta asal dan tujuan
  const sourcePeserta = sourceSlot === 'A' ? sourceMatch.pesertaA : sourceMatch.pesertaB;
  const targetPeserta = targetSlot === 'A' ? targetMatch.pesertaA : targetMatch.pesertaB;

  // Lakukan Swap
  if (sourceSlot === 'A') {
    sourceMatch.pesertaA = targetPeserta;
  } else {
    sourceMatch.pesertaB = targetPeserta;
  }

  if (targetSlot === 'A') {
    targetMatch.pesertaA = sourcePeserta;
  } else {
    targetMatch.pesertaB = sourcePeserta;
  }

  // Reset status pertandingan yang diubah agar tidak ada pemenang lama yang invalid
  sourceMatch.pemenangId = null;
  sourceMatch.status = 'pending';
  sourceMatch.skorA = 0;
  sourceMatch.skorB = 0;

  targetMatch.pemenangId = null;
  targetMatch.status = 'pending';
  targetMatch.skorA = 0;
  targetMatch.skorB = 0;

  return updatedRounds;
}

/**
 * Generate struktur awal Multi-Match / Pertandingan Multi-Peserta dengan Poin
 */
export function generateInitialMultiMatches(pesertaList: PesertaRef[]): import('@/types/lomba').MultiMatch[] {
  if (pesertaList.length === 0) return [];

  if (pesertaList.length <= 4) {
    return [
      {
        id: `match_final_${Date.now()}`,
        namaMatch: 'Babak Final / Pertandingan Utama',
        status: 'pending',
        pesertaList: pesertaList.map(p => ({
          peserta: p,
          skor: 0,
          poin: 0
        }))
      }
    ];
  }

  // Bagi per 3 atau 4 peserta per pertandingan / heat
  const groupSize = pesertaList.length <= 8 ? Math.ceil(pesertaList.length / 2) : 4;
  const matches: import('@/types/lomba').MultiMatch[] = [];
  const totalMatches = Math.ceil(pesertaList.length / groupSize);

  for (let i = 0; i < totalMatches; i++) {
    const chunk = pesertaList.slice(i * groupSize, (i + 1) * groupSize);
    const letter = String.fromCharCode(65 + i);
    matches.push({
      id: `match_heat_${i + 1}_${Date.now()}_${i}`,
      namaMatch: `Pertandingan ${i + 1} (Heat / Grup ${letter})`,
      status: 'pending',
      pesertaList: chunk.map(p => ({
        peserta: p,
        skor: 0,
        poin: 0
      }))
    });
  }

  return matches;
}
