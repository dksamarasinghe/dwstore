import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { globalMemoryCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

const PRODUCTS_FILE = path.join(process.cwd(), 'src', 'data', 'products.json');
const CACHE_KEY = 'dwstore_products';
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

function getProducts(): any[] {
  const cached = globalMemoryCache.get<any[]>(CACHE_KEY, CACHE_TTL_MS);
  if (cached) return cached;

  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const content = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      const products = JSON.parse(content);
      globalMemoryCache.set(CACHE_KEY, products);
      return products;
    }
  } catch (err) {
    console.error('Error reading products:', err);
  }
  return [];
}

function saveProducts(products: any[]) {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
    globalMemoryCache.set(CACHE_KEY, products);
    return true;
  } catch (err) {
    console.error('Error saving products:', err);
    return false;
  }
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idOrSlug = searchParams.get('id') || searchParams.get('slug');
  const products = getProducts();

  if (idOrSlug) {
    const found = products.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
    if (!found) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404, headers: CORS_HEADERS });
    }
    return NextResponse.json(found, { headers: CORS_HEADERS });
  }

  return NextResponse.json(products, { headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const products = getProducts();

    const productId = String(body.id || '');
    const productSlug = body.slug || String(body.name || '').toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

    const existingIndex = products.findIndex(
      (p) => String(p.id) === productId || p.slug === productSlug
    );

    // Normalize prices to minor cents (e.g. Rs 1,990 => 199000)
    const saleMinor = body.salePrice ? Math.round(Number(body.salePrice) * 100) : (body.salePriceMinor || 0);
    const regMinor = body.regularPrice ? Math.round(Number(body.regularPrice) * 100) : (body.regularPriceMinor || saleMinor);
    const inStock = body.status !== 'Out of stock' && Number(body.stock ?? 1) > 0;
    const stockQty = body.stock !== undefined ? Number(body.stock) : 10;
    const warrantyPeriod = body.warrantyPeriod !== undefined ? String(body.warrantyPeriod).trim() : '';

    const primaryImage = body.image || body.displayImage || (existingIndex >= 0 ? products[existingIndex].displayImage : '/dwstore_logo.png');
    const galleryList = Array.isArray(body.galleryImages) && body.galleryImages.length > 0
      ? body.galleryImages
      : Array.isArray(body.imageUrls) && body.imageUrls.length > 0
      ? body.imageUrls
      : (existingIndex >= 0 && products[existingIndex].imageUrls?.length ? products[existingIndex].imageUrls : [primaryImage]);

    const formattedVariations = Array.isArray(body.variations)
      ? body.variations.map((v: any) => ({
          ...v,
          id: String(v.id || `var-${Date.now()}`),
          sku: v.sku || '',
          attributes: v.attributes || {},
          regularPriceMinor: v.regularPrice !== undefined ? Math.round(Number(v.regularPrice) * 100) : (v.regularPriceMinor || 0),
          salePriceMinor: v.salePrice !== undefined ? Math.round(Number(v.salePrice) * 100) : (v.salePriceMinor || 0),
          displayImage: v.displayImage || v.image || primaryImage,
          imageUrls: v.image ? [v.image] : (v.displayImage ? [v.displayImage] : []),
          inStock: Number(v.stock ?? 1) > 0,
          stockQty: v.stock !== undefined ? Number(v.stock) : null,
        }))
      : (existingIndex >= 0 ? products[existingIndex].variations || [] : []);

    if (existingIndex >= 0) {
      // Update existing product
      products[existingIndex] = {
        ...products[existingIndex],
        name: body.name || products[existingIndex].name,
        warrantyPeriod,
        regularPriceMinor: regMinor,
        salePriceMinor: saleMinor,
        inStock,
        stockQty,
        brand: body.brand || products[existingIndex].brand,
        shortDescription: body.shortDesc !== undefined ? body.shortDesc : products[existingIndex].shortDescription,
        description: body.description !== undefined ? body.description : products[existingIndex].description,
        shipping: body.shipping || products[existingIndex].shipping,
        displayImage: primaryImage,
        imageUrls: galleryList,
        variations: formattedVariations,
      };
    } else {
      // Create new product
      const newProduct = {
        id: productId || `prod-${Date.now()}`,
        name: body.name,
        slug: productSlug,
        sku: body.sku || `WC-${Date.now()}`,
        type: body.productType || 'simple',
        status: 'published',
        regularPriceMinor: regMinor,
        salePriceMinor: saleMinor,
        minPriceMinor: saleMinor,
        warrantyPeriod,
        inStock,
        stockQty,
        brand: body.brand || 'DWstore',
        shortDescription: body.shortDesc || '',
        description: body.description || '',
        categorySlugs: [body.category ? body.category.toLowerCase().replace(/\s+/g, '-') : 'general'],
        attributes: body.attributes || {},
        imageUrls: galleryList,
        displayImage: primaryImage,
        variations: formattedVariations,
        sourceSystem: 'admin',
      };
      products.unshift(newProduct);
    }

    saveProducts(products);
    return NextResponse.json({ success: true, count: products.length }, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error('Error saving product in API:', err);
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}
