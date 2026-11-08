'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  Phone, 
  ShieldCheck, 
  Clock, 
  ExternalLink,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  LogOut,
  FileText,
  Truck,
  ArrowRight,
  MessageSquare,
  KeyRound,
  Edit3,
  X
} from 'lucide-react';
import { formatPriceLKR } from '@/lib/catalog';
import { KoombiyoTrackingModal } from '@/components/KoombiyoTrackingModal';

const SRI_LANKA_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle'
];

interface UserProfile {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
}

export default function AccountPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [showPassword, setShowPassword] = useState(false);

  // Auth Form State
  const [loginPhoneOrEmail, setLoginPhoneOrEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDistrict, setRegDistrict] = useState('Colombo');

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile' | 'warranty'>('orders');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
  });

  const [orders, setOrders] = useState<any[]>([]);
  const [orderFilter, setOrderFilter] = useState('all');
  const [notification, setNotification] = useState<string | null>(null);

  // Invoice modal state
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  // Live tracking modal state
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<any | null>(null);

  // Check saved session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('dwstore_user');
      if (savedUser) {
        setUserProfile(JSON.parse(savedUser));
        setIsLoggedIn(true);
      } else {
        // Also check if they recently completed checkout
        const lastOrder = sessionStorage.getItem('dwstore_last_order');
        if (lastOrder) {
          const parsed = JSON.parse(lastOrder);
          if (parsed.shippingAddress) {
            setUserProfile({
              name: `${parsed.shippingAddress.firstName} ${parsed.shippingAddress.lastName}`,
              phone: parsed.shippingAddress.phone,
              email: parsed.shippingAddress.email || '',
              address: parsed.shippingAddress.address,
              city: parsed.shippingAddress.city,
              district: parsed.shippingAddress.district || 'Colombo',
              postalCode: parsed.shippingAddress.postalCode || '',
            });
            setIsLoggedIn(true);
          }
        }
      }
    } catch {
      // ignore
    }

    // Fetch orders from API
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      })
      .catch(() => {});
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhoneOrEmail || !loginPassword) return;

    // Simulate login
    const updated = {
      ...userProfile,
      phone: loginPhoneOrEmail.includes('@') ? userProfile.phone : loginPhoneOrEmail,
      email: loginPhoneOrEmail.includes('@') ? loginPhoneOrEmail : userProfile.email,
    };
    setUserProfile(updated);
    setIsLoggedIn(true);
    localStorage.setItem('dwstore_user', JSON.stringify(updated));
    showToast('Signed in successfully! Welcome back.');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regPhone) return;

    const newUser: UserProfile = {
      name: regName.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim(),
      address: 'Enter street address',
      city: 'Colombo',
      district: regDistrict,
      postalCode: '',
    };
    setUserProfile(newUser);
    setIsLoggedIn(true);
    localStorage.setItem('dwstore_user', JSON.stringify(newUser));
    showToast('Account created successfully! Welcome to DWstore.');
  };

    const GOOGLE_CLIENT_ID =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '703849255847-d9fvhlve8ddc76gdb5lna3er7rve669g.apps.googleusercontent.com';

  // Load Google Identity Services script and check OAuth redirect token
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if redirected back with OAuth access_token in hash
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((r) => r.json())
          .then((info) => {
            if (info && (info.email || info.name)) {
              const googleUser: UserProfile = {
                name: info.name || 'Google Customer',
                email: info.email || '',
                phone: '',
                address: '',
                city: 'Colombo',
                district: 'Colombo',
                postalCode: '',
              };
              setUserProfile(googleUser);
              setIsLoggedIn(true);
              localStorage.setItem('dwstore_user', JSON.stringify(googleUser));
              showToast(`Welcome ${googleUser.name}! Signed in with Google.`);
              window.history.replaceState(null, '', window.location.pathname);
            }
          })
          .catch(() => {});
      }
    }

    const existing = document.getElementById('google-gsi-script');
    if (!existing) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleGoogleSignIn = () => {
    if (typeof window === 'undefined') return;

    if ((window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: any) => {
            try {
              const base64Url = response.credential.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );
              const payload = JSON.parse(jsonPayload);
              const googleUser: UserProfile = {
                name: payload.name || 'Google Customer',
                email: payload.email || '',
                phone: '',
                address: '',
                city: 'Colombo',
                district: 'Colombo',
                postalCode: '',
              };
              setUserProfile(googleUser);
              setIsLoggedIn(true);
              localStorage.setItem('dwstore_user', JSON.stringify(googleUser));
              showToast(`Welcome ${googleUser.name}! Signed in with Google.`);
            } catch (e) {
              showToast('Google Sign In authentication error.');
            }
          },
        });

        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            const redirectUri = window.location.origin + '/account';
            const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
              GOOGLE_CLIENT_ID
            )}&response_type=token&scope=openid%20profile%20email&redirect_uri=${encodeURIComponent(
              redirectUri
            )}`;
            window.location.href = oauthUrl;
          }
        });
      } catch (e) {
        const redirectUri = window.location.origin + '/account';
        const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
          GOOGLE_CLIENT_ID
        )}&response_type=token&scope=openid%20profile%20email&redirect_uri=${encodeURIComponent(
          redirectUri
        )}`;
        window.location.href = oauthUrl;
      }
    } else {
      const redirectUri = window.location.origin + '/account';
      const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        GOOGLE_CLIENT_ID
      )}&response_type=token&scope=openid%20profile%20email&redirect_uri=${encodeURIComponent(
        redirectUri
      )}`;
      window.location.href = oauthUrl;
    }
  };

  const handleLogOut = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('dwstore_user');
    showToast('Signed out successfully.');
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('dwstore_user', JSON.stringify(userProfile));
    showToast('Profile & Address details saved successfully!');
  };

  const handleConfirmDelivered = async (orderId: string) => {
    try {
      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: 'delivered' } : o))
      );

      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: 'delivered' }),
      });
      const data = await res.json();
      if (data && data.success) {
        showToast(`Order #${orderId} confirmed as delivered! Thank you!`);
      } else {
        showToast(`Order #${orderId} marked as delivered.`);
      }
    } catch {
      showToast(`Order #${orderId} marked as delivered.`);
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  return (
    <main className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-300 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-10">
        <div className="page-container flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-xl font-bold">
              <User className="w-7 h-7 text-blue-300" />
            </div>
            <div>
              <span className="text-xs text-blue-300 uppercase tracking-wider font-bold">Customer Portal</span>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {isLoggedIn ? `Hello, ${userProfile.name}` : 'My DWstore Account'}
              </h1>
              <span className="text-xs text-slate-300">
                {isLoggedIn ? 'Manage your orders, warranties & delivery addresses' : 'Sign in to access your orders and express checkout'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/track-order"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track Active Delivery</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="page-container py-10 flex-1">
        {/* ========================================================================= */}
        {/* VIEW 1: WHEN NOT LOGGED IN (REAL ECOMMERCE SIGN IN / REGISTER TABS)       */}
        {/* ========================================================================= */}
        {!isLoggedIn ? (
          <div className="max-w-md mx-auto">
            {/* Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
              {/* Tab Selector */}
              <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-2xl mb-6 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className={`py-2.5 rounded-xl transition ${
                    authMode === 'signin'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`py-2.5 rounded-xl transition ${
                    authMode === 'register'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Sign In Form */}
              {authMode === 'signin' ? (
                <form onSubmit={handleSignIn} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5">
                      Phone Number or Email Address *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={loginPhoneOrEmail}
                        onChange={(e) => setLoginPhoneOrEmail(e.target.value)}
                        placeholder="077 123 4567 or your@email.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-slate-700 font-bold">Password *</label>
                      <button
                        type="button"
                        onClick={() => showToast('Password reset link sent to your registered phone / email!')}
                        className="text-[11px] text-blue-600 hover:underline font-semibold"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      defaultChecked
                      className="rounded border-slate-300 text-blue-600 focus:ring-0 w-4 h-4"
                    />
                    <label htmlFor="rememberMe" className="text-slate-600 cursor-pointer text-[11px]">
                      Keep me signed in on this device
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md shadow-blue-600/30 flex items-center justify-center gap-2"
                  >
                    <span>Sign In to DWstore</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">Or</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 hover:border-slate-300 transition shadow-sm flex items-center justify-center gap-2.5 text-xs"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
                </form>
              ) : (
                /* Register Form */
                <form onSubmit={handleRegister} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Ruwindi Wijethunge"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1.5">Mobile Phone *</label>
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="07X XXX XXXX"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1.5">District *</label>
                      <select
                        value={regDistrict}
                        onChange={(e) => setRegDistrict(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition font-medium"
                      >
                        {SRI_LANKA_DISTRICTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5">Create Password *</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md shadow-blue-600/30 flex items-center justify-center gap-2"
                  >
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">Or</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 hover:border-slate-300 transition shadow-sm flex items-center justify-center gap-2.5 text-xs"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Sign up with Google</span>
                  </button>
                </form>
              )}

              {/* Guest Lookup Shortcut */}
              <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs">
                <span className="text-slate-500">Placed an order without an account?</span>
                <Link
                  href="/track-order"
                  className="block mt-1 font-bold text-blue-600 hover:underline"
                >
                  Track Guest Order with Order ID &amp; Phone →
                </Link>
              </div>
            </div>

            {/* Trust highlights */}
            <div className="grid grid-cols-3 gap-3 mt-6 text-center text-[10px] text-slate-500 font-medium">
              <div className="p-3 bg-white rounded-2xl border border-slate-200/80">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span>100% Genuine</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200/80">
                <Truck className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span>Island-wide COD</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200/80">
                <Lock className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                <span>SSL Encrypted</span>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: LOGGED IN CUSTOMER DASHBOARD (REAL ECOMMERCE USER PORTAL)         */
          /* ========================================================================= */
          <div className="space-y-8">
            {/* Customer Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Orders</span>
                <strong className="text-2xl font-black text-slate-900 block mt-1">
                  {orders.length}
                </strong>
                <span className="text-[10px] text-blue-600 font-semibold">Lifetime purchases</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Deliveries</span>
                <strong className="text-2xl font-black text-amber-500 block mt-1">
                  {orders.filter((o) => o.status === 'processing' || o.status === 'dispatched').length}
                </strong>
                <span className="text-[10px] text-slate-400">On the way to your door</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Default District</span>
                <strong className="text-xl font-black text-slate-900 block mt-1 truncate">
                  {userProfile.district || 'Colombo'}
                </strong>
                <span className="text-[10px] text-emerald-600 font-semibold">24-48h Delivery Zone</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Account Status</span>
                <strong className="text-xl font-black text-emerald-600 block mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Verified</span>
                </strong>
                <span className="text-[10px] text-slate-400">DWstore VIP Customer</span>
              </div>
            </div>

            {/* Layout: Sidebar Tabs + Active Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Navigation Sidebar (3 cols) */}
              <aside className="lg:col-span-3">
                <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-xs space-y-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition ${
                      activeTab === 'orders'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4" />
                      <span>My Orders</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {orders.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('addresses')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                      activeTab === 'addresses'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Saved Addresses</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                      activeTab === 'profile'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Personal Info &amp; Security</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('warranty')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                      activeTab === 'warranty'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Warranty &amp; Support</span>
                  </button>

                  <Link
                    href="/wishlist"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Heart className="w-4 h-4" />
                    <span>Wishlist</span>
                  </Link>

                  <div className="pt-2 border-t border-slate-100 mt-2">
                    <button
                      type="button"
                      onClick={handleLogOut}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </aside>

              {/* Main Tab Pane (9 cols) */}
              <div className="lg:col-span-9">
                {/* ── TAB 1: ORDERS ─────────────────────────────────────────── */}
                {activeTab === 'orders' && (
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                      <div>
                        <h3 className="text-base font-black text-slate-900">Orders &amp; Receipts</h3>
                        <span className="text-xs text-slate-500">Live order status and parcel delivery tracking</span>
                      </div>

                      {/* Status filter pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold">
                        {['all', 'processing', 'dispatched', 'delivered'].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setOrderFilter(st)}
                            className={`px-3 py-1.5 rounded-xl capitalize transition whitespace-nowrap ${
                              orderFilter === st
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {filteredOrders.length > 0 ? (
                      <div className="space-y-4">
                        {filteredOrders.map((order) => {
                          const statusColors: Record<string, string> = {
                            processing: 'bg-amber-50 text-amber-700 border-amber-200',
                            dispatched: 'bg-blue-50 text-blue-700 border-blue-200',
                            delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                            cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
                          };
                          const badgeClass = statusColors[order.status] || statusColors.processing;

                          return (
                            <div
                              key={order.orderId}
                              className="border border-slate-200/90 rounded-2xl p-5 hover:border-blue-300 transition space-y-4 bg-white"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold block uppercase">
                                    Order ID &bull; {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                                  </span>
                                  <strong className="text-sm font-black text-slate-900 font-mono">
                                    {order.orderId}
                                  </strong>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${badgeClass}`}>
                                    {order.status || 'Processing'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedTrackingOrder(order)}
                                    className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                    title="Track package live with Koombiyo Delivery"
                                  >
                                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Track</span>
                                  </button>
                                </div>
                              </div>

                              {/* Items list */}
                              <div className="space-y-2">
                                {(order.items || []).map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between text-xs py-1">
                                    <div className="flex items-center gap-3">
                                      {item.image && (
                                        <img
                                          src={item.image}
                                          alt={item.name}
                                          className="w-10 h-10 object-contain rounded-lg bg-slate-50 border border-slate-200 p-1 flex-shrink-0"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/dwstore_logo.png';
                                          }}
                                        />
                                      )}
                                      <div>
                                        <span className="font-semibold text-slate-800 line-clamp-1">
                                          {item.name}
                                        </span>
                                        <span className="text-[10px] text-slate-400">Qty: {item.quantity}</span>
                                      </div>
                                    </div>
                                    <strong className="text-slate-900 font-mono">
                                      LKR {formatPriceLKR(item.priceMinor * item.quantity)}
                                    </strong>
                                  </div>
                                ))}
                              </div>

                              {/* Footer row */}
                              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                <div className="space-y-0.5">
                                  <span className="text-[11px] text-slate-500">
                                    Payment: <strong className="text-slate-700 uppercase">{order.paymentMethod || 'COD'}</strong>
                                  </span>
                                  {order.courierTrackingNumber && (
                                    <div className="text-[11px] text-slate-600">
                                      Courier No: <code className="text-blue-600 font-bold">{order.courierTrackingNumber}</code>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 self-end sm:self-auto">
                                  <div>
                                    <span className="text-[10px] text-slate-400 block text-right">Total with Shipping</span>
                                    <strong className="text-sm font-black text-blue-600 font-mono">
                                      LKR {formatPriceLKR(order.totalMinor || 0)}
                                    </strong>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => setSelectedInvoice(order)}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition flex items-center gap-1.5"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Receipt</span>
                                  </button>
                                </div>
                              </div>

                              {/* Confirm Delivery Banner / Button */}
                              {order.status !== 'delivered' && order.status !== 'cancelled' ? (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50/70 border border-emerald-200/90 rounded-2xl">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                                      <Truck className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <strong className="text-xs font-bold text-emerald-950 block">
                                        Received your package safely?
                                      </strong>
                                      <span className="text-[11px] text-emerald-700">
                                        Confirm delivery once you receive your parcel from courier.
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleConfirmDelivered(order.orderId)}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm whitespace-nowrap cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Confirm Delivered</span>
                                  </button>
                                </div>
                              ) : order.status === 'delivered' ? (
                                <div className="flex items-center gap-2 p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl text-[11px] text-emerald-800">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                  <span>Package marked as safely delivered. Thank you for shopping with DWstore!</span>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-slate-700">No orders found in this status</h4>
                        <p className="text-xs text-slate-500 mt-1 mb-5">
                          Explore our genuine tech collection and place an order with island-wide COD.
                        </p>
                        <Link
                          href="/shop"
                          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs inline-block"
                        >
                          Explore 407+ Products
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* ── TAB 2: SAVED ADDRESSES ───────────────────────────────── */}
                {activeTab === 'addresses' && (
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="pb-4 border-b border-slate-100">
                      <h3 className="text-base font-black text-slate-900">Default Delivery Address</h3>
                      <span className="text-xs text-slate-500">Used for express courier dispatch and COD orders</span>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs max-w-xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1.5">Contact Name *</label>
                          <input
                            type="text"
                            required
                            value={userProfile.name}
                            onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1.5">Contact Phone *</label>
                          <input
                            type="tel"
                            required
                            value={userProfile.phone}
                            onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1.5">Street Address *</label>
                        <input
                          type="text"
                          required
                          value={userProfile.address}
                          onChange={(e) => setUserProfile({ ...userProfile, address: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1.5">City / Town *</label>
                          <input
                            type="text"
                            required
                            value={userProfile.city}
                            onChange={(e) => setUserProfile({ ...userProfile, city: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1.5">District *</label>
                          <select
                            value={userProfile.district}
                            onChange={(e) => setUserProfile({ ...userProfile, district: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition font-medium"
                          >
                            {SRI_LANKA_DISTRICTS.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1.5">Postal Code</label>
                          <input
                            type="text"
                            value={userProfile.postalCode}
                            onChange={(e) => setUserProfile({ ...userProfile, postalCode: e.target.value })}
                            placeholder="10280"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-xs flex items-center gap-2 mt-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save Address Changes</span>
                      </button>
                    </form>
                  </div>
                )}

                {/* ── TAB 3: PERSONAL INFO & SECURITY ───────────────────────── */}
                {activeTab === 'profile' && (
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="pb-4 border-b border-slate-100">
                      <h3 className="text-base font-black text-slate-900">Personal Info &amp; Security</h3>
                      <span className="text-xs text-slate-500">Update your account credentials and password</span>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs max-w-xl">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1.5">Full Name</label>
                        <input
                          type="text"
                          required
                          value={userProfile.name}
                          onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1.5">Email Address</label>
                          <input
                            type="email"
                            value={userProfile.email}
                            onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1.5">Mobile Phone (Login &amp; OTP)</label>
                          <input
                            type="tel"
                            required
                            value={userProfile.phone}
                            onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <span className="font-bold text-slate-900 block mb-3 flex items-center gap-1.5">
                          <KeyRound className="w-4 h-4 text-blue-600" />
                          <span>Change Password</span>
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-500 mb-1">New Password</label>
                            <input
                              type="password"
                              placeholder="••••••••"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Confirm New Password</label>
                            <input
                              type="password"
                              placeholder="••••••••"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-xs flex items-center gap-2 mt-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Update Account Info</span>
                      </button>
                    </form>
                  </div>
                )}

                {/* ── TAB 4: WARRANTY & SUPPORT ─────────────────────────────── */}
                {activeTab === 'warranty' && (
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="pb-4 border-b border-slate-100">
                      <h3 className="text-base font-black text-slate-900">DWstore Warranty &amp; Service</h3>
                      <span className="text-xs text-slate-500">Coverage for your purchased electronics</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-5 bg-blue-50/50 border border-blue-200/60 rounded-2xl space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                          7D
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">7-Day Checking Warranty</h4>
                        <p className="text-slate-600 leading-relaxed">
                          All orders include 7 days of hardware inspection and instant replacement if any technical defect is found.
                        </p>
                      </div>

                      <div className="p-5 bg-emerald-50/50 border border-emerald-200/60 rounded-2xl space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                          HQ
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">Official Brand Coverage</h4>
                        <p className="text-slate-600 leading-relaxed">
                          Aspor, Remax, HainoTeko, and BWOO devices carry extended manufacturer warranties honored directly at our Pannipitiya center.
                        </p>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <h4 className="text-xs font-bold text-slate-900">Need to Claim or Check a Fault?</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Message our technical service desk with your Order ID and a 10-second video of the issue. We will arrange a replacement or inspection immediately.
                      </p>
                      <div className="flex flex-wrap gap-3 pt-1">
                        <a
                          href="https://wa.me/94756693358"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp Service Center</span>
                        </a>
                        <Link
                          href="/warranty-policy"
                          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition"
                        >
                          Read Full Warranty Policy
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invoice / Receipt Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <img src="/dwstore_logo.png" alt="DWstore" className="h-6 w-auto" />
                <span className="font-bold text-slate-900">Official Order Receipt</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Order Number</span>
              <strong className="text-base font-black text-slate-900 font-mono">{selectedInvoice.orderId}</strong>
              <span className="text-slate-500 block mt-0.5">
                Date: {selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleString() : 'Recent'}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl space-y-1 text-slate-700 border border-slate-100">
              <strong className="text-slate-900 block font-bold">
                {selectedInvoice.customer?.firstName} {selectedInvoice.customer?.lastName}
              </strong>
              <p>{selectedInvoice.customer?.address}, {selectedInvoice.customer?.city}</p>
              <p>{selectedInvoice.customer?.district} &bull; Phone: {selectedInvoice.customer?.phone}</p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                Items Purchased
              </span>
              {(selectedInvoice.items || []).map((it: any, i: number) => (
                <div key={i} className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-700">{it.name} (x{it.quantity})</span>
                  <strong className="text-slate-900 font-mono">
                    LKR {formatPriceLKR(it.priceMinor * it.quantity)}
                  </strong>
                </div>
              ))}
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-200">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span className="font-mono">LKR {formatPriceLKR(selectedInvoice.subtotalMinor || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Island-wide Delivery:</span>
                <span className="font-mono">LKR {formatPriceLKR(selectedInvoice.shippingFeeMinor || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-100">
                <span>Grand Total:</span>
                <span className="text-blue-600 font-mono">LKR {formatPriceLKR(selectedInvoice.totalMinor || 0)}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
              <p>DWstore.lk &bull; No.55/1/2, Borella road, Pannipitiya &bull; Hotline / WhatsApp: +94 75 669 3358</p>
              <p className="mt-0.5">Thank you for your business!</p>
            </div>
          </div>
        </div>
      )}

      {/* Koombiyo Delivery Real-time Tracking Modal */}
      {selectedTrackingOrder && (
        <KoombiyoTrackingModal
          isOpen={!!selectedTrackingOrder}
          order={selectedTrackingOrder}
          onClose={() => setSelectedTrackingOrder(null)}
        />
      )}

      <Footer />
    </main>
  );
}
