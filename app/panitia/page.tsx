'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import {
  Download,
  Upload,
  User,
  Shield,
  Save,
  CheckCircle2,
  RefreshCw,
  Palette,
  AlertCircle,
  Database,
  Sparkles,
  Printer,
  ChevronRight,
  Layers
} from 'lucide-react';
import { IdCardPreview } from '@/components/IdCardPreview';
import { PhotoAdjuster } from '@/components/PhotoAdjuster';
import { PanitiaData } from '@/types/panitia';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import Link from 'next/link';

const DIVISIONS = [
  'Umum',
  'Ketua Pelaksana',
  'Wakil Ketua',
  'Sekretaris',
  'Bendahara',
  'Seksi Acara & Protokoler',
  'Seksi Perlombaan',
  'Seksi Keamanan & Ketertiban',
  'Seksi Konsumsi',
  'Seksi Humas & Publikasi',
  'Seksi Logistik & Perlengkapan',
  'Seksi Dokumentasi & Kreatif',
  'Seksi Kebersihan & P3K',
];

export default function PanitiaPage() {
  const cardRef = useRef<HTMLDivElement>(null);

  // Form & Card State
  const [name, setName] = useState<string>('ILHAM MAULANA');
  const [role, setRole] = useState<string>('PANITIA');
  const [division, setDivision] = useState<string>('Seksi Acara & Protokoler');
  const [cardNumber, setCardNumber] = useState<string>('IPPCW-17-001');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoScale, setPhotoScale] = useState<number>(1.0);
  const [photoPosition, setPhotoPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [themeVariant, setThemeVariant] = useState<'gold_modern' | 'dark_elegance' | 'classic'>('gold_modern');

  // UI state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savedPanitiaList, setSavedPanitiaList] = useState<PanitiaData[]>([]);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(false);

  // Default initial demo photo
  useEffect(() => {
    // Generate a random card number on mount
    const randomNum = Math.floor(100 + Math.random() * 900);
    setCardNumber(`IPPCW-17-${randomNum}`);
  }, []);

  // Fetch saved cards from Supabase or LocalStorage
  const fetchPanitiaList = useCallback(async () => {
    setIsLoadingList(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('panitia_cards')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase fetch error:', error);
          loadLocalList();
        } else if (data) {
          const mapped: PanitiaData[] = data.map((item) => ({
            id: item.id,
            name: item.name,
            role: item.role,
            division: item.division,
            cardNumber: item.card_number,
            photoUrl: item.photo_url,
            photoScale: item.photo_scale,
            photoPosition: item.photo_position,
            themeVariant: item.theme_variant,
            created_at: item.created_at,
          }));
          setSavedPanitiaList(mapped);
        }
      } else {
        loadLocalList();
      }
    } catch (err) {
      console.error('Error fetching list:', err);
      loadLocalList();
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  const loadLocalList = () => {
    try {
      const local = localStorage.getItem('ippcw_panitia_cards');
      if (local) {
        setSavedPanitiaList(JSON.parse(local));
      }
    } catch (e) {
      console.error('Local storage error:', e);
    }
  };

  useEffect(() => {
    fetchPanitiaList();
  }, [fetchPanitiaList]);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setStatusMessage({ type: 'error', text: 'Ukuran foto maksimal 8MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
          setPhotoScale(1.0);
          setPhotoPosition({ x: 0, y: 0 });
          setStatusMessage({ type: 'success', text: 'Foto berhasil diunggah! Sesuaikan posisi di bawah.' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger Confetti
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#DC2626', '#FFFFFF', '#F59E0B', '#18181B'],
      });
    } catch {
      // ignore
    }
  };

  // Download ID Card as HD PNG
  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    setStatusMessage(null);

    try {
      // Export at high resolution (pixelRatio 3 for crisp print output)
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.98,
        pixelRatio: 3,
        cacheBust: true,
      });

      const link = document.createElement('a');
      const sanitizedName = (name || 'panitia').replace(/\s+/g, '_').toLowerCase();
      link.download = `ID_CARD_${sanitizedName}_IPPCW_17.png`;
      link.href = dataUrl;
      link.click();

      triggerCelebration();
      setStatusMessage({
        type: 'success',
        text: 'ID Card berhasil diunduh dalam kualitas HD (Siap Cetak)!',
      });
    } catch (err) {
      console.error('Download error:', err);
      setStatusMessage({
        type: 'error',
        text: 'Gagal mengunduh gambar kartu. Coba periksa foto Anda.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Save Card to Supabase / Local Storage
  const handleSaveData = async () => {
    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'Mohon masukkan nama panitia terlebih dahulu.' });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    const newEntry: PanitiaData = {
      id: crypto.randomUUID(),
      name: name.trim().toUpperCase(),
      role: role.trim().toUpperCase(),
      division,
      cardNumber,
      photoUrl,
      photoScale,
      photoPosition,
      themeVariant,
      created_at: new Date().toISOString(),
    };

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('panitia_cards').insert([
          {
            name: newEntry.name,
            role: newEntry.role,
            division: newEntry.division,
            card_number: newEntry.cardNumber,
            photo_url: newEntry.photoUrl,
            photo_scale: newEntry.photoScale,
            photo_position: newEntry.photoPosition,
            theme_variant: newEntry.themeVariant,
          },
        ]);

        if (error) {
          console.warn('Supabase insert failed:', error);
          saveToLocal(newEntry);
          setStatusMessage({
            type: 'success',
            text: 'Data kartu disimpan ke memori lokal browser (Tabel Supabase belum terhubung).',
          });
        } else {
          triggerCelebration();
          setStatusMessage({
            type: 'success',
            text: 'Data kartu berhasil tersimpan ke Database Supabase!',
          });
        }
      } else {
        saveToLocal(newEntry);
        setStatusMessage({
          type: 'success',
          text: 'Data kartu berhasil disimpan secara lokal! (Siap diekspor ke Supabase saat variabel diset)',
        });
      }

      fetchPanitiaList();
    } catch (err) {
      console.error('Save error:', err);
      saveToLocal(newEntry);
    } finally {
      setIsSaving(false);
    }
  };

  const saveToLocal = (item: PanitiaData) => {
    try {
      const existing = localStorage.getItem('ippcw_panitia_cards');
      const list: PanitiaData[] = existing ? JSON.parse(existing) : [];
      const updated = [item, ...list];
      localStorage.setItem('ippcw_panitia_cards', JSON.stringify(updated));
      setSavedPanitiaList(updated);
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  };

  // Load a saved card back into editor
  const handleLoadCard = (item: PanitiaData) => {
    setName(item.name);
    setRole(item.role || 'PANITIA');
    setDivision(item.division || 'Umum');
    if (item.cardNumber) setCardNumber(item.cardNumber);
    if (item.photoUrl) setPhotoUrl(item.photoUrl);
    if (item.photoScale) setPhotoScale(item.photoScale);
    if (item.photoPosition) setPhotoPosition(item.photoPosition);
    if (item.themeVariant) setThemeVariant(item.themeVariant);

    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStatusMessage({
      type: 'success',
      text: `Kartu panitia "${item.name}" berhasil dimuat ke editor!`,
    });
  };

  const currentCardData: PanitiaData = {
    name: name || 'NAMA PANITIA',
    role: role || 'PANITIA',
    division,
    cardNumber,
    photoUrl,
    photoScale,
    photoPosition,
    themeVariant,
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-red-600 selection:text-white pb-20">
      {/* Top Banner Navigation */}
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-red-500 to-amber-400 p-0.5 flex items-center justify-center shadow-lg shadow-red-900/30">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center font-black text-amber-400 text-sm">
                17
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white tracking-wider text-base">
                  IPPCW REBORN
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 font-bold uppercase">
                  Cimanggu Wates
                </span>
              </div>
              <p className="text-xs text-neutral-400">Generator ID Card Panitia HUT RI</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-neutral-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-neutral-800"
            >
              Beranda
            </Link>

            <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-neutral-300">
                {isSupabaseConfigured ? 'Supabase Connected' : 'Local Database'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Studio Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/60 border border-red-700/50 text-red-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>ID Card Generator 17 Agustus</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
            Buat Kartu Panitia <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-300 to-white">IPPCW REBORN</span>
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Kustomisasi nama, divisi, foto panitia dengan tema Merah Putih & aksen Emas-Hitam elegan berukuran pas KTP.
          </p>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div
            className={`max-w-3xl mx-auto mb-6 p-4 rounded-xl flex items-center gap-3 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                : 'bg-red-950/50 border-red-500/50 text-red-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span className="text-sm font-medium">{statusMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: FORM & CONTROLS (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Data Panitia Form */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-2xl backdrop-blur-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                <User className="w-5 h-5 text-red-500" />
                <h2 className="font-bold text-lg text-white">1. Masukkan Data Panitia</h2>
              </div>

              {/* Nama Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  Nama Lengkap Panitia <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: AHMAD FAUZI"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm font-medium"
                />
              </div>

              {/* Role & Division Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    Status / Label Utama
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="PANITIA"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition text-sm font-bold uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Seksi / Divisi
                  </label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400 transition text-sm"
                  >
                    {DIVISIONS.map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ID Card Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  Nomor Identitas Kartu
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2 text-neutral-300 font-mono text-sm focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setCardNumber(`IPPCW-17-${Math.floor(100 + Math.random() * 900)}`)}
                    className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium flex items-center gap-1 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Acak
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Upload & Customize Photo */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-2xl backdrop-blur-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                <Upload className="w-5 h-5 text-amber-400" />
                <h2 className="font-bold text-lg text-white">2. Upload & Sesuaikan Foto</h2>
              </div>

              {/* Upload Input */}
              <div>
                <label className="block w-full cursor-pointer">
                  <div className="border-2 border-dashed border-neutral-700 hover:border-amber-400/80 bg-neutral-950 rounded-2xl p-6 text-center transition group">
                    <div className="w-12 h-12 mx-auto rounded-full bg-neutral-900 group-hover:bg-amber-400/20 text-neutral-400 group-hover:text-amber-400 flex items-center justify-center mb-3 transition">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold text-neutral-200 block">
                      Klik untuk Upload Foto Panitia
                    </span>
                    <span className="text-xs text-neutral-500 mt-1 block">
                      Mendukung format JPG, PNG, WEBP (Maksimal 8MB)
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Photo Adjuster Component */}
              <PhotoAdjuster
                scale={photoScale}
                position={photoPosition}
                onScaleChange={setPhotoScale}
                onPositionChange={setPhotoPosition}
                onReset={() => {
                  setPhotoScale(1.0);
                  setPhotoPosition({ x: 0, y: 0 });
                }}
                hasPhoto={Boolean(photoUrl)}
              />
            </div>

            {/* 3. Theme Selector */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-2xl backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                <Palette className="w-5 h-5 text-amber-400" />
                <h2 className="font-bold text-lg text-white">3. Pilihan Tema Kartu</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setThemeVariant('gold_modern')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    themeVariant === 'gold_modern'
                      ? 'bg-amber-950/40 border-amber-400 text-white shadow-lg shadow-amber-950/50'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase">Gold Modern</span>
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    Kombinasi Putih, Merah & Bingkai Emas Mewah (Rekomendasi)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setThemeVariant('dark_elegance')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    themeVariant === 'dark_elegance'
                      ? 'bg-zinc-900 border-amber-400 text-white shadow-lg'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase">Dark Elegance</span>
                    <span className="w-3 h-3 rounded-full bg-zinc-900 border border-amber-400"></span>
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    Background Hitam Tegas dengan Aksen Merah Emas
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setThemeVariant('classic')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    themeVariant === 'classic'
                      ? 'bg-red-950/40 border-red-500 text-white shadow-lg'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase">Patriot Red</span>
                    <span className="w-3 h-3 rounded-full bg-red-600"></span>
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    Dominan Merah Menyala Khas Semangat 45
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: REAL-TIME PREVIEW & ACTIONS (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-2xl backdrop-blur-sm flex flex-col items-center">
              <div className="w-full flex items-center justify-between border-b border-neutral-800 pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-base text-white">Live Preview ID Card</h3>
                </div>
                <span className="text-[11px] font-mono bg-neutral-800 px-2.5 py-1 rounded-full text-neutral-400">
                  Rasio KTP (54x86mm)
                </span>
              </div>

              {/* Visual Card Wrapper for DOM Capture */}
              <div className="py-2 flex justify-center w-full overflow-hidden">
                <IdCardPreview ref={cardRef} data={currentCardData} />
              </div>

              {/* Action Buttons */}
              <div className="w-full mt-6 space-y-3">
                {/* Download HD Button */}
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold text-sm tracking-wide shadow-xl shadow-red-900/40 hover:shadow-amber-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-5 h-5" />
                  {isGenerating ? 'Memproses HD Image...' : 'Download ID Card (HD PNG)'}
                </button>

                {/* Save to Supabase Button */}
                <button
                  type="button"
                  onClick={handleSaveData}
                  disabled={isSaving}
                  className="w-full py-3 px-6 rounded-2xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-bold text-sm tracking-wide active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-emerald-400" />
                  {isSaving ? 'Menyimpan...' : 'Simpan Data ke Database'}
                </button>
              </div>
            </div>

            {/* Supabase Connection Helper Info */}
            {!isSupabaseConfigured && (
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 text-xs text-neutral-400 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Database className="w-4 h-4" />
                  <span>Tips Koneksi Supabase</span>
                </div>
                <p>
                  Aplikasi saat ini berjalan dalam mode <strong>Local Storage</strong>. Untuk menyimpan data secara online ke Supabase, tambahkan env variable:
                </p>
                <div className="bg-black/80 rounded-lg p-2 font-mono text-[10px] text-neutral-300 select-all space-y-1">
                  <div>NEXT_PUBLIC_SUPABASE_URL=...</div>
                  <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=...</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION: RIWAYAT KARTU PANITIA TERDAFTAR */}
        <div className="mt-16 border-t border-neutral-800 pt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-red-500" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wide">
                  Daftar Kartu Panitia Terdaftar
                </h2>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Koleksi kartu panitia yang sudah dibuat. Klik kartu untuk mengedit atau mendownload ulang.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchPanitiaList}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-300 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {savedPanitiaList.length === 0 ? (
            <div className="bg-neutral-900/50 border border-dashed border-neutral-800 rounded-3xl p-12 text-center">
              <User className="w-12 h-12 mx-auto text-neutral-600 mb-3" />
              <h3 className="text-base font-semibold text-neutral-300">Belum ada kartu tersimpan</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Gunakan form di atas untuk membuat kartu panitia pertama Anda!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {savedPanitiaList.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => handleLoadCard(item)}
                  className="group bg-neutral-900/80 hover:bg-neutral-800/80 border border-neutral-800 hover:border-amber-400/50 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-amber-500/10 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-950 border border-amber-400/60 shrink-0">
                      {item.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.photoUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-amber-400 text-xs font-bold">
                          {item.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-sm text-white truncate group-hover:text-amber-300 transition">
                        {item.name}
                      </h4>
                      <p className="text-xs text-red-400 font-semibold">{item.role}</p>
                      <p className="text-[10px] text-neutral-400 truncate">{item.division}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400">
                    <span className="font-mono text-neutral-500">{item.cardNumber}</span>
                    <span className="flex items-center gap-1 text-amber-400 font-medium">
                      Buka Kartu <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
