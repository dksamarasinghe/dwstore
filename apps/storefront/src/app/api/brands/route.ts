import { NextRequest, NextResponse } from 'next/server';
import { readDataJson, writeDataJson } from '@/lib/data-paths';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Private-Network': 'true',
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function getBrands(): any[] {
  return readDataJson('brands.json', []);
}

function saveBrands(brands: any[]): boolean {
  return writeDataJson('brands.json', brands);
}

export async function GET() {
  try {
    const brands = getBrands();
    return NextResponse.json({ success: true, brands }, { headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const brands = getBrands();

    // Check if bulk array update
    if (Array.isArray(body?.brands)) {
      saveBrands(body.brands);
      return NextResponse.json(
        { success: true, message: 'Brands updated successfully', brands: body.brands },
        { headers: CORS_HEADERS }
      );
    }

    const brandData = body.brand || body;
    if (!brandData.name) {
      return NextResponse.json(
        { success: false, error: 'Brand name is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const slug = brandData.slug || brandData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const id = brandData.id || slug;

    const existingIndex = brands.findIndex(
      (b: any) => b.id === id || b.slug === slug || (b.name && b.name.toLowerCase() === brandData.name.toLowerCase())
    );

    const updatedBrand = {
      id,
      name: brandData.name.trim(),
      slug,
      productCount: typeof brandData.productCount === 'number' ? brandData.productCount : (existingIndex >= 0 ? brands[existingIndex].productCount || 0 : 0),
      logo: brandData.logo !== undefined ? brandData.logo : (existingIndex >= 0 ? brands[existingIndex].logo : ''),
      description: brandData.description !== undefined ? brandData.description : (existingIndex >= 0 ? brands[existingIndex].description : ''),
      featured: brandData.featured !== undefined ? brandData.featured : true,
    };

    if (existingIndex >= 0) {
      brands[existingIndex] = { ...brands[existingIndex], ...updatedBrand };
    } else {
      brands.unshift(updatedBrand);
    }

    saveBrands(brands);

    return NextResponse.json(
      { success: true, message: 'Brand saved successfully', brand: updatedBrand, brands },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error('Error saving brand:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paramId = searchParams.get('id') || searchParams.get('slug');

    let bodyId = '';
    try {
      const body = await req.json();
      bodyId = body?.id || body?.slug || '';
    } catch {}

    const targetId = paramId || bodyId;
    if (!targetId) {
      return NextResponse.json(
        { success: false, error: 'Brand id or slug is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const brands = getBrands();
    const filtered = brands.filter((b: any) => b.id !== targetId && b.slug !== targetId);
    saveBrands(filtered);

    return NextResponse.json(
      { success: true, message: 'Brand deleted successfully', brands: filtered },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error('Error deleting brand:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}
