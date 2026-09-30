'use client';

import React, { useState } from 'react';
import { Supermarket, SupermarketCategory } from '../types';
import { formatDistance } from '../utils/geo';
import {
  Store,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Tag,
  Building,
  Sparkles,
} from 'lucide-react';

interface SupermarketListProps {
  supermarkets: Supermarket[];
  selectedSupermarket: Supermarket | null;
  onSelectSupermarket: (sm: Supermarket) => void;
  radiusMeters: number;
}

type FilterTab = 'all' | 'in-radius' | SupermarketCategory;

export default function SupermarketList({
  supermarkets,
  selectedSupermarket,
  onSelectSupermarket,
  radiusMeters,
}: SupermarketListProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('in-radius');

  const inRadiusCount = supermarkets.filter((sm) => sm.isWithinRadius).length;

  const filteredList = supermarkets.filter((sm) => {
    if (activeTab === 'in-radius') return sm.isWithinRadius;
    if (activeTab === 'all') return true;
    return sm.category === activeTab;
  });

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <button
          onClick={() => setActiveTab('in-radius')}
          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 flex items-center gap-1.5 transition-all ${
            activeTab === 'in-radius'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-blue-50 border border-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>En radio ({inRadiusCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-blue-50 border border-slate-200'
          }`}
        >
          Todos ({supermarkets.length})
        </button>

        <button
          onClick={() => setActiveTab('hipermercado')}
          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
            activeTab === 'hipermercado'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-blue-50 border border-slate-200'
          }`}
        >
          Hipermercados
        </button>

        <button
          onClick={() => setActiveTab('mayorista')}
          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
            activeTab === 'mayorista'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-blue-50 border border-slate-200'
          }`}
        >
          Mayoristas
        </button>

        <button
          onClick={() => setActiveTab('supermercado')}
          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
            activeTab === 'supermercado'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-blue-50 border border-slate-200'
          }`}
        >
          Supermercados
        </button>
      </div>

      {/* Supermarkets cards list */}
      <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
        {filteredList.length === 0 ? (
          <div className="bg-blue-50/50 border border-dashed border-blue-200 rounded-2xl p-6 text-center space-y-2 my-2">
            <Store className="w-8 h-8 text-blue-400 mx-auto" />
            <h4 className="text-sm font-semibold text-blue-900">
              No hay sucursales en este filtro
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {activeTab === 'in-radius'
                ? `Prueba aumentar el radio de búsqueda (actualmente ${formatDistance(
                    radiusMeters
                  )}) o mover el punto en el mapa.`
                : 'No se encontraron comercios bajo esta categoría en la zona seleccionada.'}
            </p>
          </div>
        ) : (
          filteredList.map((sm) => {
            const isSelected = selectedSupermarket?.id === sm.id;
            const isInside = sm.isWithinRadius;

            return (
              <div
                key={sm.id}
                onClick={() => onSelectSupermarket(sm)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-xs ${
                  isSelected
                    ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                    : isInside
                    ? 'bg-white hover:bg-blue-50/40 border-blue-200/90 shadow-xs'
                    : 'bg-slate-50/60 hover:bg-white border-slate-200 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isInside
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm">{sm.name}</h3>
                        {sm.chain && (
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-1.5 py-0.2 rounded-md">
                            {sm.chain}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700">
                        {sm.category}
                      </span>
                    </div>
                  </div>

                  {sm.distance !== undefined && (
                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block font-bold text-xs px-2 py-0.5 rounded-full ${
                          isInside
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {formatDistance(sm.distance)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Information details */}
                <div className="mt-3 space-y-1.5 text-slate-600 border-t border-slate-100 pt-2.5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">
                      {sm.address} <span className="text-slate-400 font-normal">({sm.neighborhood})</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{sm.openingHours}</span>
                  </div>

                  {sm.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{sm.phone}</span>
                    </div>
                  )}
                </div>

                {/* Service pills */}
                {sm.services && sm.services.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {sm.services.slice(0, 3).map((service, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-50 text-blue-800 text-[10px] px-2 py-0.5 rounded-md font-medium border border-blue-100"
                      >
                        {service}
                      </span>
                    ))}
                    {sm.services.length > 3 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{sm.services.length - 3} más
                      </span>
                    )}
                  </div>
                )}

                {/* Status indicator */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {isInside ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span
                      className={`text-[11px] font-semibold ${
                        isInside ? 'text-blue-800' : 'text-slate-500'
                      }`}
                    >
                      {isInside ? 'Dentro del radio' : 'Fuera del radio'}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                  >
                    <span>Ver en mapa</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
