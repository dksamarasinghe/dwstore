import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { readDataJson, writeDataJson } from '@/lib/data-paths';
import { globalMemoryCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

const CACHE_KEY = 'dwstore_products';
const CACHE_TTL_MS = 10 * 1000;

function getProducts(): any[] {
  const cached = globalMemoryCache.get<any[]>(CACHE_KEY, CACHE_TTL_MS);
  if (cached) return cached;

  const products = readDataJson('products.json', []);
  if (products && products.length > 0) {
    globalMemoryCache.set(CACHE_KEY, products);
  }
  return products;
}

function saveProducts(products: any[]) {
  const ok = writeDataJson('products.json', products);
  if (ok) {
    globalMemoryCache.set(CACHE_KEY, products);
  }
  return ok;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idOrSlug = searchParams.get('id') || searchParams.get('slug');
  const products = getProducts();

  if (idOrSlug) {
    const found = products.find((p) => String(p.id) === idOrSlug || p.slug === idOrSlug);
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
    const warrantyPeriod = body.warrantyPeriod !== undefined ? String(body.warrantyPeriod).trim() : '';

    const primaryImage = body.image || body.displayImage || (existingIndex >= 0 ? products[existingIndex].displayImage : '/dwstore_logo.png');
    const galleryList = Array.isArray(body.galleryImages) && body.galleryImages.length > 0
      ? body.galleryImages
      : Array.isArray(body.imageUrls) && body.imageUrls.length > 0
      ? body.imageUrls
      : (existingIndex >= 0 && products[existingIndex].imageUrls?.length ? products[existingIndex].imageUrls : [primaryImage]);

    // Parse attributes
    let normalizedAttributes: any = body.attributes || (existingIndex >= 0 ? products[existingIndex].attributes : {});
    if (Array.isArray(body.attributes)) {
      const attrObj: Record<string, string[]> = {};
      body.attributes.forEach((a: any) => {
        if (a && a.name && a.name.toLowerCase() !== 'warranty') {
          const vals = typeof a.values === 'string'
            ? a.values.split(',').map((s: string) => s.trim()).filter(Boolean)
            : Array.isArray(a.values) ? a.values : [String(a.values)];
          attrObj[a.name] = vals;
        }
      });
      normalizedAttributes = attrObj;
    }

    // Format variations
    const formattedVariations = Array.isArray(body.variations) && body.variations.length > 0
      ? body.variations.map((v: any, idx: number) => {
          const varReg = v.regularPrice !== undefined && v.regularPrice !== null && v.regularPrice !== ''
            ? Math.round(Number(v.regularPrice) * 100)
            : (v.regularPriceMinor || regMinor);
          const varSale = v.salePrice !== undefined && v.salePrice !== null && v.salePrice !== ''
            ? Math.round(Number(v.salePrice) * 100)
            : (v.salePriceMinor !== undefined ? v.salePriceMinor : (saleMinor || varReg));
          const varStock = v.stock !== undefined && v.stock !== null && v.stock !== ''
            ? Number(v.stock)
            : (v.stockQty !== undefined && v.stockQty !== null ? Number(v.stockQty) : 10);
          const varInStock = varStock > 0 || v.inStock === true;
          const varImg = v.displayImage || v.image || primaryImage;

          return {
            id: String(v.id || `var-${Date.now()}-${idx}`),
            sku: v.sku || '',
            name: v.name || `${body.name || (existingIndex >= 0 ? products[existingIndex].name : '')} - ${Object.values(v.attributes || {}).join(' ')}`.trim(),
            attributes: v.attributes || {},
            regularPriceMinor: varReg,
            salePriceMinor: varSale,
            displayImage: varImg,
            imageUrls: v.image ? [v.image] : (v.displayImage ? [v.displayImage] : [primaryImage]),
            inStock: varInStock,
            stockQty: varStock,
          };
        })
      : (existingIndex >= 0 ? products[existingIndex].variations || [] : []);

    const isVariable = body.productType === 'variable' || body.type === 'variable' || formattedVariations.length > 0;
    const hasVarStock = formattedVariations.length > 0
      ? formattedVariations.some((v: any) => v.inStock && (v.stockQty === null || v.stockQty > 0))
      : false;
    const inStock = isVariable ? hasVarStock : (body.status !== 'Out of stock' && Number(body.stock ?? 1) > 0);
    const stockQty = isVariable
      ? formattedVariations.reduce((sum: number, v: any) => sum + (Number(v.stockQty) || 0), 0)
      : (body.stock !== undefined ? Number(body.stock) : 10);

    const minPriceMinor = formattedVariations.length > 0
      ? Math.min(...formattedVariations.map((v: any) => v.salePriceMinor || v.regularPriceMinor || saleMinor))
      : (saleMinor > 0 ? saleMinor : regMinor);

    const nowIso = new Date().toISOString();
    const nowTs = Date.now();

    if (existingIndex >= 0) {
      // Update existing product
      const updatedProduct = {
        ...products[existingIndex],
        type: isVariable ? 'variable' : 'simple',
        name: body.name || products[existingIndex].name,
        warrantyPeriod,
        regularPriceMinor: regMinor,
        salePriceMinor: saleMinor,
        minPriceMinor: minPriceMinor > 0 ? minPriceMinor : (saleMinor > 0 ? saleMinor : regMinor),
        inStock,
        stockQty,
        brand: body.brand || products[existingIndex].brand,
        shortDescription: body.shortDesc !== undefined ? body.shortDesc : products[existingIndex].shortDescription,
        description: body.description !== undefined ? body.description : products[existingIndex].description,
        shipping: body.shipping || products[existingIndex].shipping,
        displayImage: primaryImage,
        imageUrls: galleryList,
        attributes: normalizedAttributes,
        variations: formattedVariations,
        updatedAt: nowIso,
        updatedAtTimestamp: nowTs,
      };

      // Move newly edited product to the front (top) of catalog
      products.splice(existingIndex, 1);
      products.unshift(updatedProduct);
    } else {
      // Create new product
      const newProduct = {
        id: productId || `prod-${Date.now()}`,
        name: body.name,
        slug: productSlug,
        sku: body.sku || `WC-${Date.now()}`,
        type: isVariable ? 'variable' : 'simple',
        status: 'published',
        regularPriceMinor: regMinor,
        salePriceMinor: saleMinor,
        minPriceMinor: minPriceMinor > 0 ? minPriceMinor : (saleMinor > 0 ? saleMinor : regMinor),
        warrantyPeriod,
        inStock,
        stockQty,
        brand: body.brand || 'DWstore',
        shortDescription: body.shortDesc || '',
        description: body.description || '',
        categorySlugs: [body.category ? body.category.toLowerCase().replace(/\s+/g, '-') : 'general'],
        attributes: normalizedAttributes,
        imageUrls: galleryList,
        displayImage: primaryImage,
        variations: formattedVariations,
        sourceSystem: 'admin',
        createdAt: nowIso,
        createdAtTimestamp: nowTs,
        updatedAt: nowIso,
        updatedAtTimestamp: nowTs,
      };
      products.unshift(newProduct);
    }

    saveProducts(products);

    // Revalidate Next.js cache so changes reflect instantly
    try {
      revalidatePath('/product/' + productSlug);
      revalidatePath('/shop');
      revalidatePath('/');
    } catch (e) {}

    return NextResponse.json({ success: true, count: products.length }, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error('Error saving product in API:', err);
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}
