'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { resolveImageUrl } from '@/lib/image';

export interface BentoBoxItem {
  id: string;
  categorySlug?: string;
  badge?: string;
  title: string;
  description?: string;
  subtitle?: string;
  buttonText?: string;
  link?: string;
  image?: string;
}

const DEFAULT_BOXES: BentoBoxItem[] = [
  {
    id: 'box1',
    categorySlug: 'headphone-and-headset',
    badge: 'STUDIO & WIRELESS',
    title: 'Headphones & Earbuds',
    description: 'Over-Ear Headsets, TWS Noise Cancelling & Wireless Earphones',
    subtitle: '',
    buttonText: 'Explore Headphones',
    link: '/category/headphone-and-headset',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'box2',
    categorySlug: 'smartwatches',
    badge: 'WEARABLE TECH',
    title: 'Smart Watches',
    description: 'AMOLED Displays, Bluetooth Calling, Heart Rate & Fitness Sensors',
    subtitle: '',
    buttonText: 'Explore Smartwatches',
    link: '/category/smartwatches',
    image: 'https://www.dwstore.lk/wp-content/uploads/2024/10/T800-Ultra-Smart-Watch-1.jpg',
  },
  {
    id: 'box3',
    categorySlug: 'bluetooth-speakers',
    badge: 'HI-FI SOUND',
    title: 'Speakers',
    description: 'Wireless Bluetooth & Extra Bass',
    subtitle: '55+ Models',
    buttonText: 'Shop Speakers',
    link: '/category/bluetooth-speakers',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'box4',
    categorySlug: 'power-banks',
    badge: 'FAST CHARGE',
    title: 'PowerBanks',
    description: '10000mAh – 30000mAh 22.5W PD',
    subtitle: '32+ Models',
    buttonText: 'Shop PowerBanks',
    link: '/category/power-banks',
    image: 'https://www.dwstore.lk/wp-content/uploads/2024/10/1.jpg',
  },
  {
    id: 'box5',
    categorySlug: 'phone-accessories',
    badge: 'DAILY ESSENTIALS',
    title: 'Phone Accessories',
    description: 'Fast Wall Chargers, Type-C Cables, 9H Tempered Glass & Car Phone Mounts.',
    subtitle: '140+ Certified Accessories',
    buttonText: 'Explore Phone Accessories',
    link: '/category/phone-accessories',
    image: 'https://www.dwstore.lk/wp-content/uploads/2024/10/UIYMHe1d4e6137a474dab9a387743d627bef1H.jpg',
  },
];

interface BentoPromoProps {
  initialConfig?: {
    enabled?: boolean;
    boxes?: BentoBoxItem[];
  };
}

