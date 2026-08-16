'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import confetti from 'canvas-confetti';
import {
  Download,
  FolderArchive,
  RefreshCw,
  Search,
  Trash2,
  Layers,
  Database,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  CreditCard,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { IdCardPreview } from '@/components/IdCardPreview';
import { PanitiaData } from '@/types/panitia';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function IlhamDashboardPage() {
  const [cards, setCards] = useState<PanitiaData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Batch download state
  const [isBulkDownloading, setIsBulkDownloading] = useState<boolean>(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; cardName: string }>({
    current: 0,
    total: 0,
    cardName: '',
  });

  // Single downloading state
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Hidden offscreen container for batch rendering
  const batchRenderContainerRef = useRef<HTMLDivElement>(null);
  const [cardToRender, setCardToRender] = useState<PanitiaData | null>(null);

  // Trigger celebration
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#DC2626', '#FFFFFF', '#F59E0B', '#18181B'],
      });
    } catch {
      // ignore
    }
  };

  // Fetch all saved cards from Supabase or localStorage
  const fetchAllCards = useCallback(async () => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('panitia_cards')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase fetch error:', error);
          throw error;
        }

        if (data) {
          const formatted: PanitiaData[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            role: item.role || 'PANITIA',
            division: item.division || 'Umum',
            cardNumber: item.card_number,
            photoUrl: item.photo_url,
            photoScale: item.photo_scale || 1.0,
            photoPosition: item.photo_position || { x: 0, y: 0 },
            themeVariant: item.theme_variant || 'gold_modern',
            created_at: item.created_at,
          }));

          setCards(formatted);
          // Cache ke local storage
          try {
            localStorage.setItem('ippcw_panitia_cards', JSON.stringify(formatted));
          } catch (e) {
            // ignore
          }

          if (formatted.length === 0) {
            // Jika di Supabase kosong, cek apakah ada di local storage yang belum terunggah
            const localData = localStorage.getItem('ippcw_panitia_cards') || localStorage.getItem('saved_panitia_cards');
            if (localData) {
              const localParsed = JSON.parse(localData);
              if (localParsed.length > 0) {
                setCards(localParsed);
                setStatusMessage({
                  type: 'info',
                  text: 'Database Supabase masih kosong. Menampilkan kartu dari memori lokal.',
                });
              }
            }
          }
          return;
        }
      }

      // Fallback to local storage jika Supabase tidak terkonfigurasi
      const localData = localStorage.getItem('ippcw_panitia_cards') || localStorage.getItem('saved_panitia_cards');
      if (localData) {
        setCards(JSON.parse(localData));
      } else {
        setCards([]);
      }
    } catch (err: any) {
      console.warn('Error fetching cards:', err);
      const localData = localStorage.getItem('ippcw_panitia_cards') || localStorage.getItem('saved_panitia_cards');
      if (localData) {
        setCards(JSON.parse(localData));
      } else {
        setCards([]);
      }
      setStatusMessage({
        type: 'error',
        text: `Koneksi Supabase bermasalah (${err?.message || 'Error'}). Menampilkan data lokal.`,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllCards();
  }, [fetchAllCards]);

  // Delete Card
  const handleDeleteCard = async (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus kartu panitia "${name}"?`)) {
      return;
    }

    try {
      if (isSupabaseConfigured && supabase && id && id.includes('-')) {
        const { error } = await supabase.from('panitia_cards').delete().eq('id', id);
        if (error) console.warn('Supabase delete error:', error);
      }

      const updated = cards.filter((c) => c.id !== id);
      setCards(updated);
      try {
        localStorage.setItem('ippcw_panitia_cards', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }

      setStatusMessage({
        type: 'success',
        text: `Kartu "${name}" berhasil dihapus.`,
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: `Gagal menghapus kartu: ${err?.message || 'Error'}`,
      });
    }
  };

  // Download Single Card by ID
  const handleDownloadSingle = async (card: PanitiaData) => {
    setDownloadingId(card.id || card.cardNumber || card.name);
    setStatusMessage(null);

    try {
      const cardElement = document.getElementById(`card-render-${card.id || card.cardNumber}`);
      if (!cardElement) {
        throw new Error('Elemen kartu tidak ditemukan');
      }

      const dataUrl = await toPng(cardElement, {
        quality: 0.98,
        pixelRatio: 3,
        cacheBust: true,
      });

      const sanitizedName = (card.name || 'panitia').replace(/\s+/g, '_').toLowerCase();
      const filename = `ID_CARD_${sanitizedName}_${card.cardNumber || '17'}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      triggerCelebration();
      setStatusMessage({
        type: 'success',
        text: `Kartu "${card.name}" berhasil diunduh (HD PNG)!`,
      });
    } catch (err) {
      console.error('Download single error:', err);
      setStatusMessage({
        type: 'error',
        text: `Gagal mengunduh kartu "${card.name}".`,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  // Bulk Download ALL Cards as ZIP
  const handleDownloadAllAsZip = async () => {
    if (cards.length === 0) return;

    setIsBulkDownloading(true);
    setStatusMessage(null);
    const zip = new JSZip();

    try {
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        setBulkProgress({
          current: i + 1,
          total: cards.length,
          cardName: card.name,
        });

        // Set card in hidden container
        setCardToRender(card);

        // Wait a tick for DOM update and image rendering
        await new Promise((resolve) => setTimeout(resolve, 350));

        if (batchRenderContainerRef.current) {
          const cardNode = batchRenderContainerRef.current.querySelector('#id-card-element') as HTMLElement;
          if (cardNode) {
            const dataUrl = await toPng(cardNode, {
              quality: 0.98,
              pixelRatio: 3,
              cacheBust: true,
            });

            // Strip header to get base64
            const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
            const sanitizedName = (card.name || 'panitia').replace(/\s+/g, '_').toUpperCase();
            const filename = `ID_CARD_${String(i + 1).padStart(2, '0')}_${sanitizedName}.png`;

            zip.file(filename, base64Data, { base64: true });
          }
        }
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `SEMUA_ID_CARD_PANITIA_IPPCW_17_${new Date().toISOString().slice(0, 10)}.zip`);

      triggerCelebration();
      setStatusMessage({
        type: 'success',
        text: `Sukses! Sebanyak ${cards.length} kartu panitia berhasil dipaketkan ke dalam file ZIP!`,
      });
    } catch (err) {
      console.error('Bulk download error:', err);
      setStatusMessage({
        type: 'error',
        text: 'Terjadi kendala saat memproses download massal. Silakan coba download satu per satu.',
      });
    } finally {
      setIsBulkDownloading(false);
      setCardToRender(null);
    }
  };

  // Filter cards
  const filteredCards = cards.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.cardNumber && c.cardNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTheme = selectedTheme === 'all' || c.themeVariant === selectedTheme;

    return matchesSearch && matchesTheme;
  });

  return (
    <div className="min-h-screen bg-[#160000] text-neutral-100 font-sans selection:bg-yellow-400 selection:text-red-900 pb-24">
      {/* Top Banner Navigation */}
      <header className="border-b border-red-900/60 bg-[#1A0000]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="relative w-12 h-10 block">
              <Image src="/logo.png" alt="IPPCW REBORN" fill className="object-contain" priority />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white tracking-wider text-base">
                  IPPCW REBORN
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 font-bold uppercase">
                  Pusat Unduhan Kartu
                </span>
              </div>
              <p className="text-xs text-red-300/70">Database &amp; Batch Export Panitia 17-an</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/panitia"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-red-900/50 hover:bg-red-800/60 border border-red-700/50 text-yellow-300 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Buat Kartu Baru</span>
            </Link>

            <div className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-800/60">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-neutral-300">
                {isSupabaseConfigured ? 'Supabase Cloud' : 'Local Storage'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Hero Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 border-b border-red-900/50 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-950/60 border border-red-600/50 text-yellow-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5 text-yellow-400" />
              <span>Arsip Database Panitia</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Koleksi ID Card Terdaftar ({cards.length})
            </h1>
            <p className="text-xs sm:text-sm text-red-200/60 mt-1">
              Download kartu panitia satu per satu dalam format PNG HD atau unduh seluruhnya sekaligus dalam 1 file ZIP.
            </p>
          </div>

          {/* Action Bulk Download */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchAllCards}
              disabled={isLoading || isBulkDownloading}
              className="p-3 rounded-2xl bg-red-900/40 hover:bg-red-800/60 border border-red-700/50 text-red-200 transition disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleDownloadAllAsZip}
              disabled={cards.length === 0 || isBulkDownloading}
              className="py-3 px-6 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase transition flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #F5C518 0%, #FFD700 60%, #F5C518 100%)',
                color: '#3B0F6F',
                border: '2px solid rgba(255,255,255,0.4)',
                boxShadow: '0 6px 25px rgba(245,197,24,0.3)',
              }}
            >
              <FolderArchive className="w-5 h-5" />
              <span>
                {isBulkDownloading
                  ? `Memproses (${bulkProgress.current}/${bulkProgress.total})...`
                  : `Download Semua Sekaligus (.ZIP)`}
              </span>
            </button>
          </div>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl mb-6 flex items-center gap-3 border ${statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : statusMessage.type === 'error'
                ? 'bg-red-950/60 border-red-500/50 text-red-200'
                : 'bg-yellow-950/40 border-yellow-500/50 text-yellow-200'
              }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            ) : (
              <Database className="w-5 h-5 text-yellow-400 shrink-0" />
            )}
            <span className="text-sm font-medium">{statusMessage.text}</span>
          </div>
        )}

        {/* Bulk Download Progress Modal/Card */}
        {isBulkDownloading && (
          <div className="bg-red-950/60 border-2 border-yellow-400/80 rounded-3xl p-6 mb-8 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-yellow-400 animate-spin" />
                <span className="font-bold text-sm text-white">
                  Sedang Merender ID Card Menjadi HD Image ({bulkProgress.current} dari {bulkProgress.total})
                </span>
              </div>
              <span className="text-xs font-mono text-yellow-300 font-bold">
                {Math.round((bulkProgress.current / bulkProgress.total) * 100)}%
              </span>
            </div>

            <div className="w-full bg-black/60 rounded-full h-3 overflow-hidden border border-red-800">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(bulkProgress.current / bulkProgress.total) * 100}%`,
                  background: 'linear-gradient(90deg, #F59E0B, #FBBF24, #F59E0B)',
                }}
              />
            </div>
            <p className="text-xs text-red-200/70 mt-2">
              Memproses kartu: <strong className="text-yellow-300 uppercase">{bulkProgress.cardName}</strong>
            </p>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-red-950/30 border border-red-900/50 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-red-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama panitia atau nomor ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/60 border border-red-800/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-red-400/40 focus:outline-none focus:border-yellow-400 transition"
            />
          </div>

          {/* Theme Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-red-300/60 shrink-0">Filter Tema:</span>
            {[
              { id: 'all', label: 'Semua' },
              { id: 'gold_modern', label: 'Merah Emas' },
              { id: 'dark_patriot', label: 'Dark Patriot' },
              { id: 'classic', label: 'Putih Bersih' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTheme(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${selectedTheme === t.id
                  ? 'bg-yellow-400 text-red-950 shadow-md'
                  : 'bg-black/40 border border-red-900/60 text-red-200 hover:border-red-600'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        {isLoading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-10 h-10 text-yellow-400 animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-red-200/80">Memuat data kartu dari database...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="py-20 text-center bg-red-950/20 border border-dashed border-red-900/50 rounded-3xl p-8">
            <CreditCard className="w-12 h-12 text-red-400/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Belum Ada Kartu yang Disimpan</h3>
            <p className="text-xs text-red-300/60 max-w-md mx-auto mb-6">
              {searchQuery
                ? 'Tidak ada kartu yang cocok dengan kata kunci pencarian Anda.'
                : 'Belum ada kartu panitia yang tersimpan di database. Silakan buat kartu baru di studio panitia.'}
            </p>
            <Link
              href="/panitia"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase bg-yellow-400 text-red-950 hover:bg-yellow-300 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buka Studio Panitia</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCards.map((card, index) => {
              const cardId = card.id || `card-${index}`;
              const isCurrentDownloading = downloadingId === (card.id || card.cardNumber || card.name);

              return (
                <div
                  key={cardId}
                  className="bg-red-950/30 border border-red-900/60 rounded-3xl p-5 shadow-xl hover:border-yellow-500/50 transition flex flex-col justify-between group"
                >
                  {/* Card Header Info */}
                  <div className="flex items-center justify-between border-b border-red-900/50 pb-3 mb-4">
                    <div>
                      <span className="text-[10px] font-mono text-yellow-300/80 block">
                        {card.cardNumber || `NO-ID-${index + 1}`}
                      </span>
                      <h3 className="font-extrabold text-white text-sm uppercase tracking-wide truncate max-w-[180px]">
                        {card.name}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCard(card.id || '', card.name)}
                      className="p-2 rounded-xl text-red-400 hover:text-red-200 hover:bg-red-900/40 transition opacity-60 group-hover:opacity-100"
                      title="Hapus Kartu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* ID Card Visual Preview Container */}
                  <div className="flex justify-center items-center py-2 overflow-hidden rounded-2xl bg-black/40 border border-red-900/30">
                    <div
                      id={`card-render-${card.id || card.cardNumber}`}
                      style={{
                        transform: 'scale(0.68)',
                        transformOrigin: 'top center',
                        height: '388px', // 570 * 0.68 = ~388px
                        width: '360px',
                        marginBottom: '-8px',
                      }}
                    >
                      <IdCardPreview data={card} />
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-4 pt-3 border-t border-red-900/50 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(card)}
                      disabled={isCurrentDownloading || isBulkDownloading}
                      className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #F5C518, #FFD700)',
                        color: '#3B0F6F',
                        border: '1.5px solid rgba(255,255,255,0.4)',
                        boxShadow: '0 2px 10px rgba(245,197,24,0.2)',
                      }}
                    >
                      <Download className={`w-4 h-4 ${isCurrentDownloading ? 'animate-bounce' : ''}`} />
                      <span>{isCurrentDownloading ? 'Mengunduh...' : 'Download (HD PNG)'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Hidden container used for high-res bulk rendering */}
      <div
        ref={batchRenderContainerRef}
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {cardToRender && <IdCardPreview data={cardToRender} />}
      </div>
    </div>
  );
}
