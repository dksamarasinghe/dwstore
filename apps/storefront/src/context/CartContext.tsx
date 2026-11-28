'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { trackAddToCart } from '@/lib/meta-pixel';

export interface CartItem {
  id: string; // product id or product id + variation id
  productId: string;
  name: string;
  slug: string;
  image: string;
  priceMinor: number;
  regularPriceMinor?: number | null;
  quantity: number;
  allowedPaymentMethods?: string[];
  comboDiscountBadge?: string;
  isGrouped?: boolean;
  groupedProducts?: Array<{
    id: string;
    name: string;
    image?: string;
    regularPrice?: number;
    salePrice?: number;
    sku?: string;
    slug?: string;
    quantity?: number;
    productType?: string;
  }>;
  variation?: {
    id?: string;
    attributes: Record<string, string>;
  } | null;
}

interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (item: Omit<CartItem, 'id'>, openDrawer?: boolean) => void;
  addMultipleToCart: (items: Array<Omit<CartItem, 'id'>>, openDrawer?: boolean) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotalMinor: number;
  comboSavingsMinor: number;
  originalSubtotalMinor: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'dwstore_cart_items';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  }, [cart, isLoaded]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addToCart = (newItem: Omit<CartItem, 'id'>, openDrawer = true) => {
    const variationKey = newItem.variation
      ? Object.entries(newItem.variation.attributes)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}:${v}`)
          .join('|')
      : '';
    const cartItemId = `${newItem.productId}_${variationKey}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((i) => i.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      } else {
        return [...prevCart, { ...newItem, id: cartItemId }];
      }
    });

    if (openDrawer) {
      setIsOpen(true);
    }

    try {
      trackAddToCart(newItem);
    } catch (e) {
      // ignore
    }
  };

  const addMultipleToCart = (newItems: Array<Omit<CartItem, 'id'>>, openDrawer = true) => {
    if (!newItems || newItems.length === 0) return;

    setCart((prevCart) => {
      let updated = [...prevCart];
      newItems.forEach((newItem) => {
        const variationKey = newItem.variation
          ? Object.entries(newItem.variation.attributes)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([k, v]) => `${k}:${v}`)
              .join('|')
          : '';
        const cartItemId = `${newItem.productId}_${variationKey}`;
        const existingIndex = updated.findIndex((i) => i.id === cartItemId);
        if (existingIndex > -1) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + newItem.quantity,
            priceMinor: newItem.priceMinor,
            regularPriceMinor: newItem.regularPriceMinor ?? updated[existingIndex].regularPriceMinor,
            comboDiscountBadge: newItem.comboDiscountBadge || updated[existingIndex].comboDiscountBadge,
          };
        } else {
          updated.push({ ...newItem, id: cartItemId });
        }
      });
      return updated;
    });

    if (openDrawer) {
      setIsOpen(true);
    }

    newItems.forEach((item) => {
      try {
        trackAddToCart(item);
      } catch (e) {}
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const subtotalMinor = cart.reduce(
    (total, item) => total + item.priceMinor * item.quantity,
    0
  );

  const comboSavingsMinor = cart.reduce((total, item) => {
    if (
      item.comboDiscountBadge &&
      item.regularPriceMinor &&
      item.regularPriceMinor > item.priceMinor
    ) {
      return total + (item.regularPriceMinor - item.priceMinor) * item.quantity;
    }
    return total;
  }, 0);

  const originalSubtotalMinor = subtotalMinor + comboSavingsMinor;

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        addMultipleToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotalMinor,
        comboSavingsMinor,
        originalSubtotalMinor,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
