'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { resolveImageUrl } from '@/lib/image';

interface PromoBannerSliderProps {
  initialConfig?: any;
}

export default function PromoBannerSlider({ initialConfig }: PromoBannerSliderProps) {
  const [promoConfig, setPromoConfig] = useState<any>(initialConfig ?? null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Keep state synchronized with prop updates
  useEffect(() => {
    if (initialConfig !== undefined) {
      setPromoConfig(initialConfig);
    }
  }, [initialConfig]);

  // Sync with live server API and keep updated automatically without hard refresh
  useEffect(() => {
    // Purge any stale legacy localStorage on storefront port 3000
    try {
      localStorage.removeItem('dwstore_homepage_config');
    } catch {}

    const syncWithServer = () => {
      fetch('/api/homepage?t=' + Date.now(), { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.config) {
            setPromoConfig(data.config.promoBanners ?? null);
          }
        })
        .catch(() => {});
    };

    syncWithServer();
    const timer = setInterval(syncWithServer, 3000);
    return () => clearInterval(timer);
  }, []);

  // Auto-slide effect every 4.5 seconds
  useEffect(() => {
    const banners = (promoConfig?.banners || []).filter((b: any) => b.active !== false);
    if (banners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [promoConfig, isPaused]);

  // Strict check: if not enabled or explicitly disabled, do NOT render
  if (!promoConfig || promoConfig.enabled !== true) {
    return null;
  }

  const activeBanners = (promoConfig.banners || []).filter((b: any) => b.active !== false);
  if (activeBanners.length === 0) {
    return null;
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  return (
    <section 
      className="w-full bg-white py-4 sm:py-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="page-container px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 group">
          {/* Banner container with 1400x360 (~3.88:1) aspect ratio */}
          <Link
            href={currentBanner.link || '/shop'}
            className="block relative w-full aspect-[21/9] sm:aspect-[16/5] md:aspect-[28/7] max-h-[380px] bg-slate-900 overflow-hidden"
          >
            <img
              src={resolveImageUrl(currentBanner.image, 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&auto=format&fit=crop&q=80')}
              alt={currentBanner.title || 'Promotional Banner'}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src =
                  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&auto=format&fit=crop&q=80';
              }}
            />

            {/* Subtle bottom gradient & overlay for text if title exists */}
            {currentBanner.title && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4 sm:p-8">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-600/90 text-white text-[10px] sm:text-xs font-bold w-fit mb-2 shadow-xs">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  Special Announcement
                </div>
                <h2 className="text-white text-lg sm:text-2xl md:text-3xl font-black drop-shadow-md line-clamp-2 max-w-2xl">
                  {currentBanner.title}
                </h2>
              </div>
            )}
          </Link>

          {/* Left / Right Nav Arrows (only if > 1 banner) */}
          {activeBanners.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Banner"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-sm opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Banner"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-sm opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Dots Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-xs">
                {activeBanners.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