export default function BentoPromo({ initialConfig }: BentoPromoProps) {
  const [config, setConfig] = useState(initialConfig);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
      return;
    }

    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/homepage?t=' + Date.now(), { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data?.config?.bentoGrid) {
            setConfig(data.config.bentoGrid);
          }
        }
      } catch {}
    };

    fetchConfig();
  }, [initialConfig]);

  if (config?.enabled === false) return null;

  const boxes = config?.boxes && config.boxes.length >= 5 ? config.boxes : DEFAULT_BOXES;
  const box1 = boxes[0] || DEFAULT_BOXES[0];
  const box2 = boxes[1] || DEFAULT_BOXES[1];
  const box3 = boxes[2] || DEFAULT_BOXES[2];
  const box4 = boxes[3] || DEFAULT_BOXES[3];
  const box5 = boxes[4] || DEFAULT_BOXES[4];

  return (
    <section className="w-full bg-white py-8">
      <div className="page-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">

          {/* Box 1: Left Card (3 cols) */}
          <Link
            href={box1.link || '/category/headphone-and-headset'}
            className="lg:col-span-3 min-h-[380px] rounded-2xl text-white p-7 flex flex-col justify-between relative overflow-hidden group border border-stone-800 shadow-md"
            style={{ background: 'linear-gradient(180deg, #1c1917 0%, #0c0a09 100%)' }}
          >
            <div className="relative z-10">
              {box1.badge && (
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block mb-2">
                  {box1.badge}
                </span>
              )}
              <h3 className="text-2xl font-black uppercase tracking-tight text-white leading-tight">
                {box1.title}
              </h3>
              {box1.description && (
                <p className="text-xs text-stone-300 mt-2 font-medium">
                  {box1.description}
                </p>
              )}
              {box1.subtitle && (
                <p className="text-xs font-bold text-amber-400 mt-2">{box1.subtitle}</p>
              )}
            </div>
            <div className="relative z-10 flex items-center text-xs font-bold text-amber-400 group-hover:text-amber-300 transition">
              {box1.buttonText || 'Explore Category'} <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition" />
            </div>
            <div className="absolute inset-x-0 bottom-0 top-32 flex items-end justify-center pb-4 pointer-events-none">
              <img
                src={resolveImageUrl(box1.image, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80')}
                alt={box1.title}
                className="h-48 object-contain group-hover:scale-105 transition duration-500 drop-shadow-2xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80';
                }}
              />
            </div>
          </Link>

          {/* Box 2: Middle Card (3 cols) */}
          <Link
            href={box2.link || '/category/smartwatches'}
            className="lg:col-span-3 min-h-[380px] rounded-2xl text-white p-7 flex flex-col justify-between relative overflow-hidden group border border-stone-800 shadow-md"
            style={{ background: 'linear-gradient(180deg, #1a1210 0%, #0d0b09 100%)' }}
          >
            <div className="relative z-10">
              {box2.badge && (
                <span className="text-[10px] uppercase font-bold tracking-widest text-orange-300 block mb-2">
                  {box2.badge}
                </span>
              )}
              <h3 className="text-2xl font-black tracking-tight text-white leading-tight">
                {box2.title}
              </h3>
              {box2.description && (
                <p className="text-xs text-stone-300 mt-2 font-medium">
                  {box2.description}
                </p>
              )}
              {box2.subtitle && (
                <p className="text-xs font-bold text-orange-300 mt-2">{box2.subtitle}</p>
              )}
            </div>
            <div className="relative z-10 flex items-center text-xs font-bold text-orange-300 group-hover:text-orange-200 transition">
              {box2.buttonText || 'Explore Category'} <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition" />
            </div>
            <div className="absolute inset-x-0 bottom-0 top-32 flex items-end justify-center pb-4 pointer-events-none">
              <img
                src={resolveImageUrl(box2.image, '/media/products/T800-Ultra-Smart-Watch-1_d7ac6b08.jpg')}
                alt={box2.title}
                className="h-48 object-contain group-hover:scale-105 transition duration-500 drop-shadow-2xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/media/products/T800-Ultra-Smart-Watch-1_d7ac6b08.jpg';
                }}
              />
            </div>
          </Link>

          {/* Right Stack (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Top Row: 2 cards (Box 3 & Box 4) */}
            <div className="grid grid-cols-2 gap-4 flex-1">
              {/* Box 3: Small Card 1 (Speakers) */}
              <Link
                href={box3.link || '/category/bluetooth-speakers'}
                className="rounded-2xl text-white p-5 flex flex-col justify-between relative overflow-hidden group border border-neutral-800 shadow-md min-h-[180px]"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}
              >
                <div className="relative z-10">
                  {box3.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 block mb-1">
                      {box3.badge}
                    </span>
                  )}
                  <h4 className="text-base font-black text-white group-hover:text-blue-400 transition">
                    {box3.title}
                  </h4>
                  {box3.description && (
                    <p className="text-[11px] text-neutral-400 mt-1 max-w-[130px]">
                      {box3.description}
                    </p>
                  )}
                  {box3.subtitle && (
                    <p className="text-xs font-bold text-blue-400 mt-1">{box3.subtitle}</p>
                  )}
                </div>
                <div className="relative z-10 flex items-center text-xs font-bold text-blue-400 mt-2">
                  {box3.buttonText || 'Shop Now'} <ArrowRight className="w-3 h-3 ml-1" />
                </div>
                <div className="absolute right-0 bottom-0 w-28 h-28 flex items-end justify-end pointer-events-none p-2">
                  <img
                    src={resolveImageUrl(box3.image, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=240&auto=format&fit=crop&q=80')}
                    alt={box3.title}
                    className="h-full object-contain group-hover:scale-105 transition duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=240&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
              </Link>

              {/* Box 4: Small Card 2 (PowerBanks) */}
              <Link
                href={box4.link || '/category/power-banks'}
                className="rounded-2xl text-white p-5 flex flex-col justify-between relative overflow-hidden group border border-neutral-800 shadow-md min-h-[180px]"
                style={{ background: 'linear-gradient(135deg, #0a1a0e 0%, #0f2d0e 100%)' }}
              >
                <div className="relative z-10">
                  {box4.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block mb-1">
                      {box4.badge}
                    </span>
                  )}
                  <h4 className="text-base font-black text-white group-hover:text-emerald-400 transition">
                    {box4.title}
                  </h4>
                  {box4.description && (
                    <p className="text-[11px] text-neutral-400 mt-1 max-w-[130px]">
                      {box4.description}
                    </p>
                  )}
                  {box4.subtitle && (
                    <p className="text-xs font-bold text-emerald-400 mt-1">{box4.subtitle}</p>
                  )}
                </div>
                <div className="relative z-10 flex items-center text-xs font-bold text-emerald-400 mt-2">
                  {box4.buttonText || 'Shop Now'} <ArrowRight className="w-3 h-3 ml-1" />
                </div>
                <div className="absolute right-0 bottom-0 w-28 h-28 flex items-end justify-end pointer-events-none p-2">
                  <img
                    src={resolveImageUrl(box4.image, '/media/products/RPP2921_5d0c7431.jpg')}
                    alt={box4.title}
                    className="h-full object-contain group-hover:scale-105 transition duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/media/products/RPP2921_5d0c7431.jpg';
                    }}
                  />
                </div>
              </Link>
            </div>

            {/* Box 5: Bottom Wide Card (Phone Accessories) */}
            <Link
              href={box5.link || '/category/phone-accessories'}
              className="rounded-2xl text-white p-6 flex flex-col justify-between relative overflow-hidden group border border-emerald-900/40 shadow-md min-h-[168px]"
              style={{ background: 'linear-gradient(90deg, #052e16 0%, #0f172a 60%, #000000 100%)' }}
            >
              <div className="relative z-10 max-w-xs">
                {box5.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block mb-1">
                    {box5.badge}
                  </span>
                )}
                <h4 className="text-xl sm:text-2xl font-black text-white group-hover:text-emerald-400 transition uppercase">
                  {box5.title}
                </h4>
                {box5.description && (
                  <p className="text-xs text-neutral-300 mt-1.5">
                    {box5.description}
                  </p>
                )}
                {box5.subtitle && (
                  <p className="text-xs font-bold text-emerald-400 mt-2">
                    {box5.subtitle}
                  </p>
                )}
              </div>
              <div className="relative z-10 pt-3 flex items-center text-xs font-bold text-emerald-400 group-hover:text-emerald-300 transition">
                {box5.buttonText || 'Explore Accessories'} <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition" />
              </div>
              <div className="absolute right-4 bottom-0 top-0 w-40 flex items-center justify-end pointer-events-none">
                <img
                  src={resolveImageUrl(box5.image, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=280&auto=format&fit=crop&q=80')}
                  alt={box5.title}
                  className="h-36 object-contain group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=280&auto=format&fit=crop&q=80';
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
