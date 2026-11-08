'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingCart, Star } from 'lucide-react';
import productsData from '@/data/products.json';
import { formatPriceLKR } from '@/lib/catalog';

export default function CategoryShowcase() {
  // Real SmartWatches from CSV
  const smartwatches = (productsData as any[])
    .filter((p) => p.categorySlugs?.includes('smartwatches'))
    .slice(0, 5);

  // Real Power Banks & Charging from CSV
  const powerbanks = (productsData as any[])
    .filter((p) => p.categorySlugs?.includes('power-banks'))
    .slice(0, 5);

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
                        src={item.displayImage}
                        alt={item.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-300"
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
                        src={item.displayImage}
                        alt={item.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-300"
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
