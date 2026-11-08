'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import initialHomepageData from '@/data/homepage.json';

interface HeroSectionProps {
  initialData?: any;
}

export default function HeroSection({ initialData }: HeroSectionProps) {
  const [heroData, setHeroData] = useState(initialData ?? initialHomepageData.hero);

  useEffect(() => {
    // Fetch live config from API to reflect instant admin saves without rebuild
    fetch('/api/homepage?t=' + Date.now(), { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.config?.hero) {
          setHeroData(data.config.hero);
        }
      })
      .catch(() => {});
  }, []);

  const mainBox = heroData?.mainBox || initialHomepageData.hero.mainBox;
  const sideBox1 = heroData?.sideBox1 || initialHomepageData.hero.sideBox1;
  const sideBox2 = heroData?.sideBox2 || initialHomepageData.hero.sideBox2;

  return (
    <section className="w-full bg-white pt-4 pb-6">
      <div className="page-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* ── Left Hero (8 cols) ───────────────────────────────────── */}
          <div className="lg:col-span-8">
            <div
              className="relative overflow-hidden rounded-2xl min-h-[380px] lg:min-h-[440px] flex"
              style={{
                background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 40%, #dbeafe 100%)',
              }}
            >
              {/* Subtle dot-grid overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(#3b82f6 1px, transparent 1px)',
                  backgroundSize: '22px 22px',
                  opacity: 0.12,
                }}
              />

              {/* Glow blobs */}
              <div className="absolute -top-16 -right-16 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-400/15 rounded-full blur-2xl pointer-events-none" />

              {/* Content grid: text left, image right */}
              <div className="relative z-10 flex flex-col lg:flex-row w-full">

                {/* Text column */}
                <div className="flex flex-col justify-between p-7 sm:p-10 flex-1 min-w-0">
                  {/* Top */}
                  <div>
                    {/* Official badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full text-blue-700 text-xs font-bold mb-5 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span>{mainBox.badge || "DWSTORE • SRI LANKA'S TRUSTED TECH STORE"}</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-slate-900 tracking-tight uppercase leading-[1.08] mb-4">
                      {mainBox.title ? (
                        mainBox.title
                      ) : (
                        <>
                          PREMIUM TECH, <br />
                          <span className="text-blue-600">SMARTWATCHES</span>
                          <br />
                          &amp; ACCESSORIES
                        </>
                      )}
                    </h1>

                    {/* Sub-text */}
                    <p className="text-slate-600 text-sm sm:text-base font-medium max-w-sm leading-relaxed">
                      {mainBox.description ||
                        'Direct importer warranties, 100% genuine products & island-wide express cash on delivery. Pay in 3x or 4x installments with KOKO and Payzy.'}
                    </p>

                    {/* Trust badges */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        100% Genuine Tech
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        Island-wide COD
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        KOKO &amp; Payzy BNPL
                      </span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap gap-3 mt-8">
                    {mainBox.button1Text && (
                      <Link
                        href={mainBox.button1Link || '/shop'}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md shadow-blue-600/30 transition group"
                      >
                        {mainBox.button1Text}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                      </Link>
                    )}
                    {mainBox.button2Text && (
                      <Link
                        href={mainBox.button2Link || '/shop'}
                        className="inline-flex items-center bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm px-6 py-3 rounded-xl border border-slate-200 transition"
                      >
                        {mainBox.button2Text}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Image column — featured smartwatch showcase */}
                <div className="hidden lg:flex items-center justify-center w-80 xl:w-96 p-6 flex-shrink-0">
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Main Featured Image */}
                    <img
                      src={
                        mainBox.image ||
                        'https://www.dwstore.lk/wp-content/uploads/2024/10/T800-Ultra-Smart-Watch-1.jpg'
                      }
                      alt={mainBox.title || 'Featured Tech'}
                      className="w-64 xl:w-72 h-auto object-contain drop-shadow-2xl rounded-2xl bg-white/70 p-3 border border-white"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&auto=format&fit=crop&q=80';
                      }}
                    />
                    {/* Floating secondary badge chip */}
                    {mainBox.secondaryImage && (
                      <div className="absolute -bottom-2 left-0 w-28 h-28 bg-white/90 backdrop-blur-md rounded-2xl p-2.5 border border-white shadow-xl hidden xl:block">
                        <img
                          src={mainBox.secondaryImage}
                          alt="Secondary Showcase"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=160&auto=format&fit=crop&q=80';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Cards (4 cols) ──────────────────────────────────── */}
          <div className="lg:col-span-4 flex flex-col gap-4">

            {/* Card 1 */}
            <Link
              href={sideBox1.link || '/shop'}
              className="flex-1 rounded-2xl overflow-hidden relative flex flex-col justify-between p-6 group border border-slate-800/60 shadow-md min-h-[195px]"
              style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)' }}
            >
              <div className="relative z-10">
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 block mb-1">
                  {sideBox1.badge || 'BEST SELLER'}
                </span>
                <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition">
                  {sideBox1.title || 'Featured Item'}
                </h3>
                <p className="text-slate-400 text-xs mt-1 max-w-[170px] line-clamp-2">
                  {sideBox1.subtitle || 'Premium Genuine Tech Product'}
                </p>
                {sideBox1.priceText && (
                  <p className="text-sm font-bold text-amber-400 mt-2">
                    {sideBox1.priceText}
                  </p>
                )}
              </div>
              <div className="relative z-10 flex items-center text-xs font-bold text-white group-hover:text-blue-300 transition mt-2">
                <span>{sideBox1.buttonText || 'Order now'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
              </div>
              {/* Product image */}
              <div className="absolute right-2 bottom-0 top-0 w-36 flex items-center justify-end p-2 pointer-events-none">
                <img
                  src={
                    sideBox1.image ||
                    'https://www.dwstore.lk/wp-content/uploads/2024/10/T800-Ultra-Smart-Watch-1.jpg'
                  }
                  alt={sideBox1.title || 'Product'}
                  className="w-full h-auto object-contain group-hover:scale-105 transition duration-500 rounded-lg max-h-36"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
            </Link>

            {/* Card 2 */}
            <Link
              href={sideBox2.link || '/shop'}
              className="flex-1 rounded-2xl overflow-hidden relative flex flex-col justify-between p-6 group border border-slate-700/60 shadow-md min-h-[195px]"
              style={{ background: 'linear-gradient(135deg, #0c1321 0%, #111827 50%, #0c1a2e 100%)' }}
            >
              <div className="relative z-10">
                <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 block mb-1">
                  {sideBox2.badge || 'SPECIAL OFFER'}
                </span>
                <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition">
                  {sideBox2.title || 'Featured Item'}
                </h3>
                <p className="text-slate-300 text-xs mt-1 max-w-[170px] line-clamp-2">
                  {sideBox2.subtitle || 'Original Factory Warranty'}
                </p>
                {sideBox2.priceText && (
                  <p className="text-sm font-bold text-amber-400 mt-2">
                    {sideBox2.priceText}
                  </p>
                )}
              </div>
              <div className="relative z-10 flex items-center text-xs font-bold text-white group-hover:text-cyan-200 transition mt-2">
                <span>{sideBox2.buttonText || 'Order now'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
              </div>
              <div className="absolute right-2 bottom-0 top-0 w-36 flex items-center justify-end p-2 pointer-events-none">
                <img
                  src={
                    sideBox2.image ||
                    'https://www.dwstore.lk/wp-content/uploads/2024/10/RPP2921.jpg'
                  }
                  alt={sideBox2.title || 'Product'}
                  className="w-full h-auto object-contain group-hover:scale-105 transition duration-500 rounded-lg max-h-36"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=200&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}
