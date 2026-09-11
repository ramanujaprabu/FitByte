/**
 * FitByte — Food Data Service
 *
 * Talks to two free, external food databases instead of a mock file:
 *
 *  - USDA FoodData Central: generic/whole foods, full nutrient profiles.
 *    Free API key: https://fdc.nal.usda.gov/api-key-signup
 *  - Open Food Facts: barcode/branded product lookup. No key required.
 *    Docs: https://world.openfoodfacts.org/data
 *
 * Both return a normalized `FoodSearchResult` so the UI never needs to know
 * which provider a result came from. When the user logs a result, save the
 * normalized fields into `food_entries` via nutritionService.logFood — this
 * app does not mirror either provider's full catalog into its own database.
 */

export type FoodSource = 'usda' | 'openfoodfacts';

export interface FoodSearchResult {
  id: string;            // provider-prefixed id, e.g. "usda:173944"
  source: FoodSource;
  sourceId: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  servingLabel?: string;  // e.g. "100 g" or "1 slice (28g)"
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';
const OFF_BASE = 'https://world.openfoodfacts.org';

function usdaKey(): string {
  const key = process.env.EXPO_PUBLIC_USDA_FDC_API_KEY;
  if (!key) throw new Error('Missing EXPO_PUBLIC_USDA_FDC_API_KEY — see .env.example');
  return key;
}

function offHeaders(): HeadersInit {
  return {
    'User-Agent': process.env.EXPO_PUBLIC_OFF_USER_AGENT ?? 'FitByte-StudyApp/1.0',
  };
}

// ─── USDA ───────────────────────────────────────────────────────────────────

function nutrient(nutrients: any[], name: string): number {
  const hit = nutrients?.find((n) => n.nutrientName === name);
  return hit?.value ?? 0;
}

function normalizeUsda(item: any): FoodSearchResult {
  const nutrients = item.foodNutrients ?? [];
  return {
    id: `usda:${item.fdcId}`,
    source: 'usda',
    sourceId: String(item.fdcId),
    name: item.description ?? 'Unknown food',
    brand: item.brandOwner,
    servingLabel: '100 g',
    calories: nutrient(nutrients, 'Energy'),
    protein: nutrient(nutrients, 'Protein'),
    carbs: nutrient(nutrients, 'Carbohydrate, by difference'),
    fats: nutrient(nutrients, 'Total lipid (fat)'),
  };
}

async function searchUsda(query: string, pageSize = 15): Promise<FoodSearchResult[]> {
  const url = `${USDA_BASE}/foods/search?api_key=${usdaKey()}&query=${encodeURIComponent(
    query
  )}&pageSize=${pageSize}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`USDA search failed (${res.status})`);
  const data = await res.json();
  return (data.foods ?? []).map(normalizeUsda);
}

// ─── Open Food Facts ────────────────────────────────────────────────────────

function normalizeOff(product: any): FoodSearchResult {
  const n = product.nutriments ?? {};
  return {
    id: `openfoodfacts:${product.code}`,
    source: 'openfoodfacts',
    sourceId: product.code,
    name: product.product_name || product.generic_name || 'Unknown product',
    brand: product.brands,
    imageUrl: product.image_front_small_url || product.image_url,
    servingLabel: product.serving_size || '100 g',
    calories: n['energy-kcal_100g'] ?? 0,
    protein: n['proteins_100g'] ?? 0,
    carbs: n['carbohydrates_100g'] ?? 0,
    fats: n['fat_100g'] ?? 0,
  };
}

async function searchOpenFoodFacts(query: string, pageSize = 15): Promise<FoodSearchResult[]> {
  const url = `${OFF_BASE}/cgi/search.pl?search_terms=${encodeURIComponent(
    query
  )}&search_simple=1&action=process&json=1&page_size=${pageSize}`;
  const res = await fetch(url, { headers: offHeaders() });
  if (!res.ok) throw new Error(`Open Food Facts search failed (${res.status})`);
  const data = await res.json();
  return (data.products ?? []).map(normalizeOff);
}

async function lookupBarcode(barcode: string): Promise<FoodSearchResult | null> {
  const res = await fetch(`${OFF_BASE}/api/v2/product/${barcode}.json`, {
    headers: offHeaders(),
  });
  if (!res.ok) throw new Error(`Barcode lookup failed (${res.status})`);
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;
  return normalizeOff(data.product);
}

// ─── Public service ─────────────────────────────────────────────────────────

export const foodService = {
  /**
   * Search both providers and merge results — USDA first (higher-quality
   * generic-food data), then Open Food Facts (branded/packaged coverage).
   * A failure in one provider doesn't sink the other.
   */
  async search(query: string): Promise<FoodSearchResult[]> {
    const [usda, off] = await Promise.allSettled([
      searchUsda(query),
      searchOpenFoodFacts(query),
    ]);
    const results: FoodSearchResult[] = [];
    if (usda.status === 'fulfilled') results.push(...usda.value);
    if (off.status === 'fulfilled') results.push(...off.value);
    return results;
  },

  /** Barcode scans only make sense against Open Food Facts. */
  async lookupBarcode(barcode: string): Promise<FoodSearchResult | null> {
    return lookupBarcode(barcode);
  },
};
