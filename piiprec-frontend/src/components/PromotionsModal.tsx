'use client';

import React from 'react';
import { Tag, Sparkles, X, Bell, ExternalLink, Calendar, Store, Percent } from 'lucide-react';
import { Promotion } from '../types';

interface PromotionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROMOTIONS_DATA: Promotion[] = [
  {
    id: 'promo-1',
    title: 'Descuento 30% en Lácteos con Onda (Banco Formosa)',
    store: 'ChangoMás Formosa',
    discount: '-30%',
    validUntil: 'Jueves y Viernes',
    category: 'Lácteos',
    description: 'Aplica en leches, quesos y yogures de producción local e industrial.',
    badge: 'Bancarizado',
  },
  {
    id: 'promo-2',
    title: '2da unidad al 70% en Fideos y Arroz',
    store: 'Carrefour Market Formosa',
    discount: '70% off',
    validUntil: 'Hasta el 15 del mes',
    category: 'Almacén',
    description: 'Combinable con marcas seleccionadas (Lucchetti, Gallo Oro, Marolio).',
    badge: '2da Unidad',
  },
  {
    id: 'promo-3',
    title: 'Precios Mayoristas desde 3 Unidades en Limpieza',
    store: 'Mayorista Apache Formosa',
    discount: 'Precio Mayorista',
    validUntil: 'Vigencia Permanente',
    category: 'Limpieza',
    description: 'Llevando 3 o más unidades de detergentes, lavandinas o jabones.',
    badge: 'Volumen',
  },
  {
    id: 'promo-4',
    title: 'Canasta Formoseña: 15% de reintegro',
    store: 'Hipermercado Cáceres',
    discount: '-15%',
    validUntil: 'Fines de semana',
    category: 'Canasta Básica',
    description: 'Promoción oficial en acuerdo con el Gobierno de la Provincia de Formosa.',
    badge: 'Acuerdo Oficial',
  },
];

export default function PromotionsModal({ isOpen, onClose }: PromotionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-blue-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-amber-100">
                PIIPreC Ahorro
              </span>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                Promociones y Ofertas Vigentes
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of promotions */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto flex-1">
          {PROMOTIONS_DATA.map((promo) => (
            <div
              key={promo.id}
              className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      {promo.badge}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      <Store className="w-3 h-3 text-slate-400" />
                      {promo.store}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5 leading-snug">
                    {promo.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">{promo.description}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base sm:text-lg font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-xl border border-rose-100 block">
                    {promo.discount}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {promo.validUntil}
                </span>
                <span className="text-blue-600 font-semibold">{promo.category}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer notification signup */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1.5 font-medium">
            <Bell className="w-4 h-4 text-blue-600" />
            Notificaciones activas en Formosa
          </span>
          <button
            onClick={() => {
              alert('¡Suscripción a alertas de ofertas activada!');
              onClose();
            }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs"
          >
            Activar Alertas
          </button>
        </div>
      </div>
    </div>
  );
}
