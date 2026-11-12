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

function normalizeHeroImageUrl(url?: string): string {
  if (!url) return '';
  if (url.includes('wp-content/uploads') || url.includes('T800-Ultra-Smart-Watch') || url.includes('T800_Ultra')) {
    if (url.includes('RPP2921') || url.includes('RPP-292')) {
      return '/media/products/RPP2921_5d0c7431.jpg';
    }
    return '/media/products/T800-Ultra-Smart-Watch-1_d7ac6b08.jpg';
  }
  if (url.includes('wp-content/uploads') && url.includes('RPP2921')) {
    return '/media/products/RPP2921_5d0c7431.jpg';
  }
  return url;
}

function sanitizeHomepageConfig(data: any): any {
  if (!data || typeof data !== 'object') return data;
  if (data.hero) {
    if (data.hero.mainBox) {
      if (!data.hero.mainBox.image || data.hero.mainBox.image.includes('wp-content/uploads')) {
        data.hero.mainBox.image = '/media/products/T800-Ultra-Smart-Watch-1_d7ac6b08.jpg';
      }
      if (!data.hero.mainBox.secondaryImage || data.hero.mainBox.secondaryImage.includes('wp-content/uploads')) {
        data.hero.mainBox.secondaryImage = '/media/products/RPP2921_5d0c7431.jpg';
      }
    }
    if (data.hero.sideBox1) {
      if (!data.hero.sideBox1.image || data.hero.sideBox1.image.includes('wp-content/uploads')) {
        data.hero.sideBox1.image = '/media/products/T800-Ultra-Smart-Watch-1_d7ac6b08.jpg';
      }
    }
    if (data.hero.sideBox2) {
      if (!data.hero.sideBox2.image || data.hero.sideBox2.image.includes('wp-content/uploads')) {
        data.hero.sideBox2.image = '/media/products/RPP2921_5d0c7431.jpg';
      }
    }
  }
  return data;
}

function getHomepageConfig() {
  const cached = globalMemoryCache.get(HOMEPAGE_CACHE_KEY, HOMEPAGE_CACHE_TTL);
  if (cached) return sanitizeHomepageConfig(cached);

  const data = readDataJson('homepage.json', null);
  if (data) {
    const clean = sanitizeHomepageConfig(data);
    globalMemoryCache.set(HOMEPAGE_CACHE_KEY, clean);
    return clean;
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

    const cleanMerged = sanitizeHomepageConfig(mergedConfig);
    writeDataJson('homepage.json', cleanMerged);
    globalMemoryCache.set(HOMEPAGE_CACHE_KEY, cleanMerged);

    return NextResponse.json(
      { success: true, message: 'Homepage configuration updated successfully', config: cleanMerged },
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
