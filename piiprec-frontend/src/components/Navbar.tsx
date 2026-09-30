'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Sparkles,
  User as UserIcon,
  LogOut,
  Shield,
  UploadCloud,
  ShoppingCart,
  LineChart,
  Menu,
  X,
  Store,
  LogIn,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'map' | 'comparator' | 'list' | 'admin';
  onChangeTab: (tab: 'map' | 'comparator' | 'list' | 'admin') => void;
  onOpenUploadModal: () => void;
  onOpenAuthModal: () => void;
  onOpenPromotionsModal: () => void;
  basketCount: number;
}

export default function Navbar({
  activeTab,
  onChangeTab,
  onOpenUploadModal,
  onOpenAuthModal,
  onOpenPromotionsModal,
  basketCount,
}: NavbarProps) {
  const { user, isGuest, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-blue-100 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                PIIPreC
              </h1>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                Formosa
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden md:block">
              Inteligencia de Precios de Consumo • Estadísticas y Censos
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => onChangeTab('map')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'map'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Mapa & Comercios</span>
          </button>

          <button
            onClick={() => onChangeTab('comparator')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'comparator'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Comparador de Precios</span>
          </button>

          <button
            onClick={() => onChangeTab('list')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all relative ${
              activeTab === 'list'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Listas Inteligentes</span>
            {basketCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {basketCount}
              </span>
            )}
          </button>

          {isAdmin && (
            <button
              onClick={() => onChangeTab('admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'admin'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Panel Admin</span>
            </button>
          )}
        </nav>

        {/* Right side controls: Promos, Citizen Upload, Real Auth */}
        <div className="flex items-center gap-2">
          {/* Promos Button */}
          <button
            onClick={onOpenPromotionsModal}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Promociones vigentes"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="hidden xl:inline">Promociones</span>
          </button>

          {/* Citizen Price Upload Button */}
          <button
            onClick={onOpenUploadModal}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all shrink-0"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Cargar Precio</span>
          </button>

          {/* Real User profile / login button */}
          {isGuest ? (
            <button
              onClick={onOpenAuthModal}
              className="py-1.5 px-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Ingresar</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {user?.firstName} {user?.lastName}
                </p>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                    isAdmin
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white p-3 space-y-2 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => {
                onChangeTab('map');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl flex items-center gap-2 ${
                activeTab === 'map' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-700'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Mapa & Comercios</span>
            </button>
            <button
              onClick={() => {
                onChangeTab('comparator');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl flex items-center gap-2 ${
                activeTab === 'comparator' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-700'
              }`}
            >
              <LineChart className="w-4 h-4" />
              <span>Comparador</span>
            </button>
            <button
              onClick={() => {
                onChangeTab('list');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl flex items-center gap-2 ${
                activeTab === 'list' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-700'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Listas ({basketCount})</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  onChangeTab('admin');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl flex items-center gap-2 ${
                  activeTab === 'admin' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Panel Admin</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
