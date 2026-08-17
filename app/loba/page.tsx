'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Lock, 
  User as UserIcon, 
  LogOut, 
  Trophy, 
  Plus, 
  Search, 
  Filter, 
  Swords, 
  Users, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  Cloud,
  CloudOff,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { Lomba, UserAuth } from '@/types/lomba';
import { LombaFormModal } from '@/components/lomba/LombaFormModal';
import { LombaDetailView } from '@/components/lomba/LombaDetailView';
import { LombaPrintDocument } from '@/components/lomba/LombaPrintDocument';
import { generateSingleEliminationBracket } from '@/lib/bracketUtils';
import { fetchLombaList, saveLombaToDb, deleteLombaFromDb } from '@/lib/lombaService';

const STORAGE_KEY_AUTH = 'loba_auth_user';

// Data sample awal jika penyimpanan masih kosong
const SAMPLE_LOMBA_LIST: Lomba[] = [
  {
    id: 'sample_tarik_tambang',
    judul: 'Lomba Tarik Tambang Ibu-Ibu',
    kategori: 'ibu-ibu',
    tipePeserta: 'kelompok',
    formatTanding: 'bracket',
    status: 'berlangsung',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pesertaIndividu: [],
    daftarTim: [
      { id: 'tim_rt01', namaTim: 'Srikandi RT 01', anggota: ['Ibu Siti', 'Ibu Nur', 'Ibu Ani', 'Ibu Linda'] },
      { id: 'tim_rt02', namaTim: 'Mawar Merah RT 02', anggota: ['Ibu Dewi', 'Ibu Rina', 'Ibu Maya', 'Ibu Tri'] },
      { id: 'tim_rt03', namaTim: 'Garuda Ibu RT 03', anggota: ['Ibu Wati', 'Ibu Eka', 'Ibu Yanti', 'Ibu Eni'] },
      { id: 'tim_rt04', namaTim: 'Dahlia RT 04', anggota: ['Ibu Retno', 'Ibu Endang', 'Ibu Sri', 'Ibu Lis'] }
    ],
    rounds: generateSingleEliminationBracket([
      { id: 'tim_rt01', nama: 'Srikandi RT 01', tipe: 'kelompok', detailAnggota: ['Ibu Siti', 'Ibu Nur', 'Ibu Ani', 'Ibu Linda'] },
      { id: 'tim_rt02', nama: 'Mawar Merah RT 02', tipe: 'kelompok', detailAnggota: ['Ibu Dewi', 'Ibu Rina', 'Ibu Maya', 'Ibu Tri'] },
      { id: 'tim_rt03', nama: 'Garuda Ibu RT 03', tipe: 'kelompok', detailAnggota: ['Ibu Wati', 'Ibu Eka', 'Ibu Yanti', 'Ibu Eni'] },
      { id: 'tim_rt04', nama: 'Dahlia RT 04', tipe: 'kelompok', detailAnggota: ['Ibu Retno', 'Ibu Endang', 'Ibu Sri', 'Ibu Lis'] }
    ]),
    hasilJuara: { juara1: null, juara2: null, juara3: null }
  },
  {
    id: 'sample_makan_kerupuk',
    judul: 'Lomba Makan Kerupuk Anak-Anak',
    kategori: 'anak-anak',
    tipePeserta: 'individu',
    formatTanding: 'sekaligus',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    daftarTim: [],
    rounds: [],
    pesertaIndividu: [
      { id: 'p_1', nama: 'Adit Pratama', skor: 0 },
      { id: 'p_2', nama: 'Bima Satria', skor: 0 },
      { id: 'p_3', nama: 'Citra Kirana', skor: 0 },
      { id: 'p_4', nama: 'Dimas Anggara', skor: 0 },
      { id: 'p_5', nama: 'Echa Aurelia', skor: 0 },
      { id: 'p_6', nama: 'Fajar Nugraha', skor: 0 }
    ],
    hasilJuara: { juara1: null, juara2: null, juara3: null }
  }
];

