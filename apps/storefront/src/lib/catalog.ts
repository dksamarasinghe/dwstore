import productsData from '@/data/products.json';
import categoriesData from '@/data/categories.json';
import brandsData from '@/data/brands.json';

export interface ProductVariation {
  id: string;
  sku: string;
  name: string;
  regularPriceMinor: number;
  salePriceMinor?: number | null;
  imageUrls: string[];
  displayImage?: string | null;
  inStock: boolean;
  stockQty?: number | null;
}

export interface Product {
  id: string;
  type: string;
  name: string;
  slug: string;
  sku: string;
  status: string;
  regularPriceMinor: number;
  salePriceMinor?: number | null;
  shortDescription?: string;
  description?: string;
  categorySlugs: string[];
  brand?: string | null;
  brandSlug?: string | null;
  imageUrls: string[];
  localImages: string[];
  displayImage: string;
  inStock: boolean;
  stockQty?: number | null;
  seoTitle?: string;
  seoDescription?: string;
  variations: ProductVariation[];
  sourceSystem: string;
  sourceId: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentSlug?: string | null;
  level: number;
  productCount: number;
  imageUrl?: string | null;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export function getAllProducts(): Product[] {
  return productsData as unknown as Product[];
}

export function getAllCategories(): Category[] {
  return categoriesData as unknown as Category[];
}

export function getAllBrands(): Brand[] {
  return brandsData as unknown as Brand[];
}

export function getProductBySlug(slug: string): Product | undefined {
  const products = getAllProducts();
  return products.find((p) => p.slug === slug || p.id === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  const products = getAllProducts();
  return products.filter((p) => p.categorySlugs.includes(categorySlug));
}

export function getBestSellingProducts(limit = 10): Product[] {
  const products = getAllProducts();
  // Filter products that have images and are in stock
  return products
    .filter((p) => p.imageUrls.length > 0 && p.regularPriceMinor > 0)
    .slice(0, limit);
}

export function getFeaturedProducts(limit = 10): Product[] {
  const products = getAllProducts();
  return products
    .filter((p) => p.imageUrls.length > 0 && p.regularPriceMinor > 0)
    .slice(10, 10 + limit);
}

export function formatPriceLKR(minorCents: number): string {
  if (!minorCents || isNaN(minorCents)) return '0.00';
  const val = minorCents / 100;
  return val.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Checks whether a product has active stock.
 * Catalog Status 'Active' / 'Low stock' takes precedence so products can be sold even if opening stock is 0.
 * If status is explicitly 'Out of stock' or 'Draft', returns false.
 */
export function isProductInStock(product: any): boolean {
  if (!product) return false;
  if (product.status === 'Out of stock' || product.status === 'Draft') return false;
  if (product.status === 'Active' || product.status === 'Low stock') return true;
  if (product.inStock === false) return false;

  if (product.variations && product.variations.length > 0) {
    return product.variations.some(
      (v: any) => v.inStock !== false && (v.stockQty === undefined || v.stockQty === null || v.stockQty > 0)
    );
  }
  return product.inStock !== false;
}
