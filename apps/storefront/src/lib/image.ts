/**
 * Utility to resolve and sanitize media & image URLs across Dwstore Storefront.
 * Handles legacy WordPress wp-content URLs, VPS /media/ paths, relative paths,
 * and external URLs with robust fallbacks.
 */

export const FALLBACK_TECH_IMAGE = '/media/products/T800-Ultra-Smart-Watch-1_d7ac6b08.jpg';
export const FALLBACK_BRAND_LOGO = '/dwstore_logo.png';

export function resolveImageUrl(url?: string | null, fallback = FALLBACK_TECH_IMAGE): string {
  if (!url || typeof url !== 'string' || !url.trim()) return fallback;
  const trimmed = url.trim();

  // If data URI or blob URI
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // If it's a legacy WordPress wp-content URL (e.g. https://www.dwstore.lk/wp-content/uploads/...)
  // Route it through the local Next.js /wp-content/uploads/ handler
  if (trimmed.includes('/wp-content/uploads/')) {
    const idx = trimmed.indexOf('/wp-content/uploads/');
    return trimmed.substring(idx);
  }

  // If it already starts with /media/ or /wp-content/
  if (trimmed.startsWith('/media/') || trimmed.startsWith('/wp-content/')) {
    return trimmed;
  }

  // If it contains /media/ (e.g. from http://localhost:3000/media/...)
  if (trimmed.includes('/media/')) {
    const idx = trimmed.indexOf('/media/');
    return trimmed.substring(idx);
  }

  // If full external URL (e.g. upload.wikimedia.org, images.unsplash.com)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // If it points to dwstore.lk, extract relative path
    if (trimmed.includes('dwstore.lk/')) {
      const parts = trimmed.split('dwstore.lk');
      if (parts[1]) return parts[1];
    }
    return trimmed;
  }

  // If relative path without leading slash
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return `/${trimmed}`;
}
