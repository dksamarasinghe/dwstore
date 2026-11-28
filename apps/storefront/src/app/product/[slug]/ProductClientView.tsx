'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PaymentInstallmentBoxes from '@/components/PaymentInstallmentBoxes';
import productsData from '@/data/products.json';
import categoriesData from '@/data/categories.json';
import { formatPriceLKR, isProductInStock } from '@/lib/catalog';
import { trackViewContent } from '@/lib/meta-pixel';
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
  PhoneCall,
  Package,
  Sparkles
} from 'lucide-react';

// Bulletproof price extractors that support regularPriceMinor / salePriceMinor / salePrice / regularPrice
const getTargetPrice = (target: any): number => {
  if (!target) return 0;
  if (target.salePrice && target.salePrice > 0) return Number(target.salePrice);
  if (target.price && target.price > 0) return Number(target.price);
  if (target.salePriceMinor && target.salePriceMinor > 0) return target.salePriceMinor / 100;
  if (target.regularPrice && target.regularPrice > 0) return Number(target.regularPrice);
  if (target.regularPriceMinor && target.regularPriceMinor > 0) return target.regularPriceMinor / 100;
  return 0;
};

const getTargetRegularPrice = (target: any): number => {
  if (!target) return 0;
  if (target.regularPrice && target.regularPrice > 0) return Number(target.regularPrice);
  if (target.regularPriceMinor && target.regularPriceMinor > 0) return target.regularPriceMinor / 100;
  return getTargetPrice(target);
};

