import { NextRequest, NextResponse } from 'next/server';
import { readDataJson } from '@/lib/data-paths';
import { isProductInStock } from '@/lib/catalog';
import defaultProducts from '@/data/products.json';

export const dynamic = 'force-dynamic';

const SITE_URL = 'https://www.dwstore.lk';

/**
 * Strips HTML tags, decodes common entities, and normalizes whitespaces/newlines for Meta Catalog description.
 */
function cleanDescription(raw?: string): string {
  if (!raw || typeof raw !== 'string') return '';
  let text = raw.replace(/<[^>]*>/g, ' ');
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
  text = text.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
  return text.slice(0, 5000);
}

/**
 * Escapes values according to standard RFC 4180 CSV specifications.
 * Wraps values containing commas, double quotes, or newlines in double quotes,
 * and escapes internal double quotes as "".
 */
function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val).replace(/\r\n/g, ' ').replace(/[\r\n]/g, ' ');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: NextRequest) {
  try {
    const origin =
      req.nextUrl.origin && !req.nextUrl.origin.includes('localhost')
        ? req.nextUrl.origin
        : SITE_URL;

    // Load active products from persistent storage / products.json
    const products = readDataJson<any[]>('products.json', defaultProducts as any[]);

    // Meta required headers
    const headers = [
      'id',
      'title',
      'description',
      'availability',
      'condition',
      'price',
      'link',
      'image_link',
      'brand',
    ];

    const rows: string[] = [headers.join(',')];

    for (const p of products) {
      // 1. Skip non-active, draft, or archived items
      if (
        p.status === 'Draft' ||
        p.catalogStatus === 'Draft' ||
        p.status === 'Archived'
      ) {
        continue;
      }

      // 2. id: Unique product ID/SKU (strictly matches content_ids in Pixel events)
      const id = String(p.id || '').trim();
      if (!id) continue;

      // 3. title: Product name
      const title = String(p.name || p.title || '').trim();
      if (!title) continue;

      // 4. price: Formatted with 2 decimals and currency code (e.g., 2500.00 LKR)
      const priceMinor =
        p.salePriceMinor || p.regularPriceMinor || p.minPriceMinor || p.priceMinor || 0;
      if (typeof priceMinor !== 'number' || priceMinor <= 0) {
        // Skip products missing a valid price so Meta does not reject the feed
        continue;
      }
      const priceFormatted = `${(priceMinor / 100).toFixed(2)} LKR`;

      // 5. image_link: Full absolute direct URL to the main product image
      let rawImage =
        p.displayImage ||
        (Array.isArray(p.imageUrls) && p.imageUrls[0]) ||
        p.image ||
        '';
      if (!rawImage && Array.isArray(p.localImages) && p.localImages[0]) {
        rawImage = p.localImages[0];
      }
      if (!rawImage || typeof rawImage !== 'string' || !rawImage.trim()) {
        // Skip products missing an image URL so Meta does not reject the feed
        continue;
      }
      let imageLink = rawImage.trim();
      if (!imageLink.startsWith('http://') && !imageLink.startsWith('https://')) {
        const cleanPath = imageLink.startsWith('/') ? imageLink : `/${imageLink}`;
        imageLink = `${origin}${cleanPath}`;
      }

      // 6. description: Clean plain-text short description
      const rawDesc =
        p.shortDescription ||
        p.description ||
        p.name ||
        'Quality electronics and accessories from DW Store Sri Lanka';
      const description =
        cleanDescription(rawDesc) ||
        'Quality electronics and accessories from DW Store Sri Lanka';

      // 7. availability: Strictly "in stock" or "out of stock"
      const inStock = isProductInStock(p);
      const availability = inStock ? 'in stock' : 'out of stock';

      // 8. condition: "new"
      const condition = 'new';

      // 9. link: Full absolute product URL
      const link = `${origin}/product/${encodeURIComponent(p.slug || p.id)}`;

      // 10. brand: Product brand name (fallback to "DW Store" if empty)
      const brand = (p.brand && String(p.brand).trim()) || 'DW Store';

      // Assemble CSV row
      const row = [
        escapeCsv(id),
        escapeCsv(title),
        escapeCsv(description),
        escapeCsv(availability),
        escapeCsv(condition),
        escapeCsv(priceFormatted),
        escapeCsv(link),
        escapeCsv(imageLink),
        escapeCsv(brand),
      ].join(',');

      rows.push(row);
    }

    const csvContent = rows.join('\r\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'inline; filename="meta-catalog-feed.csv"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    console.error('[Meta Feed] Error generating catalog feed:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
