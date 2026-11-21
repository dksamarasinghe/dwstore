// Meta (Facebook) Pixel Helper for DWstore.lk

export const FB_PIXEL_ID = '1231922081314947';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

/**
 * Safe fbq caller that works in browser only
 */
export function fbq(...args: any[]) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq(...args);
    } catch (e) {
      console.warn('[Meta Pixel] Error:', e);
    }
  }
}

/**
 * Track standard PageView
 */
export function trackPageView() {
  fbq('track', 'PageView');
}

/**
 * Track ViewContent when customer views a product page
 * Matches Facebook Catalog product ID
 */
export function trackViewContent(product: {
  id?: string;
  sku?: string;
  slug?: string;
  name?: string;
  priceMinor?: number;
  salePriceMinor?: number;
  regularPriceMinor?: number;
  category?: string;
}) {
  if (!product) return;
  const price = (product.salePriceMinor || product.priceMinor || product.regularPriceMinor || 0) / 100;
  const contentId = String(product.id || product.sku || product.slug || '');

  fbq('track', 'ViewContent', {
    content_name: product.name,
    content_ids: [contentId],
    content_type: 'product',
    value: price,
    currency: 'LKR',
    content_category: product.category,
  });
}

/**
 * Track AddToCart when customer adds an item
 */
export function trackAddToCart(item: {
  productId?: string;
  id?: string;
  name?: string;
  priceMinor?: number;
  quantity?: number;
}) {
  if (!item) return;
  const price = ((item.priceMinor || 0) * (item.quantity || 1)) / 100;
  const contentId = String(item.productId || item.id || '');

  fbq('track', 'AddToCart', {
    content_name: item.name,
    content_ids: [contentId],
    content_type: 'product',
    value: price,
    currency: 'LKR',
  });
}

/**
 * Track InitiateCheckout
 */
export function trackInitiateCheckout(items: any[], totalMinor: number) {
  const total = (totalMinor || 0) / 100;
  const contentIds = items.map((i) => String(i.productId || i.id || '')).filter(Boolean);

  fbq('track', 'InitiateCheckout', {
    content_ids: contentIds,
    content_type: 'product',
    value: total,
    currency: 'LKR',
    num_items: items.length,
  });
}

/**
 * Track Purchase on order success
 */
export function trackPurchase(order: {
  orderId?: string;
  totalMinor?: number;
  total?: number;
  items?: any[];
}) {
  if (!order) return;
  const total =
    typeof order.total === 'number'
      ? order.total
      : typeof order.totalMinor === 'number'
      ? order.totalMinor / 100
      : 0;

  const contentIds = Array.isArray(order.items)
    ? order.items.map((i: any) => String(i.productId || i.id || '')).filter(Boolean)
    : [];

  fbq('track', 'Purchase', {
    content_ids: contentIds,
    content_type: 'product',
    value: total,
    currency: 'LKR',
    num_items: contentIds.length,
  });
}
