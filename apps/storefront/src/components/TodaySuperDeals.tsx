'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Flame, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  ShoppingCart, 
  Heart,
  CheckCircle2
} from 'lucide-react';
import productsData from '@/data/products.json';
import initialHomepageData from '@/data/homepage.json';
import { formatPriceLKR } from '@/lib/catalog';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface TodaySuperDealsProps {
  initialConfig?: any;
}

export default function TodaySuperDeals({ initialConfig }: TodaySuperDealsProps) {
  const [dealsConfig, setDealsConfig] = useState<any>(initialConfig ?? initialHomepageData.superDeals);
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 45 });
  const sliderRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Keep state synchronized with prop updates
  useEffect(() => {
    if (initialConfig !== undefined) {
      setDealsConfig(initialConfig);
    }
  }, [initialConfig]);

  useEffect(() => {
    // Purge any stale legacy localStorage on storefront port 3000
    try {
      localStorage.removeItem('dwstore_homepage_config');
    } catch {}

    const syncWithServer = () => {
      fetch('/api/homepage?t=' + Date.now(), { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.config?.superDeals) {
            setDealsConfig(data.config.superDeals);
          }
        })
        .catch(() => {});
    };

    syncWithServer();
    const timer = setInterval(syncWithServer, 3000);
    return () => clearInterval(timer);
  }, []);

  // Ticking countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!dealsConfig?.enabled) {
    return null;
  }

  // Resolve products from config's productIds
  const selectedProductIds = dealsConfig?.productIds || [];
  const prodMap = new Map((productsData as any[]).map((p) => [String(p.id), p]));

  let dealProducts = selectedProductIds
    .map((id: string) => prodMap.get(String(id)))
    .filter(Boolean);

  // Fallback: If no products selected, take top discounted products from catalog
  if (dealProducts.length === 0) {
    dealProducts = (productsData as any[])
      .filter((p) => p.displayImage && (p.salePriceMinor || p.minPriceMinor || p.regularPriceMinor))
      .slice(0, 8);
  }

  // Robust pricing resolver that extracts actual selling price & discount for every product type
  const getProductPricing = (product: any) => {
    let selling = product.salePriceMinor || product.minPriceMinor || product.regularPriceMinor || 0;
    let regular = product.regularPriceMinor || 0;

    // Check variations for variable products
    if ((!selling || selling === 0) && product.variations && product.variations.length > 0) {
      const v = product.variations[0];
      selling = v.salePriceMinor || v.minPriceMinor || v.regularPriceMinor || 0;
      regular = v.regularPriceMinor || 0;
    }

    // Fallback if regular price is lower or equal to selling
    if (!regular || regular <= selling) {
      regular = Math.round(selling * 1.2);
    }

    const hasDiscount = regular > selling;
    const discountPercent = hasDiscount
      ? Math.round(((regular - selling) / regular) * 100)
      : 15;

    return { selling, regular, hasDiscount, discountPercent };
  };

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full bg-gradient-to-b from-white via-rose-50/20 to-white py-8 border-y border-rose-100/60">
      <div className="page-container px-4 sm:px-6">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black uppercase tracking-wider shadow-sm animate-pulse">
              <Flame className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>{dealsConfig?.title || "Today's Super Deals"}</span>
            </div>

            {/* Countdown Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-amber-400 text-xs font-mono font-bold shadow-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Ends in: {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition shadow-xs cursor-pointer"
              aria-label="Previous Deal"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition shadow-xs cursor-pointer"
              aria-label="Next Deal"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Slider */}
        <div
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {dealProducts.map((product: any) => {
            const { selling, regular, hasDiscount, discountPercent } = getProductPricing(product);
            const inWishlist = isInWishlist(String(product.id));
            const isOutOfStock = product.inStock === false || (typeof product.stockQty === 'number' && product.stockQty <= 0);

            return (
              <div
                key={product.id}
                className={`w-64 sm:w-72 flex-shrink-0 bg-white rounded-2xl border p-4 transition-all duration-300 hover:shadow-lg flex flex-col justify-between group relative ${
                  isOutOfStock ? 'border-slate-200 opacity-80' : 'border-rose-100/80 hover:border-rose-300'
                }`}
              >
                {/* Discount Tag */}
                <div className="absolute top-3 left-3 z-10">
                  {isOutOfStock ? (
                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-rose-300 text-[11px] font-black uppercase tracking-tight shadow-xs flex items-center gap-1">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[11px] font-black uppercase tracking-tight shadow-xs flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-white" />
                      -{discountPercent}% OFF
                    </span>
                  )}
                </div>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/90 hover:bg-white border border-slate-100 flex items-center justify-center shadow-xs text-slate-400 hover:text-rose-500 transition cursor-pointer"
                  aria-label="Add to wishlist"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      inWishlist ? 'fill-rose-500 text-rose-500' : ''
                    }`}
                  />
                </button>

                {/* Product Image */}
                <Link
                  href={`/product/${product.slug}`}
                  className="w-full aspect-square rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-3 mb-3 relative block"
                >
                  <img
                    src={product.displayImage}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/dwstore_logo.png';
                    }}
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {product.brand || 'DWSTORE'}
                    </span>
                    <Link
                      href={`/product/${product.slug}`}
                      className="text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600 transition line-clamp-2 block leading-snug mb-2"
                    >
                      {product.name}
                    </Link>
                  </div>

                  <div>
                    {/* Prices */}
                    <div className="flex items-baseline gap-2 mb-2">
                      <strong className="text-base font-black text-rose-600 font-mono">
                        LKR {formatPriceLKR(selling)}
                      </strong>
                      {hasDiscount && (
                        <span className="text-xs text-slate-400 line-through font-mono">
                          LKR {formatPriceLKR(regular)}
                        </span>
                      )}
                    </div>

                    {/* KOKO installment tag */}
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 mb-3">
                      <span>or 3x with</span>
                      <span className="font-black text-purple-600">KOKO</span>
                      <span className="text-slate-400 font-mono">
                        LKR {formatPriceLKR(Math.round(selling / 3))}
                      </span>
                    </div>

                    {/* Action button */}
                    {isOutOfStock ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-2 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
                      >
                        Out of Stock
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToCart({
                          productId: String(product.id),
                          name: product.name,
                          slug: product.slug,
                          image: product.displayImage || '',
                          priceMinor: selling,
                          regularPriceMinor: regular,
                          quantity: 1,
                        })}
                        className="w-full py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer group-hover:bg-rose-600"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Grab Super Deal</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
