'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, ShoppingCart, Heart, Star } from 'lucide-react';
import productsData from '@/data/products.json';
import { formatPriceLKR } from '@/lib/catalog';
import { useWishlist } from '@/context/WishlistContext';

export default function FindFavoriteProducts() {
  const [activeFilter, setActiveFilter] = useState('All');
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Select 3 top genuine featured products from CSV
  const audioProducts = (productsData as any[]).filter(
    (p) => p.categorySlugs?.includes('bluetooth-handfree') || p.categorySlugs?.includes('headphone-and-headset')
  );

  const smartWatchProducts = (productsData as any[]).filter(
    (p) => p.categorySlugs?.includes('smartwatches')
  );

  const chargerProducts = (productsData as any[]).filter(
    (p) => p.categorySlugs?.includes('cable-and-adaptors') || p.categorySlugs?.includes('power-banks')
  );

  const featuredList = [
    smartWatchProducts[0] || productsData[0],
    audioProducts[0] || productsData[1],
    chargerProducts[0] || productsData[2],
  ].filter(Boolean);

  return (
    <section className="w-full bg-slate-50/60 py-10 border-t border-slate-100">
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              DWstore Certified <span className="text-blue-600">Spotlight</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Top trending genuine electronic picks with island-wide Cash on Delivery
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl px-4 py-2 hover:bg-slate-50 hover:border-blue-500 transition shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>Browse Full Catalog</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredList.map((item: any) => {
            const price = item.salePriceMinor || item.minPriceMinor || item.regularPriceMinor || 0;
            const regPrice = item.regularPriceMinor && item.regularPriceMinor > price ? item.regularPriceMinor : null;
            const isVariable = item.type === 'variable' || (item.variations && item.variations.length > 0);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 hover:border-blue-400 hover:shadow-lg transition flex flex-col justify-between group"
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
                      src={item.displayImage}
                      alt={item.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-300"
                    />
                  </Link>

                  <div className="flex items-center gap-1 mb-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-slate-800">5.0</span>
                    <span className="text-[11px] text-slate-400 font-medium">(Verified Stock)</span>
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
