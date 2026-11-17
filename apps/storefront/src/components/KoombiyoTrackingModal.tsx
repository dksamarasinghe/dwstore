'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Truck, 
  Package, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Phone, 
  ExternalLink, 
  Calendar,
  Box,
  RotateCw
} from 'lucide-react';

interface KoombiyoTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export const KoombiyoTrackingModal: React.FC<KoombiyoTrackingModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState<any>(null);

  useEffect(() => {
    if (!isOpen || !order) return;

    setLoading(true);
    const trackingNo = order.courierTrackingNumber || order.trackingNumber || order.orderId;
    const phoneNo = order.customer?.phone || order.phone || '';

    fetch('/api/koombiyo-track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        waybillId: trackingNo,
        phone: phoneNo,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.tracking) {
          setTrackingData(data.tracking);
        } else {
          setTrackingData(null);
        }
      })
      .catch((err) => {
        console.error('Tracking fetch error:', err);
        setTrackingData(null);
      })
      .finally(() => setLoading(false));
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const steps = [
    { key: 'collected', label: 'Collected', desc: 'Picked up by Koombiyo courier' },
    { key: 'destination', label: 'Received at Destination', desc: 'Arrived at delivery hub' },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Dispatched with courier rider' },
    { key: 'delivered', label: 'Delivered', desc: 'Safely handed over to customer' },
  ];

  const rawStatus = (trackingData?.status || order.status || '').toLowerCase();
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

  const hasRealTracking = Boolean(trackingData?.hasCourierTracking && trackingData?.trackingNumber);
  const waybillNumber = trackingData?.trackingNumber || trackingData?.trackingId || '';
  const customerPhone = trackingData?.phone || order.customer?.phone || '';
  const koombiyoPortalUrl = waybillNumber
    ? `https://koombiyodelivery.lk/track?id=${encodeURIComponent(waybillNumber)}&phone=${encodeURIComponent(customerPhone)}`
    : '#';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {hasRealTracking ? 'Koombiyo Delivery' : 'DWstore Fulfillment'}
            </span>
            <span className="text-[11px] text-slate-400">
              {hasRealTracking ? 'Official Logistics Partner' : 'Direct Order Status'}
            </span>
          </div>

          <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            {hasRealTracking ? (
              <>
                <Truck className="w-5 h-5 text-blue-400" />
                <span>Live Courier Tracking</span>
              </>
            ) : (
              <>
                <Package className="w-5 h-5 text-amber-400" />
                <span>Order Fulfillment Status</span>
              </>
            )}
          </h3>

          <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-300 font-mono">
            {hasRealTracking && (
              <>
                <span>Waybill: <strong className="text-white">{waybillNumber}</strong></span>
                <span>&bull;</span>
              </>
            )}
            <span>Order: <strong className="text-white">#{order.orderId}</strong></span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">Checking delivery records...</p>
            </div>
          ) : trackingData ? (
            hasRealTracking ? (
              <>
                {/* Top Banner Matching Koombiyo Layout */}
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white text-sky-900 flex items-center justify-center shadow-xs border border-sky-100">
                      <Box className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Tracking ID</span>
                      <strong className="text-lg font-black text-slate-900 font-mono">
                        {waybillNumber}
                      </strong>
                    </div>
                  </div>

                  <span className="px-3.5 py-1.5 rounded-xl text-xs font-black border border-sky-300 bg-white text-sky-900 shadow-2xs">
                    {trackingData.status || 'In Transit'}
                  </span>
                </div>

                {/* 3x2 Grid Details (Collected Date, Name, Destination Branch, Status, Weight, Age) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block mb-0.5">Collected Date</span>
                    <strong className="text-slate-800 block text-xs">
                      {trackingData.collectedDate || 'Recent'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block mb-0.5">Name</span>
                    <strong className="text-slate-800 block text-xs">
                      {trackingData.recipientName || 'Customer'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block mb-0.5">Destination Branch</span>
                    <strong className="text-slate-800 block text-xs">
                      {trackingData.destinationBranch || 'Colombo'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block mb-0.5">Status</span>
                    <strong className="text-slate-800 block text-xs">
                      {trackingData.status || 'In Transit'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block mb-0.5">Weight (kg)</span>
                    <strong className="text-slate-800 block text-xs font-mono">
                      {trackingData.weight || '1.00'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block mb-0.5">Age</span>
                    <strong className="text-slate-800 block text-xs">
                      {trackingData.age || 'Recent'}
                    </strong>
                  </div>
                </div>

                {/* Delivery Progress Stepper */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Delivery Milestones
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {steps.map((st, idx) => {
                      const isDone = idx <= activeStep;
                      const isCurrent = idx === activeStep;

                      return (
                        <div 
                          key={st.key} 
                          className={`p-2.5 rounded-xl border text-center transition ${
                            isCurrent 
                              ? 'bg-blue-50/90 border-blue-300' 
                              : isDone 
                              ? 'bg-emerald-50/60 border-emerald-200' 
                              : 'bg-slate-50 border-slate-200 opacity-60'
                          }`}
                        >
                          <div 
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mx-auto mb-1 ${
                              isDone ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {isDone ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
                          </div>
                          <strong className={`text-[10px] block font-bold leading-tight ${isCurrent ? 'text-blue-700' : isDone ? 'text-slate-900' : 'text-slate-500'}`}>
                            {st.label}
                          </strong>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  <a
                    href={koombiyoPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                    <span>Verify on Koombiyo Website</span>
                  </a>

                  <a
                    href="https://wa.me/94756693358?text=Hello%20DWstore,%20I%20need%20assistance%20tracking%20my%20Koombiyo%20delivery"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Courier Help</span>
                  </a>
                </div>
              </>
            ) : (
              /* ORDER FOUND BUT NO COURIER TRACKING NUMBER YET */
              <>
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-xs font-bold text-amber-950 block mb-0.5">
                      Order Confirmed &bull; Preparing for Courier Dispatch
                    </strong>
                    <p className="text-[11px] text-amber-900/80 leading-relaxed">
                      Your order is confirmed and being prepared at our fulfillment center. An official live tracking ID will be updated as soon as the package is handed over to the courier partner.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block mb-0.5">Order Date</span>
                    <strong className="text-slate-800 block text-xs">
                      {trackingData.collectedDate || 'Recent'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block mb-0.5">Customer Name</span>
                    <strong className="text-slate-800 block text-xs">
                      {trackingData.recipientName || 'Customer'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block mb-0.5">Destination</span>
                    <strong className="text-slate-800 block text-xs">
                      {trackingData.destinationBranch || 'Sri Lanka'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block mb-0.5">Fulfillment Status</span>
                    <strong className="text-amber-800 block text-xs">
                      {trackingData.status || 'Processing'}
                    </strong>
                  </div>
                </div>

                {/* Progress */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Store Fulfillment Steps
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { step: 1, label: 'Order Confirmed', state: 'done' },
                      { step: 2, label: 'Quality Check & Packing', state: 'active' },
                      { step: 3, label: 'Courier Handover', state: 'pending' },
                      { step: 4, label: 'Islandwide Delivery', state: 'pending' },
                    ].map((st) => (
                      <div 
                        key={st.step} 
                        className={`p-2.5 rounded-xl border text-center transition ${
                          st.state === 'active' 
                            ? 'bg-amber-50/90 border-amber-300' 
                            : st.state === 'done' 
                            ? 'bg-emerald-50/60 border-emerald-200' 
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div 
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mx-auto mb-1 ${
                            st.state === 'done' ? 'bg-emerald-600 text-white' : st.state === 'active' ? 'bg-amber-600 text-white animate-pulse' : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {st.state === 'done' ? <CheckCircle2 className="w-3 h-3" /> : st.step}
                        </div>
                        <strong className={`text-[10px] block font-bold leading-tight ${st.state === 'active' ? 'text-amber-800' : st.state === 'done' ? 'text-slate-900' : 'text-slate-500'}`}>
                          {st.label}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  <a
                    href={`https://wa.me/94756693358?text=Hello%20DWstore,%20I%20would%20like%20an%20update%20on%20my%20Order%20${encodeURIComponent(order.orderId)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-white" />
                    <span>Inquire via WhatsApp Support</span>
                  </a>
                </div>
              </>
            )
          ) : (
            <div className="py-8 text-center space-y-2">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No courier tracking number assigned yet.</p>
              <p className="text-[11px] text-slate-400">Order is pending packaging and courier handover.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
