'use client';

import React from 'react';
import { ZoomIn, ZoomOut, Move, RotateCcw, Image as ImageIcon } from 'lucide-react';

interface PhotoAdjusterProps {
  scale: number;
  position: { x: number; y: number };
  onScaleChange: (scale: number) => void;
  onPositionChange: (pos: { x: number; y: number }) => void;
  onReset: () => void;
  hasPhoto: boolean;
}

export const PhotoAdjuster: React.FC<PhotoAdjusterProps> = ({
  scale,
  position,
  onScaleChange,
  onPositionChange,
  onReset,
  hasPhoto,
}) => {
  if (!hasPhoto) {
    return (
      <div className="bg-neutral-900/60 border border-dashed border-neutral-700 rounded-xl p-4 text-center">
        <ImageIcon className="w-8 h-8 mx-auto text-neutral-500 mb-2" />
        <p className="text-sm text-neutral-400">Upload foto panitia terlebih dahulu untuk mengaktifkan pengaturan posisi & zoom.</p>
      </div>
    );
  }

  const handleZoom = (delta: number) => {
    const newScale = Math.min(Math.max(Number((scale + delta).toFixed(2)), 0.5), 3.0);
    onScaleChange(newScale);
  };

  const handleMove = (dx: number, dy: number) => {
    onPositionChange({
      x: position.x + dx,
      y: position.y + dy,
    });
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">
            Atur & Sesuaikan Foto
          </span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] flex items-center gap-1 text-neutral-400 hover:text-amber-400 transition"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Posisi
        </button>
      </div>

      {/* Zoom Slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-neutral-300">
          <span className="flex items-center gap-1">
            <ZoomIn className="w-3.5 h-3.5 text-neutral-400" /> Ukuran (Zoom)
          </span>
          <span className="font-mono text-amber-400 font-bold">{Math.round(scale * 100)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleZoom(-0.1)}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.05"
            value={scale}
            onChange={(e) => onScaleChange(parseFloat(e.target.value))}
            className="w-full accent-amber-400 h-2 bg-neutral-700 rounded-lg cursor-pointer"
          />
          <button
            type="button"
            onClick={() => handleZoom(0.1)}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Direction Pad (Geser Foto) */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-neutral-300">
          <span>Geser Posisi Wajah</span>
          <span className="text-[10px] text-neutral-500 font-mono">
            X: {position.x}px | Y: {position.y}px
          </span>
        </div>
        <div className="flex justify-center items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => handleMove(-10, 0)}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 active:bg-amber-500 active:text-black text-xs font-semibold rounded-lg text-neutral-200 transition"
          >
            ← Kiri
          </button>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => handleMove(0, -10)}
              className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 active:bg-amber-500 active:text-black text-xs font-semibold rounded-lg text-neutral-200 transition"
            >
              ↑ Atas
            </button>
            <button
              type="button"
              onClick={() => handleMove(0, 10)}
              className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 active:bg-amber-500 active:text-black text-xs font-semibold rounded-lg text-neutral-200 transition"
            >
              ↓ Bawah
            </button>
          </div>
          <button
            type="button"
            onClick={() => handleMove(10, 0)}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 active:bg-amber-500 active:text-black text-xs font-semibold rounded-lg text-neutral-200 transition"
          >
            Kanan →
          </button>
        </div>
      </div>
    </div>
  );
};
