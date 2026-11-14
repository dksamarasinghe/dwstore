'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, Tag } from 'lucide-react';
import initialPaymentGateways from '@/data/payment-gateways.json';

interface PaymentInstallmentBoxesProps {
  priceCents: number; // in cents e.g. 185000 for Rs. 1,850.00
  stockQty?: number;
  inStock?: boolean;
  warranty?: string;
  gatewaysConfig?: any;
}

export default function PaymentInstallmentBoxes({
  priceCents,
  stockQty,
  inStock = true,
  warranty,
  gatewaysConfig: initialGatewaysProp,
}: PaymentInstallmentBoxesProps) {
  const [gateways, setGateways] = useState<any>(initialGatewaysProp || initialPaymentGateways);

  // Fetch real-time payment gateway settings and promotional discounts
  useEffect(() => {
    let isMounted = true;
    fetch('/api/integrations/payment-gateways?public=true', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.gateways) {
          setGateways(data.gateways);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const price = priceCents > 0 ? priceCents / 100 : 0;

  if (price <= 0) return null;

  const fmt = (num: number) => {
    return 'LKR ' + num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Helper to calculate gateway promotional discount, final price, and promo badge
  const calcGatewayDiscount = (gwKey: string, basePrice: number) => {
    const gw = gateways?.[gwKey];
    if (!gw?.discountEnabled || !Number(gw?.discountValue)) {
      return {
        hasDiscount: false,
        finalPrice: basePrice,
        discountAmount: 0,
        badge: null,
      };
    }
    const val = Number(gw.discountValue);
    let discountAmount = 0;
    if (gw.discountType === 'fixed') {
      discountAmount = Math.min(val, basePrice);
    } else {
      discountAmount = (basePrice * val) / 100;
    }
    const finalPrice = Math.max(0, basePrice - discountAmount);
    const badge =
      gw.discountBadge ||
      (gw.discountType === 'fixed'
        ? `LKR ${val.toLocaleString()} OFF`
        : `${val}% OFF`);

    return {
      hasDiscount: discountAmount > 0,
      finalPrice,
      discountAmount,
      badge,
    };
  };

  // 1. Cash Price (COD)
  const cashCalc = calcGatewayDiscount('cod', price);

  // 2. Bank Transfer
  const bankCalc = calcGatewayDiscount('bank', price);

  // 3. Visa / Mastercard (PayHere)
  const cardCalc = calcGatewayDiscount('payhere', price);

  // 4. KOKO: Price + 10%, divided by 3 installments (with gateway discount if enabled)
  const kokoCalc = calcGatewayDiscount('koko', price);
  const kokoStandardTotal = price * 1.10;
  const kokoDiscountedTotal = kokoCalc.finalPrice * 1.10;
  const kokoTotal = kokoCalc.hasDiscount ? kokoDiscountedTotal : kokoStandardTotal;
  const kokoMonthly = kokoTotal / 3;

  // 5. Payzy: Price + 13%, divided by 4 installments (with gateway discount if enabled)
  const payzyCalc = calcGatewayDiscount('payzy', price);
  const payzyStandardTotal = price * 1.13;
  const payzyDiscountedTotal = payzyCalc.finalPrice * 1.13;
  const payzyTotal = payzyCalc.hasDiscount ? payzyDiscountedTotal : payzyStandardTotal;
  const payzyMonthly = payzyTotal / 4;

  return (
    <div className="w-full my-4 space-y-4">
      {/* Top Section: Cash Price, Bank Transfer, Visa / Mastercard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 1. Cash Price Box */}
        <div
          className={`relative overflow-hidden bg-white border-2 ${
            cashCalc.hasDiscount ? 'border-emerald-600 bg-emerald-50/20' : 'border-emerald-600'
          } rounded-xl p-3.5 flex items-center justify-between shadow-2xs hover:shadow-xs transition`}
        >
          <div className="flex items-center gap-3">
            {/* Cash & Coins Icon */}
            <div className="w-11 h-11 flex items-center justify-center flex-shrink-0">
              <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="10" width="30" height="18" rx="3" fill="#10B981" />
                <rect x="7" y="12" width="26" height="14" rx="2" fill="#34D399" />
                <circle cx="20" cy="19" r="4" fill="#059669" />
                <circle cx="34" cy="30" r="7" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
                <circle cx="28" cy="33" r="6" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
                <text x="34" y="32.5" fontSize="7" fontWeight="bold" fill="#78350F" textAnchor="middle">Rs</text>
              </svg>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                CASH PRICE
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <strong className="text-base sm:text-lg font-black text-slate-900 block leading-tight">
                  {fmt(cashCalc.finalPrice)}
                </strong>
                {cashCalc.hasDiscount && (
                  <span className="text-xs text-slate-400 line-through font-semibold">
                    {fmt(price)}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Top-right "BEST DEAL" or Promotional Discount Badge */}
          <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg tracking-wider shadow-2xs">
            {cashCalc.hasDiscount ? cashCalc.badge : 'BEST DEAL'}
          </span>
        </div>

        {/* 2. Bank Transfer Box */}
        <div
          className={`relative overflow-hidden bg-white border-2 ${
            bankCalc.hasDiscount ? 'border-emerald-600 bg-emerald-50/20' : 'border-emerald-600'
          } rounded-xl p-3.5 flex items-center justify-between shadow-2xs hover:shadow-xs transition`}
        >
          <div className="flex items-center gap-3">
            {/* Bank Pillars Icon */}
            <div className="w-11 h-11 flex items-center justify-center flex-shrink-0">
              <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 8L8 17H40L24 8Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
                <rect x="11" y="19" width="4" height="13" rx="1" fill="#0284C7" />
                <rect x="19" y="19" width="4" height="13" rx="1" fill="#0284C7" />
                <rect x="25" y="19" width="4" height="13" rx="1" fill="#0284C7" />
                <rect x="33" y="19" width="4" height="13" rx="1" fill="#0284C7" />
                <rect x="7" y="34" width="34" height="4" rx="1" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
              </svg>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                BANK TRANSFER
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <strong className="text-base sm:text-lg font-black text-slate-900 block leading-tight">
                  {fmt(bankCalc.finalPrice)}
                </strong>
                {bankCalc.hasDiscount && (
                  <span className="text-xs text-slate-400 line-through font-semibold">
                    {fmt(price)}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Top-right "BEST DEAL" or Promotional Discount Badge */}
          <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg tracking-wider shadow-2xs">
            {bankCalc.hasDiscount ? bankCalc.badge : 'BEST DEAL'}
          </span>
        </div>

        {/* 3. Visa / Mastercard Box */}
        <div
          className={`relative overflow-hidden bg-white border ${
            cardCalc.hasDiscount
              ? 'border-2 border-blue-600 bg-blue-50/20'
              : 'border border-blue-300'
          } rounded-xl p-3.5 flex items-center justify-between shadow-2xs hover:border-blue-500 transition sm:col-span-2 md:col-span-1`}
        >
          <div className="flex items-center gap-3">
            {/* Visa + Mastercard Dual Logo */}
            <div className="w-14 h-8 flex items-center justify-center gap-1.5 flex-shrink-0 bg-white rounded border border-slate-100 px-1">
              <span className="text-xs font-black text-[#1A1F71] tracking-tighter italic">VISA</span>
              <svg className="w-5 h-4" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="13" cy="12" r="10" fill="#EB001B" />
                <circle cx="23" cy="12" r="10" fill="#F79E1B" fillOpacity="0.9" />
              </svg>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                VISA / MASTERCARD
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <strong className="text-base sm:text-lg font-black text-slate-900 block leading-tight">
                  {fmt(cardCalc.finalPrice)}
                </strong>
                {cardCalc.hasDiscount && (
                  <span className="text-xs text-slate-400 line-through font-semibold">
                    {fmt(price)}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Top-right promotional discount badge for card payment */}
          {cardCalc.hasDiscount && (
            <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg tracking-wider shadow-2xs">
              {cardCalc.badge}
            </span>
          )}
        </div>
      </div>

      {/* Horizontal Divider */}
      <div className="border-t border-slate-200/80 pt-3">
        {/* Section Title */}
        <h4 className="text-xs sm:text-sm font-bold text-slate-800 mb-2.5">
          Pay in 3 or 4 instalments
        </h4>

        {/* Installment Boxes Grid (KOKO & PAYZY) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* KOKO Box (Pay in 3) */}
          <div
            className={`relative overflow-hidden bg-purple-50/50 border ${
              kokoCalc.hasDiscount ? 'border-2 border-purple-500' : 'border border-purple-200'
            } rounded-xl p-3 sm:p-3.5 flex items-center justify-between hover:border-purple-400 transition shadow-2xs`}
          >
            <div className="flex items-center gap-3">
              {/* KOKO Badge with real logo */}
              <div className="w-16 h-10 flex items-center justify-center flex-shrink-0 bg-white rounded-lg border border-purple-100 shadow-2xs p-1">
                <img
                  src="/koko.png"
                  alt="Koko"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  KOKO
                </span>
                <strong className="text-sm sm:text-base font-black text-slate-900 block leading-tight">
                  3 × {fmt(kokoMonthly)}
                </strong>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-slate-500 font-medium block">
                    Total {fmt(kokoTotal)}
                  </span>
                  {kokoCalc.hasDiscount && (
                    <span className="text-[10px] text-slate-400 line-through font-medium">
                      {fmt(kokoStandardTotal)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {kokoCalc.hasDiscount && (
              <span className="absolute top-0 right-0 bg-purple-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-lg tracking-wider shadow-2xs">
                {kokoCalc.badge}
              </span>
            )}
          </div>

          {/* PAYZY Box (Pay in 4) */}
          <div
            className={`relative overflow-hidden bg-teal-50/50 border ${
              payzyCalc.hasDiscount ? 'border-2 border-teal-500' : 'border border-teal-200'
            } rounded-xl p-3 sm:p-3.5 flex items-center justify-between hover:border-teal-400 transition shadow-2xs`}
          >
            <div className="flex items-center gap-3">
              {/* PAYZY Badge with real logo */}
              <div className="w-16 h-10 flex items-center justify-center flex-shrink-0 bg-white rounded-lg border border-teal-100 shadow-2xs p-1">
                <img
                  src="/payzy.png"
                  alt="Payzy"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  PAYZY
                </span>
                <strong className="text-sm sm:text-base font-black text-slate-900 block leading-tight">
                  4 × {fmt(payzyMonthly)}
                </strong>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-slate-500 font-medium block">
                    Total {fmt(payzyTotal)}
                  </span>
                  {payzyCalc.hasDiscount && (
                    <span className="text-[10px] text-slate-400 line-through font-medium">
                      {fmt(payzyStandardTotal)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {payzyCalc.hasDiscount && (
              <span className="absolute top-0 right-0 bg-teal-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-lg tracking-wider shadow-2xs">
                {payzyCalc.badge}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stock & Warranty Pills */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        {/* Stock pill */}
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
            inStock
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              inStock ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'
            }`}
          />
          <span>
            {inStock ? 'In stock' : 'Out of stock'}
          </span>
        </div>

        {/* Warranty badge */}
        {warranty && (
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-blue-50/60 text-blue-900 border border-blue-200 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block leading-none">
                Warranty
              </span>
              <span className="text-xs font-black text-slate-800 block mt-0.5">
                {warranty}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
