'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { resolveImageUrl } from '@/lib/image';

interface EntryPopupConfig {
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  image?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonAlignment?: 'left' | 'center' | 'right';
  buttonColor?: string;
}

interface EntryPopupBannerProps {
  initialConfig?: EntryPopupConfig;
}

export default function EntryPopupBanner({ initialConfig }: EntryPopupBannerProps) {
  const [config, setConfig] = useState<EntryPopupConfig | undefined>(initialConfig);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (initialConfig !== undefined) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  useEffect(() => {
    // 1. Fetch live config from API
    fetch('/api/homepage?t=' + Date.now(), { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.config?.entryPopup) {
          setConfig(data.config.entryPopup);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!config || config.enabled === false) {
      setIsOpen(false);
      return;
    }

    // Check if dismissed in this session
    try {
      const dismissed = sessionStorage.getItem('dwstore_entry_popup_dismissed');
      if (dismissed === 'true') {
        return;
      }
    } catch {}

    // Show after subtle 600ms entrance delay
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [config]);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('dwstore_entry_popup_dismissed', 'true');
    } catch {}
  };

  if (!isOpen || !config || config.enabled === false) {
    return null;
  }

  const title = config.title || 'Clearance sale';
  const subtitle = config.subtitle || 'Up to 70% OFF\nSelected tech & accessories · While stocks last';
  const image = config.image || '/media/home-customizer/clearance-sale.png';
  const buttonText = config.buttonText || 'Browse Deals';
  const buttonLink = config.buttonLink || '/shop';
  const buttonAlignment = config.buttonAlignment || 'center';

  const alignmentClasses = {
    left: 'justify-start text-left',
    center: 'justify-center text-center',
    right: 'justify-end text-right',
  }[buttonAlignment] || 'justify-center text-center';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-[420px] sm:max-w-[460px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon / Banner */}
        <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white px-6 pt-5 pb-4 text-center">
          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 flex items-center justify-center transition shadow-xs cursor-pointer z-20"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white drop-shadow-xs">
            {title}
          </h3>

          {/* Subtitle Pill / Box */}
          {subtitle && (
            <div className="mt-2.5 mx-auto max-w-[340px] bg-white text-slate-800 rounded-xl p-2.5 shadow-sm border border-blue-200/40">
              {subtitle.split('\n').map((line, idx) => (
                <p
                  key={idx}
                  className={idx === 0 ? 'text-xs sm:text-sm font-black text-blue-700 uppercase tracking-wide' : 'text-[11px] text-slate-500 font-medium mt-0.5'}
                >
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Promo Image Container */}
        {image && (
          <div className="relative w-full bg-radial from-blue-50/50 via-white to-slate-50 px-4 py-2 flex items-center justify-center min-h-[160px] sm:min-h-[200px] overflow-hidden">
            <img
              src={resolveImageUrl(image)}
              alt={title}
              className="max-h-[180px] sm:max-h-[220px] w-auto object-contain drop-shadow-lg transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Actions Section with Alignment Selector */}
        <div className="p-5 sm:p-6 bg-white space-y-3">
          <div className={`flex w-full ${alignmentClasses}`}>
            <Link
              href={buttonLink}
              onClick={handleClose}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-black text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-amber-500/25 transition duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleClose}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
