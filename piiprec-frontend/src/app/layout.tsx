import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata: Metadata = {
  title: 'PIIPreC Formosa - Plataforma Integral de Inteligencia de Precios',
  description:
    'Sistema oficial y colaborativo de precios de consumo masivo para la provincia de Formosa (Dirección de Estadísticas y Censos).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
