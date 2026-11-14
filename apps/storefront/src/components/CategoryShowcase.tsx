'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingCart, Star, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import productsData from '@/data/products.json';
import { formatPriceLKR, isProductInStock } from '@/lib/catalog';
import { useWishlist } from '@/context/WishlistContext';
import { resolveImageUrl } from '@/lib/image';

interface ShowcaseRowProps {
  title: string;
  titleHighlight: string;
  subtitle: string;
  viewAllLink: string;
  viewAllText: string;
  items: any[];
}

function ShowcaseRow({
  title,
  titleHighlight,
  subtitle,
  viewAllLink,
  viewAllText,
  items,
}: ShowcaseRowProps) {
  const [isPaused, setIsPaused] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Auto-scroll every 5000ms
  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const el = sliderRef.current;
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft >= maxScroll - 15) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: 280, behavior: 'smooth' });
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, items]);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Row Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {title} <span className="text-blue-600">{titleHighlight}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Link
            href={viewAllLink}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50/70 hover:bg-blue-100/70 px-3 py-1.5 rounded-lg transition"
          >
            <span>{viewAllText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-7 h-7 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition shadow-2xs cursor-pointer"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-7 h-7 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition shadow-2xs cursor-pointer"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={sliderRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3"
      >
        {items.map((item) => {
          const price = item.salePriceMinor || item.minPriceMinor || item.regularPriceMinor || 0;
          const isVariable = item.type === 'variable' || (item.variations && item.variations.length > 0);
          const inStock = isProductInStock(item);

          return (
            <div
              key={item.id}
              className="w-52 sm:w-60 flex-shrink-0 bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-3.5 hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full truncate max-w-[100px]">
                    {item.brand || 'GENUINE'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(item.id);
                      }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition cursor-pointer ${
                        isInWishlist(item.id)
                          ? 'bg-rose-50 text-rose-500'
                          : 'bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500'
                      }`}
                      aria-label="Wishlist"
                    >
                      <Heart className={`w-3 h-3 ${isInWishlist(item.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>
                </div>

                <Link
                  href={`/product/${item.slug}`}
                  className="w-full aspect-square bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-2.5 mb-2.5 group-hover:bg-blue-50/20 transition relative"
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
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[10px] font-bold text-slate-700">4.9</span>
                  </div>
                  {inStock ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      In Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Out of Stock
                    </span>
                  )}
                </div>

                <Link
                  href={`/product/${item.slug}`}
                  className="text-xs font-bold text-slate-800 group-hover:text-blue-600 line-clamp-2 leading-tight transition block"
                >
                  {item.name}
                </Link>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {isVariable && (
                    <span className="text-[10px] text-blue-600 font-semibold block leading-none">
                      From
                    </span>
                  )}
                  <span className="text-xs sm:text-sm font-black text-slate-900 block leading-tight">
                    LKR {formatPriceLKR(price)}
                  </span>
                </div>
                <Link
                  href={`/product/${item.slug}`}
                  className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition"
                  aria-label="View product"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CategoryShowcase() {
  const [allProducts, setAllProducts] = useState<any[]>(() => productsData as any[]);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/products?t=' + Date.now(), { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setAllProducts(data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to sort products: In-stock first, then newest added & recently edited first
  const sortProductsByNewestAndStock = (items: any[]) => {
    return [...items].sort((a, b) => {
      // 1. In-stock products first
      const stockA = isProductInStock(a) ? 1 : 0;
      const stockB = isProductInStock(b) ? 1 : 0;
      if (stockA !== stockB) return stockB - stockA;

      // 2. Latest updated or created timestamp
      const timeA =
        a.updatedAtTimestamp ||
        (a.updatedAt ? new Date(a.updatedAt).getTime() : 0) ||
        a.createdAtTimestamp ||
        (a.createdAt ? new Date(a.createdAt).getTime() : 0) ||
        0;
      const timeB =
        b.updatedAtTimestamp ||
        (b.updatedAt ? new Date(b.updatedAt).getTime() : 0) ||
        b.createdAtTimestamp ||
        (b.createdAt ? new Date(b.createdAt).getTime() : 0) ||
        0;
      if (timeA !== timeB) return timeB - timeA;

      return (b.id || 0) - (a.id || 0);
    });
  };

  // 1. SmartWatches & Wearables - newest & in-stock first
  const smartwatches = useMemo(() => {
    const list = allProducts.filter(
      (p) =>
        isProductInStock(p) &&
        (p.categorySlugs?.some((s: string) => s.toLowerCase().includes('smartwatch')) ||
          (p.name && p.name.toLowerCase().includes('smartwatch')) ||
          (p.name && p.name.toLowerCase().includes('smart watch')))
    );
    return sortProductsByNewestAndStock(list).slice(0, 12);
  }, [allProducts]);

  // 2. Power Banks & Fast Charging - newest & in-stock first
  const powerbanks = useMemo(() => {
    const list = allProducts.filter(
      (p) =>
        isProductInStock(p) &&
        (p.categorySlugs?.some((s: string) =>
          s.toLowerCase().includes('power-bank') || s.toLowerCase().includes('powerbank')
        ) ||
          (p.name && p.name.toLowerCase().includes('power bank')) ||
          (p.name && p.name.toLowerCase().includes('powerbank')))
    );
    return sortProductsByNewestAndStock(list).slice(0, 12);
  }, [allProducts]);

  // 3. Security Camera & Accessories - newest & in-stock only
  const securityCameras = useMemo(() => {
    const list = allProducts.filter(
      (p) =>
        isProductInStock(p) &&
        (p.categorySlugs?.some((s: string) =>
          s.toLowerCase().includes('camera') ||
          s.toLowerCase().includes('cctv') ||
          s.toLowerCase().includes('security')
        ) ||
          (p.name && /camera|cctv|security|ezviz|hikvision|tiandy|vstarcam|v380/i.test(p.name)))
    );
    return sortProductsByNewestAndStock(list).slice(0, 12);
  }, [allProducts]);

  return (
    <section className="w-full bg-white py-8 border-t border-slate-100">
      <div className="page-container space-y-12">
        {/* ROW 1: SmartWatches & Wearables */}
        <ShowcaseRow
          title="SmartWatches &"
          titleHighlight="Wearables"
          subtitle="Genuine smart watches with health tracking, Bluetooth calling & checking warranty"
          viewAllLink="/shop?category=SmartWatches"
          viewAllText="View all watches"
          items={smartwatches}
        />

        {/* ROW 2: Power Banks & Fast Charging */}
        <ShowcaseRow
          title="Power Banks &"
          titleHighlight="Fast Charging"
          subtitle="Original Aspor, Remax, and BWOO power banks with digital display and fast charging"
          viewAllLink="/shop?category=Power+Banks"
          viewAllText="View all power banks"
          items={powerbanks}
        />

        {/* ROW 3: Security Camera & Accessories */}
        <ShowcaseRow
          title="Security Camera &"
          titleHighlight="Accessories"
          subtitle="High-definition CCTV, smart Wi-Fi cameras, 4G surveillance & accessories with official warranty"
          viewAllLink="/shop?category=Security+Camera+%26+Accessories"
          viewAllText="View all cameras"
          items={securityCameras}
        />
      </div>
    </section>
  );
}
