'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Heart,
  ShoppingCart,
  User,
  GitCompare,
  Menu,
  ChevronDown,
  Flame,
  Truck,
  History,
  PhoneCall,
  Sparkles,
  X,
  Store,
  SlidersHorizontal,
} from 'lucide-react';
import categoriesData from '@/data/categories.json';
import productsData from '@/data/products.json';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPriceLKR } from '@/lib/catalog';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [compareCount, setCompareCount] = useState(0);

  // Mobile Drawer State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'menu' | 'categories'>('menu');

  // Mobile Bottom Bar Search Modal State
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');

  const { openCart, itemCount, subtotalMinor } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  // Load and listen to compare count
  useEffect(() => {
    const updateCompare = () => {
      try {
        const stored = localStorage.getItem('dwstore_compare_items');
        if (stored) {
          const parsed = JSON.parse(stored);
          setCompareCount(Array.isArray(parsed) ? parsed.length : 0);
        } else {
          setCompareCount(0);
        }
      } catch (e) {
        setCompareCount(0);
      }
    };
    updateCompare();
    window.addEventListener('dwstore_compare_updated', updateCompare);
    return () => window.removeEventListener('dwstore_compare_updated', updateCompare);
  }, []);

  // Lock body scroll when mobile drawer or mobile search modal is open
  useEffect(() => {
    if (mobileMenuOpen || mobileSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, mobileSearchOpen]);

  // Close mobile drawer and search modal on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  // Live matching products for mobile search popup
  const matchingProducts = useMemo(() => {
    const q = mobileSearchQuery.trim().toLowerCase();
    if (!q) return [];
    return (productsData as any[])
      .filter((p) => {
        const name = (p.name || '').toLowerCase();
        const sku = (p.sku || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const brand = (p.brand || '').toLowerCase();
        return name.includes(q) || sku.includes(q) || cat.includes(q) || brand.includes(q);
      })
      .slice(0, 6);
  }, [mobileSearchQuery]);

  const handleMobileSearchModalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (mobileSearchQuery.trim()) {
      setMobileSearchOpen(false);
      router.push(`/shop?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
    }
  };

  // Filter top categories with products
  const topCategories = (categoriesData as any[])
    .filter((c) => c.productCount > 0)
    .slice(0, 14);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?q=${encodeURIComponent(searchQuery.trim())}${
        selectedCat !== 'All' ? `&category=${selectedCat}` : ''
      }`;
    }
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setMobileMenuOpen(false);
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      {/* ── Top Announcement Bar ─────────────────────────────────────────────── */}
      <div className="bg-[#1056eb] text-white text-xs py-1.5">
        <div className="page-container flex items-center justify-between gap-2 px-3 sm:px-4">
          <div className="flex items-center gap-4 min-w-0">
            <span className="flex items-center gap-1.5 font-semibold whitespace-nowrap text-[11px] sm:text-xs">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 flex-shrink-0" />
              Daily Super Deals with up to 50% OFF!
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-blue-100 whitespace-nowrap">
              <Truck className="w-3.5 h-3.5 flex-shrink-0" />
              Island-wide Cash on Delivery Available
            </span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href="tel:+94756693358"
              className="hidden sm:flex items-center gap-1 text-blue-100 hover:text-white transition whitespace-nowrap"
            >
              <PhoneCall className="w-3 h-3" /> +94 75 669 3358
            </a>
            <div className="flex items-center gap-2 font-semibold text-[11px] sm:text-xs">
              <span className="cursor-pointer hover:text-blue-200">LKR (Rs.)</span>
              <span className="text-blue-300">|</span>
              <span className="cursor-pointer hover:text-blue-200">EN</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Header Bar (< md) ────────────────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between px-3 py-2.5 bg-white border-b border-slate-100">
        {/* Left: MENU Button with hamburger icon */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex items-center gap-1.5 text-slate-800 hover:text-blue-600 transition p-1 cursor-pointer flex-shrink-0"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 text-slate-800" />
          <span className="text-[11px] font-black text-slate-800 tracking-wider uppercase">MENU</span>
        </button>

        {/* Center: Brand Logo */}
        <Link href="/" className="flex items-center justify-center flex-1 px-2">
          <img
            src="/dwstore_logo.png"
            alt="DWstore.lk"
            className="h-8 sm:h-9 w-auto object-contain max-w-[140px]"
          />
        </Link>

        {/* Right: User Account + Cart Icon with badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/account"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-50 flex items-center justify-center text-slate-700 hover:text-blue-600 transition"
            aria-label="Account"
          >
            <User className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={openCart}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-50 flex items-center justify-center text-slate-700 hover:text-blue-600 transition relative cursor-pointer"
            aria-label="Open Cart"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {itemCount}
            </span>
          </button>
        </div>
      </div>

      {/* ── Desktop Main Navigation Bar (md and above) ───────────────────────── */}
      <div className="hidden md:flex page-container py-3 items-center gap-4 xl:gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0 group py-1">
          <img
            src="/dwstore_logo.png"
            alt="DWstore.lk - Sri Lanka's Premier Electronics Store"
            className="h-10 sm:h-11 md:h-12 w-auto object-contain transition group-hover:opacity-95"
          />
        </Link>

        {/* Deliver-to label badge (Island-wide Sri Lanka) */}
        <div className="hidden xl:flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/80 text-xs text-slate-600 select-none flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-blue-100/70 flex items-center justify-center flex-shrink-0 text-blue-600">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-slate-400 leading-none">Deliver to</span>
            <span className="font-bold text-slate-800 text-xs leading-tight whitespace-nowrap">
              Sri Lanka (All Districts)
            </span>
          </div>
        </div>

        {/* Search Bar — takes remaining space */}
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSearch} className="flex items-center border-2 border-blue-600 rounded-full overflow-visible shadow-sm focus-within:shadow-md transition bg-white relative">
            {/* Category pill */}
            <div
              className="relative hidden sm:block flex-shrink-0"
              onMouseLeave={() => setCatDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                className="flex items-center gap-1 border-r border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 whitespace-nowrap rounded-l-full"
              >
                <span>{selectedCat === 'All' ? 'Select Category' : selectedCat}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
              </button>

              {catDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 shadow-xl rounded-xl z-50 max-h-64 overflow-y-auto py-1">
                  <div
                    onClick={() => { setSelectedCat('All'); setCatDropdownOpen(false); }}
                    className="px-3 py-1.5 text-xs font-semibold hover:bg-blue-50 cursor-pointer text-slate-700"
                  >
                    All Categories
                  </div>
                  {topCategories.map((c: any) => (
                    <div
                      key={c.slug}
                      onClick={() => { setSelectedCat(c.name); setCatDropdownOpen(false); }}
                      className="px-3 py-1.5 text-xs hover:bg-blue-50 cursor-pointer text-slate-700 flex justify-between"
                    >
                      <span className="truncate">{c.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({c.productCount})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in 407+ original products (e.g. Smart Watch, Aspor, Anker, JBL)..."
              className="w-full px-4 py-2.5 text-sm text-slate-800 focus:outline-none placeholder:text-slate-400 min-w-0"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 transition flex items-center justify-center flex-shrink-0 rounded-r-full cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right utilities */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          {/* Compare */}
          <Link
            href="/compare"
            className="hidden lg:flex flex-col items-center text-slate-600 hover:text-blue-600 transition relative"
          >
            <div className="relative">
              <GitCompare className="w-5 h-5" />
              {compareCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {compareCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium mt-0.5">Compare</span>
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="flex flex-col items-center text-slate-600 hover:text-blue-600 transition relative"
          >
            <div className="relative">
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium mt-0.5 hidden sm:inline">Wishlist</span>
          </Link>

          {/* Cart */}
          <button
            type="button"
            onClick={openCart}
            className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition group cursor-pointer text-left"
            aria-label="Open Cart"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center transition">
                <ShoppingCart className="w-5 h-5 text-slate-700 group-hover:text-blue-600" />
              </div>
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {itemCount}
              </span>
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-[10px] text-slate-400 leading-none">Your Cart</span>
              <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                LKR {formatPriceLKR(subtotalMinor)}
              </span>
            </div>
          </button>

          {/* Account */}
          <Link
            href="/account"
            className="flex items-center gap-1.5 text-slate-700 hover:text-blue-600 transition pl-2 border-l border-slate-200"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-50 flex items-center justify-center">
              <User className="w-4 h-4 text-slate-600" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[10px] text-slate-400 leading-none">Hello, Sign In</span>
              <span className="text-xs font-bold text-slate-900">Account</span>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Desktop Sub Navigation Bar (md and above) ───────────────────────── */}
      <div className="hidden md:block border-t border-slate-100 bg-white">
        <div className="page-container flex items-center justify-between">
          {/* All Categories Mega Button */}
          <div className="relative" onMouseLeave={() => setMegaOpen(false)}>
            <button
              type="button"
              onMouseEnter={() => setMegaOpen(true)}
              onClick={() => setMegaOpen(!megaOpen)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-5 rounded-t-xl flex items-center justify-between gap-3 w-56 sm:w-64 md:w-72 transition shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Menu className="w-4 h-4 flex-shrink-0" />
                <span className="tracking-wide">All Categories</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${megaOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {megaOpen && (
              <div className="absolute top-full left-0 w-full min-w-[260px] md:min-w-[288px] bg-white border border-slate-200 shadow-2xl rounded-b-xl z-50 py-2 max-h-96 overflow-y-auto">
                {topCategories.map((cat: any) => (
                  <Link
                    key={cat.slug}
                    href={`/shop?category=${cat.slug}`}
                    className="flex items-center justify-between px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full ml-2">
                      {cat.productCount}
                    </span>
                  </Link>
                ))}
                <div className="border-t border-slate-100 mt-2 pt-2 px-4">
                  <Link href="/shop" className="text-xs font-bold text-blue-600 hover:underline block text-center py-1">
                    View All Categories →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick nav links */}
          <nav className="flex items-center gap-5 text-xs font-semibold text-slate-700 py-2">
            <Link href="/shop" className="text-blue-600 hover:text-blue-700 font-bold transition">
              All Products (407)
            </Link>
            <Link href="/shop?filter=deals" className="flex items-center gap-1 text-rose-600 hover:text-rose-700 transition">
              <Flame className="w-3.5 h-3.5 fill-rose-500" />
              Hot Deals
            </Link>
            <Link href="/brands" className="hover:text-blue-600 transition">Brands (56)</Link>
            <Link href="/shop?category=smartwatches" className="hover:text-blue-600 transition">Smart Watches</Link>
            <Link href="/shop?category=power-banks" className="hover:text-blue-600 transition">Power Banks</Link>
            <Link href="/shop?category=bluetooth-handfree" className="hover:text-blue-600 transition">Earbuds</Link>
          </nav>

          {/* Right helpers */}
          <div className="flex items-center gap-4 text-xs text-slate-500 py-2">
            <Link href="/track-order" className="flex items-center gap-1 hover:text-blue-600 transition">
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              <span>Order Tracking</span>
            </Link>
            <Link href="/account" className="flex items-center gap-1 hover:text-blue-600 transition">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>Recently Viewed</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Mobile Side Menu Drawer (Slide-out from Left) ───────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 left-0 w-[84%] max-w-[320px] bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-250">
            {/* 1. Search Box at top of side drawer */}
            <div className="p-3 border-b border-slate-200 bg-white flex items-center gap-2">
              <form onSubmit={handleMobileSearch} className="flex-1 relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products"
                  className="w-full pl-3 pr-9 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 text-slate-800 placeholder:text-slate-400 bg-slate-50/70"
                />
                <button
                  type="submit"
                  className="absolute right-2.5 text-slate-400 hover:text-blue-600"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition flex-shrink-0"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Tabs Row: MENU & CATEGORIES */}
            <div className="flex border-b border-slate-200 bg-slate-100/70">
              <button
                type="button"
                onClick={() => setMobileTab('menu')}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-wider text-center transition border-b-2 ${
                  mobileTab === 'menu'
                    ? 'bg-white text-slate-900 border-blue-600 shadow-xs'
                    : 'text-slate-500 border-transparent hover:text-slate-800'
                }`}
              >
                Menu
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('categories')}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-wider text-center transition border-b-2 ${
                  mobileTab === 'categories'
                    ? 'bg-white text-slate-900 border-blue-600 shadow-xs'
                    : 'text-slate-500 border-transparent hover:text-slate-800'
                }`}
              >
                Categories
              </button>
            </div>

            {/* 3. Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto">
              {mobileTab === 'menu' ? (
                <div className="divide-y divide-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider">
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-5 py-3.5 hover:bg-slate-50 hover:text-blue-600 transition"
                  >
                    Home
                  </Link>
                  <Link
                    href="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-5 py-3.5 hover:bg-slate-50 hover:text-blue-600 transition"
                  >
                    Shop
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-5 py-3.5 hover:bg-slate-50 hover:text-blue-600 transition"
                  >
                    About Us
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-5 py-3.5 hover:bg-slate-50 hover:text-blue-600 transition"
                  >
                    Contact Us
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 hover:text-blue-600 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Heart className="w-4 h-4 text-slate-600" />
                      <span>Wishlist</span>
                    </div>
                    {wishlistCount > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/compare"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 hover:text-blue-600 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <GitCompare className="w-4 h-4 text-slate-600" />
                      <span>Compare</span>
                    </div>
                    {compareCount > 0 && (
                      <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        {compareCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-5 py-3.5 hover:bg-slate-50 hover:text-blue-600 transition"
                  >
                    <User className="w-4 h-4 text-slate-600" />
                    <span>Login / Register</span>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {topCategories.map((cat: any) => (
                    <Link
                      key={cat.slug}
                      href={`/shop?category=${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-5 py-3 font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full ml-2">
                        {cat.productCount}
                      </span>
                    </Link>
                  ))}
                  <div className="p-4">
                    <Link
                      href="/shop"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-center py-2 px-4 rounded-lg bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 transition"
                    >
                      View All Categories →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Drawer Bottom Contact Info */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/80 text-[11px] text-slate-500 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <a href="tel:+94756693358" className="flex items-center gap-1.5 text-slate-700 hover:text-blue-600 font-bold">
                  <PhoneCall className="w-3.5 h-3.5 text-blue-600" /> +94 75 669 3358
                </a>
                <a
                  href="https://wa.me/94756693358"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold"
                >
                  WhatsApp Support
                </a>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Deliver to Sri Lanka (All Districts)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Search Popup Modal (md:hidden) ────────────────────────── */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-start animate-in fade-in duration-200">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSearchOpen(false)}
          />

          {/* Search Box & Dropdown Container */}
          <div className="relative z-10 bg-white rounded-b-3xl shadow-2xl p-4 flex flex-col max-h-[85vh] border-b border-slate-200 animate-in slide-in-from-top duration-250">
            <div className="flex items-center gap-2 pb-1">
              <form
                onSubmit={handleMobileSearchModalSubmit}
                className="flex-1 relative flex items-center"
              >
                <Search className="w-4 h-4 text-blue-600 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  placeholder="Search 400+ products, watches, audio..."
                  className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-100/80 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 placeholder:text-slate-400 font-medium transition"
                  autoFocus
                />
                {mobileSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setMobileSearchQuery('')}
                    className="absolute right-3 text-slate-400 hover:text-slate-700 p-0.5"
                    aria-label="Clear input"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="px-2.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition flex-shrink-0 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* Popular quick tags if input is empty */}
            {!mobileSearchQuery.trim() ? (
              <div className="mt-4 pt-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  Trending Searches
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Smart Watches',
                    'Airpods',
                    'Power Banks',
                    'Bluetooth Speakers',
                    'Fast Chargers',
                    'Cables',
                    'Aspor',
                    'Haino Teko',
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setMobileSearchOpen(false);
                        router.push(`/shop?q=${encodeURIComponent(tag)}`);
                      }}
                      className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-700 rounded-xl border border-transparent transition cursor-pointer font-medium"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Instant Live Search Results */
              <div className="mt-3 overflow-y-auto max-h-[55vh] divide-y divide-slate-100 no-scrollbar pr-1">
                {matchingProducts.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No products found matching &quot;{mobileSearchQuery}&quot;
                  </div>
                ) : (
                  <>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Found {matchingProducts.length} Products
                    </div>
                    {matchingProducts.map((item) => (
                      <Link
                        key={item.id}
                        href={`/product/${item.slug}`}
                        onClick={() => setMobileSearchOpen(false)}
                        className="flex items-center gap-3 py-2.5 px-1 hover:bg-slate-50 rounded-xl transition group"
                      >
                        <img
                          src={item.image || item.images?.[0] || '/dwstore_logo.png'}
                          alt={item.name}
                          className="w-11 h-11 object-contain rounded-lg border border-slate-100 bg-slate-50 p-1 flex-shrink-0 group-hover:border-blue-300"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate transition">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-black text-blue-600">
                              {formatPriceLKR(item.salePriceMinor || item.minPriceMinor || item.regularPriceMinor || 0)}
                            </span>
                            {item.brand && (
                              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                                • {item.brand}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleMobileSearchModalSubmit()}
                        className="w-full py-2.5 text-center text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer"
                      >
                        View all results for &quot;{mobileSearchQuery}&quot; &rarr;
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Fixed Mobile Bottom Navigation Bar (md:hidden) ────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] px-1 py-1.5 flex items-center justify-around">
        {/* 1. Shop */}
        <Link
          href="/shop"
          className={`flex flex-col items-center justify-center py-1 px-1.5 text-center transition flex-1 ${
            pathname === '/shop' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-blue-600'
          }`}
        >
          <Store className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Shop</span>
        </Link>

        {/* 2. Filter Button (ONLY when on Shop page /shop) */}
        {pathname === '/shop' && (
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('dwstore_open_filter_drawer'));
            }}
            className="flex flex-col items-center justify-center py-1 px-1.5 text-center text-blue-600 hover:text-blue-700 cursor-pointer relative flex-1 animate-in fade-in duration-200"
            aria-label="Filter Catalog"
          >
            <SlidersHorizontal className="w-5 h-5 text-blue-600" />
            <span className="text-[10px] font-bold mt-0.5 text-blue-600">Filter</span>
          </button>
        )}

        {/* 3. Search Button (Tapping opens mobile search popup) */}
        <button
          type="button"
          onClick={() => {
            setMobileSearchOpen(true);
          }}
          className={`flex flex-col items-center justify-center py-1 px-1.5 text-center cursor-pointer transition flex-1 ${
            mobileSearchOpen ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-blue-600'
          }`}
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Search</span>
        </button>

        {/* 4. Wishlist */}
        <Link
          href="/wishlist"
          className={`flex flex-col items-center justify-center py-1 px-1.5 text-center relative transition flex-1 ${
            pathname === '/wishlist' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-blue-600'
          }`}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium mt-0.5">Wishlist</span>
        </Link>

        {/* 5. Cart */}
        <button
          type="button"
          onClick={openCart}
          className="flex flex-col items-center justify-center py-1 px-1.5 text-center text-slate-600 hover:text-blue-600 relative cursor-pointer flex-1"
          aria-label="Cart"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {itemCount}
            </span>
          </div>
          <span className="text-[10px] font-medium mt-0.5">Cart</span>
        </button>

        {/* 6. My account */}
        <Link
          href="/account"
          className={`flex flex-col items-center justify-center py-1 px-1.5 text-center transition flex-1 ${
            pathname === '/account' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-blue-600'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">My account</span>
        </Link>
      </nav>
    </header>
  );
}
