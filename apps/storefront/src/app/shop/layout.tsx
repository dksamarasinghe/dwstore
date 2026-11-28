import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Electronics, Mobile Accessories & CCTV Cameras | DW Store Sri Lanka',
  description: 'Shop 400+ original electronic gadgets, wireless earbuds, smartwatches, power banks, chargers and CCTV cameras at DW Store. Island-wide Cash on Delivery & Koko installments.',
  alternates: {
    canonical: 'https://www.dwstore.lk/shop',
  },
  openGraph: {
    title: 'All Electronics, Mobile Accessories & CCTV Cameras | DW Store Sri Lanka',
    description: 'Shop 400+ original electronic gadgets with warranty & island-wide COD in Sri Lanka.',
    url: 'https://www.dwstore.lk/shop',
    siteName: 'DW Store Sri Lanka',
    type: 'website',
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
