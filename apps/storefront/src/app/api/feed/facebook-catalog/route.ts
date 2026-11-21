import { NextRequest, NextResponse } from 'next/server';
import { readDataJson } from '@/lib/data-paths';

export const dynamic = 'force-dynamic';

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin || 'https://www.dwstore.lk';
    const products = readDataJson<any[]>('products.json', []);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>DWstore.lk Official Product Catalog</title>
    <link>${origin}</link>
    <description>DWstore.lk Sri Lanka Premier Electronics and Gadgets Product Feed</description>
`;

    for (const p of products) {
      const id = escapeXml(String(p.id || p.sku || p.slug));
      const title = escapeXml(p.name || p.title || 'DWstore Product');
      const rawDesc = stripHtml(p.shortDescription || p.description || p.name || 'Quality electronics from DWstore.lk');
      const description = escapeXml(rawDesc.slice(0, 5000));
      const link = `${origin}/product/${encodeURIComponent(p.slug || p.id)}`;
      
      let image = (p.imageUrls && p.imageUrls[0]) || p.image || '/dwstoreicon_logo.png';
      if (!image.startsWith('http')) {
        image = `${origin}${image.startsWith('/') ? '' : '/'}${image}`;
      }
      const imageLink = escapeXml(image);

      const brand = escapeXml(p.brand || 'DWstore');
      const inStock = p.stockStatus === 'in_stock' || (typeof p.stockQuantity === 'number' ? p.stockQuantity > 0 : true);
      const availability = inStock ? 'in stock' : 'out of stock';

      const regPrice = (typeof p.regularPriceMinor === 'number' && p.regularPriceMinor > 0)
        ? (p.regularPriceMinor / 100).toFixed(2)
        : (typeof p.priceMinor === 'number' && p.priceMinor > 0)
        ? (p.priceMinor / 100).toFixed(2)
        : '0.00';

      const salePrice = (typeof p.salePriceMinor === 'number' && p.salePriceMinor > 0)
        ? (p.salePriceMinor / 100).toFixed(2)
        : null;

      xml += `    <item>
      <g:id>${id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${imageLink}</g:image_link>
      <g:brand>${brand}</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${regPrice} LKR</g:price>
${salePrice ? `      <g:sale_price>${salePrice} LKR</g:sale_price>\n` : ''}      <g:google_product_category>Electronics</g:google_product_category>
    </item>
`;
    }

    xml += `  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (err: any) {
    console.error('Error generating Facebook catalog feed:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
