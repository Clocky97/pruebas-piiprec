export interface Coordinates {
  lat: number;
  lng: number;
}

export type SupermarketCategory = 'hipermercado' | 'supermercado' | 'mayorista' | 'autoservicio';

export interface Supermarket {
  id: string;
  name: string;
  chain?: string;
  category: SupermarketCategory;
  address: string;
  neighborhood: string;
  lat: number;
  lng: number;
  openingHours: string;
  phone?: string;
  services: string[];
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
