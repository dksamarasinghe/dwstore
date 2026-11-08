'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import productsData from '@/data/products.json';
import { formatPriceLKR } from '@/lib/catalog';
import { extractProductSpecs, ExtractedSpecs } from '@/lib/specsExtractor';
import { useCart } from '@/context/CartContext';
import {
  GitCompare,
  ShoppingCart,
  Check,
  X,
  Star,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  SlidersHorizontal,
  Info,
  ShieldCheck,
  Truck,
  CreditCard,
  Cpu,
  Layers,
  ArrowRight,
  Eye,
} from 'lucide-react';

const COMPARE_STORAGE_KEY = 'dwstore_compare_items';
const MAX_COMPARE_ITEMS = 4;

const defaultCompareItems = [
  (productsData as any[]).find((p: any) => p.slug?.includes('t800-ultra')) || productsData[0],
  (productsData as any[]).find((p: any) => p.slug?.includes('hainoteko')) || productsData[4],
  (productsData as any[]).find((p: any) => p.slug?.includes('remax-rpp-292')) || productsData[5],
].filter(Boolean);

export default function ComparePage() {
  const { addToCart } = useCart();

  // Selected products state
  const [compareItems, setCompareItems] = useState<any[]>(defaultCompareItems);
  const [isLoaded, setIsLoaded] = useState(false);

  // Search & Selector Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replacingSlotIndex, setReplacingSlotIndex] = useState<number | null>(null);
  const [modalSearch, setModalSearch] = useState('');
  const [modalCategory, setModalCategory] = useState<string>('all');

  // Comparison Options
  const [highlightDifferences, setHighlightDifferences] = useState(true);
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);
  const [cartNotice, setCartNotice] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(COMPARE_STORAGE_KEY);
      if (stored) {
        const parsedSlugsOrIds: string[] = JSON.parse(stored);
        const matched = parsedSlugsOrIds
          .map((idOrSlug) => (productsData as any[]).find((p: any) => p.id === idOrSlug || p.slug === idOrSlug))
          .filter(Boolean);

        if (matched.length > 0) {
          setCompareItems(matched.slice(0, MAX_COMPARE_ITEMS));
        } else {
          setCompareItems(defaultCompareItems);
        }
      } else {
        setCompareItems(defaultCompareItems);
      }
    } catch (e) {
      setCompareItems(defaultCompareItems);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Persist to localStorage whenever compareItems change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const ids = compareItems.map((item) => item.id);
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(ids));
      window.dispatchEvent(new Event('dwstore_compare_updated'));
    } catch (e) {
      console.error('Failed to save compare items to storage', e);
    }
  }, [compareItems, isLoaded]);

  // Pre-extracted specifications for active products
  const specsList = useMemo(() => {
    return compareItems.map((item) => extractProductSpecs(item));
  }, [compareItems]);

  // Remove single product
  const handleRemoveItem = (index: number) => {
    setCompareItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear all
  const handleClearAll = () => {
    setCompareItems([]);
  };

  // Open modal to add or replace
  const openAddModal = (slotIndex: number | null = null) => {
    setReplacingSlotIndex(slotIndex);
    setModalSearch('');
    setModalCategory('all');
    setIsModalOpen(true);
  };

  // Add / Swap selected product from modal
  const handleSelectProduct = (product: any) => {
    if (replacingSlotIndex !== null) {
      setCompareItems((prev) => {
        const updated = [...prev];
        updated[replacingSlotIndex] = product;
        return updated;
      });
    } else {
      if (compareItems.some((item) => item.id === product.id)) {
        setIsModalOpen(false);
        return;
      }
      if (compareItems.length >= MAX_COMPARE_ITEMS) {
        alert(`You can compare a maximum of ${MAX_COMPARE_ITEMS} products at once.`);
        setIsModalOpen(false);
        return;
      }
      setCompareItems((prev) => [...prev, product]);
    }
    setIsModalOpen(false);
    setReplacingSlotIndex(null);
  };

  // Add to cart with temporary notification
  const handleAddToCart = (product: any) => {
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      priceMinor: product.salePriceMinor || product.minPriceMinor || product.regularPriceMinor || 0,
      image: product.displayImage || product.imageUrls?.[0] || '/dwstore_logo.png',
      quantity: 1,
    });
    setCartNotice(`Added "${product.name}" to cart!`);
    setTimeout(() => setCartNotice(null), 3500);
  };

  // Modal filtered product search
  const filteredModalProducts = useMemo(() => {
    const q = modalSearch.toLowerCase().trim();
    return (productsData as any[]).filter((p: any) => {
      const matchCat =
        modalCategory === 'all' || (p.categorySlugs && p.categorySlugs.includes(modalCategory));
      if (!matchCat) return false;
      if (!q) return true;

      const title = (p.name || '').toLowerCase();
      const brand = (p.brand || '').toLowerCase();
      const sku = (p.sku || '').toLowerCase();
      return title.includes(q) || brand.includes(q) || sku.includes(q);
    });
  }, [modalSearch, modalCategory]);

  // Helper to check if a row has differences across compared items
  const checkHasDifference = (accessor: (specs: ExtractedSpecs) => any) => {
    if (specsList.length <= 1) return false;
    const values = specsList.map((s) => JSON.stringify(accessor(s)));
    return new Set(values).size > 1;
  };

  // Render a spec row with diff highlighting and conditional display
  const renderRow = (
    label: string,
    accessor: (specs: ExtractedSpecs) => React.ReactNode,
    options?: {
      rawValue?: (specs: ExtractedSpecs) => any;
      icon?: React.ReactNode;
      subtext?: string;
    }
  ) => {
    const rawExtractor = options?.rawValue || accessor;
    const isDifferent = checkHasDifference(rawExtractor);

    if (showDifferencesOnly && !isDifferent) {
      return null;
    }

    const rowBg = highlightDifferences && isDifferent ? 'bg-amber-50/70' : 'bg-white';

    return (
      <tr className={`border-b border-slate-100 transition-colors ${rowBg}`}>
        <th className="py-4 px-5 text-left font-bold text-slate-800 bg-slate-50/80 w-52 min-w-[200px] border-r border-slate-200/70 align-top">
          <div className="flex items-center gap-2">
            {options?.icon && <span className="text-blue-600">{options.icon}</span>}
            <span className="text-xs sm:text-sm">{label}</span>
          </div>
          {options?.subtext && <p className="text-[10px] font-normal text-slate-400 mt-0.5">{options.subtext}</p>}
          {highlightDifferences && isDifferent && (
            <span className="inline-block mt-1 text-[9px] font-bold text-amber-700 bg-amber-100/90 px-1.5 py-0.5 rounded">
              Difference
            </span>
          )}
        </th>
        {specsList.map((specs, idx) => (
          <td
            key={specs.id + idx}
            className="py-4 px-5 text-center text-xs sm:text-sm text-slate-700 align-top border-r border-slate-100 last:border-r-0"
          >
            {accessor(specs)}
          </td>
        ))}
        {specsList.length < MAX_COMPARE_ITEMS && (
          <td className="py-4 px-5 bg-slate-50/20 border-r border-slate-100 last:border-r-0" />
        )}
      </tr>
    );
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50/60">
      <Header />

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="page-container text-center max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-bold uppercase tracking-wider mb-3">
            <GitCompare className="w-3.5 h-3.5" /> Side-by-Side Product Comparison
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Compare Products & Additional Information
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl mx-auto leading-relaxed">
            Select any products from our catalog to compare in-depth WooCommerce attributes, color variations,
            battery capacities, technical specifications, and official warranties.
          </p>
        </div>
      </div>

      {/* Floating Cart Notice */}
      {cartNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{cartNotice}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="page-container py-8 sm:py-12 flex-1">
        {/* Top Controls Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-bold text-slate-900">
              Comparing <span className="text-blue-600">{compareItems.length}</span> of {MAX_COMPARE_ITEMS} Products
            </span>
            {compareItems.length > 0 && (
              <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                Real-Time Specs Extracted
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold">
            {/* Highlight Differences Switch */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 hover:text-slate-900">
              <input
                type="checkbox"
                checked={highlightDifferences}
                onChange={(e) => setHighlightDifferences(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <span>Highlight Differences</span>
            </label>

            {/* Show Differences Only */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 hover:text-slate-900">
              <input
                type="checkbox"
                checked={showDifferencesOnly}
                onChange={(e) => setShowDifferencesOnly(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <span>Hide Similarities</span>
            </label>

            {/* Add Product Button */}
            {compareItems.length < MAX_COMPARE_ITEMS && (
              <button
                type="button"
                onClick={() => openAddModal(null)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition flex items-center gap-1.5 font-bold shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
            )}

            {/* Clear All Button */}
            {compareItems.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl transition flex items-center gap-1.5 font-bold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {compareItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center max-w-xl mx-auto shadow-xs my-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <GitCompare className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Products Selected to Compare</h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Select 2 to 4 products from the DWstore catalog to compare their full Additional Information, technical
              specifications, and installment plans side-by-side.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => openAddModal(null)}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Select Products to Compare</span>
              </button>
              <button
                type="button"
                onClick={() => setCompareItems(defaultCompareItems)}
                className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Load Popular Comparison</span>
              </button>
            </div>
          </div>
        ) : (
          /* Responsive Comparison Table Container */
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                {/* Product Header Row */}
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-slate-50/60">
                    <th className="p-5 w-52 min-w-[200px] text-slate-400 font-bold uppercase tracking-wider text-[11px] align-bottom border-r border-slate-200">
                      Product Overview
                    </th>

                    {compareItems.map((item, idx) => {
                      const price = item.salePriceMinor || item.minPriceMinor || item.regularPriceMinor || 0;
                      const regularPrice = item.regularPriceMinor || price;
                      const hasDiscount = regularPrice > price;

                      return (
                        <th
                          key={item.id + idx}
                          className="p-5 min-w-[240px] max-w-[300px] align-top border-r border-slate-200 relative group"
                        >
                          {/* Remove Slot Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
                            title="Remove from comparison"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          {/* Swap / Change Product Button */}
                          <button
                            type="button"
                            onClick={() => openAddModal(idx)}
                            className="absolute top-3 left-3 text-[10px] font-bold text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1 transition cursor-pointer"
                            title="Replace with another product"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Change</span>
                          </button>

                          <div className="flex flex-col items-center text-center mt-6">
                            {/* Product Image */}
                            <Link
                              href={`/product/${item.slug}`}
                              className="w-28 h-28 rounded-2xl bg-white p-2.5 flex items-center justify-center mb-3 border border-slate-200 shadow-xs hover:scale-105 transition"
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

                            {/* Brand Badge */}
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">
                              {item.brand || 'DWSTORE GENUINE'}
                            </span>

                            {/* Product Name */}
                            <Link
                              href={`/product/${item.slug}`}
                              className="font-bold text-slate-900 hover:text-blue-600 line-clamp-2 leading-tight text-xs sm:text-sm mb-2"
                            >
                              {item.name}
                            </Link>

                            {/* Price */}
                            <div className="flex items-baseline gap-2 mb-3">
                              <span className="text-base sm:text-lg font-black text-slate-900">
                                LKR {formatPriceLKR(price)}
                              </span>
                              {hasDiscount && (
                                <span className="text-xs text-slate-400 line-through">
                                  LKR {formatPriceLKR(regularPrice)}
                                </span>
                              )}
                            </div>

                            {/* Add to Cart Button */}
                            <button
                              type="button"
                              onClick={() => handleAddToCart(item)}
                              className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Add to Cart</span>
                            </button>
                          </div>
                        </th>
                      );
                    })}

                    {/* Placeholder Slot to Add Another Product */}
                    {compareItems.length < MAX_COMPARE_ITEMS && (
                      <th className="p-5 min-w-[220px] max-w-[260px] align-middle text-center border-r border-slate-200 bg-slate-50/40">
                        <button
                          type="button"
                          onClick={() => openAddModal(null)}
                          className="w-full h-full min-h-[220px] border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-6 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 transition group cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-white group-hover:bg-blue-50 border border-slate-200 group-hover:border-blue-300 flex items-center justify-center mb-3 shadow-xs transition">
                            <Plus className="w-6 h-6 text-slate-500 group-hover:text-blue-600" />
                          </div>
                          <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600">
                            Add Another Product
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1">
                            Slot {compareItems.length + 1} of {MAX_COMPARE_ITEMS}
                          </span>
                        </button>
                      </th>
                    )}
                  </tr>
                </thead>

                {/* Table Body Divided by In-Depth Spec Categories */}
                <tbody className="divide-y divide-slate-100">
                  {/* ====== SECTION 1: ADDITIONAL INFORMATION (Requested by User) ====== */}
                  <tr className="bg-blue-50/80 border-y border-blue-100">
                    <td
                      colSpan={compareItems.length + 1 + (compareItems.length < MAX_COMPARE_ITEMS ? 1 : 0)}
                      className="py-3 px-5 font-black text-blue-900 uppercase tracking-wider text-[11px] flex items-center gap-2"
                    >
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>Additional Information & WooCommerce Attributes</span>
                    </td>
                  </tr>

                  {/* Colors */}
                  {renderRow(
                    'Color Variations',
                    (s) => (
                      <div className="flex flex-wrap items-center justify-center gap-1.5">
                        {s.colors.map((c, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    ),
                    {
                      rawValue: (s) => s.colors.join(','),
                      subtext: 'Attribute: Color',
                    }
                  )}

                  {/* Model */}
                  {renderRow('Model / Series', (s) => <span className="font-semibold">{s.model}</span>, {
                    rawValue: (s) => s.model,
                    subtext: 'Attribute: Modle / Series',
                  })}

                  {/* Device Form Factor / Type */}
                  {renderRow('Device Type', (s) => <span className="font-medium text-slate-800">{s.type}</span>, {
                    rawValue: (s) => s.type,
                    subtext: 'Attribute: Type',
                  })}

                  {/* Capacity / Storage */}
                  {renderRow(
                    'Capacity / Battery',
                    (s) => (
                      <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-xs">
                        {s.capacity}
                      </span>
                    ),
                    {
                      rawValue: (s) => s.capacity,
                      subtext: 'Attribute: Capacity (mAh / GB)',
                    }
                  )}

                  {/* Cable / Ports */}
                  {renderRow('Cable / Interface', (s) => <span>{s.cable}</span>, {
                    rawValue: (s) => s.cable,
                    subtext: 'Attribute: Cable / Port',
                  })}

                  {/* Microphone */}
                  {renderRow('Microphone / Audio', (s) => <span>{s.microphone}</span>, {
                    rawValue: (s) => s.microphone,
                    subtext: 'Attribute: Microphone',
                  })}

                  {/* Variations Count */}
                  {renderRow(
                    'SKU Variations',
                    (s) => (
                      <span className="font-medium">
                        {s.variationsCount > 0 ? `${s.variationsCount} Available Options` : 'Single Item SKU'}
                      </span>
                    ),
                    {
                      rawValue: (s) => s.variationsCount,
                    }
                  )}

                  {/* ====== SECTION 2: TECHNICAL SPECIFICATIONS & HARDWARE ====== */}
                  <tr className="bg-slate-100/80 border-y border-slate-200">
                    <td
                      colSpan={compareItems.length + 1 + (compareItems.length < MAX_COMPARE_ITEMS ? 1 : 0)}
                      className="py-3 px-5 font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2"
                    >
                      <Cpu className="w-4 h-4 text-indigo-600" />
                      <span>Technical Specifications & Hardware</span>
                    </td>
                  </tr>

                  {/* Display & Screen */}
                  {renderRow('Display & Screen', (s) => <span className="font-medium">{s.displayScreen}</span>, {
                    rawValue: (s) => s.displayScreen,
                  })}

                  {/* Battery & Standby */}
                  {renderRow('Battery & Standby', (s) => <span>{s.batteryLife}</span>, {
                    rawValue: (s) => s.batteryLife,
                  })}

                  {/* Charging Mode */}
                  {renderRow(
                    'Charging Mode',
                    (s) => (
                      <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
                        {s.chargingMode}
                      </span>
                    ),
                    {
                      rawValue: (s) => s.chargingMode,
                    }
                  )}

                  {/* Bluetooth / Connectivity */}
                  {renderRow(
                    'Connectivity',
                    (s) => <span className="font-semibold text-slate-800">{s.bluetoothConnectivity}</span>,
                    {
                      rawValue: (s) => s.bluetoothConnectivity,
                    }
                  )}

                  {/* Waterproof Protection */}
                  {renderRow(
                    'Water Resistance',
                    (s) => (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                        {s.waterResistance}
                      </span>
                    ),
                    {
                      rawValue: (s) => s.waterResistance,
                    }
                  )}

                  {/* Enclosure & Material */}
                  {renderRow('Build & Materials', (s) => <span className="text-slate-600">{s.buildMaterial}</span>, {
                    rawValue: (s) => s.buildMaterial,
                  })}

                  {/* App Compatibility */}
                  {renderRow('Mobile App Support', (s) => <span className="font-medium">{s.appCompatibility}</span>, {
                    rawValue: (s) => s.appCompatibility,
                  })}

                  {/* Sensors & Functions */}
                  {renderRow(
                    'Sensors & Functions',
                    (s) => <span className="text-xs text-slate-600">{s.sensorFunctions}</span>,
                    {
                      rawValue: (s) => s.sensorFunctions,
                    }
                  )}

                  {/* Key Highlights */}
                  {renderRow(
                    'Key Highlights',
                    (s) => (
                      <p className="text-[11px] text-slate-600 leading-snug line-clamp-3 text-left max-w-xs mx-auto">
                        {s.keyFeatures}
                      </p>
                    ),
                    {
                      rawValue: (s) => s.keyFeatures,
                    }
                  )}

                  {/* ====== SECTION 3: PRICING, INSTALLMENTS & SERVICES ====== */}
                  <tr className="bg-slate-100/80 border-y border-slate-200">
                    <td
                      colSpan={compareItems.length + 1 + (compareItems.length < MAX_COMPARE_ITEMS ? 1 : 0)}
                      className="py-3 px-5 font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span>Pricing, Installments & DWstore Warranty</span>
                    </td>
                  </tr>

                  {/* Official Price */}
                  {renderRow(
                    'Best Cash Price',
                    (s) => (
                      <span className="text-sm font-black text-slate-900">
                        LKR {formatPriceLKR(s.salePriceMinor)}
                      </span>
                    ),
                    {
                      rawValue: (s) => s.salePriceMinor,
                    }
                  )}

                  {/* KOKO 3x Installments */}
                  {renderRow(
                    'KOKO (3x Installments)',
                    (s) => (
                      <span className="font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-lg">
                        3x LKR {formatPriceLKR(s.kokoInstallmentMinor)}/mo
                      </span>
                    ),
                    {
                      rawValue: (s) => s.kokoInstallmentMinor,
                      subtext: 'Formula: (Price × 1.10) / 3',
                    }
                  )}

                  {/* Payzy 4x Installments */}
                  {renderRow(
                    'Payzy (4x Installments)',
                    (s) => (
                      <span className="font-bold text-pink-700 bg-pink-50 px-2 py-1 rounded-lg">
                        4x LKR {formatPriceLKR(s.payzyInstallmentMinor)}/mo
                      </span>
                    ),
                    {
                      rawValue: (s) => s.payzyInstallmentMinor,
                      subtext: 'Formula: (Price × 1.13) / 4',
                    }
                  )}

                  {/* Stock Availability */}
                  {renderRow(
                    'Stock & Availability',
                    (s) => (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> {s.stockText}
                      </span>
                    ),
                    {
                      rawValue: (s) => s.stockText,
                    }
                  )}

                  {/* Warranty */}
                  {renderRow(
                    'Warranty Protection',
                    (s) => (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {s.warranty}
                      </span>
                    ),
                    {
                      rawValue: (s) => s.warranty,
                    }
                  )}

                  {/* Cash on Delivery */}
                  {renderRow(
                    'Cash on Delivery',
                    (s) => (
                      <span className="inline-flex items-center gap-1 text-slate-800 font-semibold">
                        <Truck className="w-3.5 h-3.5 text-blue-600" /> {s.cashOnDelivery}
                      </span>
                    ),
                    {
                      rawValue: (s) => s.cashOnDelivery,
                    }
                  )}

                  {/* Delivery Estimate */}
                  {renderRow('Island-Wide Delivery', (s) => <span>{s.deliverySpeed}</span>, {
                    rawValue: (s) => s.deliverySpeed,
                  })}

                  {/* Customer Rating */}
                  {renderRow(
                    'Customer Rating',
                    (s) => (
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-800">{s.rating}</span>
                        <span className="text-[10px] text-slate-400">(Verified DWstore Reviews)</span>
                      </div>
                    ),
                    {
                      rawValue: (s) => s.rating,
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* Search & Select Product Modal                            */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {replacingSlotIndex !== null ? 'Replace Product Slot' : 'Add Product to Compare'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Search across 407+ genuine products to compare Additional Information & specs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search and Category Filters */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="Search by product name, brand (e.g. Aspor, Remax, Haino Teko), or model..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  autoFocus
                />
                {modalSearch && (
                  <button
                    type="button"
                    onClick={() => setModalSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
                {[
                  { id: 'all', label: 'All Products' },
                  { id: 'smartwatches', label: 'Smart Watches' },
                  { id: 'headphone-and-headset', label: 'Headphones' },
                  { id: 'power-banks', label: 'Power Banks' },
                  { id: 'bluetooth-speakers', label: 'Speakers' },
                  { id: 'cable-and-adaptors', label: 'Cables & Chargers' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setModalCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer ${
                      modalCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-100">
              {filteredModalProducts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs sm:text-sm">
                  No products found matching &ldquo;{modalSearch}&rdquo; in this category.
                </div>
              ) : (
                filteredModalProducts.slice(0, 50).map((product: any) => {
                  const isAlreadySelected = compareItems.some((item) => item.id === product.id);
                  const price = product.salePriceMinor || product.minPriceMinor || product.regularPriceMinor || 0;

                  return (
                    <div
                      key={product.id}
                      className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 hover:bg-blue-50/40 p-2 rounded-2xl transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 p-1 flex-shrink-0 flex items-center justify-center">
                          <img
                            src={product.displayImage || product.imageUrls?.[0] || '/dwstore_logo.png'}
                            alt={product.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/dwstore_logo.png';
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-blue-600 uppercase block">
                            {product.brand || 'DWSTORE'}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {product.name}
                          </h4>
                          <span className="text-xs font-black text-slate-800">
                            LKR {formatPriceLKR(price)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isAlreadySelected}
                        onClick={() => handleSelectProduct(product)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                          isAlreadySelected
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        }`}
                      >
                        {isAlreadySelected ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>In Compare</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Select</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Showing up to 50 matching items</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
