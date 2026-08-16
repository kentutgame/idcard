'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Users, 
  User, 
  Trophy, 
  Swords, 
  ListOrdered,
  Sparkles,
  Layers
} from 'lucide-react';
import { 
  Lomba, 
  KategoriLomba, 
  TipePeserta, 
  FormatTanding, 
  TimPeserta, 
  PesertaIndividu 
} from '@/types/lomba';
import { 
  convertToPesertaRefs, 
  generateSingleEliminationBracket,
  generateInitialMultiMatches 
} from '@/lib/bracketUtils';

interface LombaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lomba: Lomba) => void;
  initialData?: Lomba | null;
}

export const LombaFormModal: React.FC<LombaFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState<KategoriLomba>('anak-anak');
  const [tipePeserta, setTipePeserta] = useState<TipePeserta>('kelompok');
  const [formatTanding, setFormatTanding] = useState<FormatTanding>('bracket');
  const [daftarTim, setDaftarTim] = useState<TimPeserta[]>([]);
  const [pesertaIndividu, setPesertaIndividu] = useState<PesertaIndividu[]>([]);

  const [bulkInput, setBulkInput] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);

  // SINKRONISASI DATA KETIKA MODAL DIBUKA (EDIT vs TAMBAH BARU)
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      // Mode Edit: Isi semua data yang sudah ada
      setJudul(initialData.judul || '');
      setKategori(initialData.kategori || 'anak-anak');
      setTipePeserta(initialData.tipePeserta || 'kelompok');
      setFormatTanding(initialData.formatTanding || 'bracket');

      if (initialData.daftarTim && initialData.daftarTim.length > 0) {
        setDaftarTim(JSON.parse(JSON.stringify(initialData.daftarTim)));
      } else {
        setDaftarTim([
          { id: 'tim_1', namaTim: 'Tim A', anggota: ['Peserta 1', 'Peserta 2'] },
          { id: 'tim_2', namaTim: 'Tim B', anggota: ['Peserta 1', 'Peserta 2'] }
        ]);
      }

      if (initialData.pesertaIndividu && initialData.pesertaIndividu.length > 0) {
        setPesertaIndividu(JSON.parse(JSON.stringify(initialData.pesertaIndividu)));
      } else {
        setPesertaIndividu([
          { id: 'p_1', nama: 'Peserta 1' },
          { id: 'p_2', nama: 'Peserta 2' },
          { id: 'p_3', nama: 'Peserta 3' },
          { id: 'p_4', nama: 'Peserta 4' }
        ]);
      }
    } else {
      // Mode Tambah Baru: Set default
      setJudul('');
      setKategori('anak-anak');
      setTipePeserta('kelompok');
      setFormatTanding('bracket');
      setDaftarTim([
        { id: 'tim_1', namaTim: 'Tim A', anggota: ['Peserta 1', 'Peserta 2'] },
        { id: 'tim_2', namaTim: 'Tim B', anggota: ['Peserta 1', 'Peserta 2'] }
      ]);
      setPesertaIndividu([
        { id: 'p_1', nama: 'Peserta 1' },
        { id: 'p_2', nama: 'Peserta 2' },
        { id: 'p_3', nama: 'Peserta 3' },
        { id: 'p_4', nama: 'Peserta 4' }
      ]);
    }
    setBulkInput('');
    setShowBulkInput(false);
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // Handler Tim
  const handleAddTim = () => {
    const nextNum = daftarTim.length + 1;
    const alphabet = String.fromCharCode(64 + nextNum);
    const newTim: TimPeserta = {
      id: `tim_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      namaTim: `Tim ${alphabet || nextNum}`,
      anggota: ['']
    };
    setDaftarTim([...daftarTim, newTim]);
  };

  const handleUpdateNamaTim = (index: number, nama: string) => {
    const updated = [...daftarTim];
    updated[index].namaTim = nama;
    setDaftarTim(updated);
  };

  const handleDeleteTim = (index: number) => {
    if (daftarTim.length <= 2) {
      alert('Minimal harus ada 2 tim!');
      return;
    }
    setDaftarTim(daftarTim.filter((_, i) => i !== index));
  };

  const handleAddAnggota = (timIndex: number) => {
    const updated = [...daftarTim];
    updated[timIndex].anggota.push('');
    setDaftarTim(updated);
  };

  const handleUpdateAnggota = (timIndex: number, anggotaIndex: number, nama: string) => {
    const updated = [...daftarTim];
    updated[timIndex].anggota[anggotaIndex] = nama;
    setDaftarTim(updated);
  };

  const handleDeleteAnggota = (timIndex: number, anggotaIndex: number) => {
    const updated = [...daftarTim];
    updated[timIndex].anggota = updated[timIndex].anggota.filter((_, i) => i !== anggotaIndex);
    setDaftarTim(updated);
  };

  // Handler Individu
  const handleAddIndividu = () => {
    const newP: PesertaIndividu = {
      id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      nama: `Peserta ${pesertaIndividu.length + 1}`
    };
    setPesertaIndividu([...pesertaIndividu, newP]);
  };

  const handleUpdateIndividu = (index: number, nama: string) => {
    const updated = [...pesertaIndividu];
    updated[index].nama = nama;
    setPesertaIndividu(updated);
  };

  const handleDeleteIndividu = (index: number) => {
    if (pesertaIndividu.length <= 2) {
      alert('Minimal harus ada 2 peserta!');
      return;
    }
    setPesertaIndividu(pesertaIndividu.filter((_, i) => i !== index));
  };

  const handleApplyBulkIndividu = () => {
    if (!bulkInput.trim()) return;
    const lines = bulkInput
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(Boolean);

    if (lines.length > 0) {
      const newItems: PesertaIndividu[] = lines.map((name, idx) => ({
        id: `p_${Date.now()}_${idx}`,
        nama: name
      }));
      setPesertaIndividu(newItems);
      setBulkInput('');
      setShowBulkInput(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!judul.trim()) {
      alert('Silakan masukkan judul lomba!');
      return;
    }

    // Filter data kosong
    const cleanedTim: TimPeserta[] = daftarTim.map(t => ({
      ...t,
      namaTim: t.namaTim.trim() || 'Tim Tanpa Nama',
      anggota: t.anggota.map(a => a.trim()).filter(Boolean)
    }));

    const cleanedIndividu: PesertaIndividu[] = pesertaIndividu
      .map(p => ({ ...p, nama: p.nama.trim() }))
      .filter(p => p.nama.length > 0);

    if (tipePeserta === 'kelompok' && cleanedTim.length < 2) {
      alert('Minimal butuh 2 tim untuk membuat lomba!');
      return;
    }

    if (tipePeserta === 'individu' && cleanedIndividu.length < 2) {
      alert('Minimal butuh 2 peserta untuk membuat lomba!');
      return;
    }

    const pesertaRefs = convertToPesertaRefs(tipePeserta, cleanedTim, cleanedIndividu);

    // Initial Bracket Setup
    const initialRounds = formatTanding === 'bracket' 
      ? generateSingleEliminationBracket(pesertaRefs)
      : [];

    // Initial MultiMatch Setup
    const initialMultiMatches = formatTanding === 'multi_match'
      ? generateInitialMultiMatches(pesertaRefs)
      : [];

    const newLomba: Lomba = {
      id: initialData?.id || `lomba_${Date.now()}`,
      judul: judul.trim(),
      kategori,
      tipePeserta,
      formatTanding,
      status: initialData?.status || 'draft',
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pesertaIndividu: cleanedIndividu,
      daftarTim: cleanedTim,
      rounds: initialData?.rounds && initialData.rounds.length > 0 && initialData.tipePeserta === tipePeserta && formatTanding === 'bracket'
        ? initialData.rounds
        : initialRounds,
      multiMatches: initialData?.multiMatches && initialData.multiMatches.length > 0 && formatTanding === 'multi_match'
        ? initialData.multiMatches
        : initialMultiMatches,
      hasilJuara: initialData?.hasilJuara || {
        juara1: null,
        juara2: null,
        juara3: null
      }
    };

    onSave(newLomba);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl text-white overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-700 via-red-600 to-rose-700 border-b border-red-500/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-lg">
              <Trophy className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialData ? 'Edit Data Lomba' : 'Tambah Lomba Baru 17-an'}
              </h2>
              <p className="text-xs text-red-100">Atur judul, kategori usia, peserta & sistem pertandingan</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Judul Lomba */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-1.5">
              Judul / Nama Lomba <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Lomba Tarik Tambang, Lomba Balap Karung Helm, dll."
              className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
            />
          </div>

          {/* Kategori Usia (3 Kategori Utama) */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Kategori Peserta <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'anak-anak', label: 'Anak-anak', emoji: '🧒', desc: 'TK - SD' },
                { id: 'remaja', label: 'Remaja', emoji: '🧑‍🎤', desc: 'SMP - SMA' },
                { id: 'ibu-ibu', label: 'Ibu-ibu', emoji: '👩‍🦰', desc: 'Ibu & Warga' },
                { id: 'umum', label: 'Umum / Lainnya', emoji: '👥', desc: 'Bapak / Umum' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setKategori(item.id as KategoriLomba)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col items-start ${
                    kategori === item.id
                      ? 'bg-red-500/20 border-red-500 text-white shadow-lg shadow-red-500/10'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-2xl mb-1">{item.emoji}</span>
                  <span className="font-bold text-sm">{item.label}</span>
                  <span className="text-[11px] text-slate-400">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tipe & Format Tanding */}
          <div className="space-y-4">
            {/* Tipe Peserta */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Tipe Peserta <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTipePeserta('kelompok')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition ${
                    tipePeserta === 'kelompok'
                      ? 'bg-red-600 text-white border-red-500 shadow'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <Users className="w-4 h-4" /> Kelompok / Tim
                </button>
                <button
                  type="button"
                  onClick={() => setTipePeserta('individu')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition ${
                    tipePeserta === 'individu'
                      ? 'bg-red-600 text-white border-red-500 shadow'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <User className="w-4 h-4" /> Individu
                </button>
              </div>
            </div>

            {/* Format Tanding (3 Pilihan) */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Format Pertandingan <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormatTanding('bracket')}
                  className={`flex flex-col items-start p-3 rounded-xl border text-xs font-semibold transition ${
                    formatTanding === 'bracket'
                      ? 'bg-amber-600/30 border-amber-500 text-white shadow-lg shadow-amber-600/10'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-sm mb-1 text-amber-400">
                    <Swords className="w-4 h-4" /> Bracket (1 vs 1)
                  </div>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Bagan eliminasi turnamen Tim vs Tim atau 1 lawan 1
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormatTanding('multi_match')}
                  className={`flex flex-col items-start p-3 rounded-xl border text-xs font-semibold transition ${
                    formatTanding === 'multi_match'
                      ? 'bg-purple-600/30 border-purple-500 text-white shadow-lg shadow-purple-600/10'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-sm mb-1 text-purple-400">
                    <Layers className="w-4 h-4" /> Multi-Peserta & Poin
                  </div>
                  <span className="text-[11px] text-slate-400 font-normal">
                    1 Match bisa &gt;2 peserta, perolehan poin ditentukan panitia
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormatTanding('sekaligus')}
                  className={`flex flex-col items-start p-3 rounded-xl border text-xs font-semibold transition ${
                    formatTanding === 'sekaligus'
                      ? 'bg-blue-600/30 border-blue-500 text-white shadow-lg shadow-blue-600/10'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-sm mb-1 text-blue-400">
                    <ListOrdered className="w-4 h-4" /> Sekaligus (Massal)
                  </div>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Semua peserta main sekaligus dalam 1 tabel ranking langsung
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4">
            {/* Bagian Input Kelompok / Tim */}
            {tipePeserta === 'kelompok' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-red-400" /> Daftar Tim & Anggota
                    </h3>
                    <p className="text-xs text-slate-400">
                      Tambahkan nama tim serta nama anggota yang berpartisipasi di tiap tim
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTim}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Tim
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {daftarTim.map((tim, timIdx) => (
                    <div 
                      key={tim.id || timIdx}
                      className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={tim.namaTim}
                          onChange={(e) => handleUpdateNamaTim(timIdx, e.target.value)}
                          placeholder={`Nama Tim ${timIdx + 1}`}
                          className="font-bold text-sm bg-slate-900/90 border border-slate-600 px-2.5 py-1.5 rounded-lg text-white w-full focus:ring-1 focus:ring-red-500 focus:outline-none"
                        />
                        {daftarTim.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTim(timIdx)}
                            className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-700/60 transition"
                            title="Hapus Tim"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Anggota Tim */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Anggota ({tim.anggota.length}):</span>
                          <button
                            type="button"
                            onClick={() => handleAddAnggota(timIdx)}
                            className="text-red-400 hover:text-red-300 flex items-center gap-1 font-medium"
                          >
                            <Plus className="w-3 h-3" /> Tambah Anggota
                          </button>
                        </div>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {tim.anggota.map((anggota, aIdx) => (
                            <div key={aIdx} className="flex items-center gap-1.5">
                              <span className="text-[11px] text-slate-500 w-4 text-right">{aIdx + 1}.</span>
                              <input
                                type="text"
                                value={anggota}
                                onChange={(e) => handleUpdateAnggota(timIdx, aIdx, e.target.value)}
                                placeholder={`Nama anggota ${aIdx + 1}`}
                                className="flex-1 text-xs bg-slate-900/60 border border-slate-700/80 px-2 py-1 rounded text-slate-200 focus:ring-1 focus:ring-red-500 focus:outline-none"
                              />
                              {tim.anggota.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAnggota(timIdx, aIdx)}
                                  className="text-slate-500 hover:text-red-400 p-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bagian Input Individu */}
            {tipePeserta === 'individu' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-red-400" /> Daftar Nama Peserta ({pesertaIndividu.length})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Masukkan nama-nama peserta yang akan bertanding
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBulkInput(!showBulkInput)}
                      className="text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg transition"
                    >
                      {showBulkInput ? 'Tutup Paste Massal' : 'Paste Banyak Nama'}
                    </button>
                    <button
                      type="button"
                      onClick={handleAddIndividu}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Peserta
                    </button>
                  </div>
                </div>

                {showBulkInput && (
                  <div className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl space-y-2">
                    <label className="text-xs text-slate-300 font-medium">
                      Tempel/Paste daftar nama (pisahkan dengan baris baru atau koma):
                    </label>
                    <textarea
                      rows={3}
                      value={bulkInput}
                      onChange={(e) => setBulkInput(e.target.value)}
                      placeholder="Contoh:&#10;Budi Santoso&#10;Ahmad Fauzi&#10;Siti Rahma&#10;Dewi Lestari"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleApplyBulkIndividu}
                        className="text-xs px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-medium rounded-md transition"
                      >
                        Terapkan Nama
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {pesertaIndividu.map((peserta, pIdx) => (
                    <div 
                      key={peserta.id || pIdx}
                      className="flex items-center gap-2 p-2 bg-slate-800/80 border border-slate-700/80 rounded-lg"
                    >
                      <span className="text-xs font-bold text-slate-500 w-5 text-right">{pIdx + 1}.</span>
                      <input
                        type="text"
                        value={peserta.nama}
                        onChange={(e) => handleUpdateIndividu(pIdx, e.target.value)}
                        placeholder={`Nama Peserta ${pIdx + 1}`}
                        className="flex-1 text-xs bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                      {pesertaIndividu.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteIndividu(pIdx)}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Tombol */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl shadow-lg shadow-red-600/30 flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" /> {initialData ? 'Simpan Perubahan' : 'Simpan & Buat Lomba'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
