'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Watch, Headphones, BatteryCharging, Speaker, Shield, Cable, Laptop, Smartphone } from 'lucide-react';
import categoriesData from '@/data/categories.json';
import { resolveImageUrl } from '@/lib/image';

// Curated top categories with appropriate icons & images
const CATEGORY_ICONS: Record<string, any> = {
  'smartwatches': Watch,
  'bluetooth-handfree': Headphones,
  'headphone-and-headset': Headphones,
  'power-banks': BatteryCharging,
  'bluetooth-speakers': Speaker,
  'temperd-glass': Shield,
  'cable-and-adaptors': Cable,
  'wall-chargers': BatteryCharging,
  'phone-holders': Smartphone,
  'security-camera-and-accessories': Shield,
  'computer-accessories': Laptop,
  'storage': Laptop,
};

interface CategoryCirclesProps {
  initialConfig?: {
    enabled?: boolean;
    title?: string;
    subtitle?: string;
    selectedCategorySlugs?: string[];
  };
}

export default function CategoryCircles({ initialConfig }: CategoryCirclesProps) {
  const [config, setConfig] = useState(initialConfig);
  const [categoriesList, setCategoriesList] = useState<any[]>(categoriesData);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll every 5000ms
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const el = scrollContainerRef.current;
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft >= maxScroll - 15) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: 300, behavior: 'smooth' });
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    // 1. Fetch categories from live API
    fetch('/api/categories?t=' + Date.now(), { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.categories) && data.categories.length > 0) {
          setCategoriesList(data.categories);
        }
      })
      .catch(() => {});

    if (initialConfig) {
      setConfig(initialConfig);
      return;
    }

    // 2. Fetch homepage config from API if not provided via props
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/homepage?t=' + Date.now(), { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data?.config?.shopByCategories) {
            setConfig(data.config.shopByCategories);
          }
        }
      } catch {}
    };

    fetchConfig();
  }, [initialConfig]);

  if (config?.enabled === false) return null;

  // Selected categories in order
  const selectedSlugs = config?.selectedCategorySlugs || [];
  let displayCategories: any[] = [];

  if (selectedSlugs.length > 0) {
    // Map slugs in the exact order specified by the admin
    displayCategories = selectedSlugs
      .map((slug) => categoriesList.find((c: any) => c.slug === slug || c.id === slug))
      .filter(Boolean);
  }

  // Fallback to top 8 leaf categories if none selected
  if (displayCategories.length === 0) {
    displayCategories = categoriesList
      .filter((c: any) => c.productCount > 0)
      .sort((a: any, b: any) => b.productCount - a.productCount)
      .slice(0, 8);
  }

  const title = config?.title || 'Shop by Categories';
  const subtitle = config?.subtitle || 'Explore authentic imported tech products with official warranty';

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full bg-white py-8">
      <div className="page-container">
        {/* Title Row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {title.includes('Categories') ? (
                <>
                  {title.replace('Categories', '').trim()}{' '}
                  <span className="text-blue-600">Categories</span>
                </>
              ) : (
                title
              )}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Carousel / Grid */}
        <div
          ref={scrollContainerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2"
        >
          {displayCategories.map((cat: any) => {
            const Icon = CATEGORY_ICONS[cat.slug] || Smartphone;
            const rawImg = cat.imageUrl || cat.image || (typeof cat.icon === 'string' && (cat.icon.startsWith('/') || cat.icon.startsWith('http')) ? cat.icon : null);
            const imgSrc = rawImg ? resolveImageUrl(rawImg) : null;

            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group flex flex-col items-center text-center p-3 rounded-2xl bg-white hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md flex-shrink-0 w-32 sm:w-36 md:w-40"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-50 border-2 border-slate-100 group-hover:border-blue-500 overflow-hidden p-2 flex items-center justify-center transition duration-300 group-hover:scale-105 shadow-sm">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={cat.name}
                      className="w-full h-full object-contain mix-blend-multiply"
                      onError={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.cat-fallback-icon')) {
                          const icon = document.createElement('div');
                          icon.className = 'cat-fallback-icon text-blue-600';
                          icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>';
                          parent.appendChild(icon);
                        }
                      }}
                    />
                  ) : (
                    <Icon className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                <span className="text-xs font-bold text-slate-800 mt-2 group-hover:text-blue-600 transition line-clamp-2 leading-tight">
                  {cat.name}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                  {cat.productCount} Items
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
