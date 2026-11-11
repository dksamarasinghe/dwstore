/**
 * Dynamic Base URL for Storefront and Backend API
 * Supports localhost, VPS IP (e.g. 2.31.119.22), and custom domain (dwstore.lk)
 */
export function getStorefrontUrl(): string {
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }
    // If hostname is an IP (e.g. 2.31.119.22), point to port 3000 on that same IP
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return `${protocol}//${hostname}:3000`;
    }
    // If running under path on main domain (e.g. dwstore.lk/sudo-sudo/admin)
    if (hostname === 'dwstore.lk' || hostname === 'www.dwstore.lk') {
      return `${protocol}//${hostname}`;
    }
    // If on a domain like admin.dwstore.lk, main site is dwstore.lk
    if (hostname.startsWith('admin.')) {
      return `${protocol}//${hostname.replace('admin.', '')}`;
    }
    return `${protocol}//${hostname}:3000`;
  }
  return 'http://localhost:3000';
}
