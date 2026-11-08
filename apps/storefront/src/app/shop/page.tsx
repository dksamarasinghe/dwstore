'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import productsData from '@/data/products.json';
import categoriesData from '@/data/categories.json';
import brandsData from '@/data/brands.json';
import { formatPriceLKR, isProductInStock } from '@/lib/catalog';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Star, ShoppingCart, Heart, SlidersHorizontal, ChevronRight, X, Check, Filter } from 'lucide-react';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedCategory, setSelectedCategory] = useState<string>(
    () => searchParams.get('category') || 'all'
  );
  const [selectedBrand, setSelectedBrand] = useState<string>(
    () => searchParams.get('brand') || 'all'
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    () => searchParams.get('q') || ''
  );
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [onlyDeals, setOnlyDeals] = useState<boolean>(
    () => searchParams.get('filter') === 'deals'
  );
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>(
    () => (searchParams.get('stock') as any) || 'all'
  );

  // Price range filter states (in LKR rupees)
  const [minPrice, setMinPrice] = useState<string>(
    () => searchParams.get('minPrice') || ''
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    () => searchParams.get('maxPrice') || ''
  );
  const [inputMinPrice, setInputMinPrice] = useState<string>(
    () => searchParams.get('minPrice') || ''
  );
  const [inputMaxPrice, setInputMaxPrice] = useState<string>(
    () => searchParams.get('maxPrice') || ''
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [cartNotice, setCartNotice] = useState<string | null>(null);
  const itemsPerPage = 20;

  // Synchronize filter state whenever searchParams in the URL changes
  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    const br = searchParams.get('brand') || 'all';
    const q = searchParams.get('q') || '';
    const filter = searchParams.get('filter') || 'all';
    const stock = (searchParams.get('stock') as any) || 'all';
    const minP = searchParams.get('minPrice') || '';
    const maxP = searchParams.get('maxPrice') || '';

    setSelectedCategory(cat);
    setSelectedBrand(br);
    setSearchQuery(q);
    setOnlyDeals(filter === 'deals');
    setStockFilter(stock);
    setMinPrice(minP);
    setMaxPrice(maxP);
    setInputMinPrice(minP);
    setInputMaxPrice(maxP);
    setCurrentPage(1);
  }, [searchParams]);

  // Synchronize state changes with URL router so back/forward button and URL sharing works
  const updateFilters = (newParams: {
    category?: string;
    brand?: string;
    q?: string;
    deals?: boolean;
    stock?: 'all' | 'in-stock' | 'out-of-stock';
    minPrice?: string;
    maxPrice?: string;
  }) => {
    const nextCat = newParams.category !== undefined ? newParams.category : selectedCategory;
    const nextBrand = newParams.brand !== undefined ? newParams.brand : selectedBrand;
    const nextQ = newParams.q !== undefined ? newParams.q : searchQuery;
    const nextDeals = newParams.deals !== undefined ? newParams.deals : onlyDeals;
    const nextStock = newParams.stock !== undefined ? newParams.stock : stockFilter;
    const nextMin = newParams.minPrice !== undefined ? newParams.minPrice : minPrice;
    const nextMax = newParams.maxPrice !== undefined ? newParams.maxPrice : maxPrice;

    setSelectedCategory(nextCat);
    setSelectedBrand(nextBrand);
    setSearchQuery(nextQ);
    setOnlyDeals(nextDeals);
    setStockFilter(nextStock);
    setMinPrice(nextMin);
    setMaxPrice(nextMax);
    setInputMinPrice(nextMin);
    setInputMaxPrice(nextMax);
    setCurrentPage(1);

    const query = new URLSearchParams();
    if (nextCat && nextCat !== 'all') query.set('category', nextCat);
    if (nextBrand && nextBrand !== 'all') query.set('brand', nextBrand);
    if (nextQ) query.set('q', nextQ);
    if (nextDeals) query.set('filter', 'deals');
    if (nextStock && nextStock !== 'all') query.set('stock', nextStock);
    if (nextMin) query.set('minPrice', nextMin);
    if (nextMax) query.set('maxPrice', nextMax);

    const qs = query.toString();
    router.replace(`/shop${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  const handleApplyPrice = () => {
    updateFilters({
      minPrice: inputMinPrice.trim(),
      maxPrice: inputMaxPrice.trim(),
    });
  };

  const handleClearPrice = () => {
    setInputMinPrice('');
    setInputMaxPrice('');
    updateFilters({ minPrice: '', maxPrice: '' });
  };

  // Stock counts in the dataset
  const { totalInStock, totalOutOfStock } = useMemo(() => {
    let inS = 0;
    let outS = 0;
    (productsData as any[]).forEach((p) => {
      if (isProductInStock(p)) inS++;
      else outS++;
    });
    return { totalInStock: inS, totalOutOfStock: outS };
  }, []);

  // Filter products with robust case-insensitive slug checking, stock status, and price range
  const filteredProducts = useMemo(() => {
    return (productsData as any[])
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'all') {
          const hasCategory = p.categorySlugs?.some(
            (slug: string) => slug.toLowerCase() === selectedCategory.toLowerCase()
          );
          if (!hasCategory) return false;
        }

        // Brand filter
        if (selectedBrand !== 'all') {
          const matchBrand =
            p.brandSlug?.toLowerCase() === selectedBrand.toLowerCase() ||
            p.brand?.toLowerCase() === selectedBrand.toLowerCase();
          if (!matchBrand) return false;
        }

        // Deals filter
        if (onlyDeals && (!p.salePriceMinor || p.salePriceMinor >= p.regularPriceMinor)) {
          return false;
        }

        // Stock filter (in-stock vs out-of-stock)
        const isInStock = isProductInStock(p);
        if (stockFilter === 'in-stock' && !isInStock) {
          return false;
        }
        if (stockFilter === 'out-of-stock' && isInStock) {
          return false;
        }

        // Price range filter (prices in minor cents / 100)
        const priceLkr = (p.salePriceMinor || p.minPriceMinor || p.regularPriceMinor || 0) / 100;
        if (minPrice) {
          const minVal = parseFloat(minPrice);
          if (!isNaN(minVal) && priceLkr < minVal) return false;
        }
        if (maxPrice) {
          const maxVal = parseFloat(maxPrice);
          if (!isNaN(maxVal) && priceLkr > maxVal) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = (p.name || '').toLowerCase().includes(q);
          const matchesDesc = (p.description || '').toLowerCase().includes(q);
          const matchesBrand = (p.brand || '').toLowerCase().includes(q);
          if (!matchesName && !matchesDesc && !matchesBrand) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.salePriceMinor || a.regularPriceMinor || 0;
        const priceB = b.salePriceMinor || b.regularPriceMinor || 0;
        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
        return 0;
      });
  }, [selectedCategory, selectedBrand, searchQuery, onlyDeals, stockFilter, minPrice, maxPrice, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeCategoryObj = useMemo(() => {
    return (categoriesData as any[]).find(
      (c) => c.slug.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [selectedCategory]);

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedBrand !== 'all' ||
    searchQuery ||
    onlyDeals ||
    stockFilter !== 'all' ||
    Boolean(minPrice) ||
    Boolean(maxPrice);

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.inStock === false) {
      setCartNotice(`"${product.name}" is currently Out of Stock.`);
      setTimeout(() => setCartNotice(null), 3000);
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      priceMinor: product.salePriceMinor || product.minPriceMinor || product.regularPriceMinor || 0,
      image: product.displayImage || product.imageUrls?.[0] || '/dwstore_logo.png',
      quantity: 1,
    });
    setCartNotice(`Added "${product.name}" to cart!`);
    setTimeout(() => setCartNotice(null), 3000);
  };

  return (
    <>
      {/* Floating Cart Notice */}
      {cartNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce border border-slate-700">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{cartNotice}</span>
        </div>
      )}

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200 py-3">
        <div className="page-container flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              href="/shop"
              onClick={(e) => {
                e.preventDefault();
                updateFilters({
                  category: 'all',
                  brand: 'all',
                  q: '',
                  deals: false,
                  stock: 'all',
                  minPrice: '',
                  maxPrice: '',
                });
              }}
              className={`hover:text-blue-600 ${
                !hasActiveFilters ? 'font-bold text-slate-800' : ''
              }`}
            >
              All Products
            </Link>

            {onlyDeals && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-rose-600 font-bold">Hot Deals</span>
              </>
            )}

            {selectedCategory !== 'all' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-blue-600 font-bold capitalize">
                  {activeCategoryObj?.name || selectedCategory.replace(/-/g, ' ')}
                </span>
              </>
            )}

            {selectedBrand !== 'all' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-800 font-bold capitalize">
                  Brand: {selectedBrand}
                </span>
              </>
            )}

            {stockFilter !== 'all' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className={`font-bold capitalize ${stockFilter === 'in-stock' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stockFilter === 'in-stock' ? 'In Stock Only' : 'Out of Stock Only'}
                </span>
              </>
            )}

            {(minPrice || maxPrice) && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-700 font-bold">
                  Price: LKR {minPrice ? Number(minPrice).toLocaleString() : '0'} - {maxPrice ? Number(maxPrice).toLocaleString() : 'Any'}
                </span>
              </>
            )}
          </div>
          <span className="font-semibold text-slate-700">
            Showing {filteredProducts.length} Products
          </span>
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="page-container py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar Filters */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                  Filter Catalog
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      updateFilters({
                        category: 'all',
                        brand: 'all',
                        q: '',
                        deals: false,
                        stock: 'all',
                        minPrice: '',
                        maxPrice: '',
                      });
                    }}
                    className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>

              {/* Special Deals Toggle */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyDeals}
                    onChange={(e) => {
                      updateFilters({ deals: e.target.checked });
                    }}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Show Discounted Deals Only</span>
                </label>
              </div>

              {/* Stock Availability Filter */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                  Stock Availability
                </h4>
                <div className="space-y-1 text-xs">
                  <button
                    type="button"
                    onClick={() => updateFilters({ stock: 'all' })}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition ${
                      stockFilter === 'all'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>All Availability</span>
                    <span>{productsData.length}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFilters({ stock: 'in-stock' })}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition ${
                      stockFilter === 'in-stock'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      In Stock
                    </span>
                    <span>{totalInStock}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFilters({ stock: 'out-of-stock' })}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition ${
                      stockFilter === 'out-of-stock'
                        ? 'bg-rose-600 text-white font-bold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      Out of Stock
                    </span>
                    <span>{totalOutOfStock}</span>
                  </button>
                </div>
              </div>

              {/* Price Range Filter (LKR) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Price Range (LKR)
                  </h4>
                  {(minPrice || maxPrice) && (
                    <button
                      type="button"
                      onClick={handleClearPrice}
                      className="text-[10px] text-blue-600 hover:underline font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium block mb-1">Min (LKR)</label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={inputMinPrice}
                      onChange={(e) => setInputMinPrice(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyPrice()}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium block mb-1">Max (LKR)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={inputMaxPrice}
                      onChange={(e) => setInputMaxPrice(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyPrice()}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyPrice}
                  className="w-full py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Filter className="w-3 h-3" />
                  Apply Price Filter
                </button>

                {/* Quick Price Preset Chips */}
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {[
                    { label: '< 2.5K', min: '', max: '2500' },
                    { label: '2.5K - 10K', min: '2500', max: '10000' },
                    { label: '10K - 30K', min: '10000', max: '30000' },
                    { label: '> 30K', min: '30000', max: '' },
                  ].map((preset) => {
                    const isSelected = minPrice === preset.min && maxPrice === preset.max;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setInputMinPrice(preset.min);
                          setInputMaxPrice(preset.max);
                          updateFilters({ minPrice: preset.min, maxPrice: preset.max });
                        }}
                        className={`text-[10px] px-2 py-1 rounded-md border transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 text-blue-600 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                  Categories ({categoriesData.length})
                </h4>
                <div className="max-h-56 overflow-y-auto space-y-1 text-xs pr-1">
                  <button
                    type="button"
                    onClick={() => {
                      updateFilters({ category: 'all' });
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition ${
                      selectedCategory === 'all'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>All Categories</span>
                    <span>{productsData.length}</span>
                  </button>
                  {(categoriesData as any[])
                    .filter((c) => c.productCount > 0)
                    .map((c) => (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => {
                          updateFilters({ category: c.slug });
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition ${
                          selectedCategory.toLowerCase() === c.slug.toLowerCase()
                            ? 'bg-blue-600 text-white font-bold'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{c.name}</span>
                        <span className="text-[10px] opacity-80">({c.productCount})</span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                  Brands ({brandsData.length})
                </h4>
                <div className="max-h-56 overflow-y-auto space-y-1 text-xs pr-1">
                  <button
                    type="button"
                    onClick={() => {
                      updateFilters({ brand: 'all' });
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition ${
                      selectedBrand === 'all'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>All Brands</span>
                  </button>
                  {(brandsData as any[])
                    .filter((b) => b.productCount > 0)
                    .map((b) => (
                      <button
                        key={b.slug}
                        type="button"
                        onClick={() => {
                          updateFilters({ brand: b.slug });
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition ${
                          selectedBrand.toLowerCase() === b.slug.toLowerCase()
                            ? 'bg-blue-600 text-white font-bold'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{b.name}</span>
                        <span className="text-[10px] opacity-80">({b.productCount})</span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Right Product Grid */}
          <main className="lg:col-span-9 space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-600">
                Page <span className="font-bold text-slate-900">{currentPage}</span> of{' '}
                <span className="font-bold text-slate-900">{totalPages}</span>
              </span>

              {/* Sorting */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="featured">Featured / Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Product Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Product Cards Grid */}
            {paginatedProducts.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 text-sm">
                No products found matching your current filter criteria.
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      updateFilters({
                        category: 'all',
                        brand: 'all',
                        q: '',
                        deals: false,
                        stock: 'all',
                        minPrice: '',
                        maxPrice: '',
                      });
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedProducts.map((product) => {
                  const price = product.salePriceMinor || product.minPriceMinor || product.regularPriceMinor || 0;
                  const regularPrice = product.regularPriceMinor || price;
                  const discountPercent =
                    regularPrice > price
                      ? Math.round(((regularPrice - price) / regularPrice) * 100)
                      : 0;

                  const isInStock = isProductInStock(product);
                  const isFavorited = isInWishlist(product.id);

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-3 flex flex-col justify-between hover:shadow-lg hover:border-blue-200 transition-all group relative"
                    >
                      {/* Top Badges Container: Discount */}
                      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
                        {discountPercent > 0 && (
                          <div className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                            -{discountPercent}%
                          </div>
                        )}
                      </div>

                      {/* Wishlist Icon */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const added = toggleWishlist(product.id);
                          setCartNotice(
                            added
                              ? `Added "${product.name}" to your Wishlist!`
                              : `Removed "${product.name}" from Wishlist.`
                          );
                          setTimeout(() => setCartNotice(null), 3000);
                        }}
                        className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full border flex items-center justify-center transition cursor-pointer ${
                          isFavorited
                            ? 'bg-rose-50 border-rose-200 text-rose-500 shadow-xs'
                            : 'bg-white/90 border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                        }`}
                        aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
                        title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>

                      <Link href={`/product/${product.slug}`} className="block">
                        <div className="w-full aspect-square bg-slate-50/50 rounded-xl p-3 flex items-center justify-center overflow-hidden mb-3 relative">
                          <img
                            src={product.displayImage || product.imageUrls?.[0] || '/dwstore_logo.png'}
                            alt={product.name}
                            className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ${
                              !isInStock ? 'opacity-70 grayscale-[20%]' : ''
                            }`}
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/dwstore_logo.png';
                            }}
                          />
                          {!isInStock && (
                            <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center pointer-events-none">
                              <span className="bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md border border-white/20">
                                Out of Stock
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Brand & Stock Status Badge */}
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                            {product.brand || 'ELECTRONICS'}
                          </span>
                          {isInStock ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/80 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              In Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200/80 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              Out of Stock
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 mb-1.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-[11px] font-bold text-slate-700">5.0</span>
                          <span className="text-[10px] text-slate-400">(Official)</span>
                        </div>

                        <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-blue-600 transition mb-2">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          {discountPercent > 0 && (
                            <span className="text-[10px] text-slate-400 line-through block">
                              LKR {formatPriceLKR(regularPrice)}
                            </span>
                          )}
                          <div className="text-xs font-black text-slate-900">
                            <span className="text-[10px] font-normal text-slate-500 mr-1">From</span>
                            LKR {formatPriceLKR(price)}
                          </div>
                        </div>

                        {isInStock ? (
                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(product, e)}
                            className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition shadow-xs cursor-pointer"
                            aria-label="Add to cart"
                            title="Add to cart"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(product, e)}
                            className="w-8 h-8 rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed flex items-center justify-center"
                            aria-label="Out of stock"
                            title="Currently Out of Stock"
                          >
                            <ShoppingCart className="w-3.5 h-3.5 opacity-40" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    type="button"
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                      currentPage === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default function ShopPage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />
      <Suspense fallback={<div className="page-container py-12 text-center text-sm text-slate-500">Loading catalog...</div>}>
        <ShopContent />
      </Suspense>
      <Footer />
    </main>
  );
}
