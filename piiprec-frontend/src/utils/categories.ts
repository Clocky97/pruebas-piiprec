// Automatic Category Detection & Unit Normalization utilities

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Lácteos: [
    'leche', 'queso', 'yogur', 'manteca', 'crema', 'dulce de leche', 'ricotta', 'mozzarella', 'danonino', 'cremon'
  ],
  Almacén: [
    'arroz', 'fideos', 'aceite', 'harina', 'azucar', 'azúcar', 'yerba', 'galletita', 'galletas',
    'atun', 'atún', 'polenta', 'sal', 'cafe', 'café', 'te', 'té', 'mayonesa', 'ketchup', 'mostaza',
    'pure de tomate', 'puré', 'lentejas', 'garbanzos', 'porotos', 'choclo', 'conserva'
  ],
  Limpieza: [
    'detergente', 'lavandina', 'jabon', 'jabón', 'desodorante', 'limpiador', 'suavizante',
    'papel higienico', 'papel higiénico', 'rollo de cocina', 'trapo', 'esponja', 'insecticida', 'lavavajilla'
  ],
  Bebidas: [
    'gaseosa', 'agua', 'jugo', 'cerveza', 'vino', 'amargo', 'soda', 'fernet', 'aperitivo', 'energizante'
  ],
  Frescos: [
    'carne', 'pollo', 'pescado', 'asado', 'molida', 'milanesa', 'manzana', 'banana', 'tomate',
    'lechuga', 'cebolla', 'papa', 'zanahoria', 'naranja', 'huevo', 'huevos'
  ],
  Higiene: [
    'shampoo', 'acondicionador', 'dentifrico', 'pasta dental', 'crema dental', 'toallitas', 'pañales', 'jabon de tocador'
  ]
};

export const COMMON_CATEGORIES = [
  'Almacén',
  'Lácteos',
  'Limpieza',
  'Bebidas',
  'Frescos',
  'Higiene',
  'Panadería',
];

/**
 * Detects the most probable category based on product title/description.
 */
export function detectCategory(input: string): string {
  if (!input) return 'Almacén';
  const cleanInput = input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      const cleanKeyword = keyword
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      if (cleanInput.includes(cleanKeyword)) {
        return category;
      }
    }
  }

  return 'Almacén';
}

/**
 * Normalizes unit to standard base (Kg, Litro, Unidad) and computes unit price.
 */
export function normalizeUnitPrice(
  price: number | string,
  unit: string,
  name: string = ''
): { normalizedUnit: string; unitPrice: number; formatted: string } {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (!numericPrice || isNaN(numericPrice)) {
    return { normalizedUnit: unit || 'Unidad', unitPrice: 0, formatted: '-' };
  }

  const combined = `${name} ${unit}`.toLowerCase();

  // Grams to Kg
  const gramsMatch = combined.match(/(\d+)\s*(g|gr|gramos)\b/);
  if (gramsMatch && parseInt(gramsMatch[1], 10) > 0) {
    const grams = parseInt(gramsMatch[1], 10);
    const pricePerKg = (numericPrice / grams) * 1000;
    return {
      normalizedUnit: 'Kg',
      unitPrice: pricePerKg,
      formatted: `$${pricePerKg.toLocaleString('es-AR', { maximumFractionDigits: 0 })} / Kg`,
    };
  }

  // Milliliters to Litro
  const mlMatch = combined.match(/(\d+)\s*(ml|cc)\b/);
  if (mlMatch && parseInt(mlMatch[1], 10) > 0) {
    const ml = parseInt(mlMatch[1], 10);
    const pricePerLiter = (numericPrice / ml) * 1000;
    return {
      normalizedUnit: 'Litro',
      unitPrice: pricePerLiter,
      formatted: `$${pricePerLiter.toLocaleString('es-AR', { maximumFractionDigits: 0 })} / L`,
    };
  }

  // Already standard
  if (unit.toLowerCase().includes('litro') || unit.toLowerCase() === 'l') {
    return {
      normalizedUnit: 'Litro',
      unitPrice: numericPrice,
      formatted: `$${numericPrice.toLocaleString('es-AR', { maximumFractionDigits: 0 })} / L`,
    };
  }

  if (unit.toLowerCase().includes('kg') || unit.toLowerCase().includes('kilo')) {
    return {
      normalizedUnit: 'Kg',
      unitPrice: numericPrice,
      formatted: `$${numericPrice.toLocaleString('es-AR', { maximumFractionDigits: 0 })} / Kg`,
    };
  }

  return {
    normalizedUnit: unit || 'Unidad',
    unitPrice: numericPrice,
    formatted: `$${numericPrice.toLocaleString('es-AR', { maximumFractionDigits: 0 })} / ${unit || 'ud'}`,
  };
}
