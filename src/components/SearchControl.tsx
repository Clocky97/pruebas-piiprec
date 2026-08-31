'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Navigation, MapPin, Loader2, X, Compass } from 'lucide-react';
import { Coordinates, GeocodedPlace } from '../types';
import { searchAddress } from '../utils/geo';
import { POPULAR_LOCATIONS } from '../data/supermarkets';

interface SearchControlProps {
  userLocation: Coordinates;
  locationAddress: string;
  onSelectCoordinates: (coords: Coordinates, addressLabel?: string) => void;
}

export default function SearchControl({
  userLocation,
  locationAddress,
  onSelectCoordinates,
}: SearchControlProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GeocodedPlace[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search with Axios
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const data = await searchAddress(query);
      setResults(data);
      setIsLoading(false);
      setIsOpen(true);
    }, 450);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectResult = (item: GeocodedPlace) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    onSelectCoordinates({ lat, lng }, item.display_name.split(',')[0]);
    setQuery('');
    setIsOpen(false);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada por este navegador.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        onSelectCoordinates(
          {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          'Mi ubicación actual'
        );
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation error:', error);
        alert('No se pudo obtener la ubicación actual. Puedes hacer clic directamente en el mapa.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="space-y-3" ref={containerRef}>
      {/* Current location banner */}
      <div className="bg-blue-50 border border-blue-200/90 rounded-xl p-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-blue-900 uppercase tracking-wider">
              Punto de referencia actual
            </p>
            <p className="text-xs text-slate-700 font-medium truncate mt-0.5" title={locationAddress}>
              {locationAddress || `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`}
            </p>
          </div>
        </div>

        <button
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          title="Detectar mi ubicación GPS"
          className="shrink-0 text-xs bg-white hover:bg-blue-100/70 text-blue-700 font-medium px-2.5 py-1.5 rounded-lg border border-blue-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">Mi GPS</span>
        </button>
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            placeholder="Buscar calle o barrio en Formosa..."
            className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="absolute right-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-blue-100 rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Buscando direcciones en Formosa con Axios...</span>
              </div>
            ) : results.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {results.map((item) => (
                  <li key={item.place_id}>
                    <button
                      onClick={() => handleSelectResult(item)}
                      className="w-full text-left p-2.5 hover:bg-blue-50/80 transition-colors flex items-start gap-2 text-xs text-slate-700"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{item.display_name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-3 text-center text-xs text-slate-500">
                No se encontraron direcciones. Prueba hacer clic en el mapa.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Popular locations shortcuts */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
          Lugares sugeridos de Formosa:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_LOCATIONS.map((loc) => (
            <button
              key={loc.name}
              onClick={() => onSelectCoordinates({ lat: loc.lat, lng: loc.lng }, loc.name)}
              className="text-[11px] bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-900 px-2.5 py-1 rounded-lg transition-colors border border-slate-200 hover:border-blue-200"
            >
              {loc.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
