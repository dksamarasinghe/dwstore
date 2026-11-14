'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from 'lucide-react';
import initialHomepageData from '@/data/homepage.json';
import { resolveImageUrl } from '@/lib/image';

interface HeroSectionProps {
  initialData?: any;
}

function getPositionClasses(pos?: string): string {
  switch (pos) {
    case 'top-left':
      return 'top-2.5 left-2.5 sm:top-6 sm:left-6';
    case 'top-center':
      return 'top-2.5 left-1/2 -translate-x-1/2 sm:top-6';
    case 'top-right':
      return 'top-2.5 right-2.5 sm:top-6 sm:right-6';
    case 'middle-left':
      return 'top-1/2 -translate-y-1/2 left-2.5 sm:left-6';
    case 'middle-center':
      return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    case 'middle-right':
      return 'top-1/2 -translate-y-1/2 right-2.5 sm:right-6';
    case 'bottom-center':
      return 'bottom-2.5 left-1/2 -translate-x-1/2 sm:bottom-6';
    case 'bottom-right':
      return 'bottom-2.5 right-2.5 sm:bottom-6 sm:right-6';
    case 'bottom-left':
    default:
      return 'bottom-2.5 left-2.5 sm:bottom-6 sm:left-6';
  }
}

export default function HeroSection({ initialData }: HeroSectionProps) {
  const [heroData, setHeroData] = useState(initialData ?? initialHomepageData.hero);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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

  // Auto-slide effect for mainBox when type is slider or slides exist
  const slides = Array.isArray(mainBox.slides) && mainBox.slides.length > 0 ? mainBox.slides : null;

  useEffect(() => {
    if (!slides || slides.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides, isPaused]);

  return (
    <section className="w-full bg-white pt-2 sm:pt-4 pb-4 sm:pb-6">
      <div className="page-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">

          {/* ── Left Hero (8 cols on desktop, full width on mobile) ──── */}
          <div className="lg:col-span-8">
            {slides && slides.length > 0 ? (
              /* Auto-Sliding Banners Carousel */
              <div
                className="relative overflow-hidden rounded-xl sm:rounded-2xl aspect-[16/9] xs:aspect-[18/9] sm:aspect-[21/9] lg:aspect-auto min-h-[160px] xs:min-h-[180px] sm:min-h-[300px] lg:min-h-[440px] flex items-center justify-center bg-slate-900 group shadow-md"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {slides.map((slide: any, idx: number) => {
                  const isActive = idx === currentSlide;
                  return (
                    <div
                      key={slide.id || idx}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                      }`}
                    >
                      {slide.image && (
                        <img
                          src={resolveImageUrl(slide.image, '/media/categories/smartwatches-T800-Ultra-Smart-Watch-1.jpg')}
                          alt={slide.title || `DWstore Hero Banner ${idx + 1}`}
                          className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
                        />
                      )}

                      {/* Optional overlay button positioned at 1 of 9 positions */}
                      {slide.buttonText ? (
                        <div className={`absolute z-20 ${getPositionClasses(slide.buttonPosition)}`}>
                          <Link
                            href={slide.buttonLink || slide.link || '/shop'}
                            className="inline-flex items-center gap-1.5 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] sm:text-sm px-3 sm:px-6 py-1.5 sm:py-3 rounded-lg sm:rounded-xl shadow-lg shadow-black/30 transition group hover:scale-105"
                          >
                            <span>{slide.buttonText}</span>
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition" />
                          </Link>
                        </div>
                      ) : slide.link ? (
                        <Link href={slide.link} className="absolute inset-0 z-10" aria-label={`Banner slide ${idx + 1}`} />
                      ) : null}
                    </div>
                  );
                })}

                {/* Slider Navigation Arrows (visible on hover) */}
                {slides.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition opacity-0 group-hover:opacity-100"
                      onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                      aria-label="Previous Slide"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                    </button>

                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition opacity-0 group-hover:opacity-100"
                      onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                      aria-label="Next Slide"
                    >
                      <ChevronRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                    </button>

                    {/* Dots and Pause Pill Indicator (matching image 4) */}
                    <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-20 flex items-center gap-1 sm:gap-1.5 bg-black/50 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-white/20 scale-90 sm:scale-100 origin-bottom-right">
                      <button
                        type="button"
                        onClick={() => setIsPaused((p) => !p)}
                        className="text-white hover:text-blue-400 p-0.5"
                        title={isPaused ? 'Resume auto-slide' : 'Pause auto-slide'}
                      >
                        {isPaused ? <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <Pause className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                      </button>
                      <div className="w-px h-2.5 sm:h-3 bg-white/30 mx-0.5" />
                      {slides.map((_: any, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          className={`transition-all rounded-full ${
                            idx === currentSlide
                              ? 'w-4 sm:w-6 h-1 sm:h-1.5 bg-white'
                              : 'w-1 sm:w-1.5 h-1 sm:h-1.5 bg-white/50 hover:bg-white/80'
                          }`}
                          onClick={() => setCurrentSlide(idx)}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : mainBox.type === 'banner' ? (
              /* Single Banner Image Mode */
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl aspect-[16/9] xs:aspect-[18/9] sm:aspect-[21/9] lg:aspect-auto min-h-[160px] xs:min-h-[180px] sm:min-h-[300px] lg:min-h-[440px] flex items-center justify-center bg-slate-900 group shadow-md">
                {mainBox.image && (
                  <img
                    src={resolveImageUrl(mainBox.image, '/media/categories/smartwatches-T800-Ultra-Smart-Watch-1.jpg')}
                    alt={mainBox.title || 'Main Hero Banner'}
                    className="w-full h-full object-cover absolute inset-0 rounded-xl sm:rounded-2xl"
                  />
                )}

                {/* Optional overlay button positioned at 1 of 9 positions */}
                {mainBox.buttonText ? (
                  <div className={`absolute z-10 ${getPositionClasses(mainBox.buttonPosition)}`}>
                    <Link
                      href={mainBox.buttonLink || mainBox.link || '/shop'}
                      className="inline-flex items-center gap-1.5 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] sm:text-sm px-3 sm:px-6 py-1.5 sm:py-3 rounded-lg sm:rounded-xl shadow-lg shadow-black/30 transition group hover:scale-105"
                    >
                      <span>{mainBox.buttonText}</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition" />
                    </Link>
                  </div>
                ) : mainBox.link ? (
                  <Link href={mainBox.link} className="absolute inset-0 z-10" aria-label="Hero Banner Link" />
                ) : null}
              </div>
            ) : (
              /* Default Rich Text & Product Showcase */
              <div
                className="relative overflow-hidden rounded-xl sm:rounded-2xl min-h-[280px] sm:min-h-[340px] lg:min-h-[440px] flex"
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
                  <div className="flex flex-col justify-between p-4 sm:p-10 flex-1 min-w-0">
                    <div>
                      {/* Official badge */}
                      <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full text-blue-700 text-[10px] sm:text-xs font-bold mb-2.5 sm:mb-5 shadow-sm">
                        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 flex-shrink-0" />
                        <span>{mainBox.badge || "DWSTORE • SRI LANKA'S TRUSTED TECH STORE"}</span>
                      </div>

                      {/* Headline */}
                      <h1 className="text-xl sm:text-4xl xl:text-5xl font-black text-slate-900 tracking-tight uppercase leading-[1.1] mb-2 sm:mb-4">
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
                      <p className="text-slate-600 text-xs sm:text-base font-medium max-w-sm leading-relaxed line-clamp-2 sm:line-clamp-none">
                        {mainBox.description ||
                          'Direct importer warranties, 100% genuine products & island-wide express cash on delivery. Pay in 3x or 4x installments with KOKO and Payzy.'}
                      </p>

                      {/* Trust badges */}
                      <div className="flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1.5 sm:gap-y-2 mt-2.5 sm:mt-4 text-[11px] sm:text-xs font-semibold text-slate-700">
                        <span className="flex items-center gap-1 sm:gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
                          100% Genuine Tech
                        </span>
                        <span className="flex items-center gap-1 sm:gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                          Island-wide COD
                        </span>
                        <span className="flex items-center gap-1 sm:gap-1.5">
                          <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
                          KOKO &amp; Payzy BNPL
                        </span>
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-8">
                      {mainBox.button1Text && (
                        <Link
                          href={mainBox.button1Link || '/shop'}
                          className="inline-flex items-center gap-1.5 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-md shadow-blue-600/30 transition group"
                        >
                          {mainBox.button1Text}
                          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition" />
                        </Link>
                      )}
                      {mainBox.button2Text && (
                        <Link
                          href={mainBox.button2Link || '/shop'}
                          className="inline-flex items-center bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 transition"
                        >
                          {mainBox.button2Text}
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Image column — featured smartwatch showcase */}
                  <div className="hidden lg:flex items-center justify-center w-80 xl:w-96 p-6 flex-shrink-0">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={resolveImageUrl(mainBox.image, '/media/categories/smartwatches-T800-Ultra-Smart-Watch-1.jpg')}
                        alt={mainBox.title || 'Featured Tech'}
                        className="w-64 xl:w-72 h-auto object-contain drop-shadow-2xl rounded-2xl bg-white/70 p-3 border border-white"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/media/categories/smartwatches-T800-Ultra-Smart-Watch-1.jpg';
                        }}
                      />
                      {mainBox.secondaryImage && (
                        <div className="absolute -bottom-2 left-0 w-28 h-28 bg-white/90 backdrop-blur-md rounded-2xl p-2.5 border border-white shadow-xl hidden xl:block">
                          <img
                            src={resolveImageUrl(mainBox.secondaryImage, '/media/products/RPP2921_5d0c7431.jpg')}
                            alt="Secondary Showcase"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = '/media/products/RPP2921_5d0c7431.jpg';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right Cards: 2 Columns on Mobile (Matching Image 4!), Stacks on Desktop (4 cols) ──── */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-1 lg:flex lg:flex-col lg:gap-4 lg:col-span-4">

            {/* Side Card 1 */}
            {sideBox1.type === 'banner' ? (
              <div className="rounded-xl sm:rounded-2xl overflow-hidden relative flex items-center justify-center min-h-[110px] xs:min-h-[125px] sm:min-h-[175px] lg:min-h-0 lg:flex-1 bg-slate-900 group border border-slate-800/60 shadow-md aspect-[16/10] sm:aspect-auto">
                {sideBox1.image && (
                  <img
                    src={resolveImageUrl(sideBox1.image, '/media/categories/smartwatches-T800-Ultra-Smart-Watch-1.jpg')}
                    alt={sideBox1.title || 'Side Banner 1'}
                    className="w-full h-full object-cover absolute inset-0"
                  />
                )}
                {sideBox1.buttonText ? (
                  <div className={`absolute z-10 ${getPositionClasses(sideBox1.buttonPosition)}`}>
                    <Link
                      href={sideBox1.buttonLink || sideBox1.link || '/shop'}
                      className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] sm:text-xs px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg shadow-md transition group hover:scale-105"
                    >
                      <span>{sideBox1.buttonText}</span>
                      <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition" />
                    </Link>
                  </div>
                ) : sideBox1.link ? (
                  <Link href={sideBox1.link} className="absolute inset-0 z-10" aria-label="Side Banner 1 Link" />
                ) : null}
              </div>
            ) : (
              <Link
                href={sideBox1.link || '/shop'}
                className="rounded-xl sm:rounded-2xl overflow-hidden relative flex flex-col justify-between p-2.5 xs:p-3 sm:p-5 lg:p-6 lg:flex-1 group border border-slate-800/60 shadow-md min-h-[110px] xs:min-h-[125px] sm:min-h-[175px] aspect-[16/10] sm:aspect-auto"
                style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)' }}
              >
                <div className="relative z-10 pr-14 xs:pr-16 sm:pr-24">
                  <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-widest text-blue-400 block mb-0.5">
                    {sideBox1.badge || 'BEST SELLER'}
                  </span>
                  <h3 className="text-xs sm:text-base lg:text-lg font-black text-white group-hover:text-blue-400 transition line-clamp-1 leading-snug">
                    {sideBox1.title || 'Featured Item'}
                  </h3>
                  <p className="text-slate-400 text-[9px] sm:text-xs mt-0.5 max-w-[90px] xs:max-w-[110px] sm:max-w-[170px] line-clamp-1">
                    {sideBox1.subtitle || 'Premium Genuine Tech Product'}
                  </p>
                  {sideBox1.priceText && (
                    <p className="text-[11px] sm:text-sm font-bold text-amber-400 mt-0.5 sm:mt-1">
                      {sideBox1.priceText}
                    </p>
                  )}
                </div>
                <div className="relative z-10 flex items-center text-[10px] sm:text-xs font-bold text-white group-hover:text-blue-300 transition mt-1">
                  <span>{sideBox1.buttonText || 'Order now'}</span>
                  <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ml-1 group-hover:translate-x-1 transition" />
                </div>
                {/* Product image */}
                <div className="absolute right-1 sm:right-2 bottom-1 sm:bottom-2 top-1 sm:top-2 w-14 xs:w-16 sm:w-28 flex items-center justify-end pointer-events-none opacity-85 sm:opacity-100">
                  <img
                    src={resolveImageUrl(sideBox1.image, '/media/categories/smartwatches-T800-Ultra-Smart-Watch-1.jpg')}
                    alt={sideBox1.title || 'Product'}
                    className="w-full h-auto object-contain group-hover:scale-105 transition duration-500 rounded-lg max-h-14 xs:max-h-16 sm:max-h-24"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/media/categories/smartwatches-T800-Ultra-Smart-Watch-1.jpg';
                    }}
                  />
                </div>
              </Link>
            )}

            {/* Side Card 2 */}
            {sideBox2.type === 'banner' ? (
              <div className="rounded-xl sm:rounded-2xl overflow-hidden relative flex items-center justify-center min-h-[110px] xs:min-h-[125px] sm:min-h-[175px] lg:min-h-0 lg:flex-1 bg-slate-700/60 group border border-slate-700/60 shadow-md aspect-[16/10] sm:aspect-auto">
                {sideBox2.image && (
                  <img
                    src={resolveImageUrl(sideBox2.image, '/media/products/RPP2921_5d0c7431.jpg')}
                    alt={sideBox2.title || 'Side Banner 2'}
                    className="w-full h-full object-cover absolute inset-0"
                  />
                )}
                {sideBox2.buttonText ? (
                  <div className={`absolute z-10 ${getPositionClasses(sideBox2.buttonPosition)}`}>
                    <Link
                      href={sideBox2.buttonLink || sideBox2.link || '/shop'}
                      className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] sm:text-xs px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg shadow-md transition group hover:scale-105"
                    >
                      <span>{sideBox2.buttonText}</span>
                      <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition" />
                    </Link>
                  </div>
                ) : sideBox2.link ? (
                  <Link href={sideBox2.link} className="absolute inset-0 z-10" aria-label="Side Banner 2 Link" />
                ) : null}
              </div>
            ) : (
              <Link
                href={sideBox2.link || '/shop'}
                className="rounded-xl sm:rounded-2xl overflow-hidden relative flex flex-col justify-between p-2.5 xs:p-3 sm:p-5 lg:p-6 lg:flex-1 group border border-slate-700/60 shadow-md min-h-[110px] xs:min-h-[125px] sm:min-h-[175px] aspect-[16/10] sm:aspect-auto"
                style={{ background: 'linear-gradient(135deg, #0c1321 0%, #111827 50%, #0c1a2e 100%)' }}
              >
                <div className="relative z-10 pr-14 xs:pr-16 sm:pr-24">
                  <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-widest text-cyan-400 block mb-0.5">
                    {sideBox2.badge || 'SPECIAL OFFER'}
                  </span>
                  <h3 className="text-xs sm:text-base lg:text-lg font-black text-white group-hover:text-cyan-300 transition line-clamp-1 leading-snug">
                    {sideBox2.title || 'Featured Item'}
                  </h3>
                  <p className="text-slate-300 text-[9px] sm:text-xs mt-0.5 max-w-[90px] xs:max-w-[110px] sm:max-w-[170px] line-clamp-1">
                    {sideBox2.subtitle || 'Original Factory Warranty'}
                  </p>
                  {sideBox2.priceText && (
                    <p className="text-[11px] sm:text-sm font-bold text-amber-400 mt-0.5 sm:mt-1">
                      {sideBox2.priceText}
                    </p>
                  )}
                </div>
                <div className="relative z-10 flex items-center text-[10px] sm:text-xs font-bold text-white group-hover:text-cyan-200 transition mt-1">
                  <span>{sideBox2.buttonText || 'Order now'}</span>
                  <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ml-1 group-hover:translate-x-1 transition" />
                </div>
                <div className="absolute right-1 sm:right-2 bottom-1 sm:bottom-2 top-1 sm:top-2 w-14 xs:w-16 sm:w-28 flex items-center justify-end pointer-events-none opacity-85 sm:opacity-100">
                  <img
                    src={resolveImageUrl(sideBox2.image, '/media/products/RPP2921_5d0c7431.jpg')}
                    alt={sideBox2.title || 'Product'}
                    className="w-full h-auto object-contain group-hover:scale-105 transition duration-500 rounded-lg max-h-14 xs:max-h-16 sm:max-h-24"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/media/products/RPP2921_5d0c7431.jpg';
                    }}
                  />
                </div>
              </Link>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}
