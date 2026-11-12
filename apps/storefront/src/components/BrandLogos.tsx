'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { resolveImageUrl } from '@/lib/image';

export interface BrandDisplayItem {
  id?: string;
  name: string;
  slug: string;
  logo?: string;
  featured?: boolean;
}

const FALLBACK_BRANDS: BrandDisplayItem[] = [
  { name: 'Apple', slug: 'apple', logo: '/media/brands/apple-logo.svg', featured: true },
  { name: 'JBL', slug: 'jbl', logo: '/media/brands/jbl-logo.svg', featured: true },
  { name: 'Xiaomi', slug: 'xiaomi', logo: '/media/brands/mi-logo.svg', featured: true },
  { name: 'Sony', slug: 'sony', logo: '/media/brands/sony-logo.svg', featured: true },
  { name: 'Anker', slug: 'anker', logo: '/media/brands/anker-logo.svg', featured: true },
  { name: 'Baseus', slug: 'baseus', logo: '/media/brands/baseus-logo.svg', featured: true },
  { name: 'Remax', slug: 'remax', logo: '/media/brands/remax-logo.svg', featured: true },
  { name: 'Joyroom', slug: 'joyroom', logo: '/media/brands/joyroom-logo.svg', featured: true },
  { name: 'Lenovo', slug: 'lenovo', logo: '/media/brands/lenovo-logo.svg', featured: true },
  { name: 'SanDisk', slug: 'sandisk', logo: '/media/brands/sandisk-logo.svg', featured: true },
  { name: 'UGREEN', slug: 'ugreen', logo: '/media/brands/ugreen-logo.svg', featured: true },
  { name: 'Hikvision', slug: 'hikvision', logo: '/media/brands/hikvision-logo.svg', featured: true },
  { name: 'LDNIO', slug: 'ldnio', logo: '/media/brands/ldnio-logo.svg', featured: true },
  { name: 'Aspor', slug: 'aspor', logo: '/media/brands/aspor-logo.svg', featured: true },
];

interface BrandLogosProps {
  initialConfig?: {
    enabled?: boolean;
    selectedBrands?: BrandDisplayItem[];
  };
  brandsData?: BrandDisplayItem[];
}

export default function BrandLogos({ initialConfig, brandsData }: BrandLogosProps) {
  const [brands, setBrands] = useState<BrandDisplayItem[]>(() => {
    if (Array.isArray(brandsData) && brandsData.length > 0) {
      const filtered = brandsData.filter((b) => Boolean(b.logo && b.logo.trim() && b.featured !== false));
      if (filtered.length > 0) return filtered;
    }
    if (initialConfig?.selectedBrands && initialConfig.selectedBrands.length > 0) {
      const filtered = initialConfig.selectedBrands.filter((b) => Boolean(b.logo && b.logo.trim()));
      if (filtered.length > 0) return filtered;
    }
    return FALLBACK_BRANDS;
  });

  const isEnabled = initialConfig?.enabled !== false;

  useEffect(() => {
    // Fetch live brands from /api/brands with cache busting
    const fetchBrands = async () => {
      try {
        const res = await fetch('/api/brands?t=' + Date.now(), { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.brands) && data.brands.length > 0) {
            // Filter brands that have a valid logo and featured !== false
            const withLogos = data.brands.filter(
              (b: any) => Boolean(b.logo && typeof b.logo === 'string' && b.logo.trim()) && b.featured !== false
            );
            if (withLogos.length > 0) {
              setBrands(withLogos);
              return;
            }
          }
        }
      } catch {}

      // Fallback: check /api/homepage
      try {
        const res = await fetch('/api/homepage?t=' + Date.now(), { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data?.config?.brandsBar?.selectedBrands?.length > 0) {
            const list = data.config.brandsBar.selectedBrands.filter(
              (b: any) => Boolean(b.logo && typeof b.logo === 'string' && b.logo.trim())
            );
            if (list.length > 0) {
              setBrands(list);
              return;
            }
          }
        }
      } catch {}
    };

    fetchBrands();
    const interval = setInterval(fetchBrands, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isEnabled || brands.length === 0) return null;

  // Duplicate items 4x to ensure smooth continuous marquee loop across all screen sizes
  const loopList = [...brands, ...brands, ...brands, ...brands];

  return (
    <section className="w-full bg-slate-50/70 py-6 sm:py-8 border-y border-slate-100/90 overflow-hidden relative">
      {/* Edge gradient fades for seamless floating look */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-slate-50 via-slate-50/90 to-transparent z-10" />

      {/* Marquee Animation Styles */}
      <style jsx>{`
        @keyframes brandMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: brandMarquee 42s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Continuous Auto-Slide Marquee Track (Logo Only, No Name Text) */}
      <div className="marquee-track flex items-center">
        {loopList.map((brand, idx) => (
          <Link
            key={`${brand.slug || brand.name}-${idx}`}
            href={`/brand/${brand.slug || brand.name.toLowerCase()}`}
            title={`View ${brand.name} official products`}
            className="w-32 h-18 sm:w-40 sm:h-22 bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-blue-500 hover:-translate-y-0.5 flex items-center justify-center p-3 sm:p-4 transition-all duration-300 flex-shrink-0 group mx-2 sm:mx-2.5 cursor-pointer"
          >
            <img
              src={resolveImageUrl(brand.logo)}
              alt={brand.name}
              className="max-h-9 sm:max-h-11 max-w-[85%] object-contain opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
              onError={(e) => {
                const target = e.target as HTMLElement;
                const link = target.closest('a');
                if (link) link.style.display = 'none';
              }}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
