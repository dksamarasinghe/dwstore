'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import productsData from '@/data/products.json';
import categoriesData from '@/data/categories.json';
import { formatPriceLKR } from '@/lib/catalog';
import { Star, ShoppingCart, Heart, SlidersHorizontal, ChevronRight, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function CategoryPage() {
  const params = useParams();
  const slug = (params.slug as string) || '';
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const currentCategory = useMemo(() => {
    return (categoriesData as any[]).find(
      (c) => c.slug === slug || c.slug === slug.toLowerCase()
    );
  }, [slug]);

  const categoryName = currentCategory?.name || slug.replace(/-/g, ' ');

  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filter products matching this category slug or parent
  const matchingProducts = useMemo(() => {
    return (productsData as any[])
      .filter((p) => {
        if (!p.categorySlugs) return false;
        return (
          p.categorySlugs.includes(slug) ||
          p.categorySlugs.some((s: string) => s.toLowerCase() === slug.toLowerCase())
        );
      })
      .sort((a, b) => {
        const priceA = a.salePriceMinor || a.regularPriceMinor || 0;
        const priceB = b.salePriceMinor || b.regularPriceMinor || 0;
        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [slug, sortBy]);

  const totalPages = Math.ceil(matchingProducts.length / itemsPerPage) || 1;
  const paginatedProducts = matchingProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <main className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200 py-3">
        <div className="page-container flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/shop" className="hover:text-blue-600">Shop</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-900 capitalize">{categoryName}</span>
          </div>
          <span className="font-semibold text-slate-700">
            {matchingProducts.length} Items Available
          </span>
        </div>
      </div>

      {/* Category Header Hero */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-8 border-b border-slate-800">
        <div className="page-container flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2 border border-blue-400/20">
              <span>DWstore Category</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black capitalize tracking-tight text-white">
              {categoryName}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Original tech &amp; accessories with official warranty and island-wide Cash on Delivery.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition border border-white/20 w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Products</span>
          </Link>
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="page-container py-8 flex-1">
        {/* Top Control Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-xs font-bold text-slate-700">
            Showing {matchingProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
            {Math.min(currentPage * itemsPerPage, matchingProducts.length)} of {matchingProducts.length} items
          </span>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="featured">Featured / Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Product Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {paginatedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginatedProducts.map((product: any) => {
              const displayPrice = product.salePriceMinor || product.minPriceMinor || product.regularPriceMinor || 0;
              const regularPrice = product.regularPriceMinor && product.regularPriceMinor > displayPrice ? product.regularPriceMinor : null;
              const isVariable = product.type === 'variable' || (product.variations && product.variations.length > 0);

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {product.brand || 'DWSTORE'}
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
                      className="w-full aspect-square bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-3 mb-3 group-hover:bg-blue-50/20 transition relative block"
                    >
                      <img
                        src={product.displayImage}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/dwstore_logo.png';
                        }}
                      />
                    </Link>

                    <div className="flex items-center gap-1 mb-1.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-[11px] font-bold text-slate-700">5.0</span>
                      <span className="text-[10px] text-slate-400">(DWstore)</span>
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

                    <button
                      type="button"
                      onClick={() =>
                        addToCart({
                          productId: product.id,
                          name: product.name,
                          slug: product.slug,
                          priceMinor: displayPrice,
                          image: product.displayImage,
                          quantity: 1,
                        })
                      }
                      className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xs transition"
                      aria-label="Add to cart"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
            <SlidersHorizontal className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No items in this category yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Check out our full catalog to discover all imported tech accessories.
            </p>
            <Link
              href="/shop"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm inline-block"
            >
              Browse All Products
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => {
                  setCurrentPage(i + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