export default function LobaPage() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserAuth | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Lomba Data State
  const [lombaList, setLombaList] = useState<Lomba[]>([]);
  const [selectedLombaId, setSelectedLombaId] = useState<string | null>(null);
  const [filterKategori, setFilterKategori] = useState<string>('semua');
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCloudSync, setIsCloudSync] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLomba, setEditingLomba] = useState<Lomba | null>(null);

  // Load Data
  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const result = await fetchLombaList();
      if (result.data && result.data.length > 0) {
        setLombaList(result.data);
      } else {
        setLombaList(SAMPLE_LOMBA_LIST);
      }
      setIsCloudSync(result.isCloud);
    } catch (e) {
      console.error('Gagal mengambil data lomba:', e);
      setLombaList(SAMPLE_LOMBA_LIST);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    setIsClient(true);

    // Auth
    const savedAuth = localStorage.getItem(STORAGE_KEY_AUTH);
    if (savedAuth) {
      try {
        setCurrentUser(JSON.parse(savedAuth));
      } catch {
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }
    }

    loadData();
  }, []);

  // Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const u = usernameInput.trim();
    const p = passwordInput.trim();

    if ((u.toLowerCase() === 'ilham' || u === 'ilham') && p === 'ilham') {
      const user: UserAuth = {
        username: 'ilham',
        namaLengkap: 'Ilham (Panitia Lomba)',
        role: 'admin',
        isLoggedIn: true
      };
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    } else if (u === 'ziqi' && p === '123') {
      const user: UserAuth = {
        username: 'ziqi',
        namaLengkap: 'Ziqi (Koordinator Lomba)',
        role: 'admin',
        isLoggedIn: true
      };
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    } else {
      setLoginError('Username atau password salah! Silakan periksa kembali.');
    }
  };

  // Logout Handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_AUTH);
    setUsernameInput('');
    setPasswordInput('');
  };

  // Add or Update Lomba
  const handleSaveLomba = async (lomba: Lomba) => {
    const existsIndex = lombaList.findIndex(l => l.id === lomba.id);
    let updated: Lomba[];
    if (existsIndex >= 0) {
      updated = [...lombaList];
      updated[existsIndex] = lomba;
    } else {
      updated = [lomba, ...lombaList];
    }
    setLombaList(updated);

    // Update to Database & LocalStorage
    const res = await saveLombaToDb(lomba);
    if (res.isCloud) setIsCloudSync(true);

    if (selectedLombaId === lomba.id) {
      setSelectedLombaId(lomba.id);
    }
  };

  // Delete Lomba
  const handleDeleteLomba = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Yakin ingin menghapus data lomba ini?')) {
      const updated = lombaList.filter(l => l.id !== id);
      setLombaList(updated);
      await deleteLombaFromDb(id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('loba_competition_data', JSON.stringify(updated));
      }
      if (selectedLombaId === id) setSelectedLombaId(null);
    }
  };

  // Open Edit
  const handleOpenEdit = (lomba: Lomba, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingLomba(lomba);
    setIsModalOpen(true);
  };

  // Active Lomba for Detail View
  const currentSelectedLomba = lombaList.find(l => l.id === selectedLombaId);

  // Filtered List
  const filteredLombaList = lombaList.filter(l => {
    const matchKategori = filterKategori === 'semua' || l.kategori === filterKategori;
    const matchStatus = filterStatus === 'semua' || l.status === filterStatus;
    const matchSearch = l.judul.toLowerCase().includes(searchQuery.toLowerCase());
    return matchKategori && matchStatus && matchSearch;
  });

  // Total Statistics
  const totalLomba = lombaList.length;
  const totalBerlangsung = lombaList.filter(l => l.status === 'berlangsung').length;
  const totalSelesai = lombaList.filter(l => l.status === 'selesai').length;
  const totalPesertaSemua = lombaList.reduce((acc, l) => {
    if (l.tipePeserta === 'kelompok') {
      return acc + l.daftarTim.reduce((sum, t) => sum + (t.anggota.length || 0), 0);
    } else {
      return acc + l.pesertaIndividu.length;
    }
  }, 0);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500" />
      </div>
    );
  }

  // ==========================================
  // VIEW: LOGIN SCREEN (Jika Belum Login)
  // ==========================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Minimal Bar */}
        <header className="p-4 sm:p-6 flex items-center justify-between border-b border-slate-800/80 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-black shadow-lg shadow-red-600/30">
              17
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-wide block">PORTAL LOMBA</span>
              <span className="text-[10px] text-slate-400">HUT Kemerdekaan RI RW 05</span>
            </div>
          </div>

          <Link
            href="/"
            className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition"
          >
            ← Kembali ke ID Card
          </Link>
        </header>

        {/* Login Card Container */}
        <main className="flex-1 flex items-center justify-center p-4 relative z-10">
          <div className="w-full max-w-md bg-slate-900/90 border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
            {/* Header Login */}
            <div className="text-center space-y-2 mb-6">
              <div className="w-14 h-14 bg-gradient-to-tr from-red-600 to-rose-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-red-600/30">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Sistem Pencatatan Lomba
              </h1>
              <p className="text-xs text-slate-400">
                Silakan login panitia untuk mengelola bagan, jadwal, dan skor pertandingan
              </p>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <span className="font-bold">⚠️</span>
                <span>{loginError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Masukkan username"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-red-600 via-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" /> Masuk ke Sistem Lomba
              </button>
            </form>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-900">
          Panitia Peringatan HUT Ke-81 Republik Indonesia • RW 05
        </footer>
      </div>
    );
  }

  // ==========================================
  // VIEW: DETAIL PERTANDINGAN / BAGAN LOMBA
  // ==========================================
  if (currentSelectedLomba) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        {/* Top Navbar */}
        <header className="p-4 sm:px-8 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedLombaId(null)}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-black shadow-lg shadow-red-600/30"
            >
              17
            </button>
            <div>
              <span className="font-bold text-sm text-white tracking-wide block">ARENA LOMBA</span>
              <span className="text-[10px] text-slate-400">HUT RI RW 05</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700">
              <UserIcon className="w-3.5 h-3.5 text-red-400" />
              <span className="text-slate-300 font-semibold">{currentUser.username}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-slate-750 px-3 py-1.5 rounded-lg border border-slate-700 transition"
              title="Keluar akun"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </button>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 print:hidden">
          <LombaDetailView
            lomba={currentSelectedLomba}
            onBack={() => setSelectedLombaId(null)}
            onUpdateLomba={handleSaveLomba}
            onEditLomba={() => handleOpenEdit(currentSelectedLomba)}
          />
        </main>

        {/* Dedicated 3-Page HVS Print Document (Only Visible on Print / Download PDF) */}
        <div className="hidden print:block">
          <LombaPrintDocument lomba={currentSelectedLomba} />
        </div>

        {/* Modal Edit Lomba */}
        <LombaFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingLomba(null);
          }}
          onSave={handleSaveLomba}
          initialData={editingLomba}
        />
      </div>
    );
  }

  // ==========================================
  // VIEW: DASHBOARD DAFTAR SEMUA LOMBA
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Navbar */}
      <header className="p-4 sm:px-8 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-black shadow-lg shadow-red-600/30">
            17
          </div>
          <div>
            <span className="font-black text-sm text-white tracking-wide block">
              SISTEM PENCATATAN LOMBA 17-AN
            </span>
            <span className="text-[10px] text-red-400 font-medium">Panitia HUT RI RW 05</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Cloud Sync Badge Indicator */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
            isCloudSync 
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
          }`}>
            {isCloudSync ? <Cloud className="w-3.5 h-3.5 text-emerald-400" /> : <CloudOff className="w-3.5 h-3.5 text-amber-400" />}
            <span className="hidden sm:inline">{isCloudSync ? 'Supabase Cloud' : 'Mode Offline'}</span>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
            title="Refresh data dari database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/panitia"
            className="hidden sm:inline-flex text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
          >
            Portal ID Card →
          </Link>

          <div className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-200 font-semibold">{currentUser.username}</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-slate-750 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Banner Selamat Datang & Stats */}
        <div className="bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-900 border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 tracking-wider">
                  Dashboard Manajemen Lomba
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isCloudSync 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {isCloudSync ? '🟢 Cloud Database Active' : '🟡 Storage Local Active'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Halo, {currentUser.namaLengkap} 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Kelola jadwal, bagan pertandingan (bracket), pendaftaran peserta kelompok maupun individu, serta live scoring pencatatan juara 17-an.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingLomba(null);
                setIsModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-red-600/30 transition transform hover:-translate-y-0.5 shrink-0"
            >
              <Plus className="w-5 h-5" /> Buat Lomba Baru
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800">
            <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60">
              <span className="text-xs text-slate-400 block font-medium">Total Lomba</span>
              <span className="text-xl sm:text-2xl font-black text-white mt-1 block">{totalLomba} Lomba</span>
            </div>
            <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60">
              <span className="text-xs text-amber-400 block font-medium">Sedang Berlangsung</span>
              <span className="text-xl sm:text-2xl font-black text-amber-300 mt-1 block">{totalBerlangsung} Lomba</span>
            </div>
            <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60">
              <span className="text-xs text-emerald-400 block font-medium">Sudah Selesai</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-300 mt-1 block">{totalSelesai} Lomba</span>
            </div>
            <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60">
              <span className="text-xs text-blue-400 block font-medium">Total Peserta</span>
              <span className="text-xl sm:text-2xl font-black text-blue-300 mt-1 block">{totalPesertaSemua} Orang</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul lomba..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              {[
                { id: 'semua', label: 'Semua Status' },
                { id: 'draft', label: 'Draft' },
                { id: 'berlangsung', label: 'Berlangsung' },
                { id: 'selesai', label: 'Selesai' }
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setFilterStatus(st.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition whitespace-nowrap ${
                    filterStatus === st.id
                      ? 'bg-slate-700 text-white border-slate-600'
                      : 'bg-slate-850 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Kategori Usia Filter Buttons (3 Kategori Utama) */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800/80">
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3 text-red-400" /> Kategori:
            </span>
            {[
              { id: 'semua', label: 'Semua Kategori', emoji: '🏆' },
              { id: 'anak-anak', label: 'Anak-anak', emoji: '🧒' },
              { id: 'remaja', label: 'Remaja', emoji: '🧑‍🎤' },
              { id: 'ibu-ibu', label: 'Ibu-ibu', emoji: '👩‍🦰' },
              { id: 'umum', label: 'Umum / Lainnya', emoji: '👥' }
            ].map((kat) => (
              <button
                key={kat.id}
                type="button"
                onClick={() => setFilterKategori(kat.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 whitespace-nowrap ${
                  filterKategori === kat.id
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/20'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                <span>{kat.emoji}</span>
                <span>{kat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lomba Cards Grid */}
        {filteredLombaList.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-900 border border-slate-800 rounded-3xl">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">Tidak ada data lomba yang cocok</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Coba ubah kata kunci pencarian atau filter kategori di atas, atau buat lomba baru.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingLomba(null);
                setIsModalOpen(true);
              }}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Buat Lomba Baru
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLombaList.map((lomba) => {
              const entityCount = lomba.tipePeserta === 'kelompok' 
                ? lomba.daftarTim.length 
                : lomba.pesertaIndividu.length;

              const totalMembers = lomba.tipePeserta === 'kelompok'
                ? lomba.daftarTim.reduce((sum, t) => sum + (t.anggota.length || 0), 0)
                : lomba.pesertaIndividu.length;

              return (
                <div
                  key={lomba.id}
                  onClick={() => setSelectedLombaId(lomba.id)}
                  className="bg-slate-900 border border-slate-800 hover:border-red-500/50 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Category & Status Badges */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        lomba.kategori === 'anak-anak'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : lomba.kategori === 'remaja'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : lomba.kategori === 'ibu-ibu'
                          ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {lomba.kategori}
                      </span>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        lomba.status === 'selesai'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : lomba.status === 'berlangsung'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {lomba.status === 'selesai' ? '🏆 Selesai' : lomba.status === 'berlangsung' ? '⚡ Berlangsung' : 'Draft'}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-red-400 transition line-clamp-2">
                      {lomba.judul}
                    </h3>

                    {/* Participant Details */}
                    <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {lomba.tipePeserta === 'kelompok' 
                            ? `${entityCount} Tim (${totalMembers} orang)` 
                            : `${entityCount} Peserta Individu`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Swords className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {lomba.formatTanding === 'bracket' 
                            ? 'Bagan Knockout (Vs)' 
                            : lomba.formatTanding === 'multi_match'
                            ? 'Grup / Heat (Lolos & Gugur)'
                            : 'Sekaligus / Ranking Langsung'}
                        </span>
                      </div>
                    </div>

                    {/* Juara 1 Preview if finished */}
                    {lomba.hasilJuara?.juara1 && (
                      <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2 text-xs">
                        <span className="text-base">🏆</span>
                        <div className="min-w-0">
                          <span className="text-[10px] text-amber-400 font-bold block">JUARA 1</span>
                          <span className="font-bold text-white truncate block">{lomba.hasilJuara.juara1.nama}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEdit(lomba, e)}
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
                        title="Edit Lomba"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteLomba(lomba.id, e)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                        title="Hapus Lomba"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <span className="text-xs font-bold text-red-400 flex items-center gap-1 group-hover:translate-x-1 transition">
                      Buka Arena <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Form Tambah / Edit Lomba */}
      <LombaFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLomba(null);
        }}
        onSave={handleSaveLomba}
        initialData={editingLomba}
      />

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-900 mt-10">
        Sistem Pencatatan & Bracket Lomba 17-an RW 05 • Hak Cipta Panitia HUT RI
      </footer>
    </div>
  );
}
