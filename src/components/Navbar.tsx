'use client';

import React from 'react';
import { ShoppingBag, MapPin, Sparkles } from 'lucide-react';

interface NavbarProps {
  totalCount: number;
  inRadiusCount: number;
}

export default function Navbar({ totalCount, inRadiusCount }: NavbarProps) {
  return (
    <header className="bg-white border-b border-blue-100 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 text-lg tracking-tight">SuperMap Formosa</h1>
              <span className="bg-blue-50 text-blue-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-600" />
                Capital
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Encuentra supermercados y mayoristas por cercanía en la ciudad
            </p>
          </div>
        </div>

        {/* Stats counter badge */}
        <div className="flex items-center gap-2">
          <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <div className="text-xs">
              <span className="text-slate-600">En radio: </span>
              <strong className="text-blue-700 font-bold">{inRadiusCount}</strong>
              <span className="text-slate-400"> / {totalCount}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
