import { Metadata } from 'next';
import brandsData from '@/data/brands.json';
import { readDataJson } from '@/lib/data-paths';
import { BrandClientView } from './BrandClientView';

interface PageProps {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://www.dwstore.lk';

function findBrand(slug: string) {
  const decoded = decodeURIComponent(slug).toLowerCase();
  const brands = readDataJson<any[]>('brands.json', brandsData as any[]);
  return brands.find(
    (b) => b.slug === decoded || b.slug === slug || b.id === decoded || b.name.toLowerCase() === decoded
  );
}

export async function generateStaticParams() {
  return (brandsData as any[]).map((b) => ({
    slug: b.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const brand = findBrand(params.slug);
  const brandName = brand?.name || params.slug.toUpperCase();

  const title = `Original ${brandName} Products in Sri Lanka | DWstore.lk`;
  const description = `Buy genuine ${brandName} smartphones, accessories & electronics at DWstore.lk. 100% original with company warranty. Island-wide cash on delivery. Best prices in Sri Lanka.`;
  const brandUrl = `${BASE_URL}/brand/${params.slug}`;

  const logoUrl = brand?.logo
    ? (brand.logo.startsWith('http') ? brand.logo : `${BASE_URL}${brand.logo.startsWith('/') ? '' : '/'}${brand.logo}`)
    : `${BASE_URL}/dwstoreicon_logo.png`;

  return {
    title,
    description,
    alternates: {
      canonical: brandUrl,
    },
    openGraph: {
      title,
      description,
      url: brandUrl,
      siteName: 'DWstore.lk',
      locale: 'en_LK',
      type: 'website',
      images: [
        {
          url: logoUrl,
          width: 600,
          height: 600,
          alt: `${brandName} Logo`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [logoUrl],
    },
  };
}

export default function BrandPage({ params }: PageProps) {
  const brand = findBrand(params.slug);
  const brandName = brand?.name || params.slug.toUpperCase();
  const brandUrl = `${BASE_URL}/brand/${params.slug}`;

  // Schema.org BreadcrumbList
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
        name: 'Brands',
        item: `${BASE_URL}/brands`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: brandName,
        item: brandUrl,
      },
    ],
  };

  // Schema.org Brand
  const brandSchema = {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: brandName,
    url: brandUrl,
    logo: brand?.logo
      ? (brand.logo.startsWith('http') ? brand.logo : `${BASE_URL}${brand.logo.startsWith('/') ? '' : '/'}${brand.logo}`)
      : `${BASE_URL}/dwstoreicon_logo.png`,
    description: `Original ${brandName} products and accessories available with Warranty at DWstore.lk in Sri Lanka.`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
      />
      <BrandClientView slug={params.slug} />
    </>
  );
}
