'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export interface BrandDisplayItem {
  id?: string;
  name: string;
  slug: string;
  logo?: string;
  featured?: boolean;
}

const FALLBACK_BRANDS: BrandDisplayItem[] = [
  { name: 'Apple', slug: 'apple', logo: '/media/brands/apple-logo.svg', featured: true },
  { name: 'JBL', slug: 'jbl', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/JBL_logo.svg/512px-JBL_logo.svg.png', featured: true },
  { name: 'Xiaomi', slug: 'xiaomi', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Xiaomi_logo_%282021-%29.svg/512px-Xiaomi_logo_%282021-%29.svg.png', featured: true },
  { name: 'Sony', slug: 'sony', logo: '/media/brands/sony-logo.svg', featured: true },
  { name: 'Anker', slug: 'anker', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Anker_logo.svg/512px-Anker_logo.svg.png', featured: true },
  { name: 'Baseus', slug: 'baseus', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Baseus_logo.svg/512px-Baseus_logo.svg.png', featured: true },
  { name: 'Remax', slug: 'remax', logo: 'https://seeklogo.com/images/R/remax-logo-F91A8CF3BA-seeklogo.com.png', featured: true },
  { name: 'Joyroom', slug: 'joyroom', logo: 'https://cdn.worldvectorlogo.com/logos/joyroom.svg', featured: true },
  { name: 'Lenovo', slug: 'lenovo', logo: '/media/brands/lenovo-logo.svg', featured: true },
  { name: 'Samsung', slug: 'samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/512px-Samsung_Logo.svg.png', featured: true },
  { name: 'SanDisk', slug: 'sandisk', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/SanDisk_Logo.svg/512px-SanDisk_Logo.svg.png', featured: true },
  { name: 'UGREEN', slug: 'ugreen', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/UGREEN_logo.svg/512px-UGREEN_logo.svg.png', featured: true },
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
      const filtered = initialConfig.selectedBrands.filter((b) => Boolean(b.logo));
      if (filtered.length > 0) return filtered;
    }
    return FALLBACK_BRANDS;
  });

  const isEnabled = initialConfig?.enabled !== false;

  useEffect(() => {
    // 1. Fetch live brands from /api/brands
    const fetchBrands = async () => {
      try {
        const res = await fetch('/api/brands?t=' + Date.now(), { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.brands) && data.brands.length > 0) {
            // Filter brands that have a logo and are marked featured (or default featured !== false)
            const withLogos = data.brands.filter(
              (b: any) => Boolean(b.logo) && b.featured !== false
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
            const list = data.config.brandsBar.selectedBrands.filter((b: any) => Boolean(b.logo));
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

  // Duplicate items 3x to ensure uninterrupted infinite marquee loop
  const loopList = [...brands, ...brands, ...brands];

  return (
    <section className="w-full bg-slate-50/60 py-6 sm:py-8 border-y border-slate-100 overflow-hidden relative">
      {/* Edge gradient fades for seamless appearance */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

      {/* Marquee Animation Styles */}
      <style jsx>{`
        @keyframes brandMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333333%);
          }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: brandMarquee 38s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Continuous Auto-Slide Marquee Track */}
      <div className="marquee-track flex items-center">
        {loopList.map((brand, idx) => (
          <Link
            key={`${brand.slug || brand.name}-${idx}`}
            href={`/brand/${brand.slug || brand.name.toLowerCase()}`}
            title={`View ${brand.name} official products`}
            className="w-32 h-20 sm:w-44 sm:h-26 bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-blue-400 hover:-translate-y-0.5 flex items-center justify-center p-3 sm:p-4 transition-all duration-300 flex-shrink-0 group mx-2 sm:mx-3 cursor-pointer"
          >
            {brand.logo ? (
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-h-10 sm:max-h-12 max-w-[85%] object-contain opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-sm font-bold text-slate-700 tracking-wider uppercase group-hover:text-blue-600">
                {brand.name}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
