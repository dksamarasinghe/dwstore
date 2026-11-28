'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, CreditCard, RotateCcw, Truck, MapPin, CheckCircle2 } from 'lucide-react';

interface Props {
  slug: string;
  categoryName: string;
}

interface SeoArticle {
  title: string;
  paragraphs: string[];
  features: string[];
  faqs?: { q: string; a: string }[];
}

const SEO_CONTENT: Record<string, SeoArticle> = {
  'phone-accessories': {
    title: 'Buy Original Phone Accessories Online at Best Prices in Sri Lanka',
    paragraphs: [
      'Welcome to DWstore.lk, your premier destination for genuine smartphone accessories in Sri Lanka. Whether you are looking for fast-charging USB-C and Lightning cables, GaN wall chargers, MagSafe wireless chargers, heavy-duty protective cases, or 9D tempered glass screen protectors, we offer a comprehensive catalog of 140+ premium accessories compatible with Apple iPhone, Samsung Galaxy, Xiaomi, and Google Pixel devices.',
      'We curate only certified, authentic products from internationally recognized brands like Anker, Baseus, Aspor, and BWOO. Every phone accessory is engineered for durability, over-voltage safety, and optimal device performance. At DW Store, you can enjoy flexible payment options including Koko and Payzy 3-month interest-free installment plans with zero hidden fees. Benefit from our 7 Days Easy Return policy, official warranty coverage, and express island-wide Cash on Delivery (COD) delivering to your doorstep anywhere in Sri Lanka within 2-3 business days. You can also visit our flagship electronics store in Pannipitiya (No. 55/1/2, Borella Road) for live product demonstrations and instant pickups.'
    ],
    features: [
      '140+ Authentic Accessories for iPhone, Samsung, Xiaomi & Android',
      'GaN 30W to 100W Fast Charging Plugs and Durable Braided Cables',
      'Pay in 3 Interest-Free Installments via Koko & Payzy',
      'Official Warranty & 7 Days Hassle-Free Replacement Guarantee',
      'Island-wide Express COD to all 25 Districts in Sri Lanka'
    ],
    faqs: [
      {
        q: 'Are phone accessories sold on DWstore.lk original?',
        a: 'Yes, 100% of our products are brand new, original, and sourced directly from authorized brand distributors with manufacturer warranty.'
      },
      {
        q: 'Can I pay for phone accessories in installments?',
        a: 'Yes! You can split your purchase into 3 equal interest-free installments using Koko or Payzy with any valid debit or credit card at checkout.'
      }
    ]
  },
  'headphone-and-headset': {
    title: 'Original Headphones, Headsets & Wireless Earbuds Price in Sri Lanka',
    paragraphs: [
      'Experience unmatched audio clarity, deep bass, and crystal-clear call quality with DW Store’s extensive lineup of genuine headphones and headsets. We carry over 80+ audio devices, ranging from premium over-ear ANC headphones and noise-cancelling office headsets to sports neckbands and gaming headsets equipped with low-latency drivers and high-sensitivity microphones.',
      'Our collection showcases top audio leaders including Sony, Anker Soundcore, JBL, and Haino Teko. Whether you need the flagship noise cancellation of Sony WH-1000XM5 or the value-packed acoustic power of Anker Soundcore, DW Store ensures competitive prices backed by genuine company warranty. Shop conveniently with 3-month interest-free installments via Koko and Payzy, verified island-wide Cash on Delivery, and 7 Days Easy Return. Experience our audio collection in person at our Pannipitiya store on Borella Road.'
    ],
    features: [
      'Active Noise Cancellation (ANC) Over-Ear & In-Ear Headphones',
      'Authorized Audio Gear from Sony, Anker Soundcore, JBL & More',
      'Studio Quality Bass, Crystal Clear Mic & Long Battery Life',
      '3-Month Installment Plans with Koko and Payzy',
      'Islandwide Cash on Delivery & In-Store Testing in Pannipitiya'
    ]
  },
  'bluetooth-handsfree': {
    title: 'Best Bluetooth Handsfree & Wireless TWS Earbuds in Sri Lanka',
    paragraphs: [
      'Looking for the best wireless Bluetooth earbuds (TWS) in Sri Lanka? DWstore.lk offers an exceptional selection of genuine Bluetooth handsfree devices, true wireless earbuds, and neckbands designed for active lifestyles, work calls, workouts, and music listening. Featuring advanced Bluetooth 5.3 and 5.4 connectivity, intuitive touch controls, environmental noise cancellation (ENC), and up to 50 hours of total playtime.',
      'Choose from best-sellers like the Anker Soundcore R50i NC, Sony WF-series, and budget-friendly premium earbuds. All our Bluetooth handsfree products come with replacement warranty, fast Cash on Delivery across Colombo and outstation regions, and buy-now-pay-later convenience with Koko and Payzy. Visit our Pannipitiya flagship store to test and find your perfect fit.'
    ],
    features: [
      'True Wireless Stereo (TWS) with Active Noise Cancelling (ANC)',
      'Ultra-Low Latency Gaming Modes & Dual Mic ENC for Calls',
      'IPX5/IPX7 Water Resistance for Sports & Gym Workouts',
      'Koko & Payzy 3-Month Installments with Zero Interest',
      'Island-wide Delivery to All 25 Districts within 48-72 Hours'
    ]
  },
  'bluetooth-speakers': {
    title: 'Buy Portable Bluetooth Speakers & Party Speakers in Sri Lanka',
    paragraphs: [
      'Upgrade your sound experience with portable Bluetooth speakers, outdoor waterproof speakers, and high-power party towers from DW Store. Featuring 50+ speaker models with punchy bass, 360-degree room-filling acoustic drivers, dynamic RGB light shows, and rugged shockproof builds suitable for beach trips, home setups, and gatherings.',
      'We proudly offer original Sony party speakers (including SRS-XV series and ULT Tower), JBL portable audio, and Anker Soundcore speakers with extended battery life and multi-speaker party-link capabilities. Take advantage of flexible Koko and Payzy installment payments, official warranty, 7-day easy return service, and secure Cash on Delivery island-wide.'
    ],
    features: [
      'Waterproof (IP67) Outdoor & Compact Portable Bluetooth Speakers',
      'High-Power Sony & JBL Party Speakers with Deep ULT Power Bass',
      'Party-Link Technology to Pair Multiple Speakers Simultaneously',
      'Official Warranty & 3-Month Installment Options via Koko & Payzy',
      'Fast Island-wide Courier Delivery & Pannipitiya Showroom Pickup'
    ]
  },
  'power-banks': {
    title: 'Original Fast Charging Power Banks Price in Sri Lanka (10000mAh to 50000mAh)',
    paragraphs: [
      'Never run out of power on the go with DWstore.lk’s premium selection of fast-charging power banks. We stock high-capacity 10,000mAh, 20,000mAh, 30,000mAh, and 50,000mAh portable power banks with Power Delivery (PD) 20W, 30W, and 65W fast-charging capabilities capable of charging smartphones, tablets, and even USB-C laptops.',
      'Our power banks feature advanced multi-protect safety systems against overheating, short-circuits, and overcharging from industry-trusted brands like Anker, Baseus, Aspor, and BWOO. Many models include digital LED battery percentage indicators and built-in cables for ultimate convenience. Enjoy 7-day replacement warranty, Koko & Payzy installment plans, and island-wide Cash on Delivery to your home or office.'
    ],
    features: [
      'PD 20W, 30W & 65W High-Speed Fast Charging Output',
      'Capacities Ranging from Ultra-Slim 10,000mAh to Massive 50,000mAh',
      'Airline-Approved Compact Power Banks with LED Battery Displays',
      'Koko and Payzy 3 Interest-Free Installments Available',
      'Islandwide Cash on Delivery & 7-Day Easy Return Policy'
    ]
  },
  'security-camera-and-accessories': {
    title: 'Buy WiFi & 4G CCTV Security Cameras in Sri Lanka — EZVIZ & Hikvision',
    paragraphs: [
      'Safeguard your home, office, and business with high-definition smart CCTV cameras from DWstore.lk. We specialize in world-leading surveillance technology from EZVIZ and Hikvision, featuring 2K and 3K smart pan-and-tilt WiFi indoor cameras, outdoor weatherproof cameras with full-color night vision, and 4G SIM-card security cameras perfect for remote construction sites, estates, and locations without broadband WiFi.',
      'All cameras offer seamless smartphone monitoring via dedicated mobile apps (iOS & Android), smart AI human and vehicle motion detection, two-way audio intercom, and micro-SD card or cloud storage support. We provide full technical guidance, official warranty, Koko & Payzy 3-month installments, and fast island-wide delivery. Visit our Pannipitiya store for live CCTV demonstrations and camera setup advice.'
    ],
    features: [
      'EZVIZ & Hikvision 2K, 3K & 4K Smart Indoor & Outdoor CCTV',
      '4G SIM-Card Security Cameras for Locations Without WiFi',
      'Color Night Vision & AI Human / Vehicle Shape Detection',
      'Easy DIY Mobile App Setup with Two-Way Audio Communication',
      'Official Warranty, Koko/Payzy Installments & Islandwide COD'
    ]
  }
};

