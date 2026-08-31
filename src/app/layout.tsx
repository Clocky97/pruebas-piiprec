import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SuperMap Formosa - Supermercados por radio de distancia',
  description: 'Mapa interactivo con Leaflet y React para encontrar supermercados cercanos en Formosa según el radio seleccionado.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
