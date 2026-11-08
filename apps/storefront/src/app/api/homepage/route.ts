import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { globalMemoryCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const HOMEPAGE_FILE = path.join(process.cwd(), 'src', 'data', 'homepage.json');
const HOMEPAGE_CACHE_KEY = 'dwstore_homepage';
const HOMEPAGE_CACHE_TTL = 60 * 1000;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Private-Network': 'true',
  'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function getHomepageConfig() {
  const cached = globalMemoryCache.get(HOMEPAGE_CACHE_KEY, HOMEPAGE_CACHE_TTL);
  if (cached) return cached;

  try {
    if (fs.existsSync(HOMEPAGE_FILE)) {
      const content = fs.readFileSync(HOMEPAGE_FILE, 'utf-8');
      const data = JSON.parse(content);
      globalMemoryCache.set(HOMEPAGE_CACHE_KEY, data);
      return data;
    }
  } catch (err) {
    console.error('Error reading homepage.json:', err);
  }
  return null;
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

    const existing = getHomepageConfig() || {};
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

    fs.writeFileSync(HOMEPAGE_FILE, JSON.stringify(mergedConfig, null, 2), 'utf-8');
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
