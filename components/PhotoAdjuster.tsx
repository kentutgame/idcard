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
      <div className="rounded-xl p-4 text-center border border-dashed"
        style={{ background: 'rgba(15,5,30,0.8)', borderColor: 'rgba(91,45,142,0.5)' }}>
        <ImageIcon className="w-8 h-8 mx-auto mb-2" style={{ color: 'rgba(168,85,247,0.5)' }} />
        <p className="text-sm" style={{ color: 'rgba(216,180,254,0.5)' }}>
          Upload foto panitia terlebih dahulu untuk mengaktifkan pengaturan posisi & zoom.
        </p>
      </div>
    );
  }

  const handleZoom = (delta: number) => {
    const newScale = Math.min(Math.max(Number((scale + delta).toFixed(2)), 0.5), 3.0);
    onScaleChange(newScale);
  };

  const handleMove = (dx: number, dy: number) => {
    onPositionChange({ x: position.x + dx, y: position.y + dy });
  };

  return (
    <div className="rounded-2xl p-4 space-y-4 shadow-xl border"
      style={{ background: 'rgba(15,5,30,0.9)', borderColor: 'rgba(91,45,142,0.5)' }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'rgba(91,45,142,0.4)' }}>
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4" style={{ color: '#F5C518' }} />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Atur &amp; Sesuaikan Foto
          </span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] flex items-center gap-1 transition hover:opacity-100 opacity-60"
          style={{ color: '#F5C518' }}
        >
          <RotateCcw className="w-3 h-3" />
          Reset Posisi
        </button>
      </div>

      {/* Zoom Slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs" style={{ color: 'rgba(216,180,254,0.8)' }}>
          <span className="flex items-center gap-1">
            <ZoomIn className="w-3.5 h-3.5" style={{ color: 'rgba(168,85,247,0.7)' }} /> Ukuran (Zoom)
          </span>
          <span className="font-mono font-bold" style={{ color: '#F5C518' }}>{Math.round(scale * 100)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleZoom(-0.1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition text-white"
            style={{ background: 'rgba(91,45,142,0.5)', border: '1px solid rgba(91,45,142,0.8)' }}
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
            className="w-full h-2 rounded-lg cursor-pointer"
            style={{ accentColor: '#F5C518', background: 'rgba(91,45,142,0.4)' }}
          />
          <button
            type="button"
            onClick={() => handleZoom(0.1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition text-white"
            style={{ background: 'rgba(91,45,142,0.5)', border: '1px solid rgba(91,45,142,0.8)' }}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Direction Pad */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span style={{ color: 'rgba(216,180,254,0.8)' }}>Geser Posisi Wajah</span>
          <span className="text-[10px] font-mono" style={{ color: 'rgba(168,85,247,0.6)' }}>
            X: {position.x}px | Y: {position.y}px
          </span>
        </div>
        <div className="flex justify-center items-center gap-1.5 pt-1">
          {[
            { label: '← Kiri', dx: -10, dy: 0 },
          ].map(({ label, dx, dy }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleMove(dx, dy)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition hover:opacity-90 active:scale-95"
              style={{ background: 'rgba(91,45,142,0.6)', border: '1px solid rgba(91,45,142,0.8)' }}
            >
              {label}
            </button>
          ))}
          <div className="flex flex-col gap-1.5">
            {[
              { label: '↑ Atas', dx: 0, dy: -10 },
              { label: '↓ Bawah', dx: 0, dy: 10 },
            ].map(({ label, dx, dy }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleMove(dx, dy)}
                className="px-3 py-1 text-xs font-semibold rounded-lg text-white transition hover:opacity-90 active:scale-95"
                style={{ background: 'rgba(91,45,142,0.6)', border: '1px solid rgba(91,45,142,0.8)' }}
              >
                {label}
              </button>
            ))}
          </div>
          {[
            { label: 'Kanan →', dx: 10, dy: 0 },
          ].map(({ label, dx, dy }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleMove(dx, dy)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition hover:opacity-90 active:scale-95"
              style={{ background: 'rgba(91,45,142,0.6)', border: '1px solid rgba(91,45,142,0.8)' }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
