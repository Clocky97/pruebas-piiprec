'use client';

import React, { useState, useEffect } from 'react';
import { BackendProduct, Company, User } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  TrendingUp,
  Users,
  Store,
  Package,
  AlertTriangle,
  Trash2,
  Edit2,
  Plus,
  CheckCircle2,
  XCircle,
  BarChart3,
  Search,
} from 'lucide-react';

interface AdminDashboardProps {
  products: BackendProduct[];
  companies: Company[];
  onRefreshData: () => void;
}

export default function AdminDashboard({
  products,
  companies,
  onRefreshData,
}: AdminDashboardProps) {
  const { user, isAdmin, isModerator } = useAuth();
  const [activeTab, setActiveTab] = useState<'metrics' | 'products' | 'companies' | 'users' | 'validation'>(
    'metrics'
  );

  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // New Company form states
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [compName, setCompName] = useState('');
  const [compAddress, setCompAddress] = useState('');
  const [compDescription, setCompDescription] = useState('');
  const [compLat, setCompLat] = useState('-26.1850');
  const [compLng, setCompLng] = useState('-58.1750');

  useEffect(() => {
    if (activeTab === 'users' && isAdmin) {
      loadUsers();
    }
  }, [activeTab, isAdmin]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await apiService.getUsers();
      setUsersList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm(`¿Eliminar producto con ID ${id}?`)) return;
    try {
      await apiService.deleteProduct(id);
      setMsg(`Producto ID ${id} eliminado.`);
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar');
    }
  };

  const handleDeleteCompany = async (id: number) => {
    if (!confirm(`¿Eliminar compañía con ID ${id}?`)) return;
    try {
      await apiService.deleteCompany(id);
      setMsg(`Compañía ID ${id} eliminada.`);
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar');
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createCompany({
        name: compName,
        address: compAddress,
        description: compDescription,
        latitude: compLat,
        longitude: compLng,
      });
      setShowAddCompanyModal(false);
      setCompName('');
      setCompAddress('');
      setCompDescription('');
      setMsg('Nueva compañía creada con éxito.');
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Error al crear compañía');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm(`¿Eliminar usuario con ID ${id}?`)) return;
    try {
      await apiService.deleteUser(id);
      setMsg(`Usuario ID ${id} eliminado.`);
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar usuario');
    }
  };

  // Metrics calculations
  const totalProducts = products.length;
  const totalCompanies = companies.length;
  const averagePrice =
    totalProducts > 0
      ? Math.round(
          products.reduce(
            (acc, curr) => acc + (typeof curr.price === 'string' ? parseFloat(curr.price) : curr.price),
            0
          ) / totalProducts
        )
      : 0;

  // Identify outlier products (prices unusually high or low for moderation)
  const suspiciousProducts = products.filter((p) => {
    const pr = typeof p.price === 'string' ? parseFloat(p.price) : p.price;
    return pr > 25000 || pr < 100;
  });

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden">
      {/* Header */}
      <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Panel Oficial de Administración & Moderación
              </h2>
              <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                {user?.role || 'Oficial'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Dirección de Estadísticas y Censos - Gobierno de Formosa
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'metrics'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Métricas
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'products'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Productos ({totalProducts})
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'companies'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Comercios ({totalCompanies})
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'users'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Usuarios
            </button>
          )}
          <button
            onClick={() => setActiveTab('validation')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'validation'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Validación</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2 rounded-xl flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg(null)} className="font-bold">
            ×
          </button>
        </div>
      )}

      {/* Main Tab Content */}
      <div className="flex-1 bg-white border border-blue-100 rounded-2xl p-4 sm:p-5 shadow-xs overflow-y-auto">
        {/* TAB 1: METRICS & KPIS */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-blue-700">Productos Monitoreados</span>
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-2xl font-black text-slate-900">{totalProducts}</p>
                <p className="text-[11px] text-slate-500 mt-1">Canasta básica formoseña</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-emerald-700">Comercios Registrados</span>
                  <Store className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-black text-slate-900">{totalCompanies}</p>
                <p className="text-[11px] text-slate-500 mt-1">Supermercados y mayoristas</p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-purple-700">Precio Promedio Canasta</span>
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-2xl font-black text-slate-900">
                  ${averagePrice.toLocaleString('es-AR')}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Por artículo individual</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-amber-700">Alertas de Dispersión</span>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-2xl font-black text-slate-900">{suspiciousProducts.length}</p>
                <p className="text-[11px] text-slate-500 mt-1">Pendientes de auditoría</p>
              </div>
            </div>

            {/* Department Info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900">
                  Sistema de Validación y Calidad de Información PIIPreC
                </p>
                <p className="mt-0.5">
                  Los datos aportados por los ciudadanos son contrastados automáticamente contra rangos de precios históricos para certificar su validez oficial.
                </p>
              </div>
              <button
                onClick={onRefreshData}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shrink-0"
              >
                Actualizar Datos
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800">
                Catálogo de Productos ({products.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Producto</th>
                    <th className="py-2.5 px-3">Categoría</th>
                    <th className="py-2.5 px-3">Precio</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Comercio</th>
                    <th className="py-2.5 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-mono">{p.id}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {p.name}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {p.brand}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-black text-blue-700">
                        ${typeof p.price === 'string' ? parseFloat(p.price).toLocaleString('es-AR') : p.price}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">{p.sku}</td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {p.company?.name || 'Formosa General'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Eliminar producto (Solo Admin)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: COMPANIES MANAGEMENT */}
        {activeTab === 'companies' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800">
                Comercios y Cadenas Habilitadas ({companies.length})
              </h3>
              <button
                onClick={() => setShowAddCompanyModal(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Comercio</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {companies.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">{c.name}</h4>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteCompany(c.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Eliminar comercio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{c.address}</p>
                    {c.description && (
                      <p className="text-[11px] text-slate-400 mt-0.5 italic">{c.description}</p>
                    )}
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>GPS: {c.latitude}, {c.longitude}</span>
                    <span className="text-blue-600 font-bold">Activo</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal to add company */}
            {showAddCompanyModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200">
                  <h4 className="font-bold text-sm text-slate-900 mb-3">Registrar Nuevo Comercio</h4>
                  <form onSubmit={handleCreateCompany} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold mb-1">Nombre</label>
                      <input
                        type="text"
                        required
                        value={compName}
                        onChange={(e) => setCompName(e.target.value)}
                        placeholder="Ej: Supermercado San Cayetano"
                        className="w-full p-2 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Dirección</label>
                      <input
                        type="text"
                        required
                        value={compAddress}
                        onChange={(e) => setCompAddress(e.target.value)}
                        placeholder="Ej: Av. Italia 1200"
                        className="w-full p-2 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Descripción</label>
                      <input
                        type="text"
                        value={compDescription}
                        onChange={(e) => setCompDescription(e.target.value)}
                        placeholder="Autoservicio barrial"
                        className="w-full p-2 border rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold mb-1">Latitud</label>
                        <input
                          type="text"
                          required
                          value={compLat}
                          onChange={(e) => setCompLat(e.target.value)}
                          className="w-full p-2 border rounded-xl font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Longitud</label>
                        <input
                          type="text"
                          required
                          value={compLng}
                          onChange={(e) => setCompLng(e.target.value)}
                          className="w-full p-2 border rounded-xl font-mono text-[11px]"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddCompanyModal(false)}
                        className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: USERS MANAGEMENT (Admin only) */}
        {activeTab === 'users' && isAdmin && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800">
              Gestión de Usuarios del Sistema ({usersList.length})
            </h3>
            {loadingUsers ? (
              <p className="text-xs text-slate-500">Cargando usuarios...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">ID</th>
                      <th className="py-2.5 px-3">Nombre</th>
                      <th className="py-2.5 px-3">Usuario</th>
                      <th className="py-2.5 px-3">Email</th>
                      <th className="py-2.5 px-3">Rol</th>
                      <th className="py-2.5 px-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-mono">{u.id}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {u.firstName} {u.lastName}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">{u.userName}</td>
                        <td className="py-2.5 px-3">{u.email}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.role === 'administrator'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'moderator'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: VALIDATION & SUSPICIOUS DATA */}
        {activeTab === 'validation' && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Módulo de Validación Automática</p>
                <p>
                  El algoritmo de consistencia detecta valores atípicos que se alejan más de 3 desviaciones estándar respecto a la mediana del producto.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">Consistencia general de la base</p>
                  <p className="text-slate-500 text-[11px]">
                    98.4% de los precios cargados se encuentran dentro del rango esperado.
                  </p>
                </div>
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Calidad Óptima
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
