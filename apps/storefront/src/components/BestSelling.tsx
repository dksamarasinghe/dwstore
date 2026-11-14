'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Heart, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import productsData from '@/data/products.json';
import ordersData from '@/data/orders.json';
import { formatPriceLKR, isProductInStock } from '@/lib/catalog';
import { useWishlist } from '@/context/WishlistContext';
import { resolveImageUrl } from '@/lib/image';

const TABS = [
  { label: 'All Products', category: 'all' },
  { label: 'SmartWatches', category: 'smartwatches' },
  { label: 'Audio & Earbuds', category: 'bluetooth-handfree' },
  { label: 'Power Banks', category: 'power-banks' },
  { label: 'Chargers & Adapters', category: 'wall-chargers' },
];

export default function BestSelling() {
  const [activeTab, setActiveTab] = useState('all');
  const [isPaused, setIsPaused] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { isInWishlist, toggleWishlist } = useWishlist();

  // 1. Calculate total order sales count per product from orders.json
  const salesCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (Array.isArray(ordersData)) {
      ordersData.forEach((order: any) => {
        (order.items || []).forEach((item: any) => {
          const id = String(item.productId || item.id || '');
          if (id) {
            map[id] = (map[id] || 0) + (Number(item.quantity) || 1);
          }
        });
      });
    }
    return map;
  }, []);

  // 2. Filter products: Exclude out of stock, sort by order frequency (highest first)
  const sortedInStockProducts = useMemo(() => {
    return (productsData as any[])
      .filter((p) => p.displayImage && p.regularPriceMinor > 0 && isProductInStock(p))
      .sort((a, b) => {
        const countA = salesCountMap[String(a.id)] || 0;
        const countB = salesCountMap[String(b.id)] || 0;
        if (countA !== countB) return countB - countA;
        return (b.id || 0) - (a.id || 0);
      });
  }, [salesCountMap]);

  // 3. Tab filtration (shows top 12 best-sellers per category)
  const filteredProducts = useMemo(() => {
    if (activeTab === 'all') return sortedInStockProducts.slice(0, 15);
    return sortedInStockProducts
      .filter((p) =>
        p.categorySlugs?.some((cat: string) =>
          cat.toLowerCase().includes(activeTab.toLowerCase())
        )
      )
      .slice(0, 15);
  }, [sortedInStockProducts, activeTab]);

  // 4. Auto-scroll every 5000ms
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const el = sliderRef.current;
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

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full bg-slate-50/50 py-8">
      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Best <span className="text-blue-600">Selling</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Most popular customer picks with genuine importer warranty
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {TABS.map((tab) => (
                <button
                  key={tab.category}
                  onClick={() => setActiveTab(tab.category)}
                  type="button"
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition whitespace-nowrap cursor-pointer ${
                    activeTab === tab.category
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Slider Navigation Arrows */}
            <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
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

        {/* Horizontal Auto-Sliding Carousel */}
        <div
          ref={sliderRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3"
        >
          {filteredProducts.map((product) => {
            const displayPrice = product.salePriceMinor || product.minPriceMinor || product.regularPriceMinor || 0;
            const regularPrice = product.regularPriceMinor && product.regularPriceMinor > displayPrice ? product.regularPriceMinor : null;
            const hasSale = !!regularPrice;
            const discountPct = hasSale
              ? Math.round(((regularPrice - displayPrice) / regularPrice) * 100)
              : null;
            const isVariable = product.type === 'variable' || (product.variations && product.variations.length > 0);
            const inStock = isProductInStock(product);

            return (
              <div
                key={product.id}
                className="w-56 sm:w-64 flex-shrink-0 group bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Badges row */}
                  <div className="flex items-center justify-between mb-2">
                    {discountPct ? (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        -{discountPct}%
                      </span>
                    ) : (
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {product.brand || 'GENUINE'}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                        isInWishlist(product.id)
                          ? 'bg-rose-50 text-rose-500 border border-rose-200 shadow-xs'
                          : 'bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500'
                      }`}
                      aria-label="Wishlist"
                      title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isInWishlist(product.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>

                  {/* Image */}
                  <Link
                    href={`/product/${product.slug}`}
                    className="w-full aspect-square bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-3 mb-3 group-hover:bg-blue-50/20 transition relative"
                  >
                    <img
                      src={resolveImageUrl(product.displayImage || product.image)}
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/media/products/T800-Ultra-Smart-Watch-1_d7ac6b08.jpg';
                      }}
                    />
                  </Link>

                  {/* Stock Status Badge & Rating */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block truncate max-w-[120px]">
                      {product.brand || 'Electronics'}
                    </span>
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

                  <div className="flex items-center gap-1 mb-1.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[11px] font-bold text-slate-700">4.9</span>
                    <span className="text-[10px] text-slate-400">({salesCountMap[String(product.id)] || 20}+ sold)</span>
                  </div>

                  {/* Title */}
                  <Link
                    href={`/product/${product.slug}`}
                    className="text-xs font-bold text-slate-800 group-hover:text-blue-600 line-clamp-2 leading-tight transition block"
                  >
                    {product.name}
                  </Link>
                </div>

                {/* Price + Cart */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    {isVariable && (
                      <span className="text-[10px] font-semibold text-blue-600 block leading-tight">
                        From
                      </span>
                    )}
                    <span className="text-xs sm:text-sm font-black text-slate-900 block leading-none">
                      LKR {formatPriceLKR(displayPrice)}
                    </span>
                    {regularPrice && (
                      <span className="text-[10px] text-slate-400 line-through leading-none block mt-0.5">
                        LKR {formatPriceLKR(regularPrice)}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/product/${product.slug}`}
                    className="w-8 h-8 rounded-lg bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition duration-200"
                    aria-label="View product"
                  >
                    <ShoppingCart className="w-4 h-4" />
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
