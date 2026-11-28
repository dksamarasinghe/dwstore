import { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import categoriesData from '@/data/categories.json';
import { readDataJson } from '@/lib/data-paths';
import { CategoryClientView } from './CategoryClientView';

interface PageProps {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://www.dwstore.lk';

const CATEGORY_REDIRECTS: Record<string, string> = {
  'bluetooth-handfree': 'bluetooth-handsfree',
  'temperd-glass': 'tempered-glass',
};

function findCategory(slug: string) {
  const decoded = decodeURIComponent(slug).toLowerCase();
  const targetSlug = CATEGORY_REDIRECTS[decoded] || decoded;
  const categories = readDataJson<any[]>('categories.json', categoriesData as any[]);
  return categories.find(
    (c) => c.slug === targetSlug || c.slug === decoded || c.id === targetSlug || c.id === decoded
  );
}

export async function generateStaticParams() {
  return (categoriesData as any[]).map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const rawSlug = decodeURIComponent(params.slug).toLowerCase();
  const cleanSlug = CATEGORY_REDIRECTS[rawSlug] || rawSlug;
  const category = findCategory(cleanSlug);
  const categoryName = category?.name || cleanSlug.replace(/-/g, ' ');
  const capitalizedName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  const title = `Buy ${capitalizedName} Online at Best Price in Sri Lanka | DWstore.lk`;
  const description = `Shop original ${capitalizedName} at DWstore.lk. Island-wide cash on delivery, manufacturer warranty, and lowest prices in Sri Lanka. Fast delivery to your doorstep!`;
  const categoryUrl = `${BASE_URL}/category/${cleanSlug}`;

  const imageUrl = category?.imageUrl
    ? (category.imageUrl.startsWith('http') ? category.imageUrl : `${BASE_URL}${category.imageUrl.startsWith('/') ? '' : '/'}${category.imageUrl}`)
    : `${BASE_URL}/dwstoreicon_logo.png`;

  return {
    title,
    description,
    alternates: {
      canonical: categoryUrl,
    },
    openGraph: {
      title,
      description,
      url: categoryUrl,
      siteName: 'DWstore.lk',
      locale: 'en_LK',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: capitalizedName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function CategoryPage({ params }: PageProps) {
  const rawSlug = decodeURIComponent(params.slug).toLowerCase();
  if (CATEGORY_REDIRECTS[rawSlug]) {
    permanentRedirect(`/category/${CATEGORY_REDIRECTS[rawSlug]}`);
  }

  const category = findCategory(params.slug);
  const categoryName = category?.name || params.slug.replace(/-/g, ' ');
  const capitalizedName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  const categoryUrl = `${BASE_URL}/category/${params.slug}`;

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
        name: 'Shop',
        item: `${BASE_URL}/shop`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: capitalizedName,
        item: categoryUrl,
      },
    ],
  };

  // Schema.org CollectionPage
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${capitalizedName} Collection - DWstore.lk`,
    url: categoryUrl,
    description: `Browse all genuine ${capitalizedName} available at DWstore.lk with Island-wide Cash on Delivery in Sri Lanka.`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <CategoryClientView slug={params.slug} />
    </>
  );
}
