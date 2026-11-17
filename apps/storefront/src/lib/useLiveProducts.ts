'use client';

import { useState, useEffect } from 'react';
import productsData from '@/data/products.json';

// In-memory cache across component unmounts and client-side route transitions
let inMemoryProductsCache: any[] | null = null;
const listeners = new Set<(products: any[]) => void>();

export function getProductTimestamp(p: any): number {
  if (p.updatedAtTimestamp && Number(p.updatedAtTimestamp) > 0) return Number(p.updatedAtTimestamp);
  if (p.createdAtTimestamp && Number(p.createdAtTimestamp) > 0) return Number(p.createdAtTimestamp);
  if (p.updatedAt) {
    const t = new Date(p.updatedAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (p.createdAt) {
    const t = new Date(p.createdAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (typeof p.id === 'string' && p.id.startsWith('prod-')) {
    const parsed = Number(p.id.replace('prod-', ''));
    if (!isNaN(parsed) && parsed > 1000000000000) return parsed;
  }
  return 0;
}

export function useLiveProducts(): any[] {
  const [products, setProducts] = useState<any[]>(() => {
    if (inMemoryProductsCache && inMemoryProductsCache.length > 0) {
      return inMemoryProductsCache;
    }
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('dwstore_live_catalog_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            inMemoryProductsCache = parsed;
            return parsed;
          }
        }
      } catch {}
    }
    return productsData as any[];
  });

  useEffect(() => {
    let isMounted = true;

    const handleChange = (updated: any[]) => {
      if (isMounted) setProducts(updated);
    };
    listeners.add(handleChange);

    // Fetch live products from /api/products
    fetch('/api/products?t=' + Date.now(), { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          inMemoryProductsCache = data;
          try {
            localStorage.setItem('dwstore_live_catalog_v1', JSON.stringify(data));
          } catch {}
          listeners.forEach((listener) => listener(data));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
      listeners.delete(handleChange);
    };
  }, []);

  return products;
}
