'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShieldCheck, Truck, Clock, Award, MapPin, Phone, Mail, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-16">
        <div className="page-container text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-blue-300 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sri Lanka&apos;s Trusted Tech Importer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
            About <span className="text-blue-400">DWstore.lk</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
            DWstore is Sri Lanka&apos;s leading tech and lifestyle electronics retailer. Based in Pannipitiya, we provide genuine smartwatches, high-capacity power banks, premium audio, and certified mobile accessories with official importer warranties and island-wide cash on delivery.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-slate-50 border-b border-slate-100">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">100% Genuine Tech</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Directly imported from original manufacturers (Aspor, Remax, HainoTeko, BWOO) with certified warranty.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Island-wide COD</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Fast courier delivery to all 25 districts in Sri Lanka with Cash on Delivery support.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Checking Warranty</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Comprehensive 7-day checking replacement policy ensures zero risk for our customers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Buy Now Pay Later</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Partnered with KOKO and Payzy so you can pay in 3 or 4 monthly installments with 0% interest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Flagship Store Details */}
      <section className="py-16">
        <div className="page-container">
          <div className="bg-[#0f172a] text-white rounded-3xl p-8 sm:p-12 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider mb-4">
                <span>Flagship Retail Store</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-4">
                Visit DWstore in Pannipitiya
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-medium">
                Experience our full range of smartwatches, audio devices, and power banks in person. Our friendly tech experts are ready to guide you and provide live demonstrations.
              </p>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>No.55/1/2, Borella road, Pannipitiya</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <a href="tel:+94756693358" className="hover:underline">+94 75 669 3358</a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span>support@dwstore.lk</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://maps.google.com/?q=DWStore+No.55/1/2+Borella+Rd+Pannipitiya"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition text-center shadow-md shadow-blue-600/30"
              >
                Get Google Maps Directions
              </a>
              <Link
                href="/shop"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition border border-white/20 text-center"
              >
                Explore Online Store
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