export function ProductClientView({ slug, initialProduct }: { slug: string; initialProduct?: any }) {
  const router = useRouter();
  const { addToCart, addMultipleToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  const [product, setProduct] = useState<any>(() => {
    if (initialProduct) return initialProduct;
    const cleanSlug = slug.replace(/-\d+$/, '');
    return (productsData as any[]).find(
      (p) => p.slug === slug || String(p.id) === String(slug) || p.slug === cleanSlug || p.slug.replace(/-\d+$/, '') === cleanSlug
    ) || null;
  });

  const primaryCategory = useMemo(() => {
    if (!product?.categorySlugs || !product.categorySlugs.length) return null;
    const catSlug = product.categorySlugs[0];
    return (categoriesData as any[]).find((c) => c.slug === catSlug || c.id === catSlug) || {
      slug: catSlug,
      name: catSlug.replace(/-/g, ' ')
    };
  }, [product]);

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

  // Ensure the browser address bar NEVER shows trailing SKU numbers (e.g. -33554)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/product/')) {
        const pathSlug = pathname.replace(/^\/product\//, '');
        const cleanPathSlug = pathSlug.replace(/-\d+$/, '');
        const targetSlug = (product?.slug ? product.slug.replace(/-\d+$/, '') : cleanPathSlug);
        if (targetSlug && pathSlug !== targetSlug) {
          window.history.replaceState(null, '', `/product/${targetSlug}`);
        }
      }
    }
  }, [product?.slug]);

  // Track Meta Pixel ViewContent event for Facebook Dynamic Product Ads
  useEffect(() => {
    if (product) {
      trackViewContent(product);
    }
  }, [product?.id, product?.slug]);

  // Attributes & variations logic (supports both array and object formats)
  const attributeEntries: Array<{ name: string; values: string[] }> = useMemo(() => {
    if (!product) return [];

    let entries: Array<{ name: string; values: string[] }> = [];

    if (product.attributes) {
      if (Array.isArray(product.attributes)) {
        entries = product.attributes
          .filter((a: any) => a && a.name && a.name.toLowerCase() !== 'warranty')
          .map((a: any) => ({
            name: a.name,
            values: typeof a.values === 'string'
              ? a.values.split(',').map((v: string) => v.trim()).filter(Boolean)
              : Array.isArray(a.values)
              ? a.values.map((v: any) => String(v).trim())
              : [String(a.values).trim()]
          }));
      } else if (typeof product.attributes === 'object') {
        entries = Object.entries(product.attributes)
          .filter(([name]) => name.toLowerCase() !== 'warranty')
          .map(([name, values]) => ({
            name,
            values: Array.isArray(values)
              ? values.map((v: any) => String(v).trim())
              : [String(values).trim()],
          }));
      }
    }

    // Also inspect variations to extract/merge any attributes not listed in product.attributes
    if (product.variations && Array.isArray(product.variations)) {
      const varAttrMap: Record<string, Set<string>> = {};
      product.variations.forEach((v: any) => {
        if (v.attributes && typeof v.attributes === 'object') {
          Object.entries(v.attributes).forEach(([k, val]) => {
            if (!k || val === undefined || val === null || val === '') return;
            const normKey = k.trim();
            const existingKey = Object.keys(varAttrMap).find(
              (ek) => ek.toLowerCase() === normKey.toLowerCase()
            ) || (normKey.charAt(0).toUpperCase() + normKey.slice(1));

            if (!varAttrMap[existingKey]) varAttrMap[existingKey] = new Set();
            varAttrMap[existingKey].add(String(val).trim());
          });
        }
      });

      if (entries.length === 0) {
        entries = Object.entries(varAttrMap).map(([name, valSet]) => ({
          name,
          values: Array.from(valSet),
        }));
      } else {
        entries = entries.map((entry) => {
          const varKey = Object.keys(varAttrMap).find(
            (k) => k.toLowerCase() === entry.name.toLowerCase()
          );
          if (varKey) {
            const merged = Array.from(new Set([...entry.values, ...Array.from(varAttrMap[varKey])]));
            return { ...entry, values: merged };
          }
          return entry;
        });
      }
    }

    return entries;
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
    if (!product?.description) return '';
    return product.description
      .replace(/\\r\\n/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/\/n/g, '\n')
      .replace(/\\r/g, '\n');
  }, [product?.description]);

  const formattedShortDescription = useMemo(() => {
    if (!product?.shortDescription) return '';
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
  }, [product?.shortDescription]);

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

  // Find matching variation based on selected attributes (case-insensitive & trimmed)
  const matchedVariation = useMemo(() => {
    if (!product?.variations || product.variations.length === 0) return null;
    const selectedEntries = Object.entries(selectedAttributes).filter(([, val]) => Boolean(val));
    if (selectedEntries.length === 0) return null;

    return (
      product.variations.find((v: any) => {
        if (!v.attributes || typeof v.attributes !== 'object') return false;
        return selectedEntries.every(([selKey, selVal]) => {
          const attrKey = Object.keys(v.attributes).find(
            (k) => k.trim().toLowerCase() === selKey.trim().toLowerCase()
          );
          if (!attrKey) return false;
          const vVal = String(v.attributes[attrKey] || '').trim().toLowerCase();
          return vVal === String(selVal).trim().toLowerCase();
        });
      }) || null
    );
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
    return product?.displayImage || product?.imageUrls?.[0] || '/placeholder-product.png';
  }, [userImage, matchedVariation, product]);

  // Active price calculation
  const activePriceMinor = useMemo(() => {
    if (!product) return 0;
    if (matchedVariation) {
      if (typeof matchedVariation.salePriceMinor === 'number' && matchedVariation.salePriceMinor > 0) {
        return matchedVariation.salePriceMinor;
      }
      if (typeof matchedVariation.salePrice === 'number' && matchedVariation.salePrice > 0) {
        return Math.round(matchedVariation.salePrice * 100);
      }
      if (typeof matchedVariation.regularPriceMinor === 'number' && matchedVariation.regularPriceMinor > 0) {
        return matchedVariation.regularPriceMinor;
      }
      if (typeof matchedVariation.regularPrice === 'number' && matchedVariation.regularPrice > 0) {
        return Math.round(matchedVariation.regularPrice * 100);
      }
    }
    return product.salePriceMinor || product.minPriceMinor || product.regularPriceMinor || 0;
  }, [matchedVariation, product]);

  const activeRegularPriceMinor = useMemo(() => {
    if (!product) return null;
    if (matchedVariation) {
      const reg = typeof matchedVariation.regularPriceMinor === 'number' && matchedVariation.regularPriceMinor > 0
        ? matchedVariation.regularPriceMinor
        : (typeof matchedVariation.regularPrice === 'number' && matchedVariation.regularPrice > 0 ? Math.round(matchedVariation.regularPrice * 100) : null);
      const sale = typeof matchedVariation.salePriceMinor === 'number' && matchedVariation.salePriceMinor > 0
        ? matchedVariation.salePriceMinor
        : (typeof matchedVariation.salePrice === 'number' && matchedVariation.salePrice > 0 ? Math.round(matchedVariation.salePrice * 100) : reg);

      if (reg && sale && sale < reg) {
        return reg;
      }
      return null;
    }
    if (product.salePriceMinor && product.regularPriceMinor && product.salePriceMinor < product.regularPriceMinor) {
      return product.regularPriceMinor;
    }
    return null;
  }, [matchedVariation, product]);

  // Check if product has variations
  const isVariable = Boolean(product?.variations && product.variations.length > 0);
  const requiredAttributes = useMemo(() => attributeEntries.map((a: any) => a.name), [attributeEntries]);
  const isAllAttributesSelected = useMemo(() => {
    if (!isVariable || requiredAttributes.length === 0) return true;
    return requiredAttributes.every((attrName) => Boolean(selectedAttributes[attrName]));
  }, [isVariable, requiredAttributes, selectedAttributes]);

  // Grouped / Combo product helpers
  const isGroupedProduct = Boolean(
    product?.type === 'grouped' || 
    product?.productType === 'grouped' || 
    product?.type === 'combo'
  );

  const comboIncludedProducts = useMemo(() => {
    if (!isGroupedProduct) return [];
    if (product?.groupedProducts && Array.isArray(product.groupedProducts) && product.groupedProducts.length > 0) {
      return product.groupedProducts.map((p: any) => ({
        ...p,
        quantity: p.quantity || 1,
        productType: p.productType || (p.variations?.length ? 'variable' : 'simple'),
      }));
    }
    if (product?.groupedProductIds && Array.isArray(product.groupedProductIds)) {
      return product.groupedProductIds
        .map((pid: string) => {
          const match = (productsData as any[]).find((p) => String(p.id) === String(pid));
          if (!match) return null;
          return {
            id: match.id,
            name: match.name,
            image: match.displayImage || match.imageUrls?.[0] || '/dwstore_logo.png',
            regularPrice: (match.regularPriceMinor || 0) / 100,
            salePrice: (match.salePriceMinor || match.minPriceMinor || 0) / 100,
            sku: match.sku,
            slug: match.slug,
            quantity: 1,
            productType: match.productType || match.type || (match.variations?.length ? 'variable' : 'simple'),
          };
        })
        .filter(Boolean);
    }
    return [];
  }, [isGroupedProduct, product]);

  const comboTotalItemsValue = useMemo(() => {
    if (!comboIncludedProducts.length) return 0;
    return comboIncludedProducts.reduce((sum: number, item: any) => {
      const p = item.salePrice || item.regularPrice || 0;
      const q = item.quantity || 1;
      return sum + (p * q);
    }, 0);
  }, [comboIncludedProducts]);

  const comboSavings = Math.max(0, comboTotalItemsValue - (activePriceMinor / 100));

  // Combo Deal / Frequently Bought Together calculations (for Simple & Variable products)
  const hasComboDeal = Boolean(
    product?.comboDeal?.enabled &&
    product?.comboDeal?.companionProducts &&
    product.comboDeal.companionProducts.length > 0
  );

  const comboCompanions = useMemo(() => {
    if (!hasComboDeal || !product?.comboDeal?.companionProducts) return [];
    return product.comboDeal.companionProducts;
  }, [hasComboDeal, product]);

  const companionsTotalRegularMinor = useMemo(() => {
    return comboCompanions.reduce((sum: number, comp: any) => {
      const fullProd = (productsData as any[])?.find((p) => String(p.id) === String(comp.id));
      const target = fullProd || comp;
      const p = getTargetPrice(target);
      return sum + Math.round(p * 100);
    }, 0);
  }, [comboCompanions]);

  const comboCombinedRegularMinor = useMemo(() => {
    return activePriceMinor + companionsTotalRegularMinor;
  }, [activePriceMinor, companionsTotalRegularMinor]);

  const comboDealPriceMinor = useMemo(() => {
    if (!product?.comboDeal) return comboCombinedRegularMinor;
    const discAmountMinor = (product.comboDeal.discountAmount || 0) * 100;
    const fixedPriceMinor = (product.comboDeal.discountPrice || 0) * 100;
    // If a custom combo price was set AND it is lower than the combined selling price, apply it!
    if (fixedPriceMinor > 0 && fixedPriceMinor < comboCombinedRegularMinor) {
      return fixedPriceMinor;
    }
    // If a discount amount was set, deduct it!
    if (discAmountMinor > 0) {
      return Math.max(0, comboCombinedRegularMinor - discAmountMinor);
    }
    // If no combo discount/custom price is configured, strictly return the normal combined total price!
    return comboCombinedRegularMinor;
  }, [product, comboCombinedRegularMinor]);

  const comboSavingsMinor = useMemo(() => {
    return Math.max(0, comboCombinedRegularMinor - comboDealPriceMinor);
  }, [comboCombinedRegularMinor, comboDealPriceMinor]);

  // Overall stock check for product (at least one variation or simple product in stock)
  // Section 12.3: If any component in a combo is out of stock, the combo is Out of Stock!
  const hasAnyStock = useMemo(() => {
    if (isGroupedProduct) {
      if (!comboIncludedProducts || comboIncludedProducts.length === 0) {
        return isProductInStock(product);
      }
      const allComponentsInStock = comboIncludedProducts.every((comp: any) => {
        const fullProd = (productsData as any[]).find((p) => String(p.id) === String(comp.id));
        if (!fullProd) return true;
        return isProductInStock(fullProd);
      });
      return allComponentsInStock && isProductInStock(product);
    }
    return isProductInStock(product);
  }, [product, isGroupedProduct, comboIncludedProducts]);

  // Stock status of currently selected or general product (strictly follows admin stock status)
  const isOutOfStock = useMemo(() => {
    if (isVariable) {
      if (matchedVariation) {
        const sStatus = String(matchedVariation.stockStatus || matchedVariation.status || '').toLowerCase().trim();
        if (
          sStatus === 'out of stock' ||
          sStatus === 'out_of_stock' ||
          matchedVariation.inStock === false
        ) {
          return true;
        }
        if (
          sStatus === 'in stock' ||
          sStatus === 'active' ||
          matchedVariation.inStock === true
        ) {
          return false;
        }
        return false;
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
    if (!product) return [];
    const list = [...(product.localImages?.length > 0 ? product.localImages : product.imageUrls || [])];
    if (product.variations) {
      product.variations.forEach((v: any) => {
        if (v.displayImage && !list.includes(v.displayImage)) {
          list.push(v.displayImage);
        }
      });
    }
    if (list.length === 0 && product.displayImage) list.push(product.displayImage);
    return list;
  }, [product]);

  // Related products
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return (productsData as any[])
      .filter((p) => p.id !== product.id && p.categorySlugs?.some((c: string) => product.categorySlugs?.includes(c)))
      .slice(0, 4);
  }, [product]);

  const handleAddToCart = () => {
    setValidationError(null);

    // 1. If overall out of stock
    if (!hasAnyStock) {
      setValidationError('This product is currently Out of Stock.');
      return;
    }

    // 2. If variable product and customer hasn't selected an option
    if (isVariable && (!matchedVariation || !isAllAttributesSelected)) {
      const missing = requiredAttributes.find((a) => !selectedAttributes[a]) || 'variation option (e.g. Color)';
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
      allowedPaymentMethods: product.allowedPaymentMethods,
      isGrouped: isGroupedProduct,
      groupedProducts: isGroupedProduct ? comboIncludedProducts : undefined,
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

    // 2. If variable product and customer hasn't selected an option
    if (isVariable && (!matchedVariation || !isAllAttributesSelected)) {
      const missing = requiredAttributes.find((a) => !selectedAttributes[a]) || 'variation option (e.g. Color)';
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
      allowedPaymentMethods: product.allowedPaymentMethods,
      isGrouped: isGroupedProduct,
      groupedProducts: isGroupedProduct ? comboIncludedProducts : undefined,
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

  const handleAddComboToCart = () => {
    if (comboCompanions.length === 0) return;
    setValidationError(null);

    // If variable product and customer hasn't selected an option
    if (isVariable && (!matchedVariation || !isAllAttributesSelected)) {
      const missing = requiredAttributes.find((a) => !selectedAttributes[a]) || 'variation option (e.g. Color)';
      setValidationError(`Please select a ${missing} for the main product before adding the combo deal.`);
      const el = document.getElementById('variation-selector-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (isOutOfStock) {
      setValidationError('The selected option is currently Out of Stock.');
      return;
    }

    const mainVarLabel = matchedVariation && matchedVariation.attributes
      ? ` (${Object.values(matchedVariation.attributes).join(' / ')})`
      : '';

    // Calculate proportional discounted prices so the individual items sum up to exactly comboDealPriceMinor
    let mainDiscountedPriceMinor = activePriceMinor;
    const compAllocatedPrices: number[] = [];

    if (comboCombinedRegularMinor > 0 && comboSavingsMinor > 0) {
      let allocatedTotal = 0;
      const mainRatio = activePriceMinor / comboCombinedRegularMinor;
      mainDiscountedPriceMinor = Math.round(comboDealPriceMinor * mainRatio);
      allocatedTotal += mainDiscountedPriceMinor;

      comboCompanions.forEach((comp: any, idx: number) => {
        const fullProd = (productsData as any[])?.find((p) => String(p.id) === String(comp.id));
        const target = fullProd || comp;
        const compPrice = getTargetPrice(target);
        const compReg = Math.round(compPrice * 100);
        if (idx === comboCompanions.length - 1) {
          // Final item absorbs any cent remainder so the exact sum matches comboDealPriceMinor
          const remainder = Math.max(0, comboDealPriceMinor - allocatedTotal);
          compAllocatedPrices.push(remainder);
        } else {
          const compRatio = compReg / comboCombinedRegularMinor;
          const discounted = Math.round(comboDealPriceMinor * compRatio);
          compAllocatedPrices.push(discounted);
          allocatedTotal += discounted;
        }
      });
    } else {
      comboCompanions.forEach((comp: any) => {
        const fullProd = (productsData as any[])?.find((p) => String(p.id) === String(comp.id));
        const target = fullProd || comp;
        const compPrice = getTargetPrice(target);
        compAllocatedPrices.push(Math.round(compPrice * 100));
      });
    }

    const comboSavingsLabel = comboSavingsMinor > 0 ? 'Combo Savings Included' : undefined;

    const itemsToAdd: any[] = [
      // 1. Main Product as its own cart item
      {
        productId: String(product.id),
        name: `${product.name}${mainVarLabel}`,
        slug: (product.slug || '').replace(/-\d+$/, ''),
        image: activeImage,
        priceMinor: mainDiscountedPriceMinor,
        regularPriceMinor: activePriceMinor,
        quantity: 1,
        allowedPaymentMethods: product.allowedPaymentMethods,
        comboDiscountBadge: comboSavingsLabel,
        variation: matchedVariation
          ? {
              id: matchedVariation.id,
              attributes: matchedVariation.attributes || selectedAttributes,
            }
          : null,
      },
      // 2. All Companion Products as individual cart items
      ...comboCompanions.map((comp: any, idx: number) => {
        const compReg = Math.round((comp.salePrice || comp.price || comp.regularPrice || 0) * 100);
        return {
          productId: String(comp.id),
          name: comp.name,
          slug: (comp.slug || comp.id).replace(/-\d+$/, ''),
          image: comp.image || '/placeholder-product.png',
          priceMinor: compAllocatedPrices[idx],
          regularPriceMinor: compReg,
          quantity: 1,
          allowedPaymentMethods: comp.allowedPaymentMethods || product.allowedPaymentMethods,
          comboDiscountBadge: comboSavingsLabel,
          variation: null,
        };
      }),
    ];

    addMultipleToCart(itemsToAdd, true);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
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
            {primaryCategory && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <Link href={`/category/${primaryCategory.slug}`} className="hover:text-blue-600 flex-shrink-0 capitalize">
                  {primaryCategory.name}
                </Link>
              </>
            )}
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
                  <Link
                    href={`/brand/${product.brandSlug || product.brand.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 hover:bg-blue-100 transition px-3 py-1 rounded-full inline-block"
                  >
                    {product.brand}
                  </Link>
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
              {isGroupedProduct && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-xs font-black uppercase tracking-wider mb-2 shadow-xs">
                  <Package className="w-3.5 h-3.5" />
                  <span>Combo Deal Package</span>
                </div>
              )}
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

            {/* Payment Method Price Boxes */}
            <PaymentInstallmentBoxes
              priceCents={activePriceMinor}
              stockQty={matchedVariation ? matchedVariation.stockQty : (hasAnyStock ? product.stockQty : 0)}
              inStock={!isOutOfStock}
              allowedPaymentMethods={product.allowedPaymentMethods}
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

            {/* Included Products in Combo Deal (Grouped Product) */}
            {isGroupedProduct && comboIncludedProducts.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 via-indigo-50/40 to-blue-50 border-2 border-purple-200 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-purple-200/80">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-purple-600 text-white rounded-lg shadow-xs">
                      <Package className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-purple-950 uppercase tracking-wide">
                        Package Includes ({comboIncludedProducts.length} Items)
                      </h3>
                      <p className="text-[11px] text-purple-700 font-medium">
                        මෙම Combo පැකේජය සමග ඔබට ලැබෙන සියලුම භාණ්ඩ
                      </p>
                    </div>
                  </div>
                  {comboSavings > 0 && (
                    <span className="bg-emerald-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-xs">
                      Save LKR {Math.round(comboSavings).toLocaleString()} as a Combo!
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {comboIncludedProducts.map((item: any, idx: number) => {
                    const itemPrice = item.salePrice || item.regularPrice;
                    return (
                      <div
                        key={item.id || idx}
                        className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-purple-100 hover:border-purple-300 transition shadow-xs"
                      >
                        <div className="w-12 h-12 bg-slate-50 rounded-lg p-1 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                          <img
                            src={resolveImageUrl(item.image)}
                            alt={item.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = '/dwstore_logo.png';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-[10px] text-purple-600 font-bold mb-0.5">
                            <CheckCircle2 className="w-3 h-3 text-purple-600 shrink-0" />
                            <span>Included Item #{idx + 1} {item.quantity && item.quantity > 1 ? `(Qty: ${item.quantity})` : ''}</span>
                          </div>
                          {item.slug ? (
                            <Link
                              href={`/product/${item.slug}`}
                              target="_blank"
                              className="text-xs font-bold text-slate-800 hover:text-blue-600 line-clamp-1 block"
                            >
                              {item.name}
                            </Link>
                          ) : (
                            <div className="text-xs font-bold text-slate-800 line-clamp-1">
                              {item.name}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {itemPrice > 0 && (
                              <span className="text-[11px] text-slate-500 font-medium">
                                Valued at <strong className="text-slate-700">LKR {Number(itemPrice * (item.quantity || 1)).toLocaleString()}</strong>
                              </span>
                            )}
                            {(item.productType === 'variable' || item.type === 'variable') && (
                              <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                Any available variation
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {comboTotalItemsValue > 0 && (
                  <div className="pt-2 border-t border-purple-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">
                      Total Individual Value: <span className="line-through text-slate-400">LKR {Math.round(comboTotalItemsValue).toLocaleString()}</span>
                    </span>
                    <span className="font-bold text-purple-900">
                      Combo Deal Price: <span className="text-sm font-black text-purple-700">LKR {formatPriceLKR(activePriceMinor)}</span>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Bullet Highlights / Short Description */}
            {formattedShortDescription && (
              <div
                className="text-xs text-slate-700 leading-relaxed py-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:text-slate-700 [&_li]:leading-relaxed [&_li::marker]:text-slate-800"
                dangerouslySetInnerHTML={{ __html: formattedShortDescription }}
              />
            )}

            {/* Dropdown Variation Selectors */}
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
                          {attr.values.map((val: string) => {
                            const optVar = product.variations?.find((v: any) => {
                              if (!v.attributes || typeof v.attributes !== 'object') return false;
                              const attrKey = Object.keys(v.attributes).find(
                                (k) => k.toLowerCase() === attr.name.toLowerCase()
                              );
                              if (!attrKey) return false;
                              return String(v.attributes[attrKey] || '').trim().toLowerCase() === val.trim().toLowerCase();
                            });
                            const isOptOutOfStock = optVar
                              ? (
                                  optVar.stockStatus === 'Out of Stock' ||
                                  optVar.stockStatus === 'out_of_stock' ||
                                  optVar.status === 'Out of stock' ||
                                  optVar.inStock === false
                                )
                              : false;

                            return (
                              <option key={val} value={val}>
                                {val} {isOptOutOfStock ? ' (Out of stock)' : ''}
                              </option>
                            );
                          })}
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
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold mt-1 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                    <span>Out of stock &bull; Currently Unavailable</span>
                  </div>
                )}
                {matchedVariation && !isOutOfStock && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold mt-1 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>In stock &bull; Ready for Island-wide Delivery</span>
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

              {/* Frequently Bought Together / Combo Deal Box (Optional Add-on) */}
              {hasComboDeal && comboCompanions.length > 0 && (
                <div className="rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-purple-50/30 to-white p-3.5 sm:p-5 shadow-xs space-y-3 sm:space-y-4">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                    <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                      <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 text-white shadow-xs flex-shrink-0 mt-0.5 sm:mt-0">
                        <Package className="w-4 h-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5 flex-wrap">
                          <span>Frequently Bought Together</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100/80 border border-red-200/60 px-1.5 py-0.5 rounded">
                            Combo Deal
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                          Buy gadgets together and enjoy an instant combo bundle discount!
                        </p>
                      </div>
                    </div>
                    {comboSavingsMinor > 0 && (
                      <div className="sm:self-center pl-10.5 sm:pl-0">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black shadow-xs flex-shrink-0">
                          <Sparkles className="w-3 h-3" />
                          <span>Save Rs. {(comboSavingsMinor / 100).toLocaleString()}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Responsive Product Cards: Stacks cleanly on mobile, side-by-side on wider screens */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5">
                    {/* Main Item Card */}
                    <div className="flex items-center gap-3 bg-white/95 p-3 rounded-xl border border-indigo-100/90 shadow-2xs flex-1 min-w-0">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-slate-50 border border-slate-200 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={activeImage}
                          alt={product.name}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="inline-block text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-1.5 py-0.5 rounded mb-1 truncate max-w-full">
                          This Item {matchedVariation ? `• ${Object.values(matchedVariation.attributes || {}).join(' / ')}` : ''}
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 leading-tight" title={product.name}>
                          {product.name}
                        </p>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="text-xs sm:text-sm font-black text-slate-900">
                            Rs. {(activePriceMinor / 100).toLocaleString()}
                          </span>
                          {activeRegularPriceMinor && activeRegularPriceMinor > activePriceMinor && (
                            <span className="text-[10px] sm:text-xs text-slate-400 line-through font-semibold">
                              Rs. {(activeRegularPriceMinor / 100).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Plus Divider between main and companions */}
                    {comboCompanions.map((comp: any, cIdx: number) => (
                      <React.Fragment key={comp.id || cIdx}>
                        <div className="flex items-center justify-center my-0.5 sm:my-0 flex-shrink-0">
                          <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xs shadow-xs ring-2 ring-indigo-100">
                            +
                          </span>
                        </div>

                        {/* Companion Item Card */}
                        <div className="flex items-center gap-3 bg-white/95 p-3 rounded-xl border border-indigo-100/90 shadow-2xs flex-1 min-w-0">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-slate-50 border border-slate-200 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            <img
                              src={comp.image || '/placeholder-product.png'}
                              alt={comp.name}
                              className="w-full h-full object-contain mix-blend-multiply"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="inline-block text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200/60 px-1.5 py-0.5 rounded mb-1 truncate max-w-full">
                              Companion Gadget
                            </span>
                            <p className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 leading-tight" title={comp.name}>
                              {comp.name}
                            </p>
                            {(() => {
                              const fullProd = (productsData as any[])?.find((p) => String(p.id) === String(comp.id));
                              const target = fullProd || comp;
                              const currP = getTargetPrice(target);
                              const regP = getTargetRegularPrice(target);
                              return (
                                <div className="flex items-baseline gap-1.5 mt-1">
                                  <span className="text-xs sm:text-sm font-black text-slate-900">
                                    Rs. {currP.toLocaleString()}
                                  </span>
                                  {regP > currP && (
                                    <span className="text-[10px] sm:text-xs text-slate-400 line-through font-semibold">
                                      Rs. {regP.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Pricing Comparison & Add Both Button */}
                  <div className="bg-slate-50/90 p-3 sm:p-4 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-xs text-slate-600 font-bold">Total Combo Price:</span>
                        <span className="text-base sm:text-xl font-black text-red-600">
                          Rs. {(comboDealPriceMinor / 100).toLocaleString()}
                        </span>
                        {comboSavingsMinor > 0 && (
                          <span className="text-xs sm:text-sm text-slate-400 line-through font-semibold">
                            Rs. {(comboCombinedRegularMinor / 100).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {comboSavingsMinor > 0 && (
                        <p className="text-[11px] sm:text-xs text-emerald-700 font-black mt-0.5 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 inline" />
                          <span>Instant Combo Savings: Rs. {(comboSavingsMinor / 100).toLocaleString()} OFF</span>
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddComboToCart}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 active:scale-[0.98] text-white font-black text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex-shrink-0"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>{comboCompanions.length > 1 ? `Add All (${comboCompanions.length + 1} Items) to Cart` : 'Add Both to Cart'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Banner Image */}
            <div className="py-2.5 border-y border-slate-100">
              <img
                src="/Payment-Methods-1300x325.png"
                alt="Accepted Payment Methods: Visa, Mastercard, Koko, Payzy, PayHere, Cash On Delivery, Bank Transfer"
                className="w-full max-w-md h-auto object-contain"
              />
            </div>

            {/* "Check Availability" Notice Box */}
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

        {/* Product Information Tabs */}
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
            {/* 1. Description Tab */}
            {activeBottomTab === 'description' && (
              <div className="max-w-4xl text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
                <div
                  dangerouslySetInnerHTML={{
                    __html: cleanDescriptionHtml || formattedShortDescription || 'No detailed description available.',
                  }}
                />
              </div>
            )}

            {/* 2. Additional Information Tab */}
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

            {/* 3. Reviews Tab */}
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

        {/* SEO Internal Linking / Category & Store Exploration */}
        <div className="mt-12 bg-slate-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Explore More at DW Store</span>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Buy Genuine {product.name} at Best Price in Sri Lanka
              </h3>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                Enjoy 100% genuine products with manufacturer warranty, 3-month interest-free installment plans with Koko &amp; Payzy, and island-wide Cash on Delivery to all 25 districts in Sri Lanka.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
              {primaryCategory && (
                <Link
                  href={`/category/${primaryCategory.slug}`}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  <span>More {primaryCategory.name} →</span>
                </Link>
              )}
              {product.brand && !['dwstore', 'dwstore original', 'unbranded', 'generic', 'no brand', 'none', ''].includes(product.brand.trim().toLowerCase()) && (
                <Link
                  href={`/brand/${product.brandSlug || product.brand.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold rounded-xl transition shadow-xs"
                >
                  <span>All {product.brand} Products</span>
                </Link>
              )}
              <Link
                href="/contact"
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition"
              >
                <span>📍 Pannipitiya Store</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Most Related Products Section */}
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
                      {rel.brand && !['dwstore', 'dwstore original', 'unbranded', 'generic', 'no brand', 'none', 'original', 'genuine', ''].includes(rel.brand.trim().toLowerCase()) && (
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                          {rel.brand}
                        </span>
                      )}
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
