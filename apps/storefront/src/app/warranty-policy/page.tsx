'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShieldCheck, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function WarrantyPolicyPage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-12">
        <div className="page-container text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300 block mb-2">
            DWstore Official Guarantee
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            Warranty &amp; Replacement Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Clear, transparent checking warranty policies for all genuine tech products purchased from DWstore.lk.
          </p>
        </div>
      </div>

      <div className="page-container py-12 flex-1 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-xs space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Section 1 */}
          <div>
            <h2 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>1. 7-Days Checking &amp; Replacement Warranty</span>
            </h2>
            <p>
              At DWstore.lk, every electronic item (Smartwatches, TWS Earbuds, Power Banks, Chargers, Audio Speakers) comes with a <strong>7-Day Checking &amp; Replacement Warranty</strong> starting from the day of package delivery.
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1.5 text-slate-600">
              <li>Inspect your package and test all functions within 7 days of receiving the item.</li>
              <li>If any manufacturing defect or hardware fault is identified, we will provide a 1-to-1 immediate replacement.</li>
              <li>Please keep the original packaging box, accessories, and warranty card intact.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-emerald-600" />
              <span>2. Manufacturer Extended Warranty</span>
            </h2>
            <p>
              Branded products (such as Aspor, Remax, HainoTeko, Joyroom, BWOO, Baseus, and Lenovo) include extended company warranties (ranging from 1 month to 6 months depending on the specific item model). The warranty duration is clearly listed on the product specifications tab.
            </p>
          </div>

          {/* Section 3 */}
          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <span>3. What is NOT Covered</span>
            </h2>
            <p className="mb-2">Warranty will be void under the following conditions:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Physical damage, screen cracks, drops, or crushed outer body.</li>
              <li>Water/liquid damage for devices not certified for swimming or underwater exposure.</li>
              <li>Damage caused by using unauthorized high-voltage fast chargers (e.g. charging a budget smartwatch with a 65W laptop charger).</li>
              <li>Unauthorized repairs, tampering with screws or security seals.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <span>4. How to Claim Warranty</span>
            </h2>
            <p>
              To initiate a warranty check or replacement:
            </p>
            <ol className="list-decimal pl-5 mt-2 space-y-2 text-slate-600">
              <li>Send a WhatsApp message with a short video of the fault to <strong>+94 75 669 3358</strong>.</li>
              <li>Provide your DWstore Order Number (e.g. <code>DWS-123456</code>) or phone number.</li>
              <li>You may drop by our flagship store at <strong>No.55/1/2, Borella road, Pannipitiya</strong> or send the package via courier service.</li>
            </ol>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
