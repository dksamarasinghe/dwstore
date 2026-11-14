'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, ShoppingCart, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import productsData from '@/data/products.json';
import initialHomepageData from '@/data/homepage.json';
import { formatPriceLKR, isProductInStock } from '@/lib/catalog';
import { useWishlist } from '@/context/WishlistContext';
import { resolveImageUrl } from '@/lib/image';

interface FindFavoriteProductsProps {
  initialConfig?: any;
}

export default function FindFavoriteProducts({ initialConfig }: FindFavoriteProductsProps) {
  const [config, setConfig] = useState<any>(initialConfig ?? (initialHomepageData as any).certifiedSpotlight);
  const [allProducts, setAllProducts] = useState<any[]>(() => productsData as any[]);
  const [isPaused, setIsPaused] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Sync config from prop or API
  useEffect(() => {
    if (initialConfig !== undefined) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  useEffect(() => {
    fetch('/api/homepage?t=' + Date.now(), { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.config?.certifiedSpotlight) {
          setConfig(data.config.certifiedSpotlight);
        }
      })
      .catch(() => {});

    fetch('/api/products?t=' + Date.now(), { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAllProducts(data);
        }
      })
      .catch(() => {});
  }, []);

  // Auto-scroll every 5000ms
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const el = sliderRef.current;
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft >= maxScroll - 15) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: 340, behavior: 'smooth' });
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Resolve products from admin configuration
  const featuredList = useMemo(() => {
    const prodMap = new Map(allProducts.map((p) => [String(p.id), p]));
    const configuredIds = config?.productIds || [];

    if (Array.isArray(configuredIds) && configuredIds.length > 0) {
      const resolved = configuredIds.map((id: string) => prodMap.get(String(id))).filter(Boolean);
      if (resolved.length > 0) return resolved;
    }

    // Default fallback: Top trending genuine items
    const smartWatchProducts = allProducts.filter((p) => p.categorySlugs?.includes('smartwatches'));
    const audioProducts = allProducts.filter((p) => p.categorySlugs?.includes('bluetooth-handfree') || p.categorySlugs?.includes('headphone-and-headset'));
    const chargerProducts = allProducts.filter((p) => p.categorySlugs?.includes('power-banks') || p.categorySlugs?.includes('cable-and-adaptors'));

    return [
      smartWatchProducts[0] || allProducts[0],
      audioProducts[0] || allProducts[1],
      chargerProducts[0] || allProducts[2],
    ].filter(Boolean);
  }, [allProducts, config]);

  if (config?.enabled === false) return null;

  return (
    <section className="w-full bg-slate-50/60 py-10 border-t border-slate-100">
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {config?.title ? (
                <span>{config.title}</span>
              ) : (
                <>
                  DWstore Certified <span className="text-blue-600">Spotlight</span>
                </>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {config?.subtitle || 'Top trending genuine electronic picks with island-wide Cash on Delivery'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl px-4 py-2 hover:bg-slate-50 hover:border-blue-500 transition shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>Browse Full Catalog</span>
            </Link>

            {/* Slider Navigation Arrows */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                onClick={() => scroll('left')}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition shadow-2xs cursor-pointer"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition shadow-2xs cursor-pointer"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Auto-sliding horizontal cards row */}
        <div
          ref={sliderRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-3"
        >
          {featuredList.map((item: any) => {
            const price = item.salePriceMinor || item.minPriceMinor || item.regularPriceMinor || 0;
            const regPrice = item.regularPriceMinor && item.regularPriceMinor > price ? item.regularPriceMinor : null;
            const isVariable = item.type === 'variable' || (item.variations && item.variations.length > 0);
            const inStock = isProductInStock(item);

            return (
              <div
                key={item.id}
                className="w-[280px] sm:w-[320px] md:w-[350px] lg:w-[380px] flex-shrink-0 bg-white rounded-2xl border border-slate-200/90 p-5 hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                      {item.brand || 'ORIGINAL'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(item.id);
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${
                        isInWishlist(item.id)
                          ? 'bg-rose-50 text-rose-500 border border-rose-200 shadow-xs'
                          : 'bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500'
                      }`}
                      aria-label="Wishlist"
                      title={isInWishlist(item.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(item.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>

                  <Link
                    href={`/product/${item.slug}`}
                    className="w-full aspect-[4/3] bg-slate-50 rounded-xl p-4 flex items-center justify-center mb-4 overflow-hidden group-hover:bg-blue-50/20 transition"
                  >
                    <img
                      src={resolveImageUrl(item.displayImage || item.image)}
                      alt={item.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/media/products/T800-Ultra-Smart-Watch-1_d7ac6b08.jpg';
                      }}
                    />
                  </Link>

                  {/* Stock Status Badge & Rating */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-slate-800">5.0</span>
                    </div>
                    {inStock ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        In Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/product/${item.slug}`}
                    className="text-sm font-bold text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-snug transition block"
                  >
                    {item.name}
                  </Link>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    {isVariable && (
                      <span className="text-[10px] text-blue-600 font-semibold block leading-none">
                        From
                      </span>
                    )}
                    <span className="text-base font-black text-slate-900 block leading-tight">
                      LKR {formatPriceLKR(price)}
                    </span>
                    {regPrice && (
                      <span className="text-xs text-slate-400 line-through block mt-0.5">
                        LKR {formatPriceLKR(regPrice)}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/product/${item.slug}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>View Deal</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
