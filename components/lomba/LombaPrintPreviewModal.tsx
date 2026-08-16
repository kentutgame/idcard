'use client';

import React, { useState } from 'react';
import { X, Printer, FileText, CheckCircle2, Eye } from 'lucide-react';
import { Lomba } from '@/types/lomba';
import { LombaPrintDocument } from './LombaPrintDocument';

interface LombaPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lomba: Lomba;
}

export const LombaPrintPreviewModal: React.FC<LombaPrintPreviewModalProps> = ({
  isOpen,
  onClose,
  lomba
}) => {
  const [selectedPage, setSelectedPage] = useState<'all' | 1 | 2 | 3>('all');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md print:hidden animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600/20 text-red-400 rounded-xl border border-red-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Pratinjau Dokumen Cetak (3 Lembar HVS)
              </h3>
              <p className="text-xs text-slate-400">
                Format resmi terstandarisasi A4 / F4 siap cetak & unduh PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition"
            >
              <Printer className="w-4 h-4" /> Cetak / Download PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Page Switcher Tabs */}
        <div className="px-4 py-2.5 bg-slate-850 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0">
            <Eye className="w-3.5 h-3.5 text-amber-400" /> Tampilan:
          </span>
          <button
            type="button"
            onClick={() => setSelectedPage('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              selectedPage === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Semua Halaman (3 Lembar)
          </button>
          <button
            type="button"
            onClick={() => setSelectedPage(1)}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              selectedPage === 1
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Lembar 1: Info & Statistik
          </button>
          <button
            type="button"
            onClick={() => setSelectedPage(2)}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              selectedPage === 2
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Lembar 2: Pengumuman Juara 1,2,3
          </button>
          <button
            type="button"
            onClick={() => setSelectedPage(3)}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              selectedPage === 3
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Lembar 3: Berita Acara & TTD
          </button>
        </div>

        {/* Document Preview Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 flex flex-col items-center">
          <div className="w-full max-w-[210mm] bg-white shadow-2xl rounded-xl text-black overflow-hidden border border-gray-300">
            <LombaPrintDocument lomba={lomba} />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Format otomatis membagi 3 lembar saat dicetak atau disimpan ke PDF.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold rounded-xl transition"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition"
            >
              <Printer className="w-4 h-4" /> Cetak Sekarang
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