export default function CategorySeoContent({ slug, categoryName }: Props) {
  const content = SEO_CONTENT[slug] || {
    title: `Buy Original ${categoryName} Online at Best Price in Sri Lanka`,
    paragraphs: [
      `Looking for authentic ${categoryName} in Sri Lanka? DWstore.lk is your trusted online electronics and tech accessories store. We offer genuine, brand-new products with manufacturer warranty, guaranteed lowest market prices, and fast island-wide Cash on Delivery.`,
      `Shop with complete peace of mind using our flexible payment options, including Koko and Payzy 3-month interest-free installments. Take advantage of our 7 Days Easy Return policy and visit our flagship showroom at No. 55/1/2, Borella Road, Pannipitiya (serving Maharagama, Kottawa, Homagama, and Greater Colombo).`
    ],
    features: [
      `100% Original ${categoryName} with Company Warranty`,
      'Pay in 3 Installments via Koko & Payzy with 0% Interest',
      '7 Days Easy Replacement for Complete Peace of Mind',
      'Island-wide Express Cash on Delivery (COD) to All 25 Districts',
      'Pannipitiya Flagship Store Pickup & Live Product Testing'
    ]
  };

  return (
    <section className="mt-14 pt-10 border-t border-slate-200/90 text-slate-700">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 inline-block mb-3">
            DW Store Buyer Guide &amp; Sri Lanka Price Overview
          </span>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
            {content.title}
          </h2>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {content.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="pt-2">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
            Why Buy {categoryName} from DW Store?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {content.features.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Island-wide COD</h4>
              <p className="text-[10px] text-slate-500">All 25 districts</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Koko &amp; Payzy</h4>
              <p className="text-[10px] text-slate-500">3x interest-free</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Official Warranty</h4>
              <p className="text-[10px] text-slate-500">100% Genuine gear</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Pannipitiya Store</h4>
              <p className="text-[10px] text-slate-500">Near Maharagama</p>
            </div>
          </div>
        </div>

        {/* Optional FAQs */}
        {content.faqs && content.faqs.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
              Frequently Asked Questions (FAQ)
            </h3>
            <div className="space-y-3">
              {content.faqs.map((faq, idx) => (
                <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                  <h4 className="text-xs font-bold text-slate-900 mb-1">
                    {faq.q}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
