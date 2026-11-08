'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Truck, Clock, MapPin, DollarSign, CheckCircle2 } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-12">
        <div className="page-container text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300 block mb-2">
            Island-Wide Express Delivery
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            Shipping &amp; Delivery Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Speedy, safe courier delivery across all 25 districts in Sri Lanka with Cash on Delivery support.
          </p>
        </div>
      </div>

      <div className="page-container py-12 flex-1 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-xs space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Timeline */}
          <div>
            <h2 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>1. Delivery Timelines</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <strong className="text-slate-900 block font-bold mb-1">Western Province (Colombo, Gampaha, Kalutara)</strong>
                <span className="text-slate-600">Delivered within <strong>24 – 48 Hours</strong> (Same day dispatch for orders before 2:00 PM).</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <strong className="text-slate-900 block font-bold mb-1">Outstation / All Other Districts</strong>
                <span className="text-slate-600">Delivered within <strong>2 – 3 Working Days</strong> via certified courier partners (Prompt, Koombiyo, Domex).</span>
              </div>
            </div>
          </div>

          {/* Delivery Charges */}
          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>2. Delivery Charges</span>
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Flat Standard Rate:</strong> LKR 350 across all island-wide locations.</li>
              <li><strong>FREE Delivery:</strong> Available on all orders with a cart total of LKR 15,000 or above!</li>
            </ul>
          </div>

          {/* Cash on Delivery */}
          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-600" />
              <span>3. Cash on Delivery (COD) Guidelines</span>
            </h2>
            <p>
              We offer Cash on Delivery to all accessible postal codes in Sri Lanka.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-slate-600">
              <li>Please keep the exact cash amount ready at the time of delivery.</li>
              <li>You may inspect the exterior courier packaging condition before making payment to the courier rider.</li>
              <li>If you need to reschedule delivery date or change address, notify us on WhatsApp (+94 75 669 3358) immediately.</li>
            </ul>
          </div>

          {/* Store Pickup */}
          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-500" />
              <span>4. Store Pickup Option (Pannipitiya Flagship)</span>
            </h2>
            <p>
              Customers within Colombo / Western Province can opt for free store pickup directly at our Pannipitiya branch: <strong>No.55/1/2, Borella road, Pannipitiya</strong>. You can test and inspect the product on-site.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
