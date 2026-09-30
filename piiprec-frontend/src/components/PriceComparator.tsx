'use client';

import React, { useState, useMemo } from 'react';
import { BackendProduct, Company } from '../types';
import { detectCategory, normalizeUnitPrice, COMMON_CATEGORIES } from '../utils/categories';
import {
  Search,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Store,
  Calendar,
  Sparkles,
  ArrowUpDown,
  ShoppingCart,
  Check,
  LineChart as ChartIcon,
  Tag,
  ExternalLink,
} from 'lucide-react';

interface PriceComparatorProps {
  products: BackendProduct[];
  companies: Company[];
  onAddToList: (product: BackendProduct) => void;
}

export default function PriceComparator({
  products,
  companies,
  onAddToList,
}: PriceComparatorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedStore, setSelectedStore] = useState<string>('Todos');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'name'>('price_asc');
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<BackendProduct | null>(
    products[0] || null
  );
  const [addedIds, setAddedIds] = useState<Record<number, boolean>>({});

  // Auto-detect category suggestion when user searches
  const suggestedCategory = useMemo(() => {
    if (searchTerm.length >= 3) {
      return detectCategory(searchTerm);
    }
    return null;
  }, [searchTerm]);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCat =
          selectedCategory === 'Todas' ||
          p.category.toLowerCase() === selectedCategory.toLowerCase();

        const matchesStore =
          selectedStore === 'Todos' ||
          (p.company && p.company.name.toLowerCase().includes(selectedStore.toLowerCase()));

        return matchesSearch && matchesCat && matchesStore;
      })
      .sort((a, b) => {
        const pA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
        const pB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
        if (sortBy === 'price_asc') return pA - pB;
        if (sortBy === 'price_desc') return pB - pA;
        return a.name.localeCompare(b.name);
      });
  }, [products, searchTerm, selectedCategory, selectedStore, sortBy]);

  // Mock price history generator for the selected product to render evolution chart
  const priceHistory = useMemo(() => {
    if (!selectedProductForHistory) return [];
    const basePrice =
      typeof selectedProductForHistory.price === 'string'
        ? parseFloat(selectedProductForHistory.price)
        : selectedProductForHistory.price;

    return [
      { date: '1 Sep', price: Math.round(basePrice * 0.88), label: 'Relevamiento Mensual' },
      { date: '8 Sep', price: Math.round(basePrice * 0.91), label: 'Semana 1' },
      { date: '15 Sep', price: Math.round(basePrice * 0.94), label: 'Semana 2' },
      { date: '22 Sep', price: Math.round(basePrice * 0.97), label: 'Semana 3' },
      { date: 'Hoy', price: basePrice, label: 'Actualizado' },
    ];
  }, [selectedProductForHistory]);

  const handleAdd = (product: BackendProduct) => {
    onAddToList(product);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Search & Filter Header */}
      <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por producto, marca (ej: leche, arroz, Lucchetti) o SKU..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden focus:border-blue-500"
            >
              <option value="Todas">Todas las categorías</option>
              {COMMON_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden focus:border-blue-500 hidden sm:block"
            >
              <option value="Todos">Todos los comercios</option>
              {companies.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden focus:border-blue-500"
            >
              <option value="price_asc">Menor precio</option>
              <option value="price_desc">Mayor precio</option>
              <option value="name">Alfabético</option>
            </select>
          </div>
        </div>

        {/* Intelligent Auto-Categorization badge hint */}
        {suggestedCategory && selectedCategory === 'Todas' && (
          <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50/80 px-3 py-1.5 rounded-xl border border-blue-200/80 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Categoría sugerida para tu búsqueda:</span>
            <button
              onClick={() => setSelectedCategory(suggestedCategory)}
              className="font-bold underline hover:text-blue-900"
            >
              Filtrar por {suggestedCategory}
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Products Table + Price Evolution Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
        {/* Products List (Left side) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white border border-blue-100 rounded-2xl p-4 shadow-xs flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800">
              {filteredProducts.length} productos encontrados
            </span>
            <span className="text-[11px] text-slate-400">
              Precios en pesos argentinos ($ ARS)
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 mt-2 pr-1">
            {filteredProducts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No se encontraron productos con los criterios ingresados.
              </div>
            ) : (
              filteredProducts.map((p) => {
                const numericPrice = typeof p.price === 'string' ? parseFloat(p.price) : p.price;
                const unitData = normalizeUnitPrice(numericPrice, p.unit, p.name);
                const isSelected = selectedProductForHistory?.id === p.id;
                const wasAdded = addedIds[p.id];

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProductForHistory(p)}
                    className={`py-3 px-2 sm:px-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/90 border border-blue-200'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    {/* Thumbnail & Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">{p.brand}</span>
                          <span>•</span>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded-md text-[10px]">
                            {p.category}
                          </span>
                          {p.company && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 truncate flex items-center gap-1">
                                <Store className="w-3 h-3 shrink-0" />
                                {p.company.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm sm:text-base font-extrabold text-blue-700">
                          ${numericPrice.toLocaleString('es-AR')}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {unitData.formatted}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdd(p);
                        }}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center transition-all ${
                          wasAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        }`}
                        title="Agregar a Lista Inteligente"
                      >
                        {wasAdded ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Price History & Evolution Graphic (Right side) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white border border-blue-100 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between overflow-hidden">
          {selectedProductForHistory ? (
            <div>
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm mb-3">
                <ChartIcon className="w-4 h-4 text-blue-600" />
                <span>Evolución Histórica de Precio</span>
              </div>

              {/* Product header in card */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {selectedProductForHistory.name}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>Marca: {selectedProductForHistory.brand}</span>
                  <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    SKU: {selectedProductForHistory.sku}
                  </span>
                </div>
              </div>

              {/* Historical Trend Badge */}
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="text-slate-500 font-medium">Variación mensual:</span>
                <span className="px-2 py-0.5 rounded-full text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold text-[11px] flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-amber-500" />
                  +13.6% (últimos 30 días)
                </span>
              </div>

              {/* SVG Price Chart */}
              <div className="p-4 bg-gradient-to-b from-blue-50/50 to-white rounded-2xl border border-blue-100 flex flex-col items-center">
                <div className="w-full h-40 relative flex items-end">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between opacity-15 pointer-events-none">
                    <div className="border-b border-blue-600 w-full" />
                    <div className="border-b border-blue-600 w-full" />
                    <div className="border-b border-blue-600 w-full" />
                  </div>

                  {/* SVG Chart Polyline */}
                  <svg className="w-full h-32 overflow-visible" viewBox="0 0 300 100">
                    <defs>
                      <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Area under curve */}
                    <path
                      d="M 10,80 L 75,70 L 150,55 L 225,40 L 290,20 L 290,100 L 10,100 Z"
                      fill="url(#gradientArea)"
                    />

                    {/* Trend Line */}
                    <polyline
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points="10,80 75,70 150,55 225,40 290,20"
                    />

                    {/* Data Points */}
                    {[
                      { cx: 10, cy: 80 },
                      { cx: 75, cy: 70 },
                      { cx: 150, cy: 55 },
                      { cx: 225, cy: 40 },
                      { cx: 290, cy: 20 },
                    ].map((pt, i) => (
                      <circle
                        key={i}
                        cx={pt.cx}
                        cy={pt.cy}
                        r="4"
                        fill="#ffffff"
                        stroke="#2563eb"
                        strokeWidth="2.5"
                      />
                    ))}
                  </svg>
                </div>

                {/* X-axis labels */}
                <div className="w-full flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
                  {priceHistory.map((ph, idx) => (
                    <span key={idx}>{ph.date}</span>
                  ))}
                </div>
              </div>

              {/* Data points table */}
              <div className="mt-4 space-y-1.5">
                {priceHistory.map((ph, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0"
                  >
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {ph.label}
                    </span>
                    <span className="font-bold text-slate-800">${ph.price.toLocaleString('es-AR')}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Selecciona un producto de la lista para ver su evolución histórica.
            </div>
          )}

          {/* Quick info note */}
          <div className="mt-4 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-slate-600">
            💡 <strong>Normalización PIIPreC:</strong> Los precios son relevados y normalizados por unidad de medida oficial para evitar distorsiones por tamaños de empaque.
          </div>
        </div>
      </div>
    </div>
  );
}
