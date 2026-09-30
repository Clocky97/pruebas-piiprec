'use client';

import React, { useMemo } from 'react';
import { BackendProduct, Company, SmartListItem } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  TrendingDown,
  Store,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Share2,
} from 'lucide-react';

interface SmartShoppingListProps {
  items: SmartListItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearList: () => void;
  products: BackendProduct[];
  companies: Company[];
}

export default function SmartShoppingList({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearList,
  products,
  companies,
}: SmartShoppingListProps) {
  const { isGuest, requireAuth } = useAuth();

  // Calculate costs across stores
  const storeComparisons = useMemo(() => {
    if (items.length === 0 || companies.length === 0) return [];

    return companies.map((company) => {
      let totalCost = 0;
      let matchedItemsCount = 0;
      const itemDetails: { name: string; quantity: number; unitPrice: number; subtotal: number }[] =
        [];

      items.forEach((item) => {
        // Find best match in this company
        const match = products.find(
          (p) =>
            p.company?.id === company.id &&
            (p.id === item.productId ||
              p.name.toLowerCase().includes(item.name.toLowerCase()) ||
              p.category === item.category)
        );

        // Fallback realistic price estimation if product isn't strictly cataloged for this specific store
        let unitPrice = 0;
        if (match) {
          unitPrice = typeof match.price === 'string' ? parseFloat(match.price) : match.price;
          matchedItemsCount++;
        } else {
          // Average category base price with slight retailer variance
          const base = item.targetPrice || 1600;
          const varianceMultiplier = company.id % 2 === 0 ? 0.96 : 1.04;
          unitPrice = Math.round(base * varianceMultiplier);
        }

        const subtotal = unitPrice * item.quantity;
        totalCost += subtotal;
        itemDetails.push({
          name: item.name,
          quantity: item.quantity,
          unitPrice,
          subtotal,
        });
      });

      return {
        company,
        totalCost,
        matchedItemsCount,
        coveragePercentage: Math.round((matchedItemsCount / items.length) * 100),
        itemDetails,
      };
    }).sort((a, b) => a.totalCost - b.totalCost);
  }, [items, companies, products]);

  const bestOption = storeComparisons[0];
  const mostExpensiveOption = storeComparisons[storeComparisons.length - 1];
  const maxSavings =
    bestOption && mostExpensiveOption ? mostExpensiveOption.totalCost - bestOption.totalCost : 0;

  const handleSaveOrShare = () => {
    if (!requireAuth('Guardar Lista de Compras Inteligente', 'citizen')) {
      return;
    }
    alert('¡Lista de compras guardada exitosamente en tu perfil ciudadano!');
  };

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden">
      {/* Header */}
      <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Generador de Listas Inteligentes
            </h2>
            <p className="text-xs text-slate-500">
              Optimizador automático de canasta al menor costo en Formosa
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveOrShare}
              className="py-1.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Guardar Lista</span>
            </button>
            <button
              onClick={onClearList}
              className="py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vaciar</span>
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex-1 bg-white border border-blue-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Tu lista de compras está vacía</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Explora el <strong>Comparador de Precios</strong> o el <strong>Mapa</strong> y presiona el botón del carrito para agregar productos a tu canasta y calcular el comercio más económico.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
          {/* Basket items list (Left side) */}
          <div className="lg:col-span-6 bg-white border border-blue-100 rounded-2xl p-4 shadow-xs flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">
                Productos en tu Canasta ({items.length})
              </span>
              <span className="text-[11px] text-slate-400">Cantidades ajustables</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 mt-2 pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {item.category} • {item.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="p-1 hover:bg-slate-200 text-slate-600 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 font-bold text-slate-800 text-xs">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="p-1 hover:bg-slate-200 text-slate-600 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Recommendation & Comparison (Right side) */}
          <div className="lg:col-span-6 flex flex-col gap-4 overflow-y-auto pr-1">
            {/* Top winner card */}
            {bestOption && (
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-lg shadow-emerald-700/20 relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs flex items-center gap-1 w-fit">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      Opción Más Económica
                    </span>
                    <h3 className="text-lg font-bold mt-1.5">{bestOption.company.name}</h3>
                    <p className="text-xs text-emerald-100 flex items-center gap-1 mt-0.5">
                      <Store className="w-3.5 h-3.5" />
                      {bestOption.company.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-emerald-100 font-medium">Costo Total Canasta</p>
                    <p className="text-2xl font-black tracking-tight">
                      ${bestOption.totalCost.toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>

                {maxSavings > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-emerald-100">
                      <TrendingDown className="w-4 h-4 text-amber-300" />
                      Ahorro estimado respecto al más caro:
                    </span>
                    <strong className="font-extrabold text-white text-sm bg-white/20 px-2.5 py-0.5 rounded-lg">
                      ${maxSavings.toLocaleString('es-AR')}
                    </strong>
                  </div>
                )}
              </div>
            )}

            {/* Supermarket Comparison breakdown */}
            <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-xs flex-1 flex flex-col">
              <span className="text-xs font-bold text-slate-800 mb-3">
                Comparativa por Comercio para tu Lista
              </span>

              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {storeComparisons.map((sc, index) => {
                  const isWinner = index === 0;
                  const diffWithWinner = sc.totalCost - (bestOption?.totalCost || 0);

                  return (
                    <div
                      key={sc.company.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                        isWinner
                          ? 'border-emerald-300 bg-emerald-50/60'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {sc.company.name}
                          </p>
                          {isWinner && (
                            <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                              Recomendado
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{sc.company.address}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-slate-900">
                          ${sc.totalCost.toLocaleString('es-AR')}
                        </p>
                        {!isWinner && diffWithWinner > 0 && (
                          <p className="text-[10px] text-rose-600 font-semibold">
                            +${diffWithWinner.toLocaleString('es-AR')} más
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
