'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import brandsData from '@/data/brands.json';
import { Search, Sparkles, ChevronRight, Tag } from 'lucide-react';

export default function BrandsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBrands = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return (brandsData as any[])
      .filter((b) => b.productCount > 0)
      .filter((b) => !q || b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [searchTerm]);

  // Group brands by initial letter
  const groupedBrands = useMemo(() => {
    const map: Record<string, any[]> = {};
    filteredBrands.forEach((b) => {
      const first = (b.name[0] || '#').toUpperCase();
      const key = /[A-Z]/.test(first) ? first : '#';
      if (!map[key]) map[key] = [];
      map[key].push(b);
    });
    return map;
  }, [filteredBrands]);

  const letters = Object.keys(groupedBrands).sort();

  return (
    <main className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-12">
        <div className="page-container text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300 block mb-2">
            Official Brand Directory
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Explore 56+ Genuine Brands at DWstore
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Browse genuine imported electronic brands backed by DWstore checking warranty and island-wide delivery.
          </p>

          {/* Search Bar */}
          <div className="mt-6 max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search brand (e.g. Aspor, Remax, LDNIO, JBL, Kingston)..."
              className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 rounded-2xl text-xs sm:text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Brands Grid Content */}
      <div className="page-container py-10 flex-1">
        {filteredBrands.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto shadow-xs">
            <p className="text-sm text-slate-500">No brands found matching &ldquo;{searchTerm}&rdquo;.</p>
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {letters.map((letter) => (
              <div key={letter} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
                  <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 font-black text-base flex items-center justify-center">
                    {letter}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {groupedBrands[letter].length} Brands Available
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {groupedBrands[letter].map((b) => (
                    <Link
                      key={b.slug}
                      href={`/shop?brand=${b.slug}`}
                      className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-200 transition group flex flex-col justify-between"
                    >
                      <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 truncate block">
                        {b.name}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 mt-2 block">
                        {b.productCount} Products
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
