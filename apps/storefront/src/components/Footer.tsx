'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200 text-slate-600">
      {/* Value Props */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="page-container py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Truck, color: 'bg-blue-50 text-blue-600', title: 'Island-wide Delivery', sub: 'Express Cash on Delivery to all 25 districts' },
            { icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-600', title: '100% Genuine Products', sub: 'Official company warranty with every device' },
            { icon: RotateCcw, color: 'bg-purple-50 text-purple-600', title: '7 Days Easy Return', sub: 'Hassle-free replacement for any defects' },
            { icon: CreditCard, color: 'bg-amber-50 text-amber-600', title: 'Flexible Payments', sub: 'COD, Bank Transfer, Koko & Mintpay 0%' },
          ].map(({ icon: Icon, color, title, sub }, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">{title}</h4>
                <p className="text-[11px] text-slate-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer links */}
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Bio — 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <img
                src="/dwstore_logo.png"
                alt="DWstore.lk"
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed pr-4">
              DWstore (dwstore.lk) is Sri Lanka&apos;s leading online destination for authentic consumer electronics, flagship smartphones, high-performance laptops, studio audio, and smart gadgets — delivered island-wide.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 text-slate-700"><MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" /><span>No.55/1/2, Borella road, Pannipitiya</span></div>
              <div className="flex items-center gap-2 text-slate-700"><Phone className="w-4 h-4 text-blue-600 flex-shrink-0" /><a href="tel:+94756693358" className="hover:text-blue-600 font-semibold transition">+94 75 669 3358</a></div>
              <div className="flex items-center gap-2 text-slate-700"><Mail className="w-4 h-4 text-blue-600 flex-shrink-0" /><span>support@dwstore.lk</span></div>
              <div className="flex items-center gap-2 text-slate-700"><Clock className="w-4 h-4 text-blue-600 flex-shrink-0" /><span>Mon – Sat: 9:00 AM – 7:00 PM</span></div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Products</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/category/smartwatches" className="hover:text-blue-600 transition">Smart Watches</Link></li>
              <li><Link href="/category/bluetooth-handfree" className="hover:text-blue-600 transition">Audio &amp; Earbuds</Link></li>
              <li><Link href="/category/power-banks" className="hover:text-blue-600 transition">Power Banks</Link></li>
              <li><Link href="/category/wall-chargers" className="hover:text-blue-600 transition">Chargers &amp; Adapters</Link></li>
              <li><Link href="/category/temperd-glass" className="hover:text-blue-600 transition">Tempered Glass</Link></li>
              <li><Link href="/shop" className="hover:text-blue-600 transition font-bold text-blue-600">All 407 Products →</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Customer Help</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/track-order" className="hover:text-blue-600 transition font-medium">Track Your Order</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-blue-600 transition">Shipping &amp; Delivery</Link></li>
              <li><Link href="/warranty-policy" className="hover:text-blue-600 transition">Warranty &amp; Replacement</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600 transition">Contact Us</Link></li>
              <li><a href="https://wa.me/94756693358" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition text-emerald-600 font-semibold">WhatsApp Support (+94 75 669 3358)</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about" className="hover:text-blue-600 transition">About DWstore</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600 transition">Pannipitiya Flagship Store</Link></li>
              <li><Link href="/shop" className="hover:text-blue-600 transition">Browse Catalog</Link></li>
              <li><a href="https://maps.google.com/?q=DWStore+No.55/1/2+Borella+Rd+Pannipitiya" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">Google Maps Location</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Legal &amp; Trust</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/privacy-policy" className="hover:text-blue-600 transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-blue-600 transition">Terms of Service</Link></li>
              <li><Link href="/warranty-policy" className="hover:text-blue-600 transition">Checking Warranty Terms</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-blue-600 transition">Cash on Delivery Terms</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-200 bg-slate-100/70 py-6">
        <div className="page-container flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="text-center md:text-left">
            © 2026 <span className="font-semibold text-slate-700">DWstore.lk</span>. All Rights Reserved. Built in Sri Lanka.
          </p>
          <div className="flex items-center justify-center">
            <img
              src="/Payment-Methods-1300x325.png"
              alt="Payment Methods: Visa, Mastercard, Koko, Payzy, PayHere, Cash on Delivery, Bank Transfer"
              className="h-11 sm:h-12 md:h-14 max-w-xs sm:max-w-md w-auto object-contain transition"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
