'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { formatPriceLKR } from '@/lib/catalog';
import {
  CheckCircle2,
  PackageCheck,
  Truck,
  MessageCircle,
  Home,
  PhoneCall,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'DWS-100234';
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('dwstore_last_order');
      if (stored) {
        setOrder(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const waSupportUrl = `https://wa.me/94756693358?text=${encodeURIComponent(
    `Hello DWstore, I placed order #${orderId}. Please let me know the delivery tracking status.`
  )}`;

  return (
    <div className="page-container py-10 sm:py-16">
      <div className="max-w-2xl mx-auto">
        {/* Success Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
            Order Confirmed
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 mb-2">
            Thank you for your order!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
            Your order has been placed successfully. Our dispatch team will contact you via WhatsApp / Phone to confirm the delivery before dispatching.
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200 text-left space-y-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Order Number</span>
                <span className="text-sm font-black text-blue-600">#{orderId}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Method</span>
                <span className="text-xs font-bold text-slate-800 uppercase">
                  {order?.paymentMethod || 'Cash on Delivery'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Delivery</span>
                <span className="text-xs font-bold text-emerald-600">1 - 3 Working Days</span>
              </div>
            </div>

            {order?.shippingAddress && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Delivering To:
                </span>
                <p className="text-xs font-semibold text-slate-800">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName} ({order.shippingAddress.phone})
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.district}
                </p>
              </div>
            )}

            {order?.items && order.items.length > 0 && (
              <div className="pt-3 border-t border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                  Items Ordered ({order.items.length}):
                </span>
                <div className="space-y-2">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-slate-700 truncate max-w-[280px]">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-bold text-slate-900">
                        LKR {formatPriceLKR(item.priceMinor * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-blue-600">LKR {formatPriceLKR(order.totalMinor)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={waSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Track on WhatsApp</span>
            </a>
            <Link
              href="/shop"
              className="flex-1 py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
            >
              <Home className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading order details...</div>}>
          <OrderSuccessContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
