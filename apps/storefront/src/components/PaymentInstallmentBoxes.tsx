'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface PaymentInstallmentBoxesProps {
  priceCents: number; // in cents e.g. 185000 for Rs. 1,850.00
  stockQty?: number;
  inStock?: boolean;
  warranty?: string;
}

export default function PaymentInstallmentBoxes({
  priceCents,
  stockQty,
  inStock = true,
  warranty,
}: PaymentInstallmentBoxesProps) {
  const price = priceCents > 0 ? priceCents / 100 : 0;

  if (price <= 0) return null;

  // 1. Normal Product Price for Cash Price, Bank Transfer, Visa / Mastercard
  const cashTotal = price;
  const bankTotal = price;
  const cardTotal = price;

  // 2. KOKO: Price + 10%, divided by 3 installments
  const kokoTotal = price * 1.10;
  const kokoMonthly = kokoTotal / 3;

  // 3. Payzy: Price + 13%, divided by 4 installments
  const payzyTotal = price * 1.13;
  const payzyMonthly = payzyTotal / 4;

  const fmt = (num: number) => {
    return 'LKR ' + num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="w-full my-4 space-y-4">
      {/* Top Section: Cash Price, Bank Transfer, Visa / Mastercard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 1. Cash Price Box (Green Border + BEST DEAL Badge) */}
        <div className="relative overflow-hidden bg-white border-2 border-emerald-600 rounded-xl p-3.5 flex items-center justify-between shadow-2xs hover:shadow-xs transition">
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
              <strong className="text-base sm:text-lg font-black text-slate-900 block leading-tight mt-0.5">
                {fmt(cashTotal)}
              </strong>
            </div>
          </div>
          {/* Top-right "BEST DEAL" Badge */}
          <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg tracking-wider shadow-2xs">
            BEST DEAL
          </span>
        </div>

        {/* 2. Bank Transfer Box (Green Border + BEST DEAL Badge) */}
        <div className="relative overflow-hidden bg-white border-2 border-emerald-600 rounded-xl p-3.5 flex items-center justify-between shadow-2xs hover:shadow-xs transition">
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
              <strong className="text-base sm:text-lg font-black text-slate-900 block leading-tight mt-0.5">
                {fmt(bankTotal)}
              </strong>
            </div>
          </div>
          {/* Top-right "BEST DEAL" Badge */}
          <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg tracking-wider shadow-2xs">
            BEST DEAL
          </span>
        </div>

        {/* 3. Visa / Mastercard Box */}
        <div className="relative overflow-hidden bg-white border border-blue-300 rounded-xl p-3.5 flex items-center justify-between shadow-2xs hover:border-blue-500 transition sm:col-span-2 md:col-span-1">
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
              <strong className="text-base sm:text-lg font-black text-slate-900 block leading-tight mt-0.5">
                {fmt(cardTotal)}
              </strong>
            </div>
          </div>
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
          <div className="bg-purple-50/50 border border-purple-200 rounded-xl p-3 sm:p-3.5 flex items-center justify-between hover:border-purple-400 transition shadow-2xs">
            <div className="flex items-center gap-3">
              {/* KOKO Badge */}
              <div className="w-12 h-10 flex items-center justify-center flex-shrink-0 bg-white rounded-lg border border-purple-100 shadow-2xs px-1">
                <span className="text-sm font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 italic">
                  KOKO
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  KOKO
                </span>
                <strong className="text-sm sm:text-base font-black text-slate-900 block leading-tight">
                  3 × {fmt(kokoMonthly)}
                </strong>
                <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                  Total {fmt(kokoTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* PAYZY Box (Pay in 4) */}
          <div className="bg-teal-50/50 border border-teal-200 rounded-xl p-3 sm:p-3.5 flex items-center justify-between hover:border-teal-400 transition shadow-2xs">
            <div className="flex items-center gap-3">
              {/* PAYZY Badge */}
              <div className="w-12 h-10 flex items-center justify-center flex-shrink-0 bg-white rounded-lg border border-teal-100 shadow-2xs px-1">
                <span className="text-sm font-black tracking-tight text-cyan-600">
                  Pay<span className="text-blue-600">zy</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  PAYZY
                </span>
                <strong className="text-sm sm:text-base font-black text-slate-900 block leading-tight">
                  4 × {fmt(payzyMonthly)}
                </strong>
                <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                  Total {fmt(payzyTotal)}
                </span>
              </div>
            </div>
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
            {stockQty !== undefined && stockQty > 0
              ? `${stockQty} in stock`
              : inStock
              ? 'In stock'
              : 'Out of stock'}
          </span>
        </div>

        {/* Warranty badge (Replica of Image 2) */}
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
