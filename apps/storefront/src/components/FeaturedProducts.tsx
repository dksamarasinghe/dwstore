'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import productsData from '@/data/products.json';
import { formatPriceLKR } from '@/lib/catalog';
import { useWishlist } from '@/context/WishlistContext';

export default function FeaturedProducts() {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const featured = (productsData as any[])
    .filter((p) => p.displayImage && p.regularPriceMinor > 0)
    .slice(10, 15);

  return (
    <section className="w-full bg-slate-50/50 py-8">
      <div className="page-container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Featured <span className="text-blue-600">Products</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Top-rated certified electronics from our inventory</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/shop"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition"
            >
              View All (407 Items) →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {featured.map((product) => {
            const displayPrice = product.salePriceMinor || product.minPriceMinor || product.regularPriceMinor || 0;
            const regularPrice = product.regularPriceMinor && product.regularPriceMinor > displayPrice ? product.regularPriceMinor : null;
            const hasSale = !!regularPrice;
            const discountPct = hasSale
              ? Math.round(((regularPrice - displayPrice) / regularPrice) * 100)
              : null;
            const isVariable = product.type === 'variable' || (product.variations && product.variations.length > 0);

            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {product.brand || 'DWstore'}
                    </span>
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

                  <Link
                    href={`/product/${product.slug}`}
                    className="w-full aspect-square bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-3 mb-3 group-hover:bg-blue-50/20 transition relative"
                  >
                    <img
                      src={product.displayImage}
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-300"
                    />
                  </Link>

                  <div className="flex items-center gap-1 mb-1.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[11px] font-bold text-slate-700">5.0</span>
                    <span className="text-[10px] text-slate-400">(Official)</span>
                  </div>

                  <Link
                    href={`/product/${product.slug}`}
                    className="text-xs font-bold text-slate-800 group-hover:text-blue-600 line-clamp-2 leading-tight transition block"
                  >
                    {product.name}
                  </Link>
                </div>

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
