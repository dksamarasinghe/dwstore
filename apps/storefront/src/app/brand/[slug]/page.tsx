import { Metadata } from 'next';
import brandsData from '@/data/brands.json';
import { readDataJson } from '@/lib/data-paths';
import { BrandClientView } from './BrandClientView';

interface PageProps {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://www.dwstore.lk';

const BRAND_SEO_MAP: Record<string, { title: string; description: string; h1: string }> = {
  sony: {
    title: 'Authorized Sony Reseller in Sri Lanka | Original Sony Audio & Speakers | DW Store',
    description: 'Shop genuine Sony headphones, wireless party speakers, soundbars, and earbuds in Sri Lanka. Authorized reseller with official warranty, Koko & Payzy installments and island-wide Cash on Delivery.',
    h1: 'Authorized Sony Reseller in Sri Lanka — Audio, Speakers & Headphones',
  },
  anker: {
    title: 'Original Anker Products in Sri Lanka | Soundcore Earbuds, Chargers & Power Banks | DW Store',
    description: 'Buy 100% genuine Anker products in Sri Lanka. Soundcore noise-cancelling earbuds, GaN fast chargers, and power banks with company warranty, Koko installments and fast delivery.',
    h1: 'Original Anker Products in Sri Lanka — Soundcore & Chargers',
  },
  ezviz: {
    title: 'Original EZVIZ Security Cameras in Sri Lanka | WiFi & 4G CCTV | DW Store',
    description: 'Buy genuine EZVIZ smart WiFi and 4G security cameras in Sri Lanka. Pan & tilt 2K/3K cameras, night vision, mobile app setup with warranty and island-wide COD.',
    h1: 'Original EZVIZ Smart Security Cameras in Sri Lanka',
  },
  hikvision: {
    title: 'Original Hikvision CCTV & Security Systems in Sri Lanka | DW Store',
    description: 'Buy authentic Hikvision CCTV security cameras and surveillance systems in Sri Lanka. Official warranty, technical support, Koko installments and island-wide delivery.',
    h1: 'Hikvision CCTV & Surveillance Solutions in Sri Lanka',
  },
  baseus: {
    title: 'Original Baseus Sri Lanka | Fast Chargers, Cables & Phone Accessories | DW Store',
    description: 'Shop genuine Baseus chargers, cables, car accessories, and earphones in Sri Lanka with company warranty, Payzy & Koko installments, and islandwide delivery.',
    h1: 'Original Baseus Sri Lanka — Fast Chargers & Accessories',
  },
  jbl: {
    title: 'Original JBL Speakers & Headphones Price in Sri Lanka | DW Store',
    description: 'Buy original JBL portable Bluetooth speakers, party speakers, and headphones in Sri Lanka with official warranty, Koko installments and islandwide delivery.',
    h1: 'Original JBL Speakers & Headphones in Sri Lanka',
  },
  aspor: {
    title: 'Original Aspor Power Banks & Accessories in Sri Lanka | DW Store',
    description: 'Buy genuine Aspor fast charging power banks, cables and mobile accessories in Sri Lanka with replacement warranty and islandwide COD.',
    h1: 'Original Aspor Power Banks & Mobile Accessories in Sri Lanka',
  },
};

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
  const rawSlug = decodeURIComponent(params.slug).toLowerCase();
  const brand = findBrand(params.slug);
  const brandName = brand?.name || params.slug.toUpperCase();
  const customSeo = BRAND_SEO_MAP[rawSlug];

  const title = customSeo?.title || `Original ${brandName} Products in Sri Lanka | Best Price | DW Store`;
  const description = customSeo?.description || `Buy genuine ${brandName} devices, accessories & electronics at DWstore.lk. 100% original with company warranty, Koko & Payzy installments, and island-wide Cash on Delivery.`;
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
