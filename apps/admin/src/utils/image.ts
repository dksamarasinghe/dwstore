import { getStorefrontUrl } from '../config';

export function resolveImageUrl(url?: string | null): string {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  const clean = url.startsWith('/') ? url : `/${url}`;
  return `${getStorefrontUrl()}${clean}`;
}
