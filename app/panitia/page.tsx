'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import {
  Download,
  Upload,
  User,
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
import Image from 'next/image';



export default function PanitiaPage() {
  const cardRef = useRef<HTMLDivElement>(null);

  // Form & Card State
  const [name, setName] = useState<string>('ILHAM MAULANA');
  const [cardNumber, setCardNumber] = useState<string>('IPPCW-17-001');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoScale, setPhotoScale] = useState<number>(1.0);
  const [photoPosition, setPhotoPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [themeVariant, setThemeVariant] = useState<'gold_modern' | 'dark_patriot' | 'classic'>('gold_modern');

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
      role: 'PANITIA',
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
    if (item.cardNumber) setCardNumber(item.cardNumber);
    if (item.photoUrl) setPhotoUrl(item.photoUrl);
    if (item.photoScale) setPhotoScale(item.photoScale);
    if (item.photoPosition) setPhotoPosition(item.photoPosition);
    if (item.themeVariant) setThemeVariant(item.themeVariant as 'gold_modern' | 'dark_patriot' | 'classic');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStatusMessage({
      type: 'success',
      text: `Kartu panitia "${item.name}" berhasil dimuat ke editor!`,
    });
  };

  const currentCardData: PanitiaData = {
    name: name || 'NAMA PANITIA',
    role: 'PANITIA',
    cardNumber,
    photoUrl,
    photoScale,
    photoPosition,
    themeVariant,
  };

  return (
    <div className="min-h-screen bg-[#160000] text-neutral-100 font-sans selection:bg-yellow-400 selection:text-red-900 pb-20">
      {/* Top Banner Navigation */}
      <header className="border-b border-red-900/60 bg-[#1A0000]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-10">
              <Image src="/ippcw-reborn-logo.png" alt="IPPCW REBORN" fill className="object-contain" priority />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white tracking-wider text-base">
                  IPPCW REBORN
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 font-bold uppercase">
                  Cimanggu Wates
                </span>
              </div>
              <p className="text-xs text-purple-300/70">Generator ID Card Panitia HUT RI</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-red-300/70 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-red-900/40"
            >
              Beranda
            </Link>

            <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-900/40 border border-red-700/50">
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/60 border border-red-600/50 text-yellow-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>ID Card Generator 17 Agustus</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
            Buat Kartu Panitia <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-300 to-yellow-400">IPPCW REBORN</span>
          </h1>
          <p className="mt-2 text-sm text-red-200/60">
            Kustomisasi nama, divisi, foto panitia dengan tema Merah Putih & aksen Emas-Hitam elegan berukuran pas KTP.
          </p>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div
            className={`max-w-3xl mx-auto mb-6 p-4 rounded-xl flex items-center gap-3 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                : 'bg-yellow-950/50 border-yellow-600/50 text-yellow-200'
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
            <div className="bg-red-950/30 border border-red-900/50 rounded-3xl p-6 shadow-2xl backdrop-blur-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-red-900/50 pb-3">
                <User className="w-5 h-5 text-yellow-400" />
                <h2 className="font-bold text-lg text-white">1. Masukkan Data Panitia</h2>
              </div>

              {/* Nama Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-red-200 uppercase tracking-wider">
                  Nama Lengkap Panitia <span className="text-yellow-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: AHMAD FAUZI"
                  className="w-full bg-black/60 border border-red-700/60 rounded-xl px-4 py-3 text-white placeholder-red-400/30 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition text-sm font-medium"
                />
              </div>

              {/* Kartu info: badge fixed PANITIA */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
                <span className="text-yellow-400 font-black text-lg">★</span>
                <div>
                  <p className="text-xs text-yellow-200/60 uppercase tracking-wider">Status Kartu</p>
                  <p className="font-black text-yellow-300 text-base tracking-widest">PANITIA</p>
                </div>
                <p className="text-xs text-red-300/50 ml-auto italic">Badge otomatis</p>
              </div>

              {/* ID Card Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-red-200 uppercase tracking-wider">
                  Nomor Identitas Kartu
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-black/60 border border-red-700/60 rounded-xl px-4 py-2 text-red-200 font-mono text-sm focus:outline-none focus:border-yellow-400"
                  />
                  <button
                    type="button"
                    onClick={() => setCardNumber(`IPPCW-17-${Math.floor(100 + Math.random() * 900)}`)}
                    className="px-3 py-2 rounded-xl bg-red-900/50 hover:bg-red-800/60 text-yellow-300 text-xs font-medium flex items-center gap-1 transition border border-red-700/50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Acak
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Upload & Customize Photo */}
            <div className="bg-red-950/30 border border-red-900/50 rounded-3xl p-6 shadow-2xl backdrop-blur-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-red-900/50 pb-3">
                <Upload className="w-5 h-5 text-yellow-400" />
                <h2 className="font-bold text-lg text-white">2. Upload & Sesuaikan Foto</h2>
              </div>

              {/* Upload Input */}
              <div>
                <label className="block w-full cursor-pointer">
                  <div className="border-2 border-dashed border-red-700/50 hover:border-yellow-400/80 bg-black/50 rounded-2xl p-6 text-center transition group">
                    <div className="w-12 h-12 mx-auto rounded-full bg-red-900/40 group-hover:bg-yellow-400/20 text-red-300 group-hover:text-yellow-400 flex items-center justify-center mb-3 transition">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold text-red-100 block">
                      Klik untuk Upload Foto Panitia
                    </span>
                    <span className="text-xs text-red-300/50 mt-1 block">
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

            {/* 3. Pilihan Design Kartu */}
            <div className="bg-red-950/30 border border-red-900/50 rounded-3xl p-6 shadow-2xl backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-red-900/50 pb-3">
                <Palette className="w-5 h-5 text-yellow-400" />
                <h2 className="font-bold text-lg text-white">3. Pilih Design Kartu</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Theme 1 */}
                <button
                  type="button"
                  onClick={() => setThemeVariant('gold_modern')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col gap-2 active:scale-[0.97] ${
                    themeVariant === 'gold_modern'
                      ? 'border-yellow-400 shadow-lg shadow-yellow-900/30 bg-yellow-950/30'
                      : 'border-red-900/60 bg-black/30 hover:border-red-600/60'
                  }`}
                >
                  {/* Mini card preview */}
                  <div className="w-full h-16 rounded-lg overflow-hidden flex flex-col">
                    <div className="flex-[2] bg-gradient-to-b from-red-800 to-red-600" />
                    <div className="flex-[3] bg-white" />
                    <div className="flex-[2] bg-gradient-to-b from-red-900 to-red-950" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Merah Emas</span>
                    <span className="text-[10px] text-red-300/60">Header merah, badan putih, aksen emas</span>
                  </div>
                  {themeVariant === 'gold_modern' && <span className="text-[9px] text-yellow-400 font-bold">✓ AKTIF</span>}
                </button>

                {/* Theme 2 */}
                <button
                  type="button"
                  onClick={() => setThemeVariant('dark_patriot')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col gap-2 active:scale-[0.97] ${
                    themeVariant === 'dark_patriot'
                      ? 'border-yellow-400 shadow-lg shadow-yellow-900/30 bg-yellow-950/30'
                      : 'border-red-900/60 bg-black/30 hover:border-red-600/60'
                  }`}
                >
                  <div className="w-full h-16 rounded-lg overflow-hidden flex flex-col">
                    <div className="flex-[2] bg-gradient-to-b from-zinc-950 to-zinc-900" style={{ borderBottom: '2px solid #DC2626' }} />
                    <div className="flex-[3] bg-zinc-950" />
                    <div className="flex-[2] bg-black" style={{ borderTop: '2px solid #DC2626' }} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Dark Patriot</span>
                    <span className="text-[10px] text-red-300/60">Hitam elegan, aksen merah & emas</span>
                  </div>
                  {themeVariant === 'dark_patriot' && <span className="text-[9px] text-yellow-400 font-bold">✓ AKTIF</span>}
                </button>

                {/* Theme 3 */}
                <button
                  type="button"
                  onClick={() => setThemeVariant('classic')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col gap-2 active:scale-[0.97] ${
                    themeVariant === 'classic'
                      ? 'border-yellow-400 shadow-lg shadow-yellow-900/30 bg-yellow-950/30'
                      : 'border-red-900/60 bg-black/30 hover:border-red-600/60'
                  }`}
                >
                  <div className="w-full h-16 rounded-lg overflow-hidden flex flex-col">
                    <div className="flex-[2] bg-white" style={{ borderBottom: '3px solid #DC2626' }} />
                    <div className="flex-[3] bg-white" />
                    <div className="flex-[2] bg-gradient-to-b from-red-700 to-red-900" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Putih Bersih</span>
                    <span className="text-[10px] text-red-300/60">Putih dominan, footer merah emas</span>
                  </div>
                  {themeVariant === 'classic' && <span className="text-[9px] text-yellow-400 font-bold">✓ AKTIF</span>}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: REAL-TIME PREVIEW & ACTIONS (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div className="bg-red-950/30 border border-red-900/50 rounded-3xl p-6 shadow-2xl backdrop-blur-sm flex flex-col items-center">
              <div className="w-full flex items-center justify-between border-b border-red-900/50 pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-yellow-400" />
                  <h3 className="font-bold text-base text-white">Live Preview ID Card</h3>
                </div>
                <span className="text-[11px] font-mono bg-red-900/40 px-2.5 py-1 rounded-full text-yellow-300/70">
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
                  className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm tracking-wide active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-purple-900 shadow-xl shadow-yellow-500/20"
                  style={{ background: 'linear-gradient(135deg, #F5C518 0%, #FFD700 60%, #F5C518 100%)', border: '2px solid rgba(91,45,142,0.4)' }}
                >
                  <Download className="w-5 h-5" />
                  {isGenerating ? 'Memproses HD Image...' : 'Download ID Card (HD PNG)'}
                </button>

                {/* Save to Supabase Button */}
                <button
                  type="button"
                  onClick={handleSaveData}
                  disabled={isSaving}
                  className="w-full py-3 px-6 rounded-2xl bg-red-900/60 hover:bg-red-800/60 border border-red-700/50 text-yellow-200 font-bold text-sm tracking-wide active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-emerald-400" />
                  {isSaving ? 'Menyimpan...' : 'Simpan Data ke Database'}
                </button>
              </div>
            </div>

            {/* Supabase Connection Helper Info */}
            {!isSupabaseConfigured && (
              <div className="bg-red-950/40 border border-red-900/50 rounded-2xl p-4 text-xs text-red-200/70 space-y-2">
                <div className="flex items-center gap-2 text-yellow-400 font-bold">
                  <Database className="w-4 h-4" />
                  <span>Tips Koneksi Supabase</span>
                </div>
                <p>
                  Aplikasi saat ini berjalan dalam mode <strong>Local Storage</strong>. Untuk menyimpan data secara online ke Supabase, tambahkan env variable:
                </p>
                <div className="bg-black/80 rounded-lg p-2 font-mono text-[10px] text-yellow-200/80 select-all space-y-1">
                  <div>NEXT_PUBLIC_SUPABASE_URL=...</div>
                  <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=...</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION: RIWAYAT KARTU PANITIA TERDAFTAR */}
        <div className="mt-16 border-t border-red-900/50 pt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wide">
                  Daftar Kartu Panitia Terdaftar
                </h2>
              </div>
              <p className="text-xs text-red-200/60 mt-1">
                Koleksi kartu panitia yang sudah dibuat. Klik kartu untuk mengedit atau mendownload ulang.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchPanitiaList}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-900/40 border border-red-700/50 hover:border-yellow-400/50 text-xs text-red-200 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {savedPanitiaList.length === 0 ? (
            <div className="bg-purple-950/30 border border-dashed border-purple-800/50 rounded-3xl p-12 text-center">
              <User className="w-12 h-12 mx-auto text-purple-600 mb-3" />
              <h3 className="text-base font-semibold text-purple-200">Belum ada kartu tersimpan</h3>
              <p className="text-xs text-purple-300/50 mt-1">
                Gunakan form di atas untuk membuat kartu panitia pertama Anda!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {savedPanitiaList.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => handleLoadCard(item)}
                  className="group bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/50 hover:border-yellow-400/60 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-yellow-400/10 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#120821] border-2 border-yellow-400/60 shrink-0" style={{ boxShadow: '0 0 8px rgba(245,197,24,0.3)' }}>
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
                      <h4 className="font-bold text-sm text-white truncate group-hover:text-yellow-300 transition">
                        {item.name}
                      </h4>
                      <p className="text-xs text-yellow-400 font-semibold">{item.role}</p>
                      <p className="text-[10px] text-purple-300/60 truncate">{item.division}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-purple-800/50 flex items-center justify-between text-[10px] text-purple-300/60">
                    <span className="font-mono text-purple-400/60">{item.cardNumber}</span>
                    <span className="flex items-center gap-1 text-yellow-400 font-medium">
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
