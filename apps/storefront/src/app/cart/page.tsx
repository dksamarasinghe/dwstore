'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { formatPriceLKR } from '@/lib/catalog';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronRight,
  Tag,
  MessageCircle,
  CheckCircle2,
} from 'lucide-react';

const STANDARD_SHIPPING_FEE_MINOR = 35000; // LKR 350.00

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotalMinor, itemCount } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const shippingFeeMinor = subtotalMinor === 0 ? 0 : STANDARD_SHIPPING_FEE_MINOR;

  const discountMinor = couponApplied ? Math.round(subtotalMinor * 0.05) : 0; // 5% discount
  const finalTotalMinor = subtotalMinor - discountMinor + shippingFeeMinor;

  // Exact DWstore BNPL Installment calculations (Matching product page formula):
  // KOKO: Price + 10%, divided by 3
  // Payzy: Price + 13%, divided by 4
  const priceBase = subtotalMinor > 0 ? subtotalMinor / 100 : 0;
  const kokoTotal = priceBase * 1.10;
  const kokoMonthly = kokoTotal / 3;

  const payzyTotal = priceBase * 1.13;
  const payzyMonthly = payzyTotal / 4;

  const fmtCurrency = (num: number) => {
    return 'LKR ' + num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    if (couponCode.trim().toUpperCase() === 'DWSTORE' || couponCode.trim().toUpperCase() === 'WELCOME5') {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try WELCOME5');
      setCouponApplied(false);
    }
  };

  const buildWhatsAppCartUrl = () => {
    let text = `*New Order Inquiry - DWstore.lk*\n\n`;
    cart.forEach((item, index) => {
      const varText = item.variation
        ? ` (${Object.entries(item.variation.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')})`
        : '';
      text += `${index + 1}. *${item.name}*${varText}\n   Qty: ${item.quantity} x LKR ${formatPriceLKR(item.priceMinor)} = LKR ${formatPriceLKR(item.priceMinor * item.quantity)}\n`;
    });
    text += `\n*Subtotal:* LKR ${formatPriceLKR(subtotalMinor)}\n*Delivery Fee:* ${shippingFeeMinor === 0 ? 'FREE' : `LKR ${formatPriceLKR(shippingFeeMinor)}`}\n*Total:* LKR ${formatPriceLKR(finalTotalMinor)}\n*Payment:* Cash on Delivery (COD)\n\nPlease proceed with my order!`;
    return `https://wa.me/94756693358?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200 py-3">
        <div className="page-container flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-900">Shopping Cart</span>
        </div>
      </div>

      <main className="flex-1 py-8 sm:py-12">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
              <p className="text-xs text-slate-500 mt-1">
                You have <span className="font-bold text-slate-800">{itemCount}</span> {itemCount === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Cart
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-xl mx-auto shadow-xs">
              <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-5">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h2 className="text-lg font-black text-slate-900 mb-2">Your shopping cart is empty</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
                Looks like you haven't added anything to your cart yet. Explore thousands of genuine smartwatches, earbuds, mobile accessories and original chargers with Sri Lanka warranty.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Cart Items List */}
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  {/* Table header (hidden on mobile) */}
                  <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-6">Product</div>
                    <div className="col-span-2 text-center">Price</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-2 text-right">Subtotal</div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-slate-100">
                    {cart.map((item) => (
                      <div key={item.id} className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                        {/* Product info */}
                        <div className="sm:col-span-6 flex gap-3.5 items-center">
                          <Link
                            href={`/product/${item.slug}`}
                            className="w-18 h-18 sm:w-20 sm:h-20 bg-slate-50 rounded-xl p-2 flex items-center justify-center flex-shrink-0 border border-slate-100 hover:border-blue-400 transition"
                          >
                            <img
                              src={item.image || '/placeholder-product.png'}
                              alt={item.name}
                              className="w-full h-full object-contain mix-blend-multiply"
                            />
                          </Link>
                          <div className="min-w-0">
                            <Link
                              href={`/product/${item.slug}`}
                              className="text-xs sm:text-sm font-bold text-slate-800 hover:text-blue-600 line-clamp-2 transition leading-snug"
                            >
                              {item.name}
                            </Link>
                            {item.variation && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {Object.entries(item.variation.attributes).map(([k, v]) => (
                                  <span
                                    key={k}
                                    className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold"
                                  >
                                    {k}: {v}
                                  </span>
                                ))}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="text-[11px] text-rose-500 hover:text-rose-700 flex items-center gap-1 mt-2 sm:hidden font-medium"
                            >
                              <Trash2 className="w-3 h-3" />
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="sm:col-span-2 sm:text-center flex justify-between sm:block text-xs">
                          <span className="sm:hidden text-slate-500">Unit Price:</span>
                          <span className="font-bold text-slate-800">LKR {formatPriceLKR(item.priceMinor)}</span>
                        </div>

                        {/* Quantity */}
                        <div className="sm:col-span-2 flex justify-between sm:justify-center items-center">
                          <span className="sm:hidden text-xs text-slate-500">Quantity:</span>
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Subtotal & Delete (desktop) */}
                        <div className="sm:col-span-2 flex justify-between sm:justify-end items-center gap-3">
                          <span className="sm:hidden text-xs text-slate-500">Total:</span>
                          <span className="text-xs sm:text-sm font-black text-slate-900">
                            LKR {formatPriceLKR(item.priceMinor * item.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="hidden sm:inline-flex text-slate-400 hover:text-rose-500 p-1 rounded-md transition"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Link
                      href="/shop"
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
                    >
                      <span>← Continue Shopping</span>
                    </Link>

                    {/* Coupon Form */}
                    <form onSubmit={handleApplyCoupon} className="flex gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-56">
                        <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Coupon Code"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 bg-white"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex-shrink-0"
                      >
                        Apply
                      </button>
                    </form>
                  </div>
                  {couponError && (
                    <div className="px-5 pb-3 text-[11px] text-rose-600 font-medium">{couponError}</div>
                  )}
                  {couponApplied && (
                    <div className="px-5 pb-3 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Coupon applied successfully! 5% discount deducted.
                    </div>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Islandwide COD</h4>
                      <p className="text-[10px] text-slate-400">Cash on delivery across all 25 districts</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">100% Genuine</h4>
                      <p className="text-[10px] text-slate-400">Original products with direct warranty</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Easy Returns</h4>
                      <p className="text-[10px] text-slate-400">7 days replacement guarantee</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                  <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
                    Order Summary
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal ({itemCount} items)</span>
                      <span className="font-bold text-slate-900">LKR {formatPriceLKR(subtotalMinor)}</span>
                    </div>

                    {couponApplied && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Promo Discount (5%)</span>
                        <span>- LKR {formatPriceLKR(discountMinor)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600 items-center">
                      <span className="flex items-center gap-1">
                        Shipping (Islandwide)
                      </span>
                      <span className="font-bold text-slate-900">
                        LKR {formatPriceLKR(shippingFeeMinor)}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                      <div>
                        <span className="text-sm font-black text-slate-900 block">Total</span>
                        <span className="text-[10px] text-slate-400 font-medium">Includes all taxes & delivery</span>
                      </div>
                      <span className="text-xl font-black text-blue-600">
                        LKR {formatPriceLKR(finalTotalMinor)}
                      </span>
                    </div>
                  </div>

                  {/* Installments Breakdown Card (BNPL) - Matching Product Page Formula */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Pay in Installments (BNPL)
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Debit / Credit Card</span>
                    </div>

                    {/* KOKO */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 flex items-center justify-between shadow-2xs hover:border-purple-300 transition">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black italic text-purple-600 tracking-tight">KOKO</span>
                          <span className="text-[10px] font-bold text-slate-400">• 3 Months</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Total: <strong className="text-slate-700">{fmtCurrency(kokoTotal)}</strong>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-black text-purple-700 block">
                          3 X {fmtCurrency(kokoMonthly)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">per month</span>
                      </div>
                    </div>

                    {/* PayZy */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 flex items-center justify-between shadow-2xs hover:border-cyan-300 transition">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-cyan-600 tracking-tight">
                            Pay<span className="text-blue-600">Zy</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">• 4 Months</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Total: <strong className="text-slate-700">{fmtCurrency(payzyTotal)}</strong>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-black text-cyan-700 block">
                          4 X {fmtCurrency(payzyMonthly)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">per month</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Checkout Button */}
                  <div className="space-y-2.5 pt-2">
                    <Link
                      href="/checkout"
                      className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-md"
                    >
                      <span>PROCEED TO CHECKOUT</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    {/* WhatsApp Fast Order */}
                    <a
                      href={buildWhatsAppCartUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>Order via WhatsApp</span>
                    </a>
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] text-slate-400">
                      🔒 256-Bit SSL Encrypted &amp; Secure Checkout
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
