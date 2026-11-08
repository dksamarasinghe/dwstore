'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export interface BrandDisplayItem {
  id?: string;
  name: string;
  slug: string;
  tag?: string;
  description?: string;
  logo?: string;
  featured?: boolean;
}

const DEFAULT_BRANDS: BrandDisplayItem[] = [
  { name: 'Anker', slug: 'anker', tag: 'Sound & Power', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Anker_logo.svg/512px-Anker_logo.svg.png' },
  { name: 'Baseus', slug: 'baseus', tag: 'Charging & Audio', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Baseus_logo.svg/512px-Baseus_logo.svg.png' },
  { name: 'JBL', slug: 'jbl', tag: 'Signature Sound', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/JBL_logo.svg/512px-JBL_logo.svg.png' },
  { name: 'Remax', slug: 'remax', tag: 'Life Accessories', logo: 'https://seeklogo.com/images/R/remax-logo-F91A8CF3BA-seeklogo.com.png' },
  { name: 'Joyroom', slug: 'joyroom', tag: 'Fast Charging', logo: 'https://cdn.worldvectorlogo.com/logos/joyroom.svg' },
  { name: 'Lenovo', slug: 'lenovo', tag: 'Audio & Tech', logo: '/media/brands/lenovo-logo.svg' },
  { name: 'SONY', slug: 'sony', tag: 'Audio & Imaging', logo: '/media/brands/sony-logo.svg' },
  { name: 'SAMSUNG', slug: 'samsung', tag: 'Original Accessories', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/512px-Samsung_Logo.svg.png' },
  { name: 'SanDisk', slug: 'sandisk', tag: 'Storage & Flash', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/SanDisk_Logo.svg/512px-SanDisk_Logo.svg.png' },
  { name: 'UGREEN', slug: 'ugreen', tag: 'Adapters & Hubs', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/UGREEN_logo.svg/512px-UGREEN_logo.svg.png' },
  { name: 'Hikvision', slug: 'hikvision', tag: 'Security & Cam', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Hikvision_logo.svg/512px-Hikvision_logo.svg.png' },
  { name: 'Aspor', slug: 'aspor', tag: 'Power Banks', logo: 'https://aspor.com.pk/wp-content/uploads/2021/04/aspor-logo.png' },
];

interface BrandLogosProps {
  initialConfig?: {
    enabled?: boolean;
    selectedBrands?: BrandDisplayItem[];
  };
}

export default function BrandLogos({ initialConfig }: BrandLogosProps) {
  const [brands, setBrands] = useState<BrandDisplayItem[]>(() => {
    if (initialConfig?.selectedBrands && initialConfig.selectedBrands.length > 0) {
      return initialConfig.selectedBrands;
    }
    return DEFAULT_BRANDS;
  });

  const isEnabled = initialConfig?.enabled !== false;

  useEffect(() => {
    if (initialConfig?.selectedBrands && initialConfig.selectedBrands.length > 0) {
      setBrands(initialConfig.selectedBrands);
      return;
    }

    // Fallback sync with API or localStorage
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/homepage?t=' + Date.now(), { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data?.config?.brandsBar?.selectedBrands?.length > 0) {
            setBrands(data.config.brandsBar.selectedBrands);
            return;
          }
        }
      } catch {}

      try {
        const saved = localStorage.getItem('dwstore_homepage_config');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.brandsBar?.selectedBrands?.length > 0) {
            setBrands(parsed.brandsBar.selectedBrands);
          }
        }
      } catch {}
    };

    fetchConfig();
  }, [initialConfig]);

  if (!isEnabled) return null;

  return (
    <section className="w-full bg-white border-y border-slate-100">
      <div className="page-container py-3 flex items-center gap-8 overflow-x-auto no-scrollbar">
        {brands.map((brand) => (
          <Link
            key={brand.slug || brand.name}
            href={`/brand/${brand.slug}`}
            className="flex items-center gap-2.5 flex-shrink-0 px-2 py-1.5 rounded-lg group opacity-85 hover:opacity-100 transition-all hover:bg-slate-50"
          >
            {brand.logo ? (
              <div className="w-8 h-8 flex items-center justify-center bg-white rounded border border-slate-200 p-1 flex-shrink-0 shadow-2xs group-hover:border-blue-300 transition">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            ) : null}

            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-wider text-slate-800 uppercase group-hover:text-blue-600 transition whitespace-nowrap">
                {brand.name}
              </span>
              {(brand.tag || brand.description) && (
                <span className="text-[10px] text-slate-400 font-medium group-hover:text-blue-500 transition whitespace-nowrap">
                  {brand.tag || brand.description}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
