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

function normalizeProductCategory(p: any) {
  if (!p) return p;
  if (!p.category || p.category === 'Uncategorized') {
    if (Array.isArray(p.categories) && p.categories[0] && p.categories[0] !== 'Uncategorized') {
      p.category = p.categories[0];
    } else if (Array.isArray(p.categorySlugs) && p.categorySlugs[0]) {
      p.category = p.categorySlugs[0].replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    } else {
      p.category = 'General';
    }
  }
  return p;
}

function populateGroupedProducts(p: any, allProducts: any[]) {
  if (!p) return p;
  if (p.type === 'grouped' || p.productType === 'grouped' || p.type === 'combo') {
    const existingGrouped = Array.isArray(p.groupedProducts) ? p.groupedProducts : [];
    const ids = Array.isArray(p.groupedProductIds) ? p.groupedProductIds : existingGrouped.map((g: any) => String(g.id));
    
    if (ids.length > 0) {
      p.groupedProducts = ids.map((gId: string) => {
        const found = allProducts.find((item) => String(item.id) === String(gId));
        const prev = existingGrouped.find((g: any) => String(g.id) === String(gId));
        if (!found && !prev) return null;
        const name = found?.name || prev?.name || 'Product';
        const slug = found?.slug || prev?.slug || '';
        const image = found?.displayImage || (found?.imageUrls && found.imageUrls[0]) || prev?.image || prev?.displayImage || '';
        const regularPrice = (found?.regularPriceMinor ? found.regularPriceMinor / 100 : found?.regularPrice) || prev?.regularPrice || 0;
        const salePrice = (found?.salePriceMinor ? found.salePriceMinor / 100 : found?.salePrice) || prev?.salePrice || regularPrice;
        const qty = prev?.quantity || 1;
        const pType = found?.productType || found?.type || prev?.productType || (found?.variations?.length ? 'variable' : 'simple');

        return {
          id: String(gId),
          name,
          slug,
          image,
          displayImage: image,
          regularPriceMinor: Math.round(regularPrice * 100),
          salePriceMinor: Math.round(salePrice * 100),
          regularPrice,
          salePrice,
          quantity: qty,
          productType: pType,
          brand: found?.brand || prev?.brand || '',
          sku: found?.sku || prev?.sku || '',
        };
      }).filter(Boolean);
    }
  }
  return p;
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
    const populated = populateGroupedProducts(normalizeProductCategory({ ...found }), products);
    return NextResponse.json(populated, { headers: CORS_HEADERS });
  }

  const normalizedList = products.map((p) => populateGroupedProducts(normalizeProductCategory({ ...p }), products));
  return NextResponse.json(normalizedList, { headers: CORS_HEADERS });
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
            : (v.stockQty !== undefined && v.stockQty !== null ? Number(v.stockQty) : 0);

          // Stock status does not depend on stock quantity count
          const isExplicitOutOfStock =
            v.stockStatus === 'Out of Stock' ||
            v.stockStatus === 'out_of_stock' ||
            v.status === 'Out of stock' ||
            v.status === 'Out of Stock' ||
            v.inStock === false;

          const varInStock = !isExplicitOutOfStock;
          const varStockStatus = varInStock ? 'In Stock' : 'Out of Stock';
          const varStatus = varInStock ? 'Active' : 'Out of stock';
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
            status: varStatus,
            stockStatus: varStockStatus,
            stockQty: varStock,
          };
        })
      : (existingIndex >= 0 ? products[existingIndex].variations || [] : []);

    const isGrouped = body.productType === 'grouped' || body.type === 'grouped' || (Array.isArray(body.groupedProductIds) && body.groupedProductIds.length > 0);
    const isVariable = !isGrouped && (body.productType === 'variable' || body.type === 'variable' || formattedVariations.length > 0);
    const finalType = isGrouped ? 'grouped' : (isVariable ? 'variable' : 'simple');

    const groupedProductIds = isGrouped && Array.isArray(body.groupedProductIds) ? body.groupedProductIds : [];
    let groupedProducts = isGrouped && Array.isArray(body.groupedProducts) ? body.groupedProducts : [];
    if (isGrouped && groupedProductIds.length > 0) {
      groupedProducts = groupedProductIds.map((gId: string) => {
        const found = products.find((item) => String(item.id) === String(gId));
        const passed = Array.isArray(body.groupedProducts)
          ? body.groupedProducts.find((gp: any) => String(gp.id) === String(gId))
          : null;
        if (!found && !passed) return null;
        const name = found?.name || passed?.name || 'Product';
        const slug = found?.slug || passed?.slug || '';
        const image = found?.displayImage || (found?.imageUrls && found.imageUrls[0]) || passed?.image || '';
        const regularPrice = (found?.regularPriceMinor ? found.regularPriceMinor / 100 : found?.regularPrice) || passed?.regularPrice || 0;
        const salePrice = (found?.salePriceMinor ? found.salePriceMinor / 100 : found?.salePrice) || passed?.salePrice || regularPrice;
        const qty = passed?.quantity || 1;
        const pType = found?.productType || found?.type || passed?.productType || (found?.variations?.length ? 'variable' : 'simple');

        return {
          id: String(gId),
          name,
          slug,
          image,
          displayImage: image,
          regularPriceMinor: Math.round(regularPrice * 100),
          salePriceMinor: Math.round(salePrice * 100),
          regularPrice,
          salePrice,
          quantity: qty,
          productType: pType,
          brand: found?.brand || passed?.brand || '',
          sku: found?.sku || passed?.sku || '',
        };
      }).filter(Boolean);
    }

    const hasVarStock = formattedVariations.length > 0
      ? formattedVariations.some((v: any) => v.inStock === true)
      : false;
    const inStock = body.status === 'Out of stock'
      ? false
      : (body.status === 'Active' || body.status === 'Low stock')
      ? true
      : isVariable
      ? (hasVarStock || body.status !== 'Out of stock')
      : (body.status !== 'Out of stock');
    const stockQty = isVariable
      ? formattedVariations.reduce((sum: number, v: any) => sum + (Number(v.stockQty) || 0), 0)
      : (body.stock !== undefined ? Number(body.stock) : 10);

    const minPriceMinor = formattedVariations.length > 0
      ? Math.min(...formattedVariations.map((v: any) => v.salePriceMinor || v.regularPriceMinor || saleMinor))
      : (saleMinor > 0 ? saleMinor : regMinor);

    // Resolve Category accurately
    const rawCategory = body.category && String(body.category).trim() !== 'Uncategorized'
      ? String(body.category).trim()
      : (Array.isArray(body.categories) && body.categories[0] && String(body.categories[0]).trim() !== 'Uncategorized'
        ? String(body.categories[0]).trim()
        : (existingIndex >= 0 && products[existingIndex].category && products[existingIndex].category !== 'Uncategorized'
          ? products[existingIndex].category
          : ''));

    const categorySlug = rawCategory
      ? rawCategory.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
      : (existingIndex >= 0 && products[existingIndex].categorySlugs?.[0]
        ? products[existingIndex].categorySlugs[0]
        : 'general');

    const finalCategoryName = rawCategory || categorySlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    const finalCategorySlugs = [categorySlug];

    const nowIso = new Date().toISOString();
    const nowTs = Date.now();

    if (existingIndex >= 0) {
      // Update existing product
      const updatedProduct = {
        ...products[existingIndex],
        type: finalType,
        productType: finalType,
        groupedProductIds: isGrouped ? groupedProductIds : (products[existingIndex].groupedProductIds || undefined),
        groupedProducts: isGrouped ? groupedProducts : (products[existingIndex].groupedProducts || undefined),
        name: body.name || products[existingIndex].name,
        category: finalCategoryName,
        categories: [finalCategoryName],
        categorySlugs: finalCategorySlugs,
        warrantyPeriod,
        regularPriceMinor: regMinor,
        salePriceMinor: saleMinor,
        minPriceMinor: minPriceMinor > 0 ? minPriceMinor : (saleMinor > 0 ? saleMinor : regMinor),
        inStock,
        stockQty,
        status: body.status || (inStock ? 'Active' : 'Out of stock'),
        catalogStatus: body.status || (inStock ? 'Active' : 'Out of stock'),
        brand: body.brand !== undefined ? body.brand : products[existingIndex].brand,
        shortDescription: body.shortDesc !== undefined ? body.shortDesc : products[existingIndex].shortDescription,
        description: body.description !== undefined ? body.description : products[existingIndex].description,
        shipping: body.shipping || products[existingIndex].shipping,
        seoTitle: body.seoTitle !== undefined ? String(body.seoTitle).trim() : (products[existingIndex].seoTitle || ''),
        seoDescription: body.seoDescription !== undefined ? String(body.seoDescription).trim() : (products[existingIndex].seoDescription || ''),
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
        type: finalType,
        productType: finalType,
        groupedProductIds: isGrouped ? groupedProductIds : undefined,
        groupedProducts: isGrouped ? groupedProducts : undefined,
        status: body.status || (inStock ? 'Active' : 'Out of stock'),
        catalogStatus: body.status || (inStock ? 'Active' : 'Out of stock'),
        regularPriceMinor: regMinor,
        salePriceMinor: saleMinor,
        minPriceMinor: minPriceMinor > 0 ? minPriceMinor : (saleMinor > 0 ? saleMinor : regMinor),
        warrantyPeriod,
        inStock,
        stockQty,
        brand: body.brand || '',
        shortDescription: body.shortDesc || '',
        description: body.description || '',
        seoTitle: body.seoTitle !== undefined ? String(body.seoTitle).trim() : '',
        seoDescription: body.seoDescription !== undefined ? String(body.seoDescription).trim() : '',
        category: finalCategoryName,
        categories: [finalCategoryName],
        categorySlugs: finalCategorySlugs,
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
