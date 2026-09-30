'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Info, LogIn, Sparkles, X } from 'lucide-react';

interface GuestNoticeBannerProps {
  onOpenAuth: () => void;
}

export default function GuestNoticeBanner({ onOpenAuth }: GuestNoticeBannerProps) {
  const { isGuest } = useAuth();
  const [dismissed, setDismissed] = React.useState(false);

  if (!isGuest || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5 max-w-4xl">
        <div className="p-1 bg-white/20 rounded-lg shrink-0">
          <Sparkles className="w-4 h-4 text-amber-300" />
        </div>
        <p className="leading-snug">
          <strong>Modo Vista General (Invitado):</strong> Estás explorando precios y comercios de Formosa en modo público. Para <strong>publicar precios ciudadanos</strong>, usar el <strong>escáner de código de barras</strong> o guardar listas personalizadas, inicia sesión con tu cuenta ciudadana.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenAuth}
          className="bg-white text-blue-700 hover:bg-blue-50 px-3 py-1 rounded-xl font-bold shadow-xs flex items-center gap-1.5 transition-all text-xs"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Ingresar</span>
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-white/20 rounded-lg text-white/80 transition-colors"
          title="Ocultar aviso"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
