'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPriceLKR } from '@/lib/catalog';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck, MessageCircle } from 'lucide-react';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, updateQuantity, removeFromCart, subtotalMinor, itemCount } = useCart();

  if (!isOpen) return null;

  const buildWhatsAppCartUrl = () => {
    let text = `*New Order Inquiry - DWstore.lk*\n\n`;
    cart.forEach((item, index) => {
      const varText = item.variation
        ? ` (${Object.entries(item.variation.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')})`
        : '';
      text += `${index + 1}. *${item.name}*${varText}\n   Qty: ${item.quantity} x LKR ${formatPriceLKR(item.priceMinor)} = LKR ${formatPriceLKR(item.priceMinor * item.quantity)}\n`;
    });
    text += `\n*Subtotal:* LKR ${formatPriceLKR(subtotalMinor)}\n*Delivery:* Islandwide COD\n\nPlease confirm availability and deliver to my address.`;
    return `https://wa.me/94756693358?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Your Shopping Cart</h2>
                <p className="text-xs text-slate-500">{itemCount} {itemCount === 1 ? 'item' : 'items'} in total</p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">Your cart is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mb-6">
                  Explore our genuine electronics, smartwatches, and accessories from top global brands.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-white transition group"
                >
                  <div className="w-20 h-20 bg-slate-50 rounded-lg p-2 flex items-center justify-center flex-shrink-0">
                    <img
                      src={item.image || '/placeholder-product.png'}
                      alt={item.name}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="text-xs font-bold text-slate-800 hover:text-blue-600 line-clamp-2 leading-snug transition"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.variation && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {Object.entries(item.variation.attributes).map(([k, v]) => (
                            <span
                              key={k}
                              className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium"
                            >
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900 block leading-tight">
                          LKR {formatPriceLKR(item.priceMinor * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-slate-400 block">
                            (LKR {formatPriceLKR(item.priceMinor)} each)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">LKR {formatPriceLKR(subtotalMinor)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  <span className="text-slate-700 font-medium">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Estimated Total</span>
                  <span className="text-blue-600">LKR {formatPriceLKR(subtotalMinor)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-center text-xs font-bold text-slate-700 transition"
                >
                  View Full Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  Checkout
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Order via WhatsApp */}
              <a
                href={buildWhatsAppCartUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                Quick Order via WhatsApp
              </a>

              <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  100% Genuine Guaranteed
                </span>
                <span>•</span>
                <span>Cash on Delivery</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
