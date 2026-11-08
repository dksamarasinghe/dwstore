'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, TrendingUp } from 'lucide-react';

export default function SellerCtaBanner() {
  return (
    <section className="w-full bg-white py-8">
      <div className="page-container">
        <div
          className="rounded-3xl p-7 sm:p-10 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 shadow-sm border border-slate-200"
          style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 40%, #eef2ff 100%)' }}
        >
          {/* Grid dots */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px,transparent 1px)', backgroundSize: '24px 24px', opacity: 0.08 }} />

          {/* Left */}
          <div className="relative z-10 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100/70 border border-blue-200 rounded-full text-blue-700 text-xs font-bold mb-4">
              <TrendingUp className="w-3.5 h-3.5" />
              GROW YOUR TECH BUSINESS
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Start Selling With Us Today <span className="text-blue-600">— DWstore</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
              Join Sri Lanka&apos;s most trusted multi-category electronics platform. Fast automated payouts,
              built-in courier delivery network, and zero onboarding fee.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-4 text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> 0% Commission for 30 Days</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Same-day Courier Pickup</span>
            </div>
            <div className="pt-6">
              <Link href="/register-seller" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md transition group">
                BECOME A SELLER <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>

          {/* Right graphic */}
          <div className="relative z-10 flex-shrink-0">
            <div className="relative w-60 sm:w-72 h-64 sm:h-72">
              <img
                src="https://images.unsplash.com/photo-1556155092-490a1ba16284?w=500&auto=format&fit=crop&q=80"
                alt="DWstore Seller Partner"
                className="w-full h-full object-cover rounded-2xl shadow-xl"
              />
              {/* 0% badge */}
              <div className="absolute -left-5 bottom-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-4 shadow-xl border-2 border-white flex items-center gap-3 animate-bounce">
                <span className="text-3xl font-black leading-none">0%</span>
                <div className="leading-tight">
                  <span className="text-[11px] font-bold block uppercase tracking-wider text-blue-200">Commission</span>
                  <span className="text-xs font-bold text-white">First 30 Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
