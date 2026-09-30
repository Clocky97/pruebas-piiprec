export interface Coordinates {
  lat: number;
  lng: number;
}

export type SupermarketCategory = 'hipermercado' | 'supermercado' | 'mayorista' | 'autoservicio';

export interface Supermarket {
  id: string | number;
  name: string;
  chain?: string;
  category: SupermarketCategory;
  address: string;
  neighborhood?: string;
  lat: number;
  lng: number;
  openingHours?: string;
  phone?: string;
  services?: string[];
  distance?: number; // in meters, calculated dynamically
  isWithinRadius?: boolean;
}

export interface GeocodedPlace {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
}

export type UserRole = 'guest' | 'citizen' | 'moderator' | 'technician-analyst' | 'administrator';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  role: 'citizen' | 'moderator' | 'technician-analyst' | 'administrator';
  isActive: boolean;
}

export interface Company {
  id: number;
  name: string;
  description?: string;
  address: string;
  latitude: string;
  longitude: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  products?: BackendProduct[];
}

export interface BackendProduct {
  id: number;
  category: string;
  name: string;
  brand: string;
  price: string | number;
  listPrice?: string | null;
  unit: string;
  sku: string;
  url: string;
  image: string;
  company?: Company;
  companyId?: number;
  createdAt?: string;
}

export interface CreateProductInput {
  category: string;
  name: string;
  brand: string;
  price: number;
  unit: string;
  sku: string;
  url: string;
  image: string;
  companyId?: number;
}

export interface CreateCompanyInput {
  name: string;
  description?: string;
  address: string;
  latitude: string;
  longitude: string;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  listPrice?: number;
  storeName: string;
}

export interface SmartListItem {
  id: string;
  productId?: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  targetPrice?: number;
}

export interface Promotion {
  id: string;
  title: string;
  store: string;
  discount: string;
  validUntil: string;
  category: string;
  description: string;
  badge: string;
}
