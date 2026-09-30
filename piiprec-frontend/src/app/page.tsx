'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import SearchControl from '../components/SearchControl';
import RadiusSelector from '../components/RadiusSelector';
import SupermarketList from '../components/SupermarketList';
import MapWrapper from '../components/MapWrapper';
import PriceComparator from '../components/PriceComparator';
import SmartShoppingList from '../components/SmartShoppingList';
import AdminDashboard from '../components/AdminDashboard';
import CitizenPriceUploadModal from '../components/CitizenPriceUploadModal';
import AuthModal from '../components/AuthModal';
import PromotionsModal from '../components/PromotionsModal';
import GuestNoticeBanner from '../components/GuestNoticeBanner';

import { useAuth } from '../context/AuthContext';
import { apiService, INITIAL_COMPANIES, INITIAL_PRODUCTS } from '../services/api';
import { FORMOSA_CENTER, SUPERMARKETS_DATA } from '../data/supermarkets';
import { BackendProduct, Company, Coordinates, SmartListItem, Supermarket } from '../types';
import { calculateDistance, reverseGeocode, formatDistance } from '../utils/geo';
import {
  Map,
  List,
  Store,
  Navigation,
  MapPin,
  CheckCircle2,
  LineChart,
  ShoppingCart,
  Shield,
  Wifi,
  WifiOff,
} from 'lucide-react';

