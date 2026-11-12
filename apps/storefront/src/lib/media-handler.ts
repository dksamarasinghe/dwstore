import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Cache-Control': 'public, max-age=31536000, immutable',
};

export function handleMediaOptions() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function generateFallbackSvg(filename: string): string {
  const safeName = filename
    .replace(/[^\w\s.-]/g, '')
    .replace(/[-_.]+/g, ' ')
    .trim()
    .slice(0, 32);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#090d16"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#60a5fa"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <circle cx="300" cy="240" r="110" fill="#1e293b" stroke="#334155" stroke-width="2"/>
  <path d="M260 210 L300 185 L340 210 L340 260 L300 285 L260 260 Z" fill="none" stroke="url(#accent)" stroke-width="5" stroke-linejoin="round"/>
  <path d="M300 185 L300 285" stroke="url(#accent)" stroke-width="4"/>
  <path d="M260 210 L300 235 L340 210" stroke="url(#accent)" stroke-width="4"/>
  <text x="300" y="390" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#ffffff" letter-spacing="2">DWSTORE.LK</text>
  <text x="300" y="420" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#94a3b8" letter-spacing="1">AUTHENTIC IMPORTED TECH</text>
  ${safeName ? `<text x="300" y="455" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#64748b">${safeName}</text>` : ''}
</svg>`;
}

function findMatchingFile(targetFilename: string, searchBases: string[]): string | null {
  const ext = path.extname(targetFilename).toLowerCase();
  const baseNoExt = path.basename(targetFilename, ext).toLowerCase().replace(/-\d+x\d+$/, '');
  const subfolders = [
    'products',
    'categories',
    'brands',
    'home-customizer',
    'gallery',
    'general',
    'products/images',
    'images',
  ];

  for (const base of searchBases) {
    for (const sub of subfolders) {
      const folder = path.join(base, sub);
      if (!fs.existsSync(folder)) continue;
      let files: string[] = [];
      try {
        files = fs.readdirSync(folder);
      } catch {
        continue;
      }

      // 1. Exact match
      const exact = files.find((f) => f.toLowerCase() === targetFilename.toLowerCase());
      if (exact) return path.join(folder, exact);

      // 2. Prefix match (e.g. filename_hash.jpg matches filename.jpg)
      if (baseNoExt.length >= 3) {
        const prefix = files.find((f) => f.toLowerCase().startsWith(baseNoExt));
        if (prefix) return path.join(folder, prefix);

        // 3. Contains match
        const contains = files.find((f) => f.toLowerCase().includes(baseNoExt));
        if (contains) return path.join(folder, contains);
      }
    }
  }
  return null;
}

export async function handleMediaGet(
  req: NextRequest,
  rawSegments: string[]
) {
  try {
    if (rawSegments.length === 0) {
      return new NextResponse('Path parameter required', { status: 400, headers: CORS_HEADERS });
    }

    let segments = [...rawSegments];
    while (segments[0] === 'media' || segments[0] === 'api') {
      segments.shift();
    }

    const targetFilename = segments[segments.length - 1];

    const searchDirs: string[] = [
      path.join(process.cwd(), 'apps', 'storefront', 'public', 'media'),
      path.join(process.cwd(), 'public', 'media'),
      path.join(process.cwd(), 'apps', 'storefront', 'public'),
      path.join(process.cwd(), 'public'),
      '/var/www/dwstore/apps/storefront/public/media',
      '/var/www/dwstore/public/media',
      '/var/www/dwstore/apps/storefront/public',
      '/var/www/dwstore/public',
      path.resolve(process.cwd(), '..', 'storefront', 'public', 'media'),
      path.resolve(process.cwd(), '..', 'public', 'media'),
    ];

    let foundPath: string | null = null;

    // 1. Direct path lookup
    for (const base of searchDirs) {
      const candidate = path.join(base, ...segments);
      if (fs.existsSync(candidate)) {
        try {
          if (fs.statSync(candidate).isFile()) {
            foundPath = candidate;
            break;
          }
        } catch {}
      }
    }

    // 2. Fuzzy / Legacy WordPress / Resized image lookup
    if (!foundPath && targetFilename) {
      foundPath = findMatchingFile(targetFilename, searchDirs);
    }

    // 3. Specific known aliases
    if (!foundPath && targetFilename) {
      const lower = targetFilename.toLowerCase();
      if (lower.includes('t800') || lower.includes('series-8')) {
        foundPath = findMatchingFile('T800-Ultra-Smart-Watch-1_d7ac6b08.jpg', searchDirs);
      } else if (lower.includes('rpp292') || lower.includes('rpp-292') || lower.includes('rpp2921')) {
        foundPath = findMatchingFile('RPP2921_5d0c7431.jpg', searchDirs);
      }
    }

    // 4. File found: stream with cache headers
    if (foundPath && fs.existsSync(foundPath)) {
      const ext = path.extname(foundPath).toLowerCase();
      const contentType = MIME_MAP[ext] || 'application/octet-stream';
      const stats = fs.statSync(foundPath);
      const etag = `W/"${stats.size}-${stats.mtime.getTime()}"`;

      const ifNoneMatch = req.headers.get('if-none-match');
      if (ifNoneMatch && ifNoneMatch === etag) {
        return new NextResponse(null, { status: 304, headers: CORS_HEADERS });
      }

      const fileBuffer = fs.readFileSync(foundPath);

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': contentType,
          'Content-Length': fileBuffer.length.toString(),
          'ETag': etag,
          'Last-Modified': stats.mtime.toUTCString(),
        },
      });
    }

    // 5. File not found: Return high-resolution branded SVG fallback
    const fallbackSvg = generateFallbackSvg(targetFilename || 'Product');
    return new NextResponse(fallbackSvg, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (err: any) {
    console.error('[Media Route Error]:', err);
    const fallbackSvg = generateFallbackSvg('Product');
    return new NextResponse(fallbackSvg, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'image/svg+xml; charset=utf-8',
      },
    });
  }
}
