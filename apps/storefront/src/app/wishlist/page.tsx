'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import productsData from '@/data/products.json';
import { formatPriceLKR } from '@/lib/catalog';
import { Heart, ShoppingCart, Trash2, ArrowRight, Check, PackageOpen, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function WishlistPage() {
  const { addToCart } = useCart();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Match saved wishlist IDs with actual product data
  const wishlistProducts = useMemo(() => {
    return wishlist
      .map((id) => (productsData as any[]).find((p) => p.id === id || p.slug === id))
      .filter(Boolean);
  }, [wishlist]);

  const handleAddToCart = (item: any) => {
    const price = item.salePriceMinor || item.minPriceMinor || item.regularPriceMinor || 0;
    addToCart({
      productId: item.id,
      name: item.name,
      slug: item.slug,
      priceMinor: price,
      image: item.displayImage || item.imageUrls?.[0] || '/dwstore_logo.png',
      quantity: 1,
    });
    setToastNotice(`Added "${item.name}" to cart!`);
    setTimeout(() => setToastNotice(null), 3000);
  };

  const handleMoveAllToCart = () => {
    wishlistProducts.forEach((item: any) => {
      const price = item.salePriceMinor || item.minPriceMinor || item.regularPriceMinor || 0;
      addToCart({
        productId: item.id,
        name: item.name,
        slug: item.slug,
        priceMinor: price,
        image: item.displayImage || item.imageUrls?.[0] || '/dwstore_logo.png',
        quantity: 1,
      }, false);
    });
    setToastNotice(`Moved all ${wishlistProducts.length} items to cart!`);
    setTimeout(() => setToastNotice(null), 3500);
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      {/* Floating Notice */}
      {toastNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="page-container text-center max-w-2xl mx-auto relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-300 block mb-2 flex items-center justify-center gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" /> Saved Products
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2">
            My Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Keep track of your favorite smartphones, audio gear, and gadgets and easily move them to your cart.
          </p>
        </div>
      </div>

      <div className="page-container py-10 flex-1 max-w-4xl mx-auto w-full">
        {wishlistProducts.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
              You haven&apos;t saved any products to your wishlist yet. Explore our catalog of 407+ original imported electronics and click the heart icon on any card to save it here!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Wishlist Table / List */
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-3">
              <div>
                <span className="text-base font-black text-slate-900">
                  Wishlist Items ({wishlistProducts.length})
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Saved items persist across browser sessions.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleMoveAllToCart}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Move All to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={clearWishlist}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {wishlistProducts.map((item: any) => {
                const price = item.salePriceMinor || item.minPriceMinor || item.regularPriceMinor || 0;
                const regularPrice = item.regularPriceMinor || price;
                const hasDiscount = regularPrice > price;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-slate-50/50 transition group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <Link
                        href={`/product/${item.slug}`}
                        className="w-20 h-20 rounded-2xl bg-slate-50 p-2 flex items-center justify-center flex-shrink-0 border border-slate-200 group-hover:scale-105 transition"
                      >
                        <img
                          src={item.displayImage || item.imageUrls?.[0] || '/dwstore_logo.png'}
                          alt={item.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/dwstore_logo.png';
                          }}
                        />
                      </Link>

                      <div className="min-w-0">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">
                          {item.brand || 'DWSTORE'}
                        </span>
                        <Link
                          href={`/product/${item.slug}`}
                          className="text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600 block line-clamp-1 transition"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-sm font-black text-slate-900">
                            LKR {formatPriceLKR(price)}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-slate-400 line-through">
                              LKR {formatPriceLKR(regularPrice)}
                            </span>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
                          <Check className="w-3 h-3" /> In Stock (Island-Wide Delivery)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => removeFromWishlist(item.id)}
                        className="w-9 h-9 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
                        title="Remove from Wishlist"
                        aria-label="Remove from Wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <Link href="/shop" className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <span>← Continue Shopping</span>
              </Link>
              <span>{wishlistProducts.length} items saved</span>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
