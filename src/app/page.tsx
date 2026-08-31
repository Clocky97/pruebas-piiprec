'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import SearchControl from '../components/SearchControl';
import RadiusSelector from '../components/RadiusSelector';
import SupermarketList from '../components/SupermarketList';
import MapWrapper from '../components/MapWrapper';
import { SUPERMARKETS_DATA, FORMOSA_CENTER } from '../data/supermarkets';
import { Coordinates, Supermarket } from '../types';
import { calculateDistance, reverseGeocode, formatDistance } from '../utils/geo';
import { Map, List, Store, Navigation, MapPin, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [userLocation, setUserLocation] = useState<Coordinates>({
    lat: FORMOSA_CENTER.lat,
    lng: FORMOSA_CENTER.lng,
  });
  const [locationAddress, setLocationAddress] = useState<string>('Plaza San Martín (Centro)');
  const [radiusMeters, setRadiusMeters] = useState<number>(2000); // 2 km default
  const [selectedSupermarket, setSelectedSupermarket] = useState<Supermarket | null>(null);
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');

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

  // Calculate distance & inRadius flag for every supermarket, sorted by distance
  const processedSupermarkets = useMemo(() => {
    return SUPERMARKETS_DATA.map((sm) => {
      const distance = calculateDistance(userLocation.lat, userLocation.lng, sm.lat, sm.lng);
      const isWithinRadius = distance <= radiusMeters;
      return {
        ...sm,
        distance,
        isWithinRadius,
      };
    }).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }, [userLocation, radiusMeters]);

  const inRadiusCount = useMemo(() => {
    return processedSupermarkets.filter((sm) => sm.isWithinRadius).length;
  }, [processedSupermarkets]);

  const nearestSupermarket = processedSupermarkets[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar totalCount={SUPERMARKETS_DATA.length} inRadiusCount={inRadiusCount} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 h-[calc(100vh-4rem)]">
        {/* Left Sidebar / Control Panel */}
        <div
          className={`lg:col-span-5 xl:col-span-4 flex flex-col gap-3.5 h-full overflow-hidden ${
            mobileTab === 'map' ? 'hidden lg:flex' : 'flex'
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
                <span>Supermercados en Formosa</span>
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                {inRadiusCount} disponibles en {formatDistance(radiusMeters)}
              </span>
            </div>

            <div className="flex-1 overflow-hidden">
              <SupermarketList
                supermarkets={processedSupermarkets}
                selectedSupermarket={selectedSupermarket}
                onSelectSupermarket={(sm) => {
                  setSelectedSupermarket(sm);
                  if (window.innerWidth < 1024) {
                    setMobileTab('map');
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
            mobileTab === 'list' ? 'hidden lg:flex' : 'flex'
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
                  {inRadiusCount} <span className="text-xs font-normal text-slate-400">locales</span>
                </p>
              </div>
            </div>

            <div className="bg-white border border-blue-100 rounded-2xl p-3 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                <Navigation className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 truncate">Más cercano</p>
                <p className="text-sm font-bold text-blue-700 truncate" title={nearestSupermarket?.name}>
                  {nearestSupermarket ? `${formatDistance(nearestSupermarket.distance ?? 0)}` : '-'}
                </p>
              </div>
            </div>

            <div className="bg-white border border-blue-100 rounded-2xl p-3 shadow-xs hidden sm:flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 truncate">Radio actual</p>
                <p className="text-sm font-bold text-slate-900">{formatDistance(radiusMeters)}</p>
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
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 bg-white/95 backdrop-blur-md border border-blue-200 rounded-2xl p-1.5 shadow-xl flex items-center justify-around">
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            mobileTab === 'map'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-blue-50'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Ver Mapa</span>
        </button>

        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            mobileTab === 'list'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-blue-50'
          }`}
        >
          <List className="w-4 h-4" />
          <span>Lista ({inRadiusCount})</span>
        </button>
      </div>
    </div>
  );
}
