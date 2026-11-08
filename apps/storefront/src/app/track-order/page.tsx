'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Package, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Phone, 
  ExternalLink, 
  MapPin, 
  Calendar,
  ShieldCheck,
  RotateCw,
  Box
} from 'lucide-react';

export default function TrackOrderPage() {
  const [trackingInput, setTrackingInput] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-track if URL parameters provided (e.g. ?trackingId=17525166&phone=0770515461)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlId =
        params.get('trackingId') ||
        params.get('tracking_id') ||
        params.get('tracking') ||
        params.get('waybill') ||
        params.get('id') ||
        params.get('orderId') ||
        params.get('waybill_id') ||
        '';
      const urlPhone =
        params.get('phone') ||
        params.get('mobile') ||
        params.get('customerPhone') ||
        params.get('tel') ||
        '';

      if (urlId || urlPhone) {
        if (urlId) setTrackingInput(urlId);
        if (urlPhone) setPhone(urlPhone);
        executeTrack(urlId, urlPhone);
      }
    }
  }, []);

  const executeTrack = async (idVal: string, phoneVal: string) => {
    const cleanId = (idVal || '').trim();
    const cleanPhone = (phoneVal || '').trim();
    if (!cleanId && !cleanPhone) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch('/api/koombiyo-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waybillId: cleanId,
          phone: cleanPhone,
        }),
      });
      const data = await res.json();
      if (data && data.success && data.tracking) {
        setResult(data.tracking);
        // Auto-fill form inputs from resolved tracking data
        if (data.tracking.phone && !cleanPhone) {
          setPhone(data.tracking.phone);
        }
        if ((data.tracking.trackingNumber || data.tracking.orderId) && !cleanId) {
          setTrackingInput(data.tracking.trackingNumber || data.tracking.orderId);
        }
      } else {
        setResult(null);
      }
    } catch (err) {
      console.error('Tracking fetch error:', err);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    executeTrack(trackingInput, phone);
  };

  // Status mapping for Koombiyo 4-stage stepper
  const steps = [
    { key: 'collected', label: 'Collected', desc: 'Picked up by Koombiyo courier' },
    { key: 'destination', label: 'Received at Destination', desc: 'Arrived at delivery hub' },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Dispatched with courier rider' },
    { key: 'delivered', label: 'Delivered', desc: 'Safely handed over to customer' },
  ];

  const rawStatus = (result?.status || '').toLowerCase();
  let activeStep = 0;
  if (rawStatus.includes('delivered') || rawStatus.includes('completed')) {
    activeStep = 3;
  } else if (rawStatus.includes('out') || rawStatus.includes('shipped')) {
    activeStep = 2;
  } else if (rawStatus.includes('destination') || rawStatus.includes('transit') || rawStatus.includes('received') || rawStatus.includes('dispatched')) {
    activeStep = 1;
  } else {
    activeStep = 0;
  }

  const waybillNumber = result?.trackingId || result?.trackingNumber || trackingInput || '61661049';
  const phoneParam = phone || result?.phone || '';
  const koombiyoPortalUrl = `https://koombiyodelivery.lk/track?id=${encodeURIComponent(waybillNumber)}&phone=${encodeURIComponent(phoneParam)}`;

  return (
    <main className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white py-14">
        <div className="page-container text-center max-w-2xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider mb-3">
            <Truck className="w-3.5 h-3.5" />
            <span>Koombiyo Delivery &bull; Official Courier Partner</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Enter your DWstore Order ID or Koombiyo Tracking ID and registered mobile number to check delivery status in real-time.
          </p>
        </div>
      </div>

      <div className="page-container py-12 flex-1 max-w-3xl mx-auto px-4 w-full">
        {/* Search Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs mb-8">
          <form onSubmit={handleTrackSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tracking ID or Order ID *
                </label>
                <div className="relative">
                  <Package className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="Tracking ID  (e.g. 61661049)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-mono uppercase transition font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Order Placed Mobile Number <span className="text-slate-400 font-normal">(Auto-verified)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Order placed mobile number  (e.g. 0706113101)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleTrackSubmit()}
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Checking Koombiyo Delivery Network...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Track Order Status</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Status Result Card - Matching Koombiyo Layout */}
        {hasSearched && (
          result ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Primary Card: Exact Match to Koombiyo Delivery UI */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-900 flex items-center justify-center flex-shrink-0 border border-sky-100">
                      <Box className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Tracking ID</span>
                      <strong className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                        {result.trackingId || result.trackingNumber || result.orderId}
                      </strong>
                    </div>
                  </div>

                  <div className="sm:self-center">
                    <span className="inline-block px-4 py-2 rounded-xl text-xs font-black tracking-wide border border-sky-200 bg-sky-50 text-sky-900 shadow-2xs">
                      {result.status || 'In Transit'}
                    </span>
                  </div>
                </div>

                {/* 3x2 Grid Details (Collected Date, Name, Destination Branch, Status, Weight, Age) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div>
                    <span className="text-xs text-slate-400 font-medium block mb-1">Collected Date</span>
                    <strong className="text-sm font-bold text-slate-800 block">
                      {result.collectedDate || 'Recent'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 font-medium block mb-1">Name</span>
                    <strong className="text-sm font-bold text-slate-800 block">
                      {result.recipientName || 'Valued Customer'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 font-medium block mb-1">Destination Branch</span>
                    <strong className="text-sm font-bold text-slate-800 block">
                      {result.destinationBranch || 'Colombo Hub'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 font-medium block mb-1">Status</span>
                    <strong className="text-sm font-bold text-slate-800 block">
                      {result.status || 'In Transit'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 font-medium block mb-1">Weight (kg)</span>
                    <strong className="text-sm font-bold text-slate-800 block font-mono">
                      {result.weight || '1.00'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 font-medium block mb-1">Age</span>
                    <strong className="text-sm font-bold text-slate-800 block">
                      {result.age || 'Recent'}
                    </strong>
                  </div>
                </div>

                {/* Milestones Stepper */}
                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Delivery Progress
                    </span>
                    <span className="text-[11px] font-bold text-blue-600">
                      Koombiyo Delivery Network
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {steps.map((st, idx) => {
                      const isDone = idx <= activeStep;
                      const isCurrent = idx === activeStep;

                      return (
                        <div 
                          key={st.key} 
                          className={`p-3 rounded-2xl border text-center transition ${
                            isCurrent 
                              ? 'bg-blue-50/90 border-blue-300' 
                              : isDone 
                              ? 'bg-emerald-50/60 border-emerald-200' 
                              : 'bg-slate-50 border-slate-200 opacity-60'
                          }`}
                        >
                          <div 
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mx-auto mb-1.5 ${
                              isDone ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                          </div>
                          <strong className={`text-[11px] block font-bold leading-tight ${isCurrent ? 'text-blue-700' : isDone ? 'text-slate-900' : 'text-slate-500'}`}>
                            {st.label}
                          </strong>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {st.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                  <a
                    href={koombiyoPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                    <span>View on Official Koombiyo Portal</span>
                  </a>

                  <a
                    href="https://wa.me/94756693358?text=Hello%20DWstore,%20I%20need%20assistance%20tracking%20my%20order"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Help</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center space-y-3 shadow-xs animate-in fade-in duration-300">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">No Tracking Records Found</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No parcel found for the provided Tracking ID and Phone Number. Please verify your details or contact customer care.
              </p>
            </div>
          )
        )}
      </div>

      <Footer />
    </main>
  );
}
