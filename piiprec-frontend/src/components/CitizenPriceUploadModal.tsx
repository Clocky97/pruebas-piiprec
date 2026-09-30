'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { BackendProduct, Company } from '../types';
import { detectCategory, COMMON_CATEGORIES } from '../utils/categories';
import { lookupBarcode } from '../services/barcodeLookup';
import BarcodeScannerModal from './BarcodeScannerModal';
import {
  X,
  UploadCloud,
  Barcode,
  Store,
  DollarSign,
  Tag,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Camera,
  Search,
  Loader2,
} from 'lucide-react';

interface CitizenPriceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: () => void;
  companies: Company[];
  products: BackendProduct[];
}

export default function CitizenPriceUploadModal({
  isOpen,
  onClose,
  onProductCreated,
  companies,
  products,
}: CitizenPriceUploadModalProps) {
  const { requireAuth } = useAuth();
  const priceInputRef = useRef<HTMLInputElement>(null);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupMessage, setLookupMessage] = useState<{
    type: 'success' | 'info';
    text: string;
  } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Almacén');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('Unidad');
  const [sku, setSku] = useState('');
  const [url, setUrl] = useState('https://piiprec.formosa.gob.ar/relevamiento');
  const [image, setImage] = useState(
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80'
  );
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(companies[0]?.id || 1);
  const [ticketPreview, setTicketPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto-detect category as user types product name
  useEffect(() => {
    if (name.length > 2 && !lookupMessage) {
      const autoCat = detectCategory(name);
      setCategory(autoCat);
    }
  }, [name, lookupMessage]);

  if (!isOpen) return null;

  // Real automatic lookup by barcode
  const handlePerformBarcodeLookup = async (barcodeToSearch: string) => {
    const cleanSku = barcodeToSearch.trim();
    if (!cleanSku) return;

    setLookingUp(true);
    setLookupMessage(null);
    try {
      const result = await lookupBarcode(cleanSku, products);
      setSku(result.sku);

      if (result.found) {
        if (result.name) setName(result.name);
        if (result.brand) setBrand(result.brand);
        if (result.category) setCategory(result.category);
        if (result.unit) setUnit(result.unit);
        if (result.image) setImage(result.image);
        if (result.url) setUrl(result.url);

        setLookupMessage({
          type: 'success',
          text: `¡Producto identificado automáticamente (${result.source === 'database' ? 'Base Oficial' : 'Registro de Código de Barras'})! Solo ingresa el precio que viste en góndola.`,
        });

        // Focus on price input for fast data entry
        setTimeout(() => {
          priceInputRef.current?.focus();
        }, 200);
      } else {
        setLookupMessage({
          type: 'info',
          text: `Código ${cleanSku} registrado. Completa el nombre, marca y el precio observado.`,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLookingUp(false);
    }
  };

  const handleBarcodeDetected = (detectedSku: string) => {
    handlePerformBarcodeLookup(detectedSku);
  };

  const handleTicketPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTicketPreview(reader.result as string);
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth('Carga Ciudadana de Precios', 'citizen')) {
      return;
    }

    setError(null);
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setError('Debes ingresar el precio numérico observado mayor a 0');
      return;
    }

    if (!sku || sku.trim().length < 3) {
      setError('Debes ingresar o escanear un SKU / código de barras válido (mín. 3 caracteres)');
      return;
    }

    setLoading(true);
    try {
      await apiService.createProduct({
        name: name.trim(),
        category,
        brand: brand.trim() || 'Genérico',
        price: numericPrice,
        unit,
        sku: sku.trim(),
        url: url.trim() || 'https://piiprec.formosa.gob.ar',
        image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
        companyId: selectedCompanyId,
      });

      setSuccess(true);
      setTimeout(() => {
        onProductCreated();
        onClose();
        setSuccess(false);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar el precio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-blue-100 flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
                <UploadCloud className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-blue-200">
                  Participación Ciudadana
                </span>
                <h3 className="font-bold text-base sm:text-lg leading-tight">Cargar Precio Observado</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form container */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {success ? (
              <div className="py-10 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 animate-bounce">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">¡Precio Registrado con Éxito!</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Tu colaboración ayuda a toda la comunidad formoseña a monitorear y transparentar precios.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Barcode scanner action banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Barcode className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Escáner de Código de Barras</p>
                      <p className="text-[11px] text-slate-500">
                        Carga automática de producto por cámara o foto
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setScannerOpen(true)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Escanear</span>
                  </button>
                </div>

                {/* SKU Code with Auto-search */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código de Barras / SKU <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="Ej: 7790895000997"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={lookingUp || sku.trim().length < 3}
                      onClick={() => handlePerformBarcodeLookup(sku)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all shrink-0"
                    >
                      {lookingUp ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Search className="w-3.5 h-3.5" />
                      )}
                      <span>Buscar datos</span>
                    </button>
                  </div>
                </div>

                {/* Auto-detected Product Notice Banner */}
                {lookupMessage && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 animate-in fade-in duration-200 ${
                      lookupMessage.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-blue-50 border-blue-200 text-blue-800'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{lookupMessage.text}</p>
                    </div>
                  </div>
                )}

                {/* Observed Price (Must be entered by hand) */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-amber-900">
                      Precio Observado en Góndola ($ ARS) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      Ingreso manual obligatorio
                    </span>
                  </div>
                  <div className="relative mt-1">
                    <DollarSign className="w-5 h-5 text-amber-700 absolute left-3 top-2.5" />
                    <input
                      ref={priceInputRef}
                      type="number"
                      step="0.01"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-amber-300 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-extrabold text-slate-900 bg-white"
                    />
                  </div>
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre del Producto <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Leche Entera Clásica 1L"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                {/* Category & Brand */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Categoría
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-blue-500"
                    >
                      {COMMON_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Marca <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Ej: La Serenísima"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Unit of measure */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unidad de Medida
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Ej: 1L, 1kg, 500g, Unidad"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                {/* Supermarket selector (Entered manually by user) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Comercio donde viste el precio <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <select
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-blue-500"
                    >
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} - {c.address}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Evidence ticket / photo upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Evidencia Fotográfica (Ticket o Foto de Góndola)
                  </label>
                  <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-colors bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-slate-600">
                        {ticketPreview ? 'Foto adjuntada' : 'Subir foto del ticket o etiqueta'}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-lg">
                      Examinar
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleTicketPhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {ticketPreview && (
                    <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300">
                      <img
                        src={ticketPreview}
                        alt="Ticket"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? 'Validando y enviando...' : 'Publicar Precio Ciudadano'}
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Real Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={handleBarcodeDetected}
      />
    </>
  );
}
