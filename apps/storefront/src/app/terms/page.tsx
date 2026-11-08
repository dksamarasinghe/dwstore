'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-12">
        <div className="page-container text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300 block mb-2">
            Terms of Service
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            Terms &amp; Conditions
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Rules and guidelines governing purchases on DWstore.lk.
          </p>
        </div>
      </div>

      <div className="page-container py-12 flex-1 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div>
            <h2 className="text-base font-black text-slate-900 mb-2">1. Agreement to Terms</h2>
            <p>
              By accessing and placing orders on DWstore.lk, you agree to comply with and be bound by these terms. If you do not agree, please refrain from using this website.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h2 className="text-base font-black text-slate-900 mb-2">2. Product Pricing &amp; Currency</h2>
            <p>
              All prices displayed on DWstore.lk are quoted in <strong>Sri Lankan Rupees (LKR)</strong>. While we strive to maintain accurate pricing, in the event of an inadvertent technical error, we reserve the right to correct pricing or cancel orders.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h2 className="text-base font-black text-slate-900 mb-2">3. Orders &amp; Cancellations</h2>
            <p>
              Orders placed online are subject to verification via call or SMS. Orders may be cancelled prior to dispatch by calling our hotline (+94 75 669 3358).
            </p>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h2 className="text-base font-black text-slate-900 mb-2">4. Governing Law</h2>
            <p>
              These Terms and any separate agreements whereby we provide services to you shall be governed by and construed in accordance with the laws of Sri Lanka.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
