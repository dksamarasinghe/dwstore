'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { formatPriceLKR } from '@/lib/catalog';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Building2,
  ChevronRight,
  MessageCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Tag,
} from 'lucide-react';

const SRI_LANKA_DISTRICTS = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Monaragala',
  'Ratnapura',
  'Kegalle',
  'Ampara',
  'Batticaloa',
  'Trincomalee',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Mullaitivu',
  'Vavuniya',
];

const FREE_SHIPPING_THRESHOLD_MINOR = 1500000;
const STANDARD_SHIPPING_FEE_MINOR = 35000;

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotalMinor, clearCart } = useCart();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    altPhone: '',
    email: '',
    address: '',
    city: '',
    district: 'Colombo',
    postalCode: '',
    orderNotes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank' | 'koko' | 'card' | 'payzy'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [gatewaysConfig, setGatewaysConfig] = useState<any>(null);

  // Fetch live gateway credentials, bank accounts, and active discounts
  useEffect(() => {
    fetch('/api/integrations/payment-gateways?public=true')
      .then((r) => r.json())
      .then((data) => {
        if (data?.gateways) {
          setGatewaysConfig(data.gateways);
        }
      })
      .catch((err) => console.error('Failed to load gateways config:', err));
  }, []);

  // Map paymentMethod ('cod' | 'bank' | 'card' | 'koko' | 'payzy') to gateway config key ('cod' | 'bank' | 'payhere' | 'koko' | 'payzy')
  const activeGatewayKey = paymentMethod === 'card' ? 'payhere' : paymentMethod;
  const activeGateway = gatewaysConfig?.[activeGatewayKey];

  // Helper to get promotional discount badge
  const getGatewayPromoBadge = (key: string) => {
    const gwKey = key === 'card' ? 'payhere' : key;
    const gw = gatewaysConfig?.[gwKey];
    if (!gw?.discountEnabled || !Number(gw?.discountValue)) return null;
    if (gw.discountBadge) return gw.discountBadge;
    if (gw.discountType === 'fixed') {
      return `LKR ${Number(gw.discountValue).toLocaleString()} OFF`;
    }
    return `${gw.discountValue}% OFF`;
  };

  // Calculate payment method discount in minor units (cents)
  const paymentDiscountMinor = useMemo(() => {
    if (!activeGateway?.discountEnabled || !Number(activeGateway?.discountValue)) return 0;
    const val = Number(activeGateway.discountValue);
    if (activeGateway.discountType === 'fixed') {
      const fixedMinor = Math.round(val * 100);
      return Math.min(fixedMinor, subtotalMinor);
    }
    return Math.round((subtotalMinor * val) / 100);
  }, [activeGateway, subtotalMinor]);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Auto-restore coupon from cart session
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('dwstore_cart_coupon');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.code) {
          setCouponCode(parsed.code);
          setAppliedCoupon(parsed);
          setCouponSuccess(`Coupon "${parsed.code}" applied from cart!`);
        }
      }
    } catch {}
  }, []);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const subtotalRs = subtotalMinor / 100;
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(couponCode.trim())}&subtotal=${subtotalRs}`);
      const data = await res.json();

      if (data.valid && data.coupon) {
        setAppliedCoupon(data.coupon);
        setCouponSuccess(data.message || `Coupon "${data.coupon.code}" applied successfully!`);
        try {
          sessionStorage.setItem('dwstore_cart_coupon', JSON.stringify({
            code: data.coupon.code,
            discountType: data.coupon.discountType,
            discountValue: data.coupon.discountValue,
            minSpend: data.coupon.minSpend,
          }));
        } catch {}
      } else {
        setAppliedCoupon(null);
        setCouponError(data.error || 'Invalid coupon code.');
        try {
          sessionStorage.removeItem('dwstore_cart_coupon');
        } catch {}
      }
    } catch (err: any) {
      setCouponError('Failed to validate coupon: ' + err.message);
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
    try {
      sessionStorage.removeItem('dwstore_cart_coupon');
    } catch {}
  };

  // Calculate dynamic coupon discount in minor units (cents)
  const couponDiscountMinor = useMemo(() => {
    if (!appliedCoupon || subtotalMinor === 0) return 0;
    const subtotalRs = subtotalMinor / 100;
    if (appliedCoupon.minSpend && subtotalRs < appliedCoupon.minSpend) {
      return 0;
    }
    if (appliedCoupon.discountType === 'percentage') {
      return Math.round((subtotalMinor * (appliedCoupon.discountValue || 0)) / 100);
    }
    const fixedMinor = Math.round((appliedCoupon.discountValue || 0) * 100);
    return Math.min(fixedMinor, subtotalMinor);
  }, [appliedCoupon, subtotalMinor]);

  const shippingFeeMinor = subtotalMinor >= FREE_SHIPPING_THRESHOLD_MINOR || subtotalMinor === 0
    ? 0
    : STANDARD_SHIPPING_FEE_MINOR;

  const totalMinor = Math.max(0, subtotalMinor + shippingFeeMinor - paymentDiscountMinor - couponDiscountMinor);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required for courier delivery';
    } else if (!/^[0-9+\s-]{9,15}$/.test(formData.phone.trim())) {
      errors.phone = 'Please enter a valid phone number (e.g. 0771234567)';
    }
    if (!formData.address.trim()) errors.address = 'Street address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.district.trim()) errors.district = 'District is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const orderId = `DWS-${Date.now().toString().slice(-6)}`;

    // Store order in session for success screen
    const orderData = {
      orderId,
      items: cart,
      subtotalMinor,
      shippingFeeMinor,
      paymentDiscountMinor,
      couponDiscountMinor,
      couponCode: appliedCoupon?.code || '',
      totalMinor,
      shippingAddress: formData,
      paymentMethod,
      createdAt: new Date().toISOString(),
    };

    // Save order to API
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customer: formData,
          items: cart,
          subtotalMinor,
          shippingFeeMinor,
          paymentDiscountMinor,
          couponDiscountMinor,
          couponCode: appliedCoupon?.code || '',
          totalMinor,
          paymentMethod,
        }),
      });
    } catch (err) {
      console.error('Failed to create order record:', err);
    }

    try {
      sessionStorage.setItem('dwstore_last_order', JSON.stringify(orderData));
    } catch (err) {
      console.error(err);
    }

    // Online Payment Gateways Handler (PayHere, Koko, Payzy)
    if (paymentMethod === 'card' || paymentMethod === 'koko' || paymentMethod === 'payzy') {
      const gatewayEndpoint =
        paymentMethod === 'card'
          ? '/api/payments/payhere/initiate'
          : paymentMethod === 'koko'
          ? '/api/payments/koko/initiate'
          : '/api/payments/payzy/initiate';

      try {
        const totalAmountRs = (totalMinor / 100).toFixed(2);
        const res = await fetch(gatewayEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            amount: totalAmountRs,
            currency: 'LKR',
            customer: formData,
            items: cart.map((i) => i.name).join(', ') || 'DWstore Electronics Order',
          }),
        });

        const data = await res.json();
        if (data.success && data.checkoutUrl && data.params) {
          // Dynamically construct and auto-submit payment gateway form
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = data.checkoutUrl;
          form.style.display = 'none';

          for (const [key, value] of Object.entries(data.params)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = String(value);
            form.appendChild(input);
          }

          document.body.appendChild(form);
          clearCart();
          form.submit();
          return;
        } else {
          alert(data.error || 'Payment gateway configuration error. Please choose Cash on Delivery or contact us.');
          setIsSubmitting(false);
          return;
        }
      } catch (err: any) {
        console.error('Payment gateway redirection error:', err);
        alert('Could not initiate online payment gateway. Please choose Cash on Delivery or Bank Deposit.');
        setIsSubmitting(false);
        return;
      }
    }

    setTimeout(() => {
      clearCart();
      router.push(`/order-success?orderId=${orderId}`);
    }, 800);
  };

  const handleOrderViaWhatsApp = () => {
    if (!validateForm()) return;

    const orderId = `DWS-${Date.now().toString().slice(-6)}`;

    // Save order in API for WhatsApp tracking as well
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        customer: formData,
        items: cart,
        subtotalMinor,
        shippingFeeMinor,
        totalMinor,
        paymentMethod: 'whatsapp',
      }),
    }).catch(console.error);
    let message = `*📦 New Order - DWstore.lk*\n`;
    message += `*Order ID:* #${orderId}\n\n`;
    message += `*Customer Details:*\n`;
    message += `👤 Name: ${formData.firstName} ${formData.lastName}\n`;
    message += `📞 Phone: ${formData.phone}${formData.altPhone ? ` / ${formData.altPhone}` : ''}\n`;
    message += `📍 Address: ${formData.address}, ${formData.city}, ${formData.district}\n`;
    if (formData.orderNotes) {
      message += `📝 Note: ${formData.orderNotes}\n`;
    }

    message += `\n*Ordered Items:*\n`;
    cart.forEach((item, index) => {
      const varText = item.variation
        ? ` (${Object.entries(item.variation.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')})`
        : '';
      message += `${index + 1}. ${item.name}${varText}\n   Qty: ${item.quantity} x LKR ${formatPriceLKR(item.priceMinor)} = LKR ${formatPriceLKR(item.priceMinor * item.quantity)}\n`;
    });

    message += `\n*Subtotal:* LKR ${formatPriceLKR(subtotalMinor)}\n`;
    if (couponDiscountMinor > 0) {
      message += `*Promo Coupon (${appliedCoupon?.code}):* -LKR ${formatPriceLKR(couponDiscountMinor)}\n`;
    }
    if (paymentDiscountMinor > 0) {
      message += `*Payment Method Discount:* -LKR ${formatPriceLKR(paymentDiscountMinor)}\n`;
    }
    message += `*Delivery Fee:* ${shippingFeeMinor === 0 ? 'FREE' : `LKR ${formatPriceLKR(shippingFeeMinor)}`}\n`;
    message += `*Total Amount:* LKR ${formatPriceLKR(totalMinor)}\n`;
    message += `*Payment Method:* ${paymentMethod.toUpperCase()}\n\n`;
    message += `Please confirm my order and send tracking details!`;

    const waUrl = `https://wa.me/94756693358?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-slate-900 mb-2">Your cart is empty</h1>
          <p className="text-xs text-slate-500 mb-6">You need items in your cart to proceed with checkout.</p>
          <Link
            href="/shop"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Go to Shop
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200 py-3">
        <div className="page-container flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/cart" className="hover:text-blue-600">Cart</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-900">Checkout</span>
        </div>
      </div>

      <main className="flex-1 py-8 sm:py-12">
        <div className="page-container">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Secure Checkout</h1>
          <p className="text-xs text-slate-500 mb-8">
            Islandwide Cash on Delivery available across all 25 districts of Sri Lanka.
          </p>

          <form onSubmit={handleCompleteOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Customer Details & Payment */}
              <div className="lg:col-span-8 space-y-6">
                {/* 1. Customer Details */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                      Customer &amp; Delivery Information
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        First Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="e.g. Kasun"
                        className={`w-full px-3.5 py-2.5 text-xs border rounded-xl focus:outline-none bg-slate-50/50 ${
                          formErrors.firstName ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 focus:border-blue-600'
                        }`}
                      />
                      {formErrors.firstName && (
                        <span className="text-[10px] text-rose-500 mt-1 block">{formErrors.firstName}</span>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Last Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="e.g. Perera"
                        className={`w-full px-3.5 py-2.5 text-xs border rounded-xl focus:outline-none bg-slate-50/50 ${
                          formErrors.lastName ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 focus:border-blue-600'
                        }`}
                      />
                      {formErrors.lastName && (
                        <span className="text-[10px] text-rose-500 mt-1 block">{formErrors.lastName}</span>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Phone Number (WhatsApp preferred) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="077 123 4567"
                        className={`w-full px-3.5 py-2.5 text-xs border rounded-xl focus:outline-none bg-slate-50/50 ${
                          formErrors.phone ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 focus:border-blue-600'
                        }`}
                      />
                      {formErrors.phone && (
                        <span className="text-[10px] text-rose-500 mt-1 block">{formErrors.phone}</span>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Alternative Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        name="altPhone"
                        value={formData.altPhone}
                        onChange={handleInputChange}
                        placeholder="071 987 6543"
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 bg-slate-50/50"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Email Address (Optional - for receipt)
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="kasun@example.com"
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 bg-slate-50/50"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Street Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="House No, Street name, Near Landmark"
                        className={`w-full px-3.5 py-2.5 text-xs border rounded-xl focus:outline-none bg-slate-50/50 ${
                          formErrors.address ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 focus:border-blue-600'
                        }`}
                      />
                      {formErrors.address && (
                        <span className="text-[10px] text-rose-500 mt-1 block">{formErrors.address}</span>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        City / Town <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g. Maharagama"
                        className={`w-full px-3.5 py-2.5 text-xs border rounded-xl focus:outline-none bg-slate-50/50 ${
                          formErrors.city ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 focus:border-blue-600'
                        }`}
                      />
                      {formErrors.city && (
                        <span className="text-[10px] text-rose-500 mt-1 block">{formErrors.city}</span>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        District <span className="text-rose-500">*</span>
                      </label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 bg-white cursor-pointer"
                      >
                        {SRI_LANKA_DISTRICTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Order Notes / Delivery Directions (Optional)
                      </label>
                      <textarea
                        name="orderNotes"
                        value={formData.orderNotes}
                        onChange={handleInputChange}
                        rows={2}
                        placeholder="Notes about your delivery, e.g. landmark, call before arriving..."
                        className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Payment Method */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                      Select Payment Method
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {/* COD */}
                    <label
                      className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition ${
                        paymentMethod === 'cod'
                          ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-black text-slate-900 flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-emerald-600" />
                            Cash on Delivery (COD)
                          </span>
                          <div className="flex items-center gap-1.5">
                            {getGatewayPromoBadge('cod') && (
                              <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-emerald-600" /> {getGatewayPromoBadge('cod')}
                              </span>
                            )}
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                              Most Popular
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {gatewaysConfig?.cod?.description || 'Pay cash to the courier delivery rider when your package arrives at your doorstep.'}
                        </p>
                      </div>
                    </label>

                    {/* Bank Transfer */}
                    <label
                      className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition ${
                        paymentMethod === 'bank'
                          ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank"
                        checked={paymentMethod === 'bank'}
                        onChange={() => setPaymentMethod('bank')}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-black text-slate-900 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            Direct Bank Transfer / Deposit
                          </span>
                          {getGatewayPromoBadge('bank') && (
                            <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-600" /> {getGatewayPromoBadge('bank')}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {gatewaysConfig?.bank?.description || 'Transfer directly into our bank account and WhatsApp the deposit slip.'}
                        </p>

                        {paymentMethod === 'bank' && (
                          <div className="mt-3 p-3.5 bg-white rounded-xl border border-slate-200 text-[11px] space-y-2.5 text-slate-700 shadow-xs">
                            {(gatewaysConfig?.bank?.accounts || [
                              {
                                bankName: 'Commercial Bank of Ceylon',
                                accountName: 'DWstore (Pvt) Ltd',
                                accountNumber: '8010023456',
                                branch: 'Colombo',
                              },
                            ]).map((acc: any, i: number) => (
                              <div key={acc.id || i} className="pb-2.5 border-b border-slate-100 last:border-b-0 last:pb-0">
                                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-1">
                                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                                  {acc.bankName}
                                </div>
                                <div className="text-slate-600">
                                  Account Name: <span className="font-semibold text-slate-800">{acc.accountName}</span>
                                </div>
                                <div className="text-slate-600 flex items-center gap-1 flex-wrap mt-0.5">
                                  <span>Account Number:</span>
                                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 select-all">
                                    {acc.accountNumber}
                                  </span>
                                  {acc.branch && <span className="text-slate-500">| Branch: {acc.branch}</span>}
                                </div>
                              </div>
                            ))}
                            <div className="text-slate-500 pt-1 text-[10px] border-t border-slate-100 italic">
                              {gatewaysConfig?.bank?.instructions ||
                                '* Please send the deposit receipt / screenshot to our WhatsApp after placing the order.'}
                            </div>
                          </div>
                        )}
                      </div>
                    </label>

                    {/* KOKO */}
                    <label
                      className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition ${
                        paymentMethod === 'koko'
                          ? 'border-purple-600 bg-purple-50/40 ring-1 ring-purple-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="koko"
                        checked={paymentMethod === 'koko'}
                        onChange={() => setPaymentMethod('koko')}
                        className="mt-0.5 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-black text-slate-900 flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px] font-bold">K</span>
                            KOKO - Pay in 3 Installments (BNPL)
                          </span>
                          <div className="flex items-center gap-1.5">
                            {getGatewayPromoBadge('koko') && (
                              <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-emerald-600" /> {getGatewayPromoBadge('koko')}
                              </span>
                            )}
                            <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                              3 X LKR {formatPriceLKR(Math.round((totalMinor * 1.10) / 3))}
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Pay 1/3 today using debit/credit card and the remainder over 2 months (+10% interest rate).
                        </p>
                      </div>
                    </label>

                    {/* Card Payment */}
                    <label
                      className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition ${
                        paymentMethod === 'card'
                          ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-black text-slate-900 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-blue-600" />
                            Credit or Debit Card (Visa / Mastercard)
                          </span>
                          <div className="flex items-center gap-1.5">
                            {getGatewayPromoBadge('card') && (
                              <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-emerald-600" /> {getGatewayPromoBadge('card')}
                              </span>
                            )}
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] font-black text-blue-700 border border-slate-200 px-1.5 py-0.5 rounded">VISA</span>
                              <span className="text-[9px] font-black text-red-600 border border-slate-200 px-1.5 py-0.5 rounded">MC</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Secure 256-bit encrypted online card payment via PayHere Sri Lanka.
                        </p>
                      </div>
                    </label>

                    {/* Payzy BNPL */}
                    <label
                      className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition ${
                        paymentMethod === 'payzy'
                          ? 'border-pink-600 bg-pink-50/40 ring-1 ring-pink-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="payzy"
                        checked={paymentMethod === 'payzy'}
                        onChange={() => setPaymentMethod('payzy')}
                        className="mt-0.5 text-pink-600 focus:ring-pink-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-black text-slate-900 flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded-full bg-pink-600 text-white flex items-center justify-center text-[9px] font-bold">P</span>
                            Payzy - Flexible Installments (BNPL)
                          </span>
                          <div className="flex items-center gap-1.5">
                            {getGatewayPromoBadge('payzy') && (
                              <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-emerald-600" /> {getGatewayPromoBadge('payzy')}
                              </span>
                            )}
                            <span className="text-[10px] font-bold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                              Up to 4 Months
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Split your purchase into interest-free installments using your Debit or Credit card.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Review & Submit */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                  <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
                    Order Summary
                  </h3>

                  {/* Product items mini list */}
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-3 items-center text-xs">
                        <div className="w-12 h-12 bg-slate-50 rounded-lg p-1 border border-slate-100 flex-shrink-0 flex items-center justify-center">
                          <img
                            src={item.image || '/placeholder-product.png'}
                            alt={item.name}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 truncate">{item.name}</h4>
                          <div className="text-[10px] text-slate-400">
                            Qty: {item.quantity} x LKR {formatPriceLKR(item.priceMinor)}
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 flex-shrink-0">
                          LKR {formatPriceLKR(item.priceMinor * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Calculations */}
                  <div className="space-y-2.5 text-xs pt-3 border-t border-slate-100">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-bold text-slate-900">LKR {formatPriceLKR(subtotalMinor)}</span>
                    </div>

                    <div className="flex justify-between text-slate-600 items-center">
                      <span>Islandwide Shipping</span>
                      <span className={`font-bold ${shippingFeeMinor === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {shippingFeeMinor === 0 ? 'FREE' : `LKR ${formatPriceLKR(shippingFeeMinor)}`}
                      </span>
                    </div>

                    {couponDiscountMinor > 0 && (
                      <div className="flex justify-between text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200/80 items-center font-bold">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5 text-emerald-600" />
                          Promo Coupon ({appliedCoupon?.code})
                        </span>
                        <span>-LKR {formatPriceLKR(couponDiscountMinor)}</span>
                      </div>
                    )}

                    {paymentDiscountMinor > 0 && (
                      <div className="flex justify-between text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200/80 items-center font-bold">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          Payment Promo Discount ({getGatewayPromoBadge(paymentMethod) || `${activeGateway?.discountValue}%`})
                        </span>
                        <span>-LKR {formatPriceLKR(paymentDiscountMinor)}</span>
                      </div>
                    )}

                    {/* Coupon Input Box */}
                    <div className="pt-2 border-t border-slate-100">
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs">
                          <div className="flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="font-mono font-bold text-emerald-800">{appliedCoupon.code}</span>
                            <span className="text-emerald-700 font-semibold">(-LKR {formatPriceLKR(couponDiscountMinor)})</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="text-[11px] text-rose-600 hover:text-rose-700 font-bold underline"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
                          <div className="relative flex-1">
                            <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              placeholder="Have a promo coupon?"
                              className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 bg-white font-mono uppercase"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={couponLoading || !couponCode.trim()}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition flex-shrink-0"
                          >
                            {couponLoading ? '...' : 'Apply'}
                          </button>
                        </form>
                      )}
                      {couponError && (
                        <div className="text-[10px] text-rose-600 font-medium mt-1">{couponError}</div>
                      )}
                      {couponSuccess && (
                        <div className="text-[10px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {couponSuccess}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                      <span className="text-sm font-black text-slate-900">Total</span>
                      <span className="text-xl font-black text-blue-600">
                        LKR {formatPriceLKR(totalMinor)}
                      </span>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="space-y-2.5 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span>Processing Order...</span>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>PLACE ORDER NOW</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleOrderViaWhatsApp}
                      className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>Confirm via WhatsApp (Fast Track)</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>100% Buyer Protection &amp; Genuine Products</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Truck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span>Fast Delivery across Sri Lanka within 1-3 days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
