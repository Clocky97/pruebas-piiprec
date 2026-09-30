import axios from 'axios';
import {
  BackendProduct,
  Company,
  CreateCompanyInput,
  CreateProductInput,
  User,
} from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token from localStorage if available
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('piiprec_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Initial mock products for Formosa consumer basket with EAN-13 barcodes
export const INITIAL_PRODUCTS: BackendProduct[] = [
  {
    id: 1,
    name: 'Leche Entera Clásica 1L',
    category: 'Lácteos',
    brand: 'La Serenísima',
    price: '1450.00',
    listPrice: '1580.00',
    unit: 'Litro',
    sku: '7790895000997',
    url: 'https://ejemplo.com/leche-serenisima',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-09-28T10:00:00.000Z',
    company: {
      id: 1,
      name: 'Carrefour Market Formosa',
      address: 'Av. 25 de Mayo 166',
      latitude: '-26.1825',
      longitude: '-58.1752',
    },
  },
  {
    id: 2,
    name: 'Aceite de Girasol 900ml',
    category: 'Almacén',
    brand: 'Cocinero',
    price: '2150.00',
    listPrice: '2300.00',
    unit: 'Litro',
    sku: '7791234567890',
    url: 'https://ejemplo.com/aceite-cocinero',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-09-29T11:30:00.000Z',
    company: {
      id: 2,
      name: 'ChangoMás Formosa',
      address: 'Av. Gutnisky 3164',
      latitude: '-26.1950',
      longitude: '-58.1980',
    },
  },
  {
    id: 3,
    name: 'Arroz Largo Fino 1kg',
    category: 'Almacén',
    brand: 'Gallo Oro',
    price: '1890.00',
    listPrice: null,
    unit: 'Kg',
    sku: '7793456789012',
    url: 'https://ejemplo.com/arroz-gallo',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-09-29T14:15:00.000Z',
    company: {
      id: 3,
      name: 'Hipermercado Cáceres',
      address: 'Av. Néstor Kirchner 2200',
      latitude: '-26.1880',
      longitude: '-58.1850',
    },
  },
  {
    id: 4,
    name: 'Fideos Tallarines 500g',
    category: 'Almacén',
    brand: 'Lucchetti',
    price: '1120.00',
    listPrice: '1250.00',
    unit: 'Kg',
    sku: '7794567890123',
    url: 'https://ejemplo.com/fideos-lucchetti',
    image: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-09-30T09:00:00.000Z',
    company: {
      id: 1,
      name: 'Carrefour Market Formosa',
      address: 'Av. 25 de Mayo 166',
      latitude: '-26.1825',
      longitude: '-58.1752',
    },
  },
  {
    id: 5,
    name: 'Detergente Lavavajilla 750ml',
    category: 'Limpieza',
    brand: 'Magistral',
    price: '2890.00',
    listPrice: '3100.00',
    unit: 'Litro',
    sku: '7795678901234',
    url: 'https://ejemplo.com/detergente-magistral',
    image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-09-30T09:45:00.000Z',
    company: {
      id: 4,
      name: 'Mayorista Apache Formosa',
      address: 'Ruta Nac. 11 Km 1168',
      latitude: '-26.2050',
      longitude: '-58.2100',
    },
  },
  {
    id: 6,
    name: 'Yerba Mate Tradicional 1kg',
    category: 'Almacén',
    brand: 'Playadito',
    price: '3450.00',
    listPrice: '3800.00',
    unit: 'Kg',
    sku: '7796789012345',
    url: 'https://ejemplo.com/yerba-playadito',
    image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-09-30T10:10:00.000Z',
    company: {
      id: 2,
      name: 'ChangoMás Formosa',
      address: 'Av. Gutnisky 3164',
      latitude: '-26.1950',
      longitude: '-58.1980',
    },
  },
];

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 1,
    name: 'Carrefour Market Formosa',
    description: 'Sucursal céntrica Carrefour',
    address: 'Av. 25 de Mayo 166',
    latitude: '-26.1825',
    longitude: '-58.1752',
    location: { type: 'Point', coordinates: [-58.1752, -26.1825] },
  },
  {
    id: 2,
    name: 'ChangoMás Formosa',
    description: 'Hipermercado y precios bajos',
    address: 'Av. Gutnisky 3164',
    latitude: '-26.1950',
    longitude: '-58.1980',
    location: { type: 'Point', coordinates: [-58.198, -26.195] },
  },
  {
    id: 3,
    name: 'Hipermercado Cáceres',
    description: 'Cadena local formoseña',
    address: 'Av. Néstor Kirchner 2200',
    latitude: '-26.1880',
    longitude: '-58.1850',
    location: { type: 'Point', coordinates: [-58.185, -26.188] },
  },
  {
    id: 4,
    name: 'Mayorista Apache Formosa',
    description: 'Venta mayorista y minorista',
    address: 'Ruta Nac. 11 Km 1168',
    latitude: '-26.2050',
    longitude: '-58.2100',
    location: { type: 'Point', coordinates: [-58.21, -26.205] },
  },
  {
    id: 5,
    name: 'Supermercado El Pucú',
    description: 'Barrio Mariano Moreno',
    address: 'Av. González Lelong 950',
    latitude: '-26.1770',
    longitude: '-58.1710',
    location: { type: 'Point', coordinates: [-58.171, -26.177] },
  },
];

