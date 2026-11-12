import { getStorefrontUrl } from '../config';

export function resolveImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) return '';
  const trimmed = url.trim();

  // If data URI or blob URI
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // If it's a legacy WordPress wp-content URL, route through Storefront's wp-content handler
  if (trimmed.includes('/wp-content/uploads/')) {
    const idx = trimmed.indexOf('/wp-content/uploads/');
    const rel = trimmed.substring(idx);
    return `${getStorefrontUrl()}${rel}`;
  }

  // If it contains /media/ (e.g. /media/products/... or http://localhost:3000/media/...)
  if (trimmed.includes('/media/')) {
    const idx = trimmed.indexOf('/media/');
    const rel = trimmed.substring(idx);
    return `${getStorefrontUrl()}${rel}`;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // If it points to dwstore.lk, route through getStorefrontUrl()
    if (trimmed.includes('dwstore.lk/')) {
      const parts = trimmed.split('dwstore.lk');
      if (parts[1]) {
        return `${getStorefrontUrl()}${parts[1]}`;
      }
    }
    return trimmed;
  }

  const clean = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${getStorefrontUrl()}${clean}`;
}
