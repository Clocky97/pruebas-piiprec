'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Supermarket, Coordinates } from '../types';
import { formatDistance } from '../utils/geo';

interface MapComponentProps {
  userLocation: Coordinates | null;
  radiusMeters: number;
  supermarkets: Supermarket[];
  selectedSupermarket: Supermarket | null;
  onSelectLocation: (coords: Coordinates) => void;
  onSelectSupermarket: (supermarket: Supermarket | null) => void;
}

export default function MapComponent({
  userLocation,
  radiusMeters,
  supermarkets,
  selectedSupermarket,
  onSelectLocation,
  onSelectSupermarket,
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Fix leaflet marker asset paths
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    const initialLat = userLocation?.lat ?? -26.1849;
    const initialLng = userLocation?.lng ?? -58.1731;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: false,
    });

    // Free OpenStreetMap tile layer (no API key required, no watermark)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control on top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Map click handler to pick user location
    map.on('click', (e: L.LeafletMouseEvent) => {
      onSelectLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update user location marker & radius circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;

    // Custom SVG user marker (blue target pin)
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute inline-flex h-9 w-9 rounded-full bg-blue-500 opacity-40 animate-ping"></span>
          <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-xl text-white font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      const marker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      marker.bindPopup(`
        <div class="p-2 font-sans text-xs">
          <p class="font-bold text-blue-900 flex items-center gap-1.5 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>Ubicación Seleccionada</span>
          </p>
          <p class="text-slate-600 mt-1.5">Radio activo: <strong class="text-blue-700 font-semibold">${formatDistance(radiusMeters)}</strong></p>
        </div>
      `);

      userMarkerRef.current = marker;
    }

    // Update Circle
    if (circleRef.current) {
      circleRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      circleRef.current.setRadius(radiusMeters);
    } else {
      const circle = L.circle([userLocation.lat, userLocation.lng], {
        radius: radiusMeters,
        color: '#0284c7', // sky-600
        weight: 2,
        opacity: 0.85,
        fillColor: '#38bdf8', // sky-400
        fillOpacity: 0.15,
        dashArray: '6, 6',
      }).addTo(map);
      circleRef.current = circle;
    }
  }, [userLocation, radiusMeters]);

  // Update supermarket markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    supermarkets.forEach((sm) => {
      const isInside = sm.isWithinRadius ?? false;
      const isSelected = selectedSupermarket?.id === sm.id;

      // Icon colors based on radius match and selection
      const bgClasses = isSelected
        ? 'bg-blue-900 ring-4 ring-blue-300 ring-offset-2 text-white scale-110'
        : isInside
        ? 'bg-blue-600 text-white shadow-lg border-2 border-white'
        : 'bg-slate-200 text-slate-500 border border-slate-300 opacity-60 hover:opacity-100 hover:scale-105';

      const iconHtml = `
        <div class="transition-all duration-200 flex flex-col items-center group cursor-pointer">
          <div class="flex items-center justify-center w-8 h-8 rounded-xl ${bgClasses} shadow-md transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"></path>
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"></path>
              <path d="M2 7h20"></path>
            </svg>
          </div>
          ${
            isInside && sm.distance !== undefined
              ? `<span class="mt-1 px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-blue-900 text-white shadow border border-blue-200 whitespace-nowrap">${formatDistance(
                  sm.distance
                )}</span>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-supermarket-marker',
        html: iconHtml,
        iconSize: [36, 48],
        iconAnchor: [18, 24],
        popupAnchor: [0, -24],
      });

      const marker = L.marker([sm.lat, sm.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 800 : isInside ? 500 : 100,
      }).addTo(map);

      // Popup content with SVG Lucide icons
      const popupHtml = `
        <div class="p-2.5 min-w-[220px] font-sans">
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              isInside ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
            }">
              ${sm.category}
            </span>
            ${
              sm.distance !== undefined
                ? `<span class="text-xs font-bold ${isInside ? 'text-blue-600' : 'text-slate-500'}">${formatDistance(
                    sm.distance
                  )}</span>`
                : ''
            }
          </div>
          <h4 class="font-bold text-sm text-slate-900 leading-snug">${sm.name}</h4>
          
          <div class="space-y-1.5 mt-2.5 text-xs text-slate-600">
            <div class="flex items-start gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>${sm.address}, ${sm.neighborhood}</span>
            </div>
            <div class="flex items-start gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>${sm.openingHours}</span>
            </div>
            ${
              sm.phone
                ? `<div class="flex items-start gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    <span>${sm.phone}</span>
                  </div>`
                : ''
            }
          </div>

          <div class="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span class="inline-flex items-center gap-1 text-[11px] font-semibold ${
              isInside ? 'text-blue-700' : 'text-slate-500'
            }">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                ${
                  isInside
                    ? '<polyline points="20 6 9 17 4 12"></polyline>'
                    : '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>'
                }
              </svg>
              ${isInside ? 'Dentro del radio' : 'Fuera del radio'}
            </span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        onSelectSupermarket(sm);
      });

      markersRef.current[sm.id] = marker;
    });
  }, [supermarkets, selectedSupermarket]);

  // When selectedSupermarket changes from external list click, center & open popup
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedSupermarket) return;

    const marker = markersRef.current[selectedSupermarket.id];
    if (marker) {
      map.flyTo([selectedSupermarket.lat, selectedSupermarket.lng], 15, {
        duration: 0.8,
      });
      marker.openPopup();
    }
  }, [selectedSupermarket]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating map hint */}
      <div className="absolute top-4 left-4 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-blue-100 flex items-center gap-2 text-xs text-blue-900 pointer-events-none transition-opacity">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
        <span className="font-medium">Haz clic en cualquier punto del mapa para cambiar tu ubicación</span>
      </div>
    </div>
  );
}
