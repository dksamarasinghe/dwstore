'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingCart, Star } from 'lucide-react';
import productsData from '@/data/products.json';
import { formatPriceLKR, isProductInStock } from '@/lib/catalog';
import { resolveImageUrl } from '@/lib/image';

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

      return 0;
    });
  };

  // Real SmartWatches from CSV / Storefront API - newest & edited first
  const smartwatches = useMemo(() => {
    const list = allProducts.filter(
      (p) =>
        p.categorySlugs?.some((s: string) => s.toLowerCase().includes('smartwatch')) ||
        (p.name && p.name.toLowerCase().includes('smartwatch')) ||
        (p.name && p.name.toLowerCase().includes('smart watch'))
    );
    return sortProductsByNewestAndStock(list).slice(0, 5);
  }, [allProducts]);

  // Real Power Banks & Charging from CSV / Storefront API - newest & edited first
  const powerbanks = useMemo(() => {
    const list = allProducts.filter(
      (p) =>
        p.categorySlugs?.some((s: string) =>
          s.toLowerCase().includes('power-bank') || s.toLowerCase().includes('powerbank')
        ) ||
        (p.name && p.name.toLowerCase().includes('power bank')) ||
        (p.name && p.name.toLowerCase().includes('powerbank'))
    );
    return sortProductsByNewestAndStock(list).slice(0, 5);
  }, [allProducts]);

  return (
    <section className="w-full bg-white py-8 border-t border-slate-100">
      <div className="page-container space-y-12">

        {/* ── ROW 1: SmartWatches & Wearables ────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                SmartWatches &amp; <span className="text-blue-600">Wearables</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Genuine smart watches with health tracking, Bluetooth calling &amp; checking warranty
              </p>
            </div>
            <Link
              href="/shop?category=SmartWatches"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View all watches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {smartwatches.map((item) => {
              const price = item.salePriceMinor || item.minPriceMinor || item.regularPriceMinor || 0;
              const isVariable = item.type === 'variable' || (item.variations && item.variations.length > 0);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-3.5 hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {item.brand || 'SMARTWATCH'}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-bold text-slate-600">5.0</span>
                      </div>
                    </div>

                    <Link
                      href={`/product/${item.slug}`}
                      className="w-full aspect-square bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-2.5 mb-2.5 group-hover:bg-blue-50/20 transition"
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

        {/* ── ROW 2: Power Banks & Portable Charging ──────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Power Banks &amp; <span className="text-blue-600">Fast Charging</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Original Aspor, Remax, and BWOO power banks with digital display and fast charging
              </p>
            </div>
            <Link
              href="/shop?category=Power+Banks"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View all power banks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {powerbanks.map((item) => {
              const price = item.salePriceMinor || item.minPriceMinor || item.regularPriceMinor || 0;
              const isVariable = item.type === 'variable' || (item.variations && item.variations.length > 0);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-3.5 hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {item.brand || 'GENUINE'}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-bold text-slate-600">4.9</span>
                      </div>
                    </div>

                    <Link
                      href={`/product/${item.slug}`}
                      className="w-full aspect-square bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-2.5 mb-2.5 group-hover:bg-blue-50/20 transition"
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

      </div>
    </section>
  );
}
