'use client';

import React from 'react';
import { SlidersHorizontal, CircleDot } from 'lucide-react';
import { formatDistance } from '../utils/geo';

interface RadiusSelectorProps {
  radiusMeters: number;
  onChangeRadius: (meters: number) => void;
}

const PRESET_DISTANCES = [
  { label: '500 m', value: 500 },
  { label: '1 km', value: 1000 },
  { label: '2 km', value: 2000 },
  { label: '3 km', value: 3000 },
  { label: '5 km', value: 5000 },
  { label: '8 km', value: 8000 },
];

export default function RadiusSelector({ radiusMeters, onChangeRadius }: RadiusSelectorProps) {
  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <span>Radio de Búsqueda</span>
        </div>
        <span className="inline-flex items-center gap-1 bg-blue-600 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-xs">
          <CircleDot className="w-3 h-3" />
          {formatDistance(radiusMeters)}
        </span>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
        {PRESET_DISTANCES.map((preset) => {
          const isSelected = radiusMeters === preset.value;
          return (
            <button
              key={preset.value}
              onClick={() => onChangeRadius(preset.value)}
              className={`py-1.5 px-2 text-xs font-semibold rounded-xl transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30'
                  : 'bg-blue-50/60 hover:bg-blue-100 text-blue-900 border border-blue-100 hover:border-blue-200'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Range Slider */}
      <div className="space-y-1">
        <input
          type="range"
          min="200"
          max="10000"
          step="100"
          value={radiusMeters}
          onChange={(e) => onChangeRadius(Number(e.target.value))}
          className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-hidden"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
          <span>200 m</span>
          <span>5 km</span>
          <span>10 km</span>
        </div>
      </div>
    </div>
  );
}
