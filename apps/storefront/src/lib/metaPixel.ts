// Meta (Facebook) Pixel Helper Utility for DWstore.lk
// Production-ready, type-safe client-side tracking for Dynamic Product Ads

export const FB_PIXEL_ID = '1231922081314947';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

/**
 * Low-level safe fbq caller that works strictly in the browser
 */
export function fbq(...args: any[]): void {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq(...args);
    } catch (err) {
      console.warn('[Meta Pixel] Failed to track event:', err);
    }
  }
}

/**
 * Track standard PageView
 */
export function trackPageView(): void {
  fbq('track', 'PageView');
}

export interface MetaProductPayload {
  id?: string | number;
  productId?: string | number;
  sku?: string;
  slug?: string;
  name?: string;
  price?: number;
  priceMinor?: number;
  salePriceMinor?: number;
  regularPriceMinor?: number;
  minPriceMinor?: number;
  category?: string;
}

/**
 * Helper to extract consistent numeric price in LKR
 */
function resolvePrice(product: MetaProductPayload): number {
  if (typeof product.price === 'number' && !isNaN(product.price)) {
    return product.price;
  }
  const minor = product.salePriceMinor || product.priceMinor || product.regularPriceMinor || product.minPriceMinor || 0;
  return Number((minor / 100).toFixed(2));
}

/**
 * Helper to extract consistent product ID string matching the CSV catalog feed exactly
 */
function resolveProductId(product: MetaProductPayload): string {
  const rawId = product.id ?? product.productId ?? product.sku ?? product.slug ?? '';
  return String(rawId).trim();
}

/**
 * 1. ViewContent: Fire on product detail pages
 * content_ids MUST match the exact 'id' header in /api/meta-feed
 */
export function trackViewContent(product: MetaProductPayload): void {
  if (!product) return;
  const contentId = resolveProductId(product);
  if (!contentId) return;

  const price = resolvePrice(product);

  fbq('track', 'ViewContent', {
    content_name: product.name || '',
    content_ids: [contentId],
    content_type: 'product',
    value: price,
    currency: 'LKR',
    content_category: product.category || '',
  });
}

export interface MetaAddToCartPayload {
  id?: string | number;
  productId?: string | number;
  name?: string;
  price?: number;
  priceMinor?: number;
  quantity?: number;
  currency?: string;
}

/**
 * 2. AddToCart: Fire when a user adds an item to the cart
 * content_ids MUST match the exact 'id' header in /api/meta-feed
 */
export function trackAddToCart(item: MetaAddToCartPayload): void {
  if (!item) return;
  const contentId = resolveProductId(item);
  if (!contentId) return;

  const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
  const unitPrice = resolvePrice(item);
  const totalValue = Number((unitPrice * qty).toFixed(2));

  fbq('track', 'AddToCart', {
    content_name: item.name || '',
    content_ids: [contentId],
    content_type: 'product',
    value: totalValue,
    currency: item.currency || 'LKR',
  });
}

export interface MetaPurchasePayload {
  orderId?: string;
  total?: number;
  totalMinor?: number;
  value?: number;
  content_ids?: Array<string | number>;
  productIds?: Array<string | number>;
  items?: Array<{
    id?: string | number;
    productId?: string | number;
    sku?: string;
    slug?: string;
    name?: string;
    priceMinor?: number;
    quantity?: number;
  }>;
  currency?: string;
  num_items?: number;
}

/**
 * 3. Purchase: Fire on order completion / thank-you page
 * content_ids is an array of purchased product IDs matching the catalog 'id'
 */
export function trackPurchase(order: MetaPurchasePayload): void {
  if (!order) return;

  // Resolve total value in LKR
  let total = 0;
  if (typeof order.value === 'number') {
    total = order.value;
  } else if (typeof order.total === 'number') {
    total = order.total;
  } else if (typeof order.totalMinor === 'number') {
    total = Number((order.totalMinor / 100).toFixed(2));
  }

  // Resolve unique content IDs matching catalog
  const contentIdSet = new Set<string>();

  if (Array.isArray(order.content_ids)) {
    order.content_ids.forEach((id) => {
      if (id !== undefined && id !== null && String(id).trim()) {
        contentIdSet.add(String(id).trim());
      }
    });
  }

  if (Array.isArray(order.productIds)) {
    order.productIds.forEach((id) => {
      if (id !== undefined && id !== null && String(id).trim()) {
        contentIdSet.add(String(id).trim());
      }
    });
  }

  if (Array.isArray(order.items)) {
    order.items.forEach((item) => {
      const raw = item.productId ?? item.id ?? item.sku ?? item.slug;
      if (raw) {
        // If it's a composite key like "29517_Color:Black", extract the root product ID
        const cleanId = String(raw).split('_')[0].trim();
        if (cleanId) contentIdSet.add(cleanId);
      }
    });
  }

  const contentIds = Array.from(contentIdSet);

  fbq('track', 'Purchase', {
    content_ids: contentIds,
    content_type: 'product',
    value: total,
    currency: order.currency || 'LKR',
    num_items: contentIds.length,
  });
}

/**
 * InitiateCheckout: Fire when user proceeds to checkout
 */
export function trackInitiateCheckout(items: any[], totalMinor: number): void {
  const total = Number(((totalMinor || 0) / 100).toFixed(2));
  const contentIds = Array.from(
    new Set(
      items
        .map((i) => {
          const raw = i.productId ?? i.id ?? i.sku ?? i.slug;
          return raw ? String(raw).split('_')[0].trim() : '';
        })
        .filter(Boolean)
    )
  );

  fbq('track', 'InitiateCheckout', {
    content_ids: contentIds,
    content_type: 'product',
    value: total,
    currency: 'LKR',
    num_items: contentIds.length,
  });
}
