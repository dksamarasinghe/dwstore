'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Lock, Shield, Eye, Database } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-12">
        <div className="page-container text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300 block mb-2">
            Data Protection &amp; Security
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            How DWstore.lk collects, protects, and respects your personal information.
          </p>
        </div>
      </div>

      <div className="page-container py-12 flex-1 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div>
            <h2 className="text-base font-black text-slate-900 mb-2">1. Information We Collect</h2>
            <p>
              When placing an order on DWstore.lk, we collect your name, delivery address, phone number, and optional email address solely to facilitate courier dispatch and notify you about your order status.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h2 className="text-base font-black text-slate-900 mb-2">2. How We Use Your Information</h2>
            <p>
              Your contact details are shared strictly with our courier partners (Prompt, Koombiyo, Domex) for delivery execution. We do not sell, rent, or distribute customer details to third-party advertisers.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h2 className="text-base font-black text-slate-900 mb-2">3. Payment Information Security</h2>
            <p>
              We do not store credit or debit card numbers on our servers. Online payments via KOKO or Payzy are processed through their secure, encrypted, PCI-DSS compliant gateways.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h2 className="text-base font-black text-slate-900 mb-2">4. Contacting Us Regarding Privacy</h2>
            <p>
              If you have any questions or wish to delete your account information, contact us via email at <strong>privacy@dwstore.lk</strong> or phone <strong>+94 75 669 3358</strong>.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
