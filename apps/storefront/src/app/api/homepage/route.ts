import { NextRequest, NextResponse } from 'next/server';
import { readDataJson, writeDataJson } from '@/lib/data-paths';
import { globalMemoryCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const HOMEPAGE_CACHE_KEY = 'dwstore_homepage';
const HOMEPAGE_CACHE_TTL = 10 * 1000; // 10 seconds max memory cache

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Private-Network': 'true',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function getHomepageConfig() {
  const cached = globalMemoryCache.get(HOMEPAGE_CACHE_KEY, HOMEPAGE_CACHE_TTL);
  if (cached) return cached;

  const data = readDataJson('homepage.json', null);
  if (data) {
    globalMemoryCache.set(HOMEPAGE_CACHE_KEY, data);
  }
  return data;
}

export async function GET() {
  const config = getHomepageConfig();
  if (config) {
    return NextResponse.json({ success: true, config }, { headers: CORS_HEADERS });
  }
  return NextResponse.json(
    { success: false, message: 'Homepage configuration not found' },
    { status: 404, headers: CORS_HEADERS }
  );
}

export async function POST(req: NextRequest) {
  try {
    let body: any = null;
    try {
      body = await req.json();
    } catch {
      const text = await req.text().catch(() => '');
      if (text) {
        try {
          body = JSON.parse(text);
        } catch {}
      }
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const config = body.config || body;

    const existing: any = getHomepageConfig() || {};
    const mergedConfig = {
      ...existing,
      ...config,
      hero: { ...(existing.hero || {}), ...(config.hero || {}) },
      brandsBar: {
        ...(existing.brandsBar || {}),
        ...(config.brandsBar || {}),
        enabled: typeof config?.brandsBar?.enabled === 'boolean'
          ? config.brandsBar.enabled
          : (existing?.brandsBar?.enabled ?? true),
      },
      promoBanners: { 
        ...(existing.promoBanners || {}), 
        ...(config.promoBanners || {}),
        enabled: typeof config?.promoBanners?.enabled === 'boolean' 
          ? config.promoBanners.enabled 
          : (existing?.promoBanners?.enabled ?? false)
      },
      shopByCategories: {
        ...(existing.shopByCategories || {}),
        ...(config.shopByCategories || {}),
        enabled: typeof config?.shopByCategories?.enabled === 'boolean'
          ? config.shopByCategories.enabled
          : (existing?.shopByCategories?.enabled ?? true),
      },
      superDeals: { 
        ...(existing.superDeals || {}), 
        ...(config.superDeals || {}),
        enabled: typeof config?.superDeals?.enabled === 'boolean' 
          ? config.superDeals.enabled 
          : (existing?.superDeals?.enabled ?? true)
      },
      bentoGrid: {
        ...(existing.bentoGrid || {}),
        ...(config.bentoGrid || {}),
        enabled: typeof config?.bentoGrid?.enabled === 'boolean'
          ? config.bentoGrid.enabled
          : (existing?.bentoGrid?.enabled ?? true),
      },
    };

    writeDataJson('homepage.json', mergedConfig);
    globalMemoryCache.set(HOMEPAGE_CACHE_KEY, mergedConfig);

    return NextResponse.json(
      { success: true, message: 'Homepage configuration updated successfully', config: mergedConfig },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error('Error saving homepage.json:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
