import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  try {
    const segments = params.path || [];
    if (segments.length === 0) {
      return new NextResponse('Media path required', { status: 400, headers: CORS_HEADERS });
    }

    // Candidate base directories where public/media might exist across local dev and VPS
    const candidates = [
      path.join(process.cwd(), 'apps', 'storefront', 'public', 'media', ...segments),
      path.join(process.cwd(), 'public', 'media', ...segments),
      path.join(process.cwd(), 'src', 'public', 'media', ...segments),
      path.join(process.cwd(), '..', 'public', 'media', ...segments),
      path.join(process.cwd(), '..', 'apps', 'storefront', 'public', 'media', ...segments),
      path.resolve('/var/www/dwstore/apps/storefront/public/media', ...segments),
      path.resolve('/var/www/dwstore/public/media', ...segments),
    ];

    const foundPath = candidates.find((p) => {
      try {
        return fs.existsSync(p) && fs.statSync(p).isFile();
      } catch {
        return false;
      }
    });

    if (!foundPath) {
      return new NextResponse('Media file not found', { status: 404, headers: CORS_HEADERS });
    }

    const ext = path.extname(foundPath).toLowerCase();
    const contentType = MIME_MAP[ext] || 'application/octet-stream';
    const fileBuffer = fs.readFileSync(foundPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (err: any) {
    console.error('[Media Route Error]:', err);
    return new NextResponse('Internal error serving media', { status: 500, headers: CORS_HEADERS });
  }
}
