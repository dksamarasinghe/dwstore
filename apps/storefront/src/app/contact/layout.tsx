import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pannipitiya Flagship Electronics Store & Contact | DW Store Sri Lanka',
  description: 'Visit DW Store at No. 55/1/2, Borella Road, Pannipitiya. Easily accessible from Maharagama, Kottawa, Homagama & Thalawathugoda. Call +94 75 669 3358 or shop online with islandwide COD.',
  alternates: {
    canonical: 'https://www.dwstore.lk/contact',
  },
  openGraph: {
    title: 'Pannipitiya Flagship Electronics Store & Contact | DW Store Sri Lanka',
    description: 'Visit our flagship showroom on Borella Road, Pannipitiya. Genuine electronics, warranty support, and in-store testing.',
    url: 'https://www.dwstore.lk/contact',
    siteName: 'DW Store Sri Lanka',
    type: 'website',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
