import { BackendProduct } from '../types';
import { detectCategory } from '../utils/categories';

export interface BarcodeLookupResult {
  found: boolean;
  source?: 'database' | 'openfoodfacts';
  sku: string;
  name?: string;
  brand?: string;
  category?: string;
  unit?: string;
  image?: string;
  url?: string;
}

/**
 * Searches for a product by barcode across:
 * 1. The 13,000+ real products in the PostgreSQL database (matching SKU or EAN in image URL).
 * 2. Public Open Food Facts barcode registry.
 */
export async function lookupBarcode(
  barcode: string,
  existingProducts: BackendProduct[] = []
): Promise<BarcodeLookupResult> {
  const clean = barcode.trim();
  if (!clean) {
    return { found: false, sku: clean };
  }

  // 1. Search in PostgreSQL database products
  const matchInDb = existingProducts.find((p) => {
    if (p.sku && p.sku.toLowerCase() === clean.toLowerCase()) return true;
    if (p.image && p.image.includes(clean)) return true;
    if (p.url && p.url.includes(clean)) return true;
    return false;
  });

  if (matchInDb) {
    return {
      found: true,
      source: 'database',
      sku: clean,
      name: matchInDb.name,
      brand: matchInDb.brand,
      category: matchInDb.category,
      unit: matchInDb.unit || 'Unidad',
      image: matchInDb.image || '',
      url: matchInDb.url || '',
    };
  }

  // 2. Query Open Food Facts public registry for Argentine / global barcodes
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${clean}.json`);
    const data = await res.json();
    if (data && (data.status === 1 || data.status_verbose === 'product found') && data.product) {
      const prod = data.product;
      const detectedName = prod.product_name_es || prod.product_name || prod.generic_name_es || '';
      const detectedBrand = prod.brands || 'Sin marca';
      const detectedImage = prod.image_url || prod.image_front_url || '';
      const catText = `${detectedName} ${prod.categories || ''}`;
      const detectedCategory = detectCategory(catText);

      if (detectedName) {
        return {
          found: true,
          source: 'openfoodfacts',
          sku: clean,
          name: detectedName,
          brand: detectedBrand,
          category: detectedCategory,
          unit: prod.quantity || 'Unidad',
          image: detectedImage,
          url: `https://world.openfoodfacts.org/product/${clean}`,
        };
      }
    }
  } catch (err) {
    console.warn('Open Food Facts barcode lookup failed:', err);
  }

  // Not found in registries, but keep SKU so user can fill the rest
  return {
    found: false,
    sku: clean,
  };
}