export default function Home() {
  const {
    user,
    role,
    isGuest,
    isAdmin,
    guestActionBlocked,
    setGuestActionBlocked,
    backendOnline,
    refreshBackendStatus,
  } = useAuth();

  // Active top tab
  const [activeTab, setActiveTab] = useState<'map' | 'comparator' | 'list' | 'admin'>('map');

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [promotionsModalOpen, setPromotionsModalOpen] = useState(false);

  // Map state
  const [userLocation, setUserLocation] = useState<Coordinates>({
    lat: FORMOSA_CENTER.lat,
    lng: FORMOSA_CENTER.lng,
  });
  const [locationAddress, setLocationAddress] = useState<string>('Plaza San Martín (Centro)');
  const [radiusMeters, setRadiusMeters] = useState<number>(2000); // 2 km default
  const [selectedSupermarket, setSelectedSupermarket] = useState<Supermarket | null>(null);
  const [mobileMapTab, setMobileMapTab] = useState<'map' | 'list'>('map');

  // Products & Companies from API
  const [products, setProducts] = useState<BackendProduct[]>(INITIAL_PRODUCTS);
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);

  // Smart Shopping Basket
  const [basket, setBasket] = useState<SmartListItem[]>([
    {
      id: 'item-1',
      productId: 1,
      name: 'Leche Entera Clásica 1L',
      category: 'Lácteos',
      quantity: 2,
      unit: 'Litro',
      targetPrice: 1450,
    },
    {
      id: 'item-2',
      productId: 2,
      name: 'Aceite de Girasol 900ml',
      category: 'Almacén',
      quantity: 1,
      unit: 'Litro',
      targetPrice: 2150,
    },
    {
      id: 'item-3',
      productId: 3,
      name: 'Arroz Largo Fino 1kg',
      category: 'Almacén',
      quantity: 1,
      unit: 'Kg',
      targetPrice: 1890,
    },
  ]);

  // Load live data from API (or fallback if backend is offline)
  const loadData = useCallback(async () => {
    try {
      const prodRes = await apiService.getProducts();
      setProducts(prodRes.products);

      const compRes = await apiService.getCompanies();
      setCompanies(compRes.companies);
    } catch (err) {
      console.warn('Using fallback data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reverse geocode when coordinates change via map click
  const handleLocationSelect = useCallback(async (coords: Coordinates, explicitLabel?: string) => {
    setUserLocation(coords);
    if (explicitLabel) {
      setLocationAddress(explicitLabel);
    } else {
      setLocationAddress('Buscando dirección...');
      const address = await reverseGeocode(coords.lat, coords.lng);
      setLocationAddress(address);
    }
  }, []);

  // Merge backend companies and default supermarkets for map visualization
  const allSupermarkets = useMemo<Supermarket[]>(() => {
    // Map backend companies to Supermarket objects if needed
    const backendAsSupermarkets: Supermarket[] = companies.map((c) => ({
      id: `company-${c.id}`,
      name: c.name,
      category: c.name.toLowerCase().includes('mayorista')
        ? 'mayorista'
        : c.name.toLowerCase().includes('hiper')
        ? 'hipermercado'
        : 'supermercado',
      address: c.address,
      lat: parseFloat(c.latitude),
      lng: parseFloat(c.longitude),
      openingHours: '08:00 - 21:00 hs',
      services: ['Carga Ciudadana', 'Relevamiento PIIPreC'],
    }));

    // Avoid duplicates by name
    const existingNames = new Set(backendAsSupermarkets.map((b) => b.name.toLowerCase()));
    const extras = SUPERMARKETS_DATA.filter((s) => !existingNames.has(s.name.toLowerCase()));

    return [...backendAsSupermarkets, ...extras];
  }, [companies]);

  // Distance & inRadius calculations for supermarkets
  const processedSupermarkets = useMemo(() => {
    return allSupermarkets
      .map((sm) => {
        const distance = calculateDistance(userLocation.lat, userLocation.lng, sm.lat, sm.lng);
        const isWithinRadius = distance <= radiusMeters;
        return {
          ...sm,
          distance,
          isWithinRadius,
        };
      })
      .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }, [allSupermarkets, userLocation, radiusMeters]);

  const inRadiusCount = useMemo(() => {
    return processedSupermarkets.filter((sm) => sm.isWithinRadius).length;
  }, [processedSupermarkets]);

  const nearestSupermarket = processedSupermarkets[0];

  // Basket Handlers
  const handleAddProductToBasket = (prod: BackendProduct) => {
    const numericPrice = typeof prod.price === 'string' ? parseFloat(prod.price) : prod.price;
    setBasket((prev) => {
      const existing = prev.find((item) => item.productId === prod.id || item.name === prod.name);
      if (existing) {
        return prev.map((item) =>
          item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: `item-${Date.now()}-${Math.random()}`,
          productId: prod.id,
          name: prod.name,
          category: prod.category,
          quantity: 1,
          unit: prod.unit,
          targetPrice: numericPrice,
        },
      ];
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setBasket((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as SmartListItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setBasket((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearBasket = () => {
    setBasket([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenUploadModal={() => setUploadModalOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenPromotionsModal={() => setPromotionsModalOpen(true)}
        basketCount={basket.reduce((sum, item) => sum + item.quantity, 0)}
      />

      {/* Guest Mode Informative Banner */}
      <GuestNoticeBanner onOpenAuth={() => setAuthModalOpen(true)} />

      {/* Backend connection pill */}
      <div className="bg-slate-100 border-b border-slate-200/80 px-4 py-1 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          {backendOnline ? (
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              Backend NestJS Conectado (:3001)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-slate-600">
              <WifiOff className="w-3.5 h-3.5 text-amber-500" />
              Backend Offline • Funcionando con almacenamiento local y datos de Formosa
            </span>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span>
            Perfil actual: <strong className="text-slate-800 capitalize">{role}</strong>
          </span>
          <span>•</span>
          <span>{products.length} productos relevados</span>
        </div>
      </div>

      {/* Main Content Area according to Active Tab */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 h-[calc(100vh-6.5rem)] flex flex-col overflow-hidden">
        {/* TAB 1: MAPA & COMERCIOS */}
        {activeTab === 'map' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 h-full overflow-hidden">
            {/* Left Sidebar / Control Panel */}
            <div
              className={`lg:col-span-5 xl:col-span-4 flex flex-col gap-3.5 h-full overflow-hidden ${
                mobileMapTab === 'map' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              {/* Search & Location Card */}
              <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-xs">
                <SearchControl
                  userLocation={userLocation}
                  locationAddress={locationAddress}
                  onSelectCoordinates={handleLocationSelect}
                />
              </div>

              {/* Radius Selector Card */}
              <RadiusSelector radiusMeters={radiusMeters} onChangeRadius={setRadiusMeters} />

              {/* Supermarkets List Panel */}
              <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-xs flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                    <Store className="w-4 h-4 text-blue-600" />
                    <span>Supermercados y Mayoristas</span>
                  </div>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {inRadiusCount} en {formatDistance(radiusMeters)}
                  </span>
                </div>

                <div className="flex-1 overflow-hidden">
                  <SupermarketList
                    supermarkets={processedSupermarkets}
                    selectedSupermarket={selectedSupermarket}
                    onSelectSupermarket={(sm) => {
                      setSelectedSupermarket(sm);
                      if (window.innerWidth < 1024) {
                        setMobileMapTab('map');
                      }
                    }}
                    radiusMeters={radiusMeters}
                  />
                </div>
              </div>
            </div>

            {/* Right Panel / Interactive Leaflet Map */}
            <div
              className={`lg:col-span-7 xl:col-span-8 flex flex-col h-full gap-3 ${
                mobileMapTab === 'list' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              {/* Quick stats ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-white border border-blue-100 rounded-2xl p-3 shadow-xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-slate-500 truncate">En tu radio</p>
                    <p className="text-sm font-bold text-slate-900">
                      {inRadiusCount}{' '}
                      <span className="text-xs font-normal text-slate-400">locales</span>
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-blue-100 rounded-2xl p-3 shadow-xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-slate-500 truncate">Más cercano</p>
                    <p
                      className="text-sm font-bold text-blue-700 truncate"
                      title={nearestSupermarket?.name}
                    >
                      {nearestSupermarket
                        ? `${formatDistance(nearestSupermarket.distance ?? 0)}`
                        : '-'}
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-blue-100 rounded-2xl p-3 shadow-xs hidden sm:flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-slate-500 truncate">Radio actual</p>
                    <p className="text-sm font-bold text-slate-900">
                      {formatDistance(radiusMeters)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Map View Box */}
              <div className="flex-1 bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-xs relative">
                <MapWrapper
                  userLocation={userLocation}
                  radiusMeters={radiusMeters}
                  supermarkets={processedSupermarkets}
                  selectedSupermarket={selectedSupermarket}
                  onSelectLocation={handleLocationSelect}
                  onSelectSupermarket={setSelectedSupermarket}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPARADOR DE PRECIOS */}
        {activeTab === 'comparator' && (
          <div className="flex-1 h-full overflow-hidden">
            <PriceComparator
              products={products}
              companies={companies}
              onAddToList={handleAddProductToBasket}
            />
          </div>
        )}

        {/* TAB 3: GENERADOR DE LISTAS INTELIGENTES */}
        {activeTab === 'list' && (
          <div className="flex-1 h-full overflow-hidden">
            <SmartShoppingList
              items={basket}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearList={handleClearBasket}
              products={products}
              companies={companies}
            />
          </div>
        )}

        {/* TAB 4: PANEL ADMIN (SOLO VISIBLE SI ES ADMIN / MODERADOR) */}
        {activeTab === 'admin' && (
          <div className="flex-1 h-full overflow-hidden">
            {isAdmin ? (
              <AdminDashboard
                products={products}
                companies={companies}
                onRefreshData={loadData}
              />
            ) : (
              <div className="p-8 bg-white border border-rose-100 rounded-2xl text-center">
                <Shield className="w-12 h-12 text-rose-500 mx-auto mb-2" />
                <h3 className="font-bold text-slate-900">Acceso Restringido</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Se requiere rol de <strong>Administrador</strong> para visualizar el panel de control y métricas oficiales.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Map Bottom Toggle for Map Tab */}
      {activeTab === 'map' && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 bg-white/95 backdrop-blur-md border border-blue-200 rounded-2xl p-1.5 shadow-xl flex items-center justify-around">
          <button
            onClick={() => setMobileMapTab('map')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              mobileMapTab === 'map'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-blue-50'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Ver Mapa</span>
          </button>

          <button
            onClick={() => setMobileMapTab('list')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              mobileMapTab === 'list'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-blue-50'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Lista ({inRadiusCount})</span>
          </button>
        </div>
      )}

      {/* Citizen Price Upload Modal (with Barcode Scanner inside) */}
      <CitizenPriceUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onProductCreated={loadData}
        companies={companies}
        products={products}
      />

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={authModalOpen || Boolean(guestActionBlocked)}
        onClose={() => {
          setAuthModalOpen(false);
          setGuestActionBlocked(null);
        }}
        actionPrompt={guestActionBlocked}
      />

      {/* Promotions & Offers Modal */}
      <PromotionsModal
        isOpen={promotionsModalOpen}
        onClose={() => setPromotionsModalOpen(false)}
      />
    </div>
  );
}
