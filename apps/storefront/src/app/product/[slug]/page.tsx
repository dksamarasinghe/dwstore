'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PaymentInstallmentBoxes from '@/components/PaymentInstallmentBoxes';
import productsData from '@/data/products.json';
import { formatPriceLKR, isProductInStock } from '@/lib/catalog';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { resolveImageUrl } from '@/lib/image';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  ChevronRight, 
  CheckCircle2, 
  X,
  MessageCircle,
  GitCompare,
  Zap,
  PhoneCall
} from 'lucide-react';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  const [product, setProduct] = useState<any>(() => {
    return (productsData as any[]).find(
      (p) => p.slug === slug || String(p.id) === String(slug)
    ) || null;
  });

  // Fetch latest real-time product from API to guarantee freshly updated data from Admin
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/products?id=${encodeURIComponent(slug)}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data && !data.error) {
          setProduct(data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Attributes & variations logic (supports both array and object formats)
  const attributeEntries: Array<{ name: string; values: string[] }> = useMemo(() => {
    if (!product || !product.attributes) return [];
    if (Array.isArray(product.attributes)) {
      return product.attributes
        .filter((a: any) => a && a.name && a.name.toLowerCase() !== 'warranty')
        .map((a: any) => ({
          name: a.name,
          values: typeof a.values === 'string'
            ? a.values.split(',').map((v: string) => v.trim()).filter(Boolean)
            : Array.isArray(a.values)
            ? a.values
            : [String(a.values)]
        }));
    }
    return Object.entries(product.attributes)
      .filter(([name]) => name.toLowerCase() !== 'warranty')
      .map(([name, values]) => ({
        name,
        values: Array.isArray(values) ? values : [values],
      }));
  }, [product]);

  // Selected attribute state (e.g. { Color: "Black" })
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [compareNotice, setCompareNotice] = useState<string | null>(null);

  const handleAddToCompare = () => {
    try {
      const stored = localStorage.getItem('dwstore_compare_items');
      let list: string[] = stored ? JSON.parse(stored) : [];
      if (!list.includes(product.id)) {
        if (list.length >= 4) {
          list = [...list.slice(1), product.id];
        } else {
          list.push(product.id);
        }
        localStorage.setItem('dwstore_compare_items', JSON.stringify(list));
        window.dispatchEvent(new Event('dwstore_compare_updated'));
        setCompareNotice('Added to Compare! You can compare up to 4 items.');
      } else {
        setCompareNotice('This product is already in your Compare list.');
      }
      setTimeout(() => setCompareNotice(null), 4500);
    } catch (e) {
      console.error(e);
    }
  };

  // Bottom Tabs & Reviews State (Description, Additional Information, Reviews)
  const [activeBottomTab, setActiveBottomTab] = useState<'description' | 'additional' | 'reviews'>('description');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [saveInfo, setSaveInfo] = useState(true);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewsList, setReviewsList] = useState<any[]>([]);

  // Clean description and short description by removing escaped /n or \n
  const cleanDescriptionHtml = useMemo(() => {
    if (!product.description) return '';
    return product.description
      .replace(/\\r\\n/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/\/n/g, '\n')
      .replace(/\\r/g, '\n');
  }, [product.description]);

  const formattedShortDescription = useMemo(() => {
    if (!product.shortDescription) return '';
    let text = product.shortDescription
      .replace(/\\r\\n/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/\/n/g, '\n')
      .replace(/\\r/g, '\n')
      .trim();

    // If it already contains <ul> or <li>, return it
    if (text.includes('<ul') || text.includes('<li')) {
      return text;
    }

    // If it's plain text lines, wrap each in <li> within <ul> so bullet points always appear
    const lines = text.split('\n').map((l: string) => l.trim()).filter(Boolean);
    if (lines.length > 1) {
      return `<ul>${lines.map((l: string) => `<li>${l.replace(/^[-•*]\s*/, '')}</li>`).join('')}</ul>`;
    }

    return text;
  }, [product.shortDescription]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim() || !reviewerName.trim()) return;
    const newRev = {
      name: reviewerName.trim(),
      rating: reviewRating,
      text: reviewText.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setReviewsList((prev) => [newRev, ...prev]);
    setReviewSubmitted(true);
    setReviewText('');
    setTimeout(() => setReviewSubmitted(false), 5000);
  };

  // Find matching variation based on selected attributes
  const matchedVariation = useMemo(() => {
    if (!product.variations || product.variations.length === 0) return null;
    const selectedKeys = Object.keys(selectedAttributes).filter((k) => selectedAttributes[k]);
    if (selectedKeys.length === 0) return null;

    return product.variations.find((v: any) => {
      if (!v.attributes) return false;
      return selectedKeys.every((key) => {
        const vVal = v.attributes[key];
        return vVal && vVal.toLowerCase() === selectedAttributes[key].toLowerCase();
      });
    }) || null;
  }, [product, selectedAttributes]);

  // Active selected image
  const [userImage, setUserImage] = useState<string | null>(null);

  // When customer switches variation, automatically switch to variation's specific image
  useEffect(() => {
    if (matchedVariation && (matchedVariation.displayImage || matchedVariation.image)) {
      setUserImage(matchedVariation.displayImage || matchedVariation.image);
    }
  }, [matchedVariation]);

  const activeImage = useMemo(() => {
    if (userImage) return userImage;
    if (matchedVariation && (matchedVariation.displayImage || matchedVariation.image)) {
      return matchedVariation.displayImage || matchedVariation.image;
    }
    return product.displayImage || product.imageUrls?.[0] || '/placeholder-product.png';
  }, [userImage, matchedVariation, product]);

  // Active price calculation
  const activePriceMinor = useMemo(() => {
    if (matchedVariation) {
      return matchedVariation.salePriceMinor || matchedVariation.regularPriceMinor || 0;
    }
    return product.salePriceMinor || product.minPriceMinor || product.regularPriceMinor || 0;
  }, [matchedVariation, product]);

  const activeRegularPriceMinor = useMemo(() => {
    if (matchedVariation) {
      if (matchedVariation.salePriceMinor && matchedVariation.regularPriceMinor && matchedVariation.salePriceMinor < matchedVariation.regularPriceMinor) {
        return matchedVariation.regularPriceMinor;
      }
      return null;
    }
    if (product.salePriceMinor && product.regularPriceMinor && product.salePriceMinor < product.regularPriceMinor) {
      return product.regularPriceMinor;
    }
    return null;
  }, [matchedVariation, product]);

  // Check if product has variations
  const isVariable = Boolean(product.variations && product.variations.length > 0);
  const requiredAttributes = useMemo(() => attributeEntries.map((a: any) => a.name), [attributeEntries]);
  const isAllAttributesSelected = useMemo(() => {
    if (!isVariable || requiredAttributes.length === 0) return true;
    return requiredAttributes.every((attrName) => Boolean(selectedAttributes[attrName]));
  }, [isVariable, requiredAttributes, selectedAttributes]);

  // Overall stock check for product (at least one variation or simple product in stock)
  const hasAnyStock = useMemo(() => {
    return isProductInStock(product);
  }, [product]);

  // Stock status of currently selected or general product
  const isOutOfStock = useMemo(() => {
    if (isVariable) {
      if (matchedVariation) {
        return matchedVariation.inStock === false || (typeof matchedVariation.stockQty === 'number' && matchedVariation.stockQty <= 0);
      }
      return !hasAnyStock;
    }
    return !hasAnyStock;
  }, [isVariable, matchedVariation, hasAnyStock]);

  const [validationError, setValidationError] = useState<string | null>(null);

  const discountPct = activeRegularPriceMinor && activePriceMinor < activeRegularPriceMinor
    ? Math.round(((activeRegularPriceMinor - activePriceMinor) / activeRegularPriceMinor) * 100)
    : null;

  const allImages = useMemo(() => {
    const list = [...(product.localImages?.length > 0 ? product.localImages : product.imageUrls || [])];
    if (product.variations) {
      product.variations.forEach((v: any) => {
        if (v.displayImage && !list.includes(v.displayImage)) {
          list.push(v.displayImage);
        }
      });
    }
    if (list.length === 0) list.push(product.displayImage);
    return list;
  }, [product]);

  // Related products
  const relatedProducts = (productsData as any[])
    .filter((p) => p.id !== product.id && p.categorySlugs?.some((c: string) => product.categorySlugs?.includes(c)))
    .slice(0, 4);

  const handleAddToCart = () => {
    setValidationError(null);

    // 1. If overall out of stock
    if (!hasAnyStock) {
      setValidationError('This product is currently Out of Stock.');
      return;
    }

    // 2. If variable product and customer hasn\'t selected an option
    if (isVariable && !isAllAttributesSelected) {
      const missing = requiredAttributes.find((a) => !selectedAttributes[a]) || 'option';
      setValidationError(`Please select a ${missing} before adding to cart.`);
      const el = document.getElementById('variation-selector-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // 3. If selected variation is out of stock
    if (isOutOfStock) {
      setValidationError('The selected option is currently Out of Stock. Please choose another option.');
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: activeImage,
      priceMinor: activePriceMinor,
      regularPriceMinor: activeRegularPriceMinor,
      quantity,
      variation: matchedVariation
        ? {
            id: matchedVariation.id,
            attributes: matchedVariation.attributes || selectedAttributes,
          }
        : null,
    }, true);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const handleBuyNow = () => {
    setValidationError(null);

    // 1. If overall out of stock
    if (!hasAnyStock) {
      setValidationError('This product is currently Out of Stock.');
      return;
    }

    // 2. If variable product and customer hasn\'t selected an option
    if (isVariable && !isAllAttributesSelected) {
      const missing = requiredAttributes.find((a) => !selectedAttributes[a]) || 'option';
      setValidationError(`Please select a ${missing} before proceeding to checkout.`);
      const el = document.getElementById('variation-selector-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // 3. If selected variation is out of stock
    if (isOutOfStock) {
      setValidationError('The selected option is currently Out of Stock. Please choose another option.');
      return;
    }

    const directBuyItem = {
      id: matchedVariation?.id ? `${product.id}-${matchedVariation.id}` : product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: activeImage,
      priceMinor: activePriceMinor,
      regularPriceMinor: activeRegularPriceMinor,
      quantity,
      variation: matchedVariation
        ? {
            id: matchedVariation.id,
            attributes: matchedVariation.attributes || selectedAttributes,
          }
        : null,
    };

    try {
      sessionStorage.setItem('dwstore_direct_checkout', JSON.stringify(directBuyItem));
    } catch (e) {}

    router.push('/checkout?buyNow=1');
  };

  const handleClearAttributes = () => {
    setSelectedAttributes({});
    setUserImage(null);
    setValidationError(null);
  };

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <div className="flex-1 flex items-center justify-center py-24">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-600 font-semibold">Loading product...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Breadcrumb Bar */}
      <div className="bg-slate-50 border-b border-slate-200 py-3">
        <div className="page-container flex items-center justify-between text-xs text-slate-500 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-blue-600 flex-shrink-0">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <Link href="/shop" className="hover:text-blue-600 flex-shrink-0">Shop</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="font-semibold text-slate-900 truncate">{product.name}</span>
          </div>
          <span className="font-mono text-slate-400 text-[11px] hidden sm:inline">
            ID: {product.sourceId || product.id}
          </span>
        </div>
      </div>

      {/* Main Product Container */}
      <div className="page-container py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Image Gallery (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="w-full aspect-square bg-slate-50 rounded-3xl border border-slate-200 p-6 flex items-center justify-center overflow-hidden relative shadow-xs">
              <img
                src={resolveImageUrl(activeImage)}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/media/products/T800-Ultra-Smart-Watch-1_d7ac6b08.jpg';
                }}
              />
              {discountPct && (
                <span className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-sm">
                  -{discountPct}%
                </span>
              )}
            </div>

            {/* Thumbnail row */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                {allImages.slice(0, 8).map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setUserImage(img)}
                    className={`w-16 h-16 rounded-xl border-2 p-1 bg-slate-50 overflow-hidden flex-shrink-0 transition ${
                      activeImage === img
                        ? 'border-blue-600 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={resolveImageUrl(img)}
                      alt="Thumbnail"
                      className="w-full h-full object-contain mix-blend-multiply"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/media/products/T800-Ultra-Smart-Watch-1_d7ac6b08.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Buy Box (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              {/* Brand & Stock Status */}
              <div className="flex items-center justify-between mb-2">
                {product.brand && !['dwstore', 'dwstore original', 'unbranded', 'generic', 'no brand', 'none', ''].includes(product.brand.trim().toLowerCase()) ? (
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {product.brand}
                  </span>
                ) : <span />}
                {isOutOfStock ? (
                  <span className="text-xs font-bold text-rose-600 flex items-center gap-1.5 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    Out of Stock — Currently Unavailable
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> In Stock — Island-wide COD
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* SKU & Ratings */}
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 pb-3 border-b border-slate-100">
                <span className="font-mono">
                  SKU: <strong className="text-slate-800">{matchedVariation?.sku || product.sku}</strong>
                </span>
                <span>•</span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="font-bold text-slate-800 ml-1">5.0</span>
                </div>
              </div>
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-3">
              {activeRegularPriceMinor && (
                <span className="text-base sm:text-lg text-slate-400 line-through">
                  LKR {formatPriceLKR(activeRegularPriceMinor)}
                </span>
              )}
              <span className="text-2xl sm:text-3xl font-black text-blue-600">
                LKR {formatPriceLKR(activePriceMinor)}
              </span>
            </div>

            {/* Payment Method Price Boxes (Cash, Bank Transfer, Visa/Mastercard & Installments: Koko, Payzy) */}
            <PaymentInstallmentBoxes
              priceCents={activePriceMinor}
              stockQty={matchedVariation ? matchedVariation.stockQty : (hasAnyStock ? product.stockQty : 0)}
              inStock={!isOutOfStock}
              warranty={
                product.warrantyPeriod !== undefined
                  ? product.warrantyPeriod
                  : product.warranty ||
                    (product.shortDescription || product.description || '').match(
                      /(\d+\s*(?:Month|Months|Year|Years|Days|Day)\s*(?:Company\s*|Checking\s*|Replacement\s*)?Warranty)/i
                    )?.[1] ||
                    ''
              }
            />

            {/* Bullet Highlights / Short Description */}
            {formattedShortDescription && (
              <div
                className="text-xs text-slate-700 leading-relaxed py-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:text-slate-700 [&_li]:leading-relaxed [&_li::marker]:text-slate-800"
                dangerouslySetInnerHTML={{ __html: formattedShortDescription }}
              />
            )}

            {/* Dropdown Variation Selectors (Positioned directly below Short Description) */}
            {attributeEntries.length > 0 && (
              <div id="variation-selector-section" className="space-y-3 pt-3 pb-2 border-t border-slate-100">
                {attributeEntries.map((attr) => {
                  const currentValue = selectedAttributes[attr.name] || '';
                  const isMissing = validationError && !currentValue;

                  return (
                    <div key={attr.name} className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 w-24">
                        {attr.name} :
                      </span>
                      <div className="flex items-center gap-3">
                        <select
                          value={currentValue}
                          onChange={(e) => {
                            setSelectedAttributes((prev) => ({
                              ...prev,
                              [attr.name]: e.target.value,
                            }));
                            setUserImage(null);
                            setValidationError(null);
                          }}
                          className={`border rounded-xl px-4 py-2 text-xs font-semibold bg-white text-slate-800 pr-8 focus:outline-none cursor-pointer shadow-xs min-w-[200px] transition ${
                            isMissing
                              ? 'border-rose-400 ring-2 ring-rose-200'
                              : 'border-slate-300 focus:border-blue-600'
                          }`}
                        >
                          <option value="">Choose an option</option>
                          {attr.values.map((val: string) => (
                            <option key={val} value={val}>
                              {val}
                            </option>
                          ))}
                        </select>

                        {currentValue && (
                          <button
                            type="button"
                            onClick={handleClearAttributes}
                            className="text-xs text-slate-400 hover:text-slate-800 font-semibold"
                          >
                            × Clear
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Stock status for selected variation */}
                {matchedVariation && isOutOfStock && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-bold mt-1">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Out of stock
                  </div>
                )}
                {matchedVariation && !isOutOfStock && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    In stock
                  </div>
                )}
              </div>
            )}

            {/* Validation Error Message */}
            {validationError && (
              <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
                <X className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Quantity, Add to Cart & Buy Now Buttons */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden">
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-slate-900">{quantity}</span>
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {isOutOfStock ? (
                  <button
                    type="button"
                    disabled
                    className="flex-1 bg-slate-200 text-slate-500 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-none cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4 text-rose-500" />
                    <span>OUT OF STOCK</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="flex-1 bg-[#3b4992] hover:bg-[#2e3a75] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>ADD TO CART</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleBuyNow}
                      className="flex-1 bg-[#5046e5] hover:bg-[#4338ca] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-center cursor-pointer"
                    >
                      <Zap className="w-4 h-4" />
                      <span>BUY NOW</span>
                    </button>
                  </>
                )}
              </div>

              {/* Wishlist & Compare */}
              <div className="flex items-center gap-6 pt-2 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    const added = toggleWishlist(product.id);
                    setAddedNotice(false);
                    setCompareNotice(added ? 'Added to your Wishlist!' : 'Removed from your Wishlist.');
                    setTimeout(() => setCompareNotice(null), 3000);
                  }}
                  className={`flex items-center gap-1.5 transition cursor-pointer font-medium ${
                    isInWishlist(product.id)
                      ? 'text-rose-600 font-bold'
                      : 'hover:text-rose-600 text-slate-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{isInWishlist(product.id) ? 'Saved in Wishlist' : 'Add to wishlist'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddToCompare}
                  className="flex items-center gap-1.5 hover:text-blue-600 font-semibold transition cursor-pointer text-slate-700"
                >
                  <GitCompare className="w-4 h-4 text-blue-600" /> Compare Product
                </button>
              </div>

              {compareNotice && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <GitCompare className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>{compareNotice}</span>
                  </div>
                  <Link href="/compare" className="text-blue-700 underline hover:text-blue-900 font-black flex items-center gap-1">
                    <span>View Comparison</span>
                    <span>→</span>
                  </Link>
                </div>
              )}

              {addedNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Product added to cart! Proceed to checkout or order via WhatsApp.
                </div>
              )}
            </div>

            {/* Payment Method Banner Image (Replaces text boxes with Payment-Methods-1300x325.png) */}
            <div className="py-2.5 border-y border-slate-100">
              <img
                src="/Payment-Methods-1300x325.png"
                alt="Accepted Payment Methods: Visa, Mastercard, Koko, Payzy, PayHere, Cash On Delivery, Bank Transfer"
                className="w-full max-w-md h-auto object-contain"
              />
            </div>

            {/* "Check Availability" Notice Box (Exact replica of user's WP screenshot) */}
            <div className="bg-amber-50/70 border-2 border-dashed border-amber-300 rounded-2xl p-4 text-center space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                Check Availability
              </h4>
              <p className="text-[11px] text-slate-600 font-medium">
                Please confirm stock &amp; colors via WhatsApp before ordering.
              </p>
              <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                පාරිභෝගික ඔබගේ පහසුව සඳහා: ඇණවුම් ලබා දීමට පෙර අදාල වර්ණ සහ තොග පිළිබඳව අපගේ WhatsApp අංකය හරහා විමසා දැනගන්න.
              </p>
              <div className="pt-1">
                <a
                  href={`https://wa.me/94756693358?text=Hello%20DWstore%2C%20I%20want%20to%20check%20availability%20for%3A%20${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat via WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                <Truck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Cash on Delivery Island-wide</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Original Warranty Covered</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                <RotateCcw className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span>7 Days Defect Exchange</span>
              </div>
            </div>

          </div>
        </div>

        {/* ── Product Information Tabs (Description, Additional Information, Reviews) ── */}
        <div className="mt-14 border-t border-slate-200">
          {/* Tab Navigation Header */}
          <div className="flex items-center justify-center border-b border-slate-200">
            <div className="flex gap-6 sm:gap-12 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveBottomTab('description')}
                className={`py-4 text-xs sm:text-sm font-black tracking-wider uppercase transition relative cursor-pointer ${
                  activeBottomTab === 'description'
                    ? 'text-slate-900 border-b-2 border-indigo-600 -mb-px'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Description
              </button>

              <button
                type="button"
                onClick={() => setActiveBottomTab('additional')}
                className={`py-4 text-xs sm:text-sm font-black tracking-wider uppercase transition relative cursor-pointer ${
                  activeBottomTab === 'additional'
                    ? 'text-slate-900 border-b-2 border-indigo-600 -mb-px'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Additional Information
              </button>

              <button
                type="button"
                onClick={() => setActiveBottomTab('reviews')}
                className={`py-4 text-xs sm:text-sm font-black tracking-wider uppercase transition relative cursor-pointer ${
                  activeBottomTab === 'reviews'
                    ? 'text-slate-900 border-b-2 border-indigo-600 -mb-px'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Reviews ({reviewsList.length})
              </button>
            </div>
          </div>

          {/* Tab Content Panes */}
          <div className="py-8">
            {/* 1. Description Tab (Screenshot 2) */}
            {activeBottomTab === 'description' && (
              <div className="max-w-4xl text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
                <div
                  dangerouslySetInnerHTML={{
                    __html: cleanDescriptionHtml || formattedShortDescription || 'No detailed description available.',
                  }}
                />
              </div>
            )}

            {/* 2. Additional Information Tab (Screenshot 3) */}
            {activeBottomTab === 'additional' && (
              <div className="max-w-2xl">
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-slate-200">
                      {attributeEntries.length > 0 ? (
                        attributeEntries.map((attr) => (
                          <tr key={attr.name}>
                            <th className="py-3.5 px-5 font-bold text-slate-800 bg-slate-50 w-44">
                              {attr.name}
                            </th>
                            <td className="py-3.5 px-5 text-slate-600 bg-white">
                              {attr.values.join(' , ')}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <th className="py-3.5 px-5 font-bold text-slate-800 bg-slate-50 w-44">
                            Color
                          </th>
                          <td className="py-3.5 px-5 text-slate-600 bg-white">
                            Standard
                          </td>
                        </tr>
                      )}
                      {product.brand && (
                        <tr>
                          <th className="py-3.5 px-5 font-bold text-slate-800 bg-slate-50 w-44">
                            Brand
                          </th>
                          <td className="py-3.5 px-5 text-slate-600 bg-white">
                            {product.brand}
                          </td>
                        </tr>
                      )}
                      {product.sku && (
                        <tr>
                          <th className="py-3.5 px-5 font-bold text-slate-800 bg-slate-50 w-44">
                            SKU
                          </th>
                          <td className="py-3.5 px-5 text-slate-600 bg-white font-mono">
                            {product.sku}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. Reviews Tab (Screenshot 4) */}
            {activeBottomTab === 'reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Reviews List */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h3 className="text-xs font-black tracking-wider uppercase text-slate-800">
                      Reviews
                    </h3>
                    <div className="flex items-center gap-3 text-xs">
                      <label className="flex items-center gap-1.5 text-slate-500 cursor-pointer">
                        <input type="checkbox" className="rounded text-blue-600" />
                        <span>Only with images</span>
                      </label>
                      <select className="border border-slate-200 rounded px-2 py-1 text-slate-700 bg-white text-xs">
                        <option>Default</option>
                        <option>Highest Rated</option>
                        <option>Lowest Rated</option>
                      </select>
                    </div>
                  </div>

                  {reviewsList.length === 0 ? (
                    <div className="py-6 text-slate-500 text-xs">
                      There are no reviews yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reviewsList.map((rev, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-xs">{rev.name}</span>
                            <div className="flex text-amber-400">
                              {[...Array(rev.rating)].map((_, s) => (
                                <Star key={s} className="w-3 h-3 fill-amber-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-slate-600">{rev.text}</p>
                          <span className="text-[10px] text-slate-400 block">{rev.date}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Add a Review Form */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Be the first to review &ldquo;{product.name}&rdquo;
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Your email address will not be published. Required fields are marked <span className="text-rose-500">*</span>
                    </p>
                  </div>

                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    {/* Star Rating */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Your rating <span className="text-rose-500">*</span> :
                      </label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            onMouseEnter={() => setReviewHoverRating(star)}
                            onMouseLeave={() => setReviewHoverRating(0)}
                            className="p-1 text-amber-400 focus:outline-none cursor-pointer"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                (reviewHoverRating || reviewRating) >= star
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Review text */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Your review <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                        placeholder="Share your experience with this product..."
                      />
                    </div>

                    {/* Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Email <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={reviewerEmail}
                          onChange={(e) => setReviewerEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                        />
                      </div>
                    </div>

                    {/* Save Info Checkbox */}
                    <label className="flex items-start gap-2 text-[11px] text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveInfo}
                        onChange={(e) => setSaveInfo(e.target.checked)}
                        className="mt-0.5 rounded text-indigo-600"
                      />
                      <span>Save my name, email, and website in this browser for the next time I comment.</span>
                    </label>

                    <p className="text-[10px] text-slate-400">
                      You have to be logged in to be able to add photos to your review.
                    </p>

                    <button
                      type="submit"
                      className="px-8 py-3 bg-[#5651b7] hover:bg-[#4742a3] text-white font-bold text-xs rounded-xl uppercase tracking-wider transition shadow-sm cursor-pointer"
                    >
                      Submit
                    </button>

                    {reviewSubmitted && (
                      <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Thank you! Your review has been submitted and is pending moderation.</span>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Most Related Products Section (Screenshot 2) */}
        {relatedProducts.length > 0 && (
          <div className="mt-14 pt-10 border-t border-slate-200">
            <h2 className="text-sm font-black uppercase tracking-wider text-amber-800 mb-6">
              Most Related Products
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map((rel: any) => {
                const relPrice = rel.salePriceMinor || rel.minPriceMinor || rel.regularPriceMinor;
                return (
                  <Link
                    key={rel.id}
                    href={`/product/${rel.slug}`}
                    className="group bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="w-full aspect-square bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-3 mb-3 group-hover:bg-blue-50/20 transition">
                      <img
                        src={rel.displayImage}
                        alt={rel.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                        {rel.brand || 'DWstore'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 line-clamp-2 leading-tight">
                        {rel.name}
                      </h4>
                      <span className="text-xs font-black text-slate-900 mt-2 block">
                        LKR {formatPriceLKR(relPrice)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