// In-browser cache / local storage management for when backend is offline
const getLocalProducts = (): BackendProduct[] => {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  const stored = localStorage.getItem('piiprec_local_products');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_PRODUCTS;
    }
  }
  localStorage.setItem('piiprec_local_products', JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
};

const saveLocalProducts = (products: BackendProduct[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('piiprec_local_products', JSON.stringify(products));
  }
};

const getLocalCompanies = (): Company[] => {
  if (typeof window === 'undefined') return INITIAL_COMPANIES;
  const stored = localStorage.getItem('piiprec_local_companies');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_COMPANIES;
    }
  }
  localStorage.setItem('piiprec_local_companies', JSON.stringify(INITIAL_COMPANIES));
  return INITIAL_COMPANIES;
};

const saveLocalCompanies = (companies: Company[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('piiprec_local_companies', JSON.stringify(companies));
  }
};

export const apiService = {
  // Check backend health
  async checkHealth(): Promise<boolean> {
    try {
      await apiClient.get('/products', { timeout: 1500 });
      return true;
    } catch {
      return false;
    }
  },

  // Auth endpoints
  async login(payload: { email: string; password: string }) {
    try {
      const response = await apiClient.post('/auth/login', payload);
      return { success: true, data: response.data, isMock: false };
    } catch (err: any) {
      // If backend offline or unreachable, handle demo accounts gracefully
      if (err.code === 'ERR_NETWORK' || !err.response) {
        if (payload.email === 'admin@piiprec.gob.ar' && payload.password === 'Admin123!') {
          const mockAdmin: User = {
            id: 99,
            firstName: 'Administrador',
            lastName: 'PIIPreC',
            userName: 'admin_formosa',
            email: 'admin@piiprec.gob.ar',
            role: 'administrator',
            isActive: true,
          };
          return {
            success: true,
            data: { user: mockAdmin, token: 'mock-jwt-admin-token' },
            isMock: true,
          };
        }
        if (payload.email === 'ciudadano@piiprec.gob.ar' && payload.password === 'Ciudadano123!') {
          const mockCitizen: User = {
            id: 101,
            firstName: 'Juan',
            lastName: 'Pérez',
            userName: 'juan_formosa',
            email: 'ciudadano@piiprec.gob.ar',
            role: 'citizen',
            isActive: true,
          };
          return {
            success: true,
            data: { user: mockCitizen, token: 'mock-jwt-citizen-token' },
            isMock: true,
          };
        }
        throw new Error(
          'Servidor backend no disponible en http://localhost:3001. Usa los botones de prueba rápida en el login para ingresar en modo demostración.'
        );
      }
      const message = err.response?.data?.message || 'Error al iniciar sesión';
      throw new Error(Array.isArray(message) ? message.join(', ') : message);
    }
  },

  async register(payload: {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    password: string;
  }) {
    try {
      const response = await apiClient.post('/auth/register', payload);
      return { success: true, data: response.data, isMock: false };
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        // Fallback registered user locally
        const newUser: User = {
          id: Math.floor(Math.random() * 900) + 100,
          firstName: payload.firstName,
          lastName: payload.lastName,
          userName: payload.userName,
          email: payload.email,
          role: 'citizen',
          isActive: true,
        };
        return {
          success: true,
          data: newUser,
          isMock: true,
        };
      }
      const message = err.response?.data?.message || 'Error al registrar usuario';
      throw new Error(Array.isArray(message) ? message.join(', ') : message);
    }
  },

  // Products
  async getProducts(): Promise<{ products: BackendProduct[]; isMock: boolean }> {
    try {
      const response = await apiClient.get<BackendProduct[]>('/products');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return { products: response.data, isMock: false };
      }
      // If backend has 0 products yet, return mock for better experience
      return { products: getLocalProducts(), isMock: true };
    } catch {
      return { products: getLocalProducts(), isMock: true };
    }
  },

  async createProduct(dto: CreateProductInput): Promise<BackendProduct> {
    try {
      const response = await apiClient.post<BackendProduct>('/products', dto);
      return response.data;
    } catch {
      // Local fallback
      const localProducts = getLocalProducts();
      const newProduct: BackendProduct = {
        id: localProducts.length + 1,
        name: dto.name,
        category: dto.category,
        brand: dto.brand,
        price: String(dto.price),
        listPrice: null,
        unit: dto.unit,
        sku: dto.sku,
        url: dto.url,
        image: dto.image,
        createdAt: new Date().toISOString(),
      };
      saveLocalProducts([newProduct, ...localProducts]);
      return newProduct;
    }
  },

  async updateProduct(id: number, dto: Partial<CreateProductInput>): Promise<any> {
    try {
      const response = await apiClient.patch(`/products/${id}`, dto);
      return response.data;
    } catch {
      const products = getLocalProducts().map((p) =>
        p.id === id
          ? {
              ...p,
              ...dto,
              price: dto.price !== undefined ? String(dto.price) : p.price,
            }
          : p
      );
      saveLocalProducts(products);
      return { message: 'Actualizado localmente' };
    }
  },

  async deleteProduct(id: number): Promise<any> {
    try {
      const response = await apiClient.delete(`/products/${id}`);
      return response.data;
    } catch {
      const products = getLocalProducts().filter((p) => p.id !== id);
      saveLocalProducts(products);
      return { message: 'Eliminado localmente' };
    }
  },

  // Companies
  async getCompanies(): Promise<{ companies: Company[]; isMock: boolean }> {
    try {
      const response = await apiClient.get<Company[]>('/companies');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return { companies: response.data, isMock: false };
      }
      return { companies: getLocalCompanies(), isMock: true };
    } catch {
      return { companies: getLocalCompanies(), isMock: true };
    }
  },

  async getNearbyCompanies(lat: number, lon: number, radius = 2000): Promise<Company[]> {
    try {
      const response = await apiClient.get<Company[]>(
        `/companies/nearby?lat=${lat}&lon=${lon}&radius=${radius}`
      );
      return response.data;
    } catch {
      return getLocalCompanies();
    }
  },

  async createCompany(dto: CreateCompanyInput): Promise<Company> {
    try {
      const response = await apiClient.post<Company>('/companies', dto);
      return response.data;
    } catch {
      const local = getLocalCompanies();
      const newComp: Company = {
        id: local.length + 1,
        name: dto.name,
        description: dto.description,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        location: {
          type: 'Point',
          coordinates: [parseFloat(dto.longitude), parseFloat(dto.latitude)],
        },
      };
      saveLocalCompanies([...local, newComp]);
      return newComp;
    }
  },

  async updateCompany(id: number, dto: Partial<CreateCompanyInput>): Promise<any> {
    try {
      const response = await apiClient.patch(`/companies/${id}`, dto);
      return response.data;
    } catch {
      const updated = getLocalCompanies().map((c) =>
        c.id === id ? { ...c, ...dto } : c
      );
      saveLocalCompanies(updated);
      return { message: 'Compañía actualizada localmente' };
    }
  },

  async deleteCompany(id: number): Promise<any> {
    try {
      const response = await apiClient.delete(`/companies/${id}`);
      return response.data;
    } catch {
      const filtered = getLocalCompanies().filter((c) => c.id !== id);
      saveLocalCompanies(filtered);
      return { message: 'Compañía eliminada localmente' };
    }
  },

  // Users (Admin only)
  async getUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get<User[]>('/user');
      return response.data;
    } catch {
      return [
        {
          id: 1,
          firstName: 'Administrador',
          lastName: 'PIIPreC',
          userName: 'admin',
          email: 'admin@piiprec.gob.ar',
          role: 'administrator',
          isActive: true,
        },
        {
          id: 2,
          firstName: 'Martín',
          lastName: 'Insfrán',
          userName: 'minsfran',
          email: 'minsfran@estadistica.formosa.gob.ar',
          role: 'moderator',
          isActive: true,
        },
        {
          id: 3,
          firstName: 'Clara',
          lastName: 'Romero',
          userName: 'cromero',
          email: 'clara.romero@gmail.com',
          role: 'citizen',
          isActive: true,
        },
      ];
    }
  },

  async updateUserRole(id: number, role: string, isActive = true): Promise<any> {
    try {
      const response = await apiClient.patch(`/user/${id}`, { role, isActive });
      return response.data;
    } catch {
      return { message: 'Usuario actualizado localmente' };
    }
  },

  async deleteUser(id: number): Promise<any> {
    try {
      const response = await apiClient.delete(`/user/${id}`);
      return response.data;
    } catch {
      return { message: 'Usuario eliminado' };
    }
  },
};
