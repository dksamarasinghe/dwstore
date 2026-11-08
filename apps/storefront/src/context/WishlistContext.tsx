'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface WishlistContextType {
  wishlist: string[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => boolean; // returns true if added, false if removed
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'dwstore_wishlist_items';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setWishlist(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load wishlist from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
      window.dispatchEvent(new Event('dwstore_wishlist_updated'));
    } catch (e) {
      console.error('Failed to save wishlist to storage', e);
    }
  }, [wishlist, isLoaded]);

  const isInWishlist = (productId: string): boolean => {
    if (!productId) return false;
    return wishlist.includes(productId);
  };

  const toggleWishlist = (productId: string): boolean => {
    if (!productId) return false;
    let added = false;
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        added = false;
        return prev.filter((id) => id !== productId);
      } else {
        added = true;
        return [...prev, productId];
      }
    });
    return added;
  };

  const addToWishlist = (productId: string) => {
    if (!productId) return;
    setWishlist((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
  };

  const removeFromWishlist = (productId: string) => {
    if (!productId) return;
    setWishlist((prev) => prev.filter((id) => id !== productId));
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        itemCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
