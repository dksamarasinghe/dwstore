import { NextRequest, NextResponse } from 'next/server';
import { readDataJson, writeDataJson } from '@/lib/data-paths';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store, max-age=0',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function getCategories(): any[] {
  return readDataJson('categories.json', []);
}

function saveCategories(categories: any[]): boolean {
  return writeDataJson('categories.json', categories);
}

export async function GET() {
  try {
    const categories = getCategories();
    return NextResponse.json({ success: true, categories }, { headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.name) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400, headers: CORS_HEADERS });
    }

    const categories = getCategories();
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const id = body.id || slug;
    const imageUrl = body.imageUrl || body.image || '';

    const existingIndex = categories.findIndex((c: any) => c.id === id || c.slug === slug);

    const categoryItem = {
      id,
      name: body.name,
      slug,
      parentId: body.parentId ?? null,
      parentSlug: body.parentSlug ?? (body.parentId || null),
      level: body.parentId ? 1 : 0,
      description: body.description || '',
      productCount: typeof body.productCount === 'number' ? body.productCount : (existingIndex >= 0 ? categories[existingIndex].productCount : 0),
      icon: body.icon || 'layers',
      image: imageUrl,
      imageUrl,
      status: body.status || 'Active',
      featured: typeof body.featured === 'boolean' ? body.featured : !body.parentId,
    };

    if (existingIndex >= 0) {
      categories[existingIndex] = {
        ...categories[existingIndex],
        ...categoryItem,
      };
    } else {
      categories.push(categoryItem);
    }

    const saved = saveCategories(categories);
    if (!saved) {
      return NextResponse.json({ success: false, error: 'Failed to write categories to disk' }, { status: 500, headers: CORS_HEADERS });
    }

    return NextResponse.json({ success: true, category: categoryItem, categories }, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error('Error updating category:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    if (!id && !slug) {
      return NextResponse.json({ success: false, error: 'ID or slug is required' }, { status: 400, headers: CORS_HEADERS });
    }

    let categories = getCategories();
    categories = categories.filter((c: any) => c.id !== id && c.slug !== slug);
    saveCategories(categories);

    return NextResponse.json({ success: true, categories }, { headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}
