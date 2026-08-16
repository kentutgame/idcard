'use client';

import React from 'react';
import { Lomba } from '@/types/lomba';

interface LombaPrintDocumentProps {
  lomba: Lomba;
}

export const LombaPrintDocument: React.FC<LombaPrintDocumentProps> = ({ lomba }) => {
  const { hasilJuara } = lomba;

  // 1. Perhitungan Statistik Lomba
  const totalPeserta = lomba.tipePeserta === 'kelompok' 
    ? lomba.daftarTim.length 
    : lomba.pesertaIndividu.length;

  const totalOrang = lomba.tipePeserta === 'kelompok'
    ? lomba.daftarTim.reduce((sum, t) => sum + (t.anggota.length || 0), 0)
    : lomba.pesertaIndividu.length;

  let totalMatches = 0;
  let matchesCompleted = 0;
  let totalGugur = 0;

  if (lomba.formatTanding === 'bracket') {
    totalMatches = lomba.rounds.reduce((acc, r) => acc + r.matches.length, 0);
    matchesCompleted = lomba.rounds.reduce(
      (acc, r) => acc + r.matches.filter(m => m.status === 'completed').length, 
      0
    );
    if (lomba.status === 'selesai' && hasilJuara.juara1) {
      totalGugur = Math.max(0, totalPeserta - 1);
    } else {
      totalGugur = matchesCompleted;
    }
  } else if (lomba.formatTanding === 'multi_match') {
    if (lomba.heatRounds && lomba.heatRounds.length > 0) {
      totalMatches = lomba.heatRounds.reduce((acc, hr) => acc + hr.matches.length, 0);
      matchesCompleted = lomba.heatRounds.reduce(
        (acc, hr) => acc + hr.matches.filter(m => m.status === 'completed').length, 
        0
      );
      // Hitung dari status peserta
      let gugurCount = 0;
      lomba.heatRounds.forEach(hr => {
        hr.matches.forEach(m => {
          m.pesertaList.forEach(p => {
            if (p.statusLolos === 'gugur') gugurCount++;
          });
        });
      });
      totalGugur = gugurCount > 0 ? gugurCount : (lomba.status === 'selesai' ? Math.max(0, totalPeserta - (hasilJuara.juara1 ? 1 : 0) - (hasilJuara.juara2 ? 1 : 0) - (hasilJuara.juara3 ? 1 : 0)) : 0);
    } else if (lomba.multiMatches) {
      totalMatches = lomba.multiMatches.length;
      matchesCompleted = lomba.multiMatches.filter(m => m.status === 'completed').length;
      totalGugur = lomba.status === 'selesai' ? Math.max(0, totalPeserta - 3) : 0;
    }
  } else {
    // Sekaligus / Massal
    totalMatches = 1;
    matchesCompleted = lomba.status === 'selesai' ? 1 : 0;
    if (lomba.status === 'selesai') {
      const juaraCount = (hasilJuara.juara1 ? 1 : 0) + (hasilJuara.juara2 ? 1 : 0) + (hasilJuara.juara3 ? 1 : 0) + (hasilJuara.juaraHarapan ? 1 : 0);
      totalGugur = Math.max(0, totalPeserta - juaraCount);
    } else {
      totalGugur = 0;
    }
  }

  const formatText = lomba.formatTanding === 'bracket' 
    ? 'Sistem Gugur (Bracket 1 vs 1)' 
    : lomba.formatTanding === 'multi_match'
    ? 'Babak Bertingkat / Heat Grup'
    : 'Skor Massal / Sekaligus';

  const kategoriBadge = lomba.kategori.toUpperCase();

  return (
    <div className="print-document bg-white text-black font-sans text-xs leading-relaxed p-0 m-0 print:p-0">
      
      {/* ============================================================
          LEMBAR 1: DATA LOMBA & STATISTIK PERTANDINGAN
          ============================================================ */}
      <section className="print-page w-full min-h-[268mm] flex flex-col justify-between p-8 border-b-2 border-dashed border-gray-300 print:border-none print:p-0 print-page-break">
        <div>
          {/* KOP RESMI */}
          <div className="border-b-4 border-double border-gray-900 pb-3 mb-5 text-center relative">
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="w-10 h-10 bg-red-600 text-white font-black rounded-lg flex items-center justify-center text-lg shadow">
                17
              </div>
              <div className="text-left">
                <h1 className="text-sm font-black tracking-wider uppercase text-gray-900 leading-tight">
                  PANITIA PERINGATAN HUT KEMERDEKAAN REPUBLIK INDONESIA KE-81
                </h1>
                <p className="text-[11px] font-bold text-red-600 uppercase tracking-wide">
                  RUKUN WARGA 05 CIMANGGU WATES • TAHUN 2026
                </p>
              </div>
            </div>
            <p className="text-[9px] text-gray-500 italic mt-0.5">
              Sekretariat: Balai Warga RW 05 Cimanggu Wates • Sistem Pencatatan & Rekapitulasi Lomba Resmi
            </p>
          </div>

          {/* JUDUL LEMBAR 1 */}
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-2.5 text-center mb-5">
            <h2 className="text-sm font-black uppercase text-gray-900 tracking-wide">
              LEMBAR 1 : INFORMASI LOMBA & STATISTIK PERTANDINGAN
            </h2>
            <p className="text-[10px] text-gray-600 font-medium">
              Dokumen identitas, komposisi partisipan, dan laporan jalannya perlombaan
            </p>
          </div>

          {/* 1. TABEL INFORMASI UMUM LOMBA */}
          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase text-gray-800 border-b border-gray-300 pb-1 mb-2.5 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-red-600 rounded-full inline-block" />
              I. Identitas Perlombaan
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="border border-gray-200 rounded p-2 bg-gray-50/70">
                <span className="text-gray-500 block text-[9px] uppercase font-bold">Nama Perlombaan:</span>
                <span className="font-bold text-gray-900 text-xs">{lomba.judul}</span>
              </div>
              <div className="border border-gray-200 rounded p-2 bg-gray-50/70">
                <span className="text-gray-500 block text-[9px] uppercase font-bold">Kategori Usia:</span>
                <span className="font-bold text-gray-900 text-xs uppercase">{kategoriBadge}</span>
              </div>
              <div className="border border-gray-200 rounded p-2 bg-gray-50/70">
                <span className="text-gray-500 block text-[9px] uppercase font-bold">Tipe Kepesertaan:</span>
                <span className="font-bold text-gray-900 capitalize text-xs">
                  {lomba.tipePeserta === 'kelompok' ? `Kelompok / Tim (${totalPeserta} Tim)` : `Individu / Perorangan (${totalPeserta} Orang)`}
                </span>
              </div>
              <div className="border border-gray-200 rounded p-2 bg-gray-50/70">
                <span className="text-gray-500 block text-[9px] uppercase font-bold">Format Pertandingan:</span>
                <span className="font-bold text-gray-900 text-xs">{formatText}</span>
              </div>
            </div>
          </div>

          {/* 2. STATISTIK PERTANDINGAN (SESUAI REQUEST: TOTAL MATCH & JUMLAH GUGUR) */}
          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase text-gray-800 border-b border-gray-300 pb-1 mb-2.5 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-red-600 rounded-full inline-block" />
              II. Statistik & Rekapitulasi Gugur / Lolos
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              {/* Total Peserta */}
              <div className="border-2 border-blue-200 bg-blue-50/60 rounded-lg p-2.5">
                <span className="text-[9px] font-bold uppercase text-blue-700 block">Total Peserta</span>
                <span className="text-lg font-black text-blue-900 block my-0.5">{totalPeserta}</span>
                <span className="text-[8.5px] text-blue-600 block">
                  {lomba.tipePeserta === 'kelompok' ? `${totalOrang} Orang Total` : 'Peserta Terdaftar'}
                </span>
              </div>

              {/* Total Pertandingan */}
              <div className="border-2 border-amber-200 bg-amber-50/60 rounded-lg p-2.5">
                <span className="text-[9px] font-bold uppercase text-amber-700 block">Total Pertandingan</span>
                <span className="text-lg font-black text-amber-900 block my-0.5">{totalMatches}</span>
                <span className="text-[8.5px] text-amber-600 block">
                  {matchesCompleted} Match Selesai
                </span>
              </div>

              {/* Jumlah Orang / Tim Gugur */}
              <div className="border-2 border-red-200 bg-red-50/60 rounded-lg p-2.5">
                <span className="text-[9px] font-bold uppercase text-red-700 block">Peserta Gugur</span>
                <span className="text-lg font-black text-red-900 block my-0.5">{totalGugur}</span>
                <span className="text-[8.5px] text-red-600 block">
                  Tereliminasi di Babak
                </span>
              </div>

              {/* Status Pemenang / Lolos */}
              <div className="border-2 border-emerald-200 bg-emerald-50/60 rounded-lg p-2.5">
                <span className="text-[9px] font-bold uppercase text-emerald-700 block">Podium / Juara</span>
                <span className="text-lg font-black text-emerald-900 block my-0.5">
                  {hasilJuara.juara1 ? (hasilJuara.juaraHarapan ? '4' : '3') : '-'}
                </span>
                <span className="text-[8.5px] text-emerald-600 block">
                  {lomba.status === 'selesai' ? 'Pemenang Ditetapkan' : 'Sedang Berlangsung'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. TABEL DAFTAR PESERTA TERDAFTAR */}
          <div>
            <h3 className="text-xs font-bold uppercase text-gray-800 border-b border-gray-300 pb-1 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-red-600 rounded-full inline-block" />
                III. Komposisi Daftar Peserta Terdaftar ({totalPeserta} Unit)
              </span>
              <span className="text-[9px] font-normal text-gray-500">
                Format: {lomba.tipePeserta === 'kelompok' ? 'Tim / Kelompok' : 'Perorangan'}
              </span>
            </h3>

            <table className="w-full border-collapse border border-gray-300 text-[10px]">
              <thead>
                <tr className="bg-gray-100 text-gray-800">
                  <th className="border border-gray-300 px-2 py-1 text-center w-8">No</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Nama Peserta / Tim</th>
                  {lomba.tipePeserta === 'kelompok' && (
                    <th className="border border-gray-300 px-2 py-1 text-left">Daftar Anggota Tim</th>
                  )}
                  <th className="border border-gray-300 px-2 py-1 text-center w-24">Status Lomba</th>
                </tr>
              </thead>
              <tbody>
                {lomba.tipePeserta === 'kelompok' ? (
                  lomba.daftarTim.map((tim, idx) => {
                    const isJuara1 = hasilJuara.juara1?.id === tim.id;
                    const isJuara2 = hasilJuara.juara2?.id === tim.id;
                    const isJuara3 = hasilJuara.juara3?.id === tim.id;
                    const isJuaraHarapan = hasilJuara.juaraHarapan?.id === tim.id;
                    const statusText = isJuara1 ? '🏆 Juara 1' : isJuara2 ? '🥈 Juara 2' : isJuara3 ? '🥉 Juara 3' : isJuaraHarapan ? '🎖️ Harapan' : (lomba.status === 'selesai' ? 'Gugur' : 'Peserta');

                    return (
                      <tr key={tim.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-2 py-1 text-center font-bold">{idx + 1}</td>
                        <td className="border border-gray-300 px-2 py-1 font-semibold text-gray-900">{tim.namaTim}</td>
                        <td className="border border-gray-300 px-2 py-1 text-gray-600">
                          {tim.anggota.length > 0 ? tim.anggota.join(', ') : '-'}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-center font-bold text-[9.5px]">
                          <span className={`px-1.5 py-0.5 rounded ${
                            isJuara1 ? 'bg-amber-100 text-amber-800' :
                            isJuara2 ? 'bg-slate-100 text-slate-800' :
                            isJuara3 ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  lomba.pesertaIndividu.map((peserta, idx) => {
                    const isJuara1 = hasilJuara.juara1?.id === peserta.id;
                    const isJuara2 = hasilJuara.juara2?.id === peserta.id;
                    const isJuara3 = hasilJuara.juara3?.id === peserta.id;
                    const isJuaraHarapan = hasilJuara.juaraHarapan?.id === peserta.id;
                    const statusText = isJuara1 ? '🏆 Juara 1' : isJuara2 ? '🥈 Juara 2' : isJuara3 ? '🥉 Juara 3' : isJuaraHarapan ? '🎖️ Harapan' : (lomba.status === 'selesai' ? 'Gugur' : 'Peserta');

                    return (
                      <tr key={peserta.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-2 py-1 text-center font-bold">{idx + 1}</td>
                        <td className="border border-gray-300 px-2 py-1 font-semibold text-gray-900">{peserta.nama}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center font-bold text-[9.5px]">
                          <span className={`px-1.5 py-0.5 rounded ${
                            isJuara1 ? 'bg-amber-100 text-amber-800' :
                            isJuara2 ? 'bg-slate-100 text-slate-800' :
                            isJuara3 ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER LEMBAR 1 */}
        <div className="pt-4 border-t border-gray-300 flex items-center justify-between text-[9px] text-gray-500 mt-6">
          <span>Panitia Peringatan HUT RI Ke-81 RW 05 Cimanggu Wates</span>
          <span className="font-bold text-gray-700">Halaman 1 dari 3 (Data & Statistik Lomba)</span>
        </div>
      </section>


      {/* ============================================================
          LEMBAR 2: PENGUMUMAN RESMI PEMENANG JUARA 1, 2, 3 (PAS 1 LEMBAR)
          ============================================================ */}
      <section className="print-page w-full min-h-[268mm] flex flex-col justify-between p-8 border-b-2 border-dashed border-gray-300 print:border-none print:p-0 print-page-break">
        <div>
          {/* KOP PENGUMUMAN */}
          <div className="border-b-4 border-double border-amber-600 pb-3 mb-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="w-10 h-10 bg-amber-500 text-slate-950 font-black rounded-lg flex items-center justify-center text-xl shadow">
                👑
              </div>
              <div className="text-left">
                <h1 className="text-sm font-black tracking-wider uppercase text-gray-900 leading-tight">
                  PENGUMUMAN RESMI DEWAN JURI & PANITIA
                </h1>
                <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">
                  PERINGATAN HUT KEMERDEKAAN REPUBLIK INDONESIA KE-81 • RW 05
                </p>
              </div>
            </div>
            <p className="text-[9px] text-gray-500 italic mt-0.5">
              Penetapan Hasil Juara Berdasarkan Babak Final & Rekapitulasi Nilai Resmi
            </p>
          </div>

          {/* HEADER PERLOMBAAN */}
          <div className="bg-gradient-to-r from-amber-100/90 via-yellow-50 to-amber-100/90 border-2 border-amber-400 rounded-xl p-3 text-center mb-5 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 block">
              Daftar Juara Resmi Perlombaan
            </span>
            <h2 className="text-xl font-black uppercase text-gray-900 mt-0.5 tracking-wide">
              {lomba.judul}
            </h2>
            <div className="flex items-center justify-center gap-3 text-[10.5px] font-semibold text-gray-700 mt-1">
              <span>Kategori: <strong className="text-red-600 uppercase">{lomba.kategori}</strong></span>
              <span>•</span>
              <span>Tipe: <strong className="capitalize">{lomba.tipePeserta}</strong></span>
              <span>•</span>
              <span>Total Peserta: <strong>{totalPeserta} {lomba.tipePeserta === 'kelompok' ? 'Tim' : 'Orang'}</strong></span>
            </div>
          </div>

          {/* KARTU JUARA 1, 2, 3 DIRANCANG PROPORSIONAL AGAR PAS DI 1 LEMBAR HVS */}
          <div className="space-y-3.5">
            
            {/* KARTU JUARA 1 (EMAS / CHAMPION) */}
            <div className="border-2 border-amber-400 bg-gradient-to-r from-amber-50 via-yellow-50/50 to-amber-50 rounded-xl p-3.5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-yellow-500 border-2 border-amber-300 rounded-xl flex flex-col items-center justify-center text-slate-950 font-black shadow shrink-0">
                    <span className="text-base leading-none">🏆</span>
                    <span className="text-sm font-black leading-none mt-0.5">1</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950 tracking-wider inline-block">
                      JUARA I (EMAS / CHAMPION)
                    </span>
                    <h3 className="text-base font-black text-gray-900 mt-1">
                      {hasilJuara.juara1?.nama || 'Belum Ditetapkan'}
                    </h3>
                    {hasilJuara.juara1?.detailAnggota && hasilJuara.juara1.detailAnggota.length > 0 && (
                      <p className="text-[10px] text-gray-600 mt-0.5 font-medium">
                        Anggota: {hasilJuara.juara1.detailAnggota.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] font-extrabold text-amber-700 block uppercase">Peringkat 1</span>
                  <span className="text-[9px] text-gray-500">Pemenang Utama</span>
                </div>
              </div>
            </div>

            {/* KARTU JUARA 2 (PERAK / RUNNER UP) */}
            <div className="border-2 border-slate-300 bg-gradient-to-r from-slate-50 via-gray-50/50 to-slate-50 rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-300 to-slate-400 border-2 border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-900 font-black shadow shrink-0">
                    <span className="text-sm leading-none">🥈</span>
                    <span className="text-xs font-black leading-none mt-0.5">2</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded bg-slate-300 text-slate-900 tracking-wider inline-block">
                      JUARA II (PERAK / RUNNER UP)
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 mt-1">
                      {hasilJuara.juara2?.nama || 'Belum Ditetapkan'}
                    </h4>
                    {hasilJuara.juara2?.detailAnggota && hasilJuara.juara2.detailAnggota.length > 0 && (
                      <p className="text-[10px] text-gray-600 mt-0.5 font-medium">
                        Anggota: {hasilJuara.juara2.detailAnggota.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] font-bold text-slate-600 block uppercase">Peringkat 2</span>
                  <span className="text-[9px] text-gray-500">Runner Up</span>
                </div>
              </div>
            </div>

            {/* KARTU JUARA 3 (PERUNGGU) */}
            <div className="border-2 border-orange-300 bg-gradient-to-r from-orange-50 via-amber-50/40 to-orange-50 rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-700 border-2 border-amber-500 rounded-xl flex flex-col items-center justify-center text-white font-black shadow shrink-0">
                    <span className="text-sm leading-none">🥉</span>
                    <span className="text-xs font-black leading-none mt-0.5">3</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded bg-amber-600 text-white tracking-wider inline-block">
                      JUARA III (PERUNGGU)
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 mt-1">
                      {hasilJuara.juara3?.nama || 'Belum Ditetapkan'}
                    </h4>
                    {hasilJuara.juara3?.detailAnggota && hasilJuara.juara3.detailAnggota.length > 0 && (
                      <p className="text-[10px] text-gray-600 mt-0.5 font-medium">
                        Anggota: {hasilJuara.juara3.detailAnggota.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] font-bold text-orange-700 block uppercase">Peringkat 3</span>
                  <span className="text-[9px] text-gray-500">Podium 3</span>
                </div>
              </div>
            </div>

            {/* JUARA 4 / HARAPAN (JIKA ADA) */}
            {hasilJuara.juaraHarapan && (
              <div className="border border-purple-200 bg-purple-50/50 rounded-xl p-2.5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-600 text-white font-black rounded-lg flex items-center justify-center text-xs shrink-0">
                    4
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-200 text-purple-900 tracking-wider">
                      JUARA IV (HARAPAN)
                    </span>
                    <h5 className="text-xs font-bold text-gray-900 mt-0.5">
                      {hasilJuara.juaraHarapan.nama}
                    </h5>
                    {hasilJuara.juaraHarapan.detailAnggota && (
                      <p className="text-[9px] text-gray-500">
                        Anggota: {hasilJuara.juaraHarapan.detailAnggota.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* UCAPAN SELAMAT & CATATAN PANITIA */}
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
            <p className="text-[10px] text-gray-700 font-medium italic">
              &quot;Selamat kepada para pemenang yang telah menunjukkan sportivitas, kekompakan, dan semangat juang dalam menyemarakkan Peringatan Kemerdekaan RI ke-81.&quot;
            </p>
          </div>
        </div>

        {/* FOOTER LEMBAR 2 */}
        <div className="pt-4 border-t border-gray-300 flex items-center justify-between text-[9px] text-gray-500 mt-6">
          <span>Panitia Peringatan HUT RI Ke-81 RW 05 Cimanggu Wates</span>
          <span className="font-bold text-gray-700">Halaman 2 dari 3 (Pengumuman Resmi Juara)</span>
        </div>
      </section>


      {/* ============================================================
          LEMBAR 3: REKAPITULASI BERITA ACARA & LEMBAR PENGESAHAN
          ============================================================ */}
      <section className="print-page w-full min-h-[268mm] flex flex-col justify-between p-8 print:p-0">
        <div>
          {/* KOP RESMI BERITA ACARA */}
          <div className="border-b-4 border-double border-gray-900 pb-3 mb-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="w-10 h-10 bg-red-600 text-white font-black rounded-lg flex items-center justify-center text-lg shadow">
                17
              </div>
              <div className="text-left">
                <h1 className="text-sm font-black tracking-wider uppercase text-gray-900 leading-tight">
                  BERITA ACARA REKAPITULASI HASIL AKHIR PERLOMBAAN
                </h1>
                <p className="text-[11px] font-bold text-red-600 uppercase tracking-wide">
                  PERINGATAN HUT KEMERDEKAAN REPUBLIK INDONESIA KE-81 • RW 05
                </p>
              </div>
            </div>
            <p className="text-[9px] text-gray-500 italic mt-0.5">
              Lampiran Resmi Pengesahan Pemenang & Penyerahan Hadiah
            </p>
          </div>

          {/* PARAGRAF PENGANTAR BERITA ACARA */}
          <div className="text-[10.5px] text-gray-800 space-y-2 mb-4 leading-relaxed">
            <p>
              Pada hari ini, dalam rangka memperingati Hari Ulang Tahun Kemerdekaan Republik Indonesia Ke-81 di lingkungan RW 05 Cimanggu Wates, telah selesai dilaksanakan perlombaan:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded p-2.5 font-medium grid grid-cols-2 gap-2 text-[10px]">
              <div>• <strong>Nama Perlombaan:</strong> {lomba.judul}</div>
              <div>• <strong>Kategori:</strong> {kategoriBadge}</div>
              <div>• <strong>Tipe Kepesertaan:</strong> {lomba.tipePeserta === 'kelompok' ? 'Kelompok / Tim' : 'Individu'}</div>
              <div>• <strong>Total Peserta:</strong> {totalPeserta} {lomba.tipePeserta === 'kelompok' ? 'Tim' : 'Peserta'}</div>
            </div>
            <p>
              Berdasarkan hasil penilaian, jalannya pertandingan, dan keputusan bulat dewan juri, panitia menetapkan rekapitulasi pemenang yang sah sebagai berikut:
            </p>
          </div>

          {/* TABEL RESMI REKAPITULASI PEMENANG & HADIAH */}
          <div className="mb-4">
            <table className="w-full border-collapse border-2 border-gray-400 text-[10.5px]">
              <thead>
                <tr className="bg-gray-200 text-gray-900 font-black">
                  <th className="border border-gray-400 px-2 py-1.5 text-center w-8">No</th>
                  <th className="border border-gray-400 px-2 py-1.5 text-left w-28">Peringkat Juara</th>
                  <th className="border border-gray-400 px-2 py-1.5 text-left">Nama Pemenang / Tim</th>
                  {lomba.tipePeserta === 'kelompok' && (
                    <th className="border border-gray-400 px-2 py-1.5 text-left">Detail Anggota</th>
                  )}
                  <th className="border border-gray-400 px-2 py-1.5 text-left w-32">Keterangan / Hadiah</th>
                </tr>
              </thead>
              <tbody>
                {/* JUARA 1 */}
                <tr className="bg-amber-50/70 font-semibold">
                  <td className="border border-gray-400 px-2 py-2 text-center font-bold">1</td>
                  <td className="border border-gray-400 px-2 py-2 text-amber-900 font-bold">JUARA I (PERTAMA)</td>
                  <td className="border border-gray-400 px-2 py-2 text-gray-900 font-extrabold">{hasilJuara.juara1?.nama || '-'}</td>
                  {lomba.tipePeserta === 'kelompok' && (
                    <td className="border border-gray-400 px-2 py-2 text-gray-700 text-[10px]">
                      {hasilJuara.juara1?.detailAnggota?.join(', ') || '-'}
                    </td>
                  )}
                  <td className="border border-gray-400 px-2 py-2 text-gray-800 text-[10px]">Tropi + Hadiah Juara I</td>
                </tr>

                {/* JUARA 2 */}
                <tr className="bg-slate-50/70">
                  <td className="border border-gray-400 px-2 py-2 text-center font-bold">2</td>
                  <td className="border border-gray-400 px-2 py-2 text-slate-800 font-bold">JUARA II (KEDUA)</td>
                  <td className="border border-gray-400 px-2 py-2 text-gray-900 font-bold">{hasilJuara.juara2?.nama || '-'}</td>
                  {lomba.tipePeserta === 'kelompok' && (
                    <td className="border border-gray-400 px-2 py-2 text-gray-700 text-[10px]">
                      {hasilJuara.juara2?.detailAnggota?.join(', ') || '-'}
                    </td>
                  )}
                  <td className="border border-gray-400 px-2 py-2 text-gray-800 text-[10px]">Tropi / Medali + Hadiah</td>
                </tr>

                {/* JUARA 3 */}
                <tr className="bg-orange-50/50">
                  <td className="border border-gray-400 px-2 py-2 text-center font-bold">3</td>
                  <td className="border border-gray-400 px-2 py-2 text-orange-900 font-bold">JUARA III (KETIGA)</td>
                  <td className="border border-gray-400 px-2 py-2 text-gray-900 font-bold">{hasilJuara.juara3?.nama || '-'}</td>
                  {lomba.tipePeserta === 'kelompok' && (
                    <td className="border border-gray-400 px-2 py-2 text-gray-700 text-[10px]">
                      {hasilJuara.juara3?.detailAnggota?.join(', ') || '-'}
                    </td>
                  )}
                  <td className="border border-gray-400 px-2 py-2 text-gray-800 text-[10px]">Tropi / Medali + Hadiah</td>
                </tr>

                {/* JUARA HARAPAN JIKA ADA */}
                {hasilJuara.juaraHarapan && (
                  <tr className="bg-purple-50/50">
                    <td className="border border-gray-400 px-2 py-2 text-center font-bold">4</td>
                    <td className="border border-gray-400 px-2 py-2 text-purple-900 font-bold">JUARA HARAPAN</td>
                    <td className="border border-gray-400 px-2 py-2 text-gray-900 font-bold">{hasilJuara.juaraHarapan.nama}</td>
                    {lomba.tipePeserta === 'kelompok' && (
                      <td className="border border-gray-400 px-2 py-2 text-gray-700 text-[10px]">
                        {hasilJuara.juaraHarapan.detailAnggota?.join(', ') || '-'}
                      </td>
                    )}
                    <td className="border border-gray-400 px-2 py-2 text-gray-800 text-[10px]">Hadiah Hiburan / Piagam</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* CATATAN RESMI */}
          <div className="text-[10px] text-gray-600 mb-5 leading-relaxed bg-gray-50 border border-gray-200 p-2.5 rounded">
            <strong>Catatan Berita Acara:</strong> Seluruh keputusan dewan juri dan panitia bersifat mutlak, sah, serta tidak dapat diganggu gugat. Berita acara ini dibuat dalam keadaan sadar dan ditandatangani oleh perwakilan pihak terkait.
          </div>

          {/* KOLOM TANDA TANGAN RESMI (3 KOLOM: KOORDINATOR, SAKSI / JURI, KETUA PANITIA) */}
          <div className="mt-4">
            <div className="text-right text-[10px] font-semibold text-gray-700 mb-2">
              Ditetapkan di: Cimanggu Wates, 17 Agustus 2026
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-[10px]">
              {/* Kolom 1: Koordinator Lomba */}
              <div>
                <p className="font-bold text-gray-800">Koordinator Seksi Lomba</p>
                <div className="h-16 flex items-end justify-center">
                  <span className="text-[9px] text-gray-400 italic">( Tanda Tangan )</span>
                </div>
                <div className="border-t border-gray-900 pt-1 font-bold text-gray-900">
                  ( ........................................ )
                </div>
              </div>

              {/* Kolom 2: Saksi / Juri Lomba */}
              <div>
                <p className="font-bold text-gray-800">Perwakilan Dewan Juri / Saksi</p>
                <div className="h-16 flex items-end justify-center">
                  <span className="text-[9px] text-gray-400 italic">( Tanda Tangan )</span>
                </div>
                <div className="border-t border-gray-900 pt-1 font-bold text-gray-900">
                  ( ........................................ )
                </div>
              </div>

              {/* Kolom 3: Ketua Panitia */}
              <div>
                <p className="font-bold text-gray-800">Ketua Panitia HUT RI RW 05</p>
                <div className="h-16 flex items-end justify-center">
                  <span className="text-[9px] text-gray-400 italic">( Tanda Tangan )</span>
                </div>
                <div className="border-t border-gray-900 pt-1 font-bold text-gray-900">
                  ( ........................................ )
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER LEMBAR 3 */}
        <div className="pt-4 border-t border-gray-300 flex items-center justify-between text-[9px] text-gray-500 mt-6">
          <span>Panitia Peringatan HUT RI Ke-81 RW 05 Cimanggu Wates</span>
          <span className="font-bold text-gray-700">Halaman 3 dari 3 (Berita Acara & Pengesahan)</span>
        </div>
      </section>

    </div>
  );
};
