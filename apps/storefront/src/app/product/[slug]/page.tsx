import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import productsData from '@/data/products.json';
import { formatPriceLKR, isProductInStock } from '@/lib/catalog';
import { readDataJson } from '@/lib/data-paths';
import { ProductClientView } from './ProductClientView';

interface PageProps {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://www.dwstore.lk';

function findProduct(slug: string) {
  const decoded = decodeURIComponent(slug).trim();
  const products = readDataJson<any[]>('products.json', productsData as any[]);
  const cleanUrlSlug = decoded.replace(/-\d+$/, '');

  // 1. Direct match by exact slug, id, or clean slug
  const direct = products.find(
    (p) => {
      const pSlug = (p.slug || '').replace(/-\d+$/, '');
      return p.slug === decoded || pSlug === cleanUrlSlug || String(p.id) === decoded || String(p.id) === cleanUrlSlug;
    }
  );
  if (direct) {
    if (direct.slug) direct.slug = direct.slug.replace(/-\d+$/, '');
    return direct;
  }

  // 2. Backward compatibility: if URL has old trailing SKU/ID number (e.g. anker-soundcore-r60i-nc-true-wireless-anc-earbuds-33554)
  const fallback = products.find(
    (p) => {
      const pSlug = (p.slug || '').replace(/-\d+$/, '');
      return pSlug === cleanUrlSlug || String(p.id) === decoded.split('-').pop();
    }
  );
  if (fallback && fallback.slug) {
    fallback.slug = fallback.slug.replace(/-\d+$/, '');
  }
  return fallback;
}

function getAbsoluteImageUrl(imagePath?: string): string {
  if (!imagePath) return `${BASE_URL}/dwstoreicon_logo.png`;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${BASE_URL}${cleanPath}`;
}

export async function generateStaticParams() {
  return (productsData as any[]).map((p) => ({
    slug: p.slug || String(p.id),
  }));
}

function cleanProductName(name: string, brand?: string): string {
  let clean = (name || '').trim();
  // Remove repeated brand prefix at start (e.g. SONY SONY, SONYSONY, AnkerAnker, Anker Anker)
  if (brand && brand.trim()) {
    const b = brand.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const doubleBrandRegex = new RegExp(`^(${b})\\s*\\1\\b`, 'i');
    clean = clean.replace(doubleBrandRegex, '$1');
  }
  clean = clean.replace(/^([A-Za-z0-9]+)\1\b/i, '$1');
  return clean.trim();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = findProduct(params.slug);

  if (!product) {
    return {
      title: 'Product Not Found | DWstore.lk',
      description: 'The requested product is not available. Browse our wide range of electronics and accessories at DWstore.lk.',
    };
  }

  const priceMinor = product.salePriceMinor || product.minPriceMinor || product.regularPriceMinor || 0;
  const formattedPrice = priceMinor > 0 ? `LKR ${formatPriceLKR(priceMinor)}` : '';
  const cleanName = cleanProductName(product.name, product.brand);

  // 1. Title: Guarantee target keyword "Price in Sri Lanka | DW Store"
  let title = '';
  if (product.seoTitle && product.seoTitle.trim()) {
    const custom = cleanProductName(product.seoTitle.trim(), product.brand);
    if (custom.toLowerCase().includes('price in sri lanka')) {
      title = custom;
    } else {
      title = `${custom}${formattedPrice ? ` - ${formattedPrice}` : ''} | Price in Sri Lanka | DW Store`;
    }
  } else {
    title = `${cleanName}${formattedPrice ? ` - ${formattedPrice}` : ''} | Price in Sri Lanka | DW Store`;
  }

  // 2. Description: User custom SEO Description from Admin OR Auto-generated
  let description = '';
  if (product.seoDescription && product.seoDescription.trim()) {
    description = product.seoDescription.trim();
  } else {
    const rawClean = (product.shortDescription || product.description || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\\r\\n|\\n|\/n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const cleanSnippet = rawClean.length > 20 ? rawClean.slice(0, 120) : '';

    description = `Buy original ${cleanName} at best price in Sri Lanka. ${
      formattedPrice ? `Price: ${formattedPrice}. ` : ''
    }${cleanSnippet ? `${cleanSnippet}... ` : ''}100% Genuine with Warranty, Koko & Payzy 3-month installments & Island-wide Cash on Delivery. Order now at DWstore.lk!`;
  }

  const ogImage = getAbsoluteImageUrl(product.displayImage || product.imageUrls?.[0]);
  const productUrl = `${BASE_URL}/product/${product.slug || product.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title,
      description,
      url: productUrl,
      siteName: 'DWstore.lk',
      locale: 'en_LK',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function ProductPage({ params }: PageProps) {
  const product = findProduct(params.slug);

  if (!product) {
    return <ProductClientView slug={params.slug} />;
  }

  // If visitor navigated using an old SKU-suffixed link (e.g. ...-33554), redirect to the clean SEO URL
  const decodedParam = decodeURIComponent(params.slug).trim();
  const cleanCanonicalSlug = (product.slug || '').replace(/-\d+$/, '');
  if (cleanCanonicalSlug && (decodedParam !== cleanCanonicalSlug || /-\d+$/.test(decodedParam))) {
    redirect(`/product/${cleanCanonicalSlug}`);
  }

  const priceMinor = product.salePriceMinor || product.minPriceMinor || product.regularPriceMinor || 0;
  const inStock = isProductInStock(product);
  const primaryImage = getAbsoluteImageUrl(product.displayImage || product.imageUrls?.[0]);
  const productUrl = `${BASE_URL}/product/${product.slug || product.id}`;

  const cleanDesc = (product.shortDescription || product.description || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300) || `${product.name} available at DWstore.lk with Island-wide Cash on Delivery in Sri Lanka.`;

  // Schema.org Product Rich Snippet (Shows stars, price & stock in Google Search)
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [primaryImage],
    description: cleanDesc,
    sku: product.sku || `WC-${product.id}`,
    mpn: product.sku || `DW-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: product.brand && product.brand.trim() ? product.brand : 'DWstore',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'LKR',
      price: priceMinor > 0 ? (priceMinor / 100).toFixed(2) : '0.00',
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'DWstore.lk',
        url: BASE_URL,
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '15',
      bestRating: '5',
      worstRating: '1',
    },
  };

  // Schema.org BreadcrumbList (Shows structured breadcrumb in Google Search)
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: `${BASE_URL}/shop`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductClientView slug={params.slug} initialProduct={product} />
    </>
  );
}
