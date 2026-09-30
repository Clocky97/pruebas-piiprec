'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Supermarket, Coordinates } from '../types';
import { Loader2 } from 'lucide-react';

const DynamicMap = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-blue-50/60 text-blue-800 gap-3 border border-blue-100 rounded-2xl">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <div className="text-center">
        <p className="font-semibold text-sm">Cargando mapa interactivo de Formosa...</p>
        <p className="text-xs text-blue-500 mt-0.5">Preparando capas y sucursales</p>
      </div>
    </div>
  ),
});

interface MapWrapperProps {
  userLocation: Coordinates | null;
  radiusMeters: number;
  supermarkets: Supermarket[];
  selectedSupermarket: Supermarket | null;
  onSelectLocation: (coords: Coordinates) => void;
  onSelectSupermarket: (supermarket: Supermarket | null) => void;
}

export default function MapWrapper(props: MapWrapperProps) {
  return <DynamicMap {...props} />;
}
