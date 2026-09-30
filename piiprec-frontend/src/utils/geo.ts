import axios from 'axios';
import { GeocodedPlace } from '../types';
import { POPULAR_LOCATIONS } from '../data/supermarkets';

/**
 * Calculates distance between two geographical points using the Haversine formula
 * @returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Formats meters into human readable string (e.g. 450 m or 2.4 km)
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Searches for addresses in Formosa using OpenStreetMap Nominatim API with Axios
 */
export async function searchAddress(query: string): Promise<GeocodedPlace[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const cleanQuery = query.trim();
    // Search with Formosa context
    const fullQuery = cleanQuery.toLowerCase().includes('formosa')
      ? cleanQuery
      : `${cleanQuery}, Formosa, Formosa, Argentina`;

    const response = await axios.get<GeocodedPlace[]>('https://nominatim.openstreetmap.org/search', {
      params: {
        q: fullQuery,
        format: 'json',
        addressdetails: 1,
        limit: 5,
        countrycodes: 'ar',
        viewbox: '-58.28,-26.10,-58.12,-26.26', // Formosa bbox: minlon,minlat,maxlon,maxlat
        bounded: 0,
      },
      headers: {
        'Accept-Language': 'es',
        'User-Agent': 'VibeSuperMapFormosa/1.0',
      },
      timeout: 4500,
    });

    if (response.data && response.data.length > 0) {
      return response.data;
    }
  } catch (error) {
    console.warn('Nominatim geocoding failed or timed out, checking local matches:', error);
  }

  // Fallback to searching known popular locations
  const queryLower = query.toLowerCase();
  const localMatches = POPULAR_LOCATIONS.filter((loc) =>
    loc.name.toLowerCase().includes(queryLower)
  ).map((loc, index) => ({
    place_id: 999000 + index,
    display_name: `${loc.name}, Formosa, Argentina`,
    lat: loc.lat.toString(),
    lon: loc.lng.toString(),
    type: 'landmark',
  }));

  return localMatches;
}

/**
 * Reverse geocodes coordinates to a human-readable address description
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon: lng,
        format: 'json',
        zoom: 18,
        addressdetails: 1,
      },
      headers: {
        'Accept-Language': 'es',
        'User-Agent': 'VibeSuperMapFormosa/1.0',
      },
      timeout: 3500,
    });

    if (response.data && response.data.display_name) {
      const road = response.data.address?.road;
      const houseNumber = response.data.address?.house_number;
      const suburb = response.data.address?.suburb || response.data.address?.neighbourhood;

      if (road) {
        return `${road}${houseNumber ? ' ' + houseNumber : ''}${suburb ? ` (${suburb})` : ''}, Formosa`;
      }
      return response.data.display_name.split(',').slice(0, 3).join(',');
    }
  } catch (err) {
    console.warn('Reverse geocode error:', err);
  }

  return `Ubicación (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}
