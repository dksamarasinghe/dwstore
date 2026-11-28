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
  comboBundleId?: string;
  comboRequiredProductIds?: string[];
  normalPriceMinor?: number;
  normalRegularPriceMinor?: number | null;
  comboDiscountedPriceMinor?: number;
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

export function validateCartBundles(items: CartItem[]): CartItem[] {
  // 1. Group items that have comboBundleId
  const bundles: Record<string, CartItem[]> = {};
  items.forEach((item) => {
    if (item.comboBundleId) {
      if (!bundles[item.comboBundleId]) {
        bundles[item.comboBundleId] = [];
      }
      bundles[item.comboBundleId].push(item);
    }
  });

  // 2. Identify which bundle IDs are intact (all required products are present with quantity > 0)
  const validBundleIds = new Set<string>();
  Object.entries(bundles).forEach(([bId, bItems]) => {
    const requiredProductIds = bItems[0]?.comboRequiredProductIds;
    if (Array.isArray(requiredProductIds) && requiredProductIds.length > 1) {
      const presentProductIds = new Set(
        bItems.filter((i) => i.quantity > 0).map((i) => String(i.productId))
      );
      const isComplete = requiredProductIds.every((reqId) => presentProductIds.has(String(reqId)));
      if (isComplete) {
        validBundleIds.add(bId);
      }
    }
  });

  // 3. Process each item:
  // - If bundle is intact: keep discounted combo price and combo discount badge
  // - If bundle is broken (any item was deleted): revert to standard normal selling price, clear badge & bundle fields
  return items.map((item) => {
    if (item.comboBundleId) {
      if (validBundleIds.has(item.comboBundleId)) {
        return {
          ...item,
          priceMinor: item.comboDiscountedPriceMinor ?? item.priceMinor,
          comboDiscountBadge: 'Combo Savings Included',
        };
      } else {
        // Bundle broken because one or more companion items were removed from cart!
        const revertedPrice = item.normalPriceMinor ?? item.regularPriceMinor ?? item.priceMinor;
        const revertedRegular = item.normalRegularPriceMinor !== undefined
          ? item.normalRegularPriceMinor
          : (item.regularPriceMinor && item.regularPriceMinor > revertedPrice ? item.regularPriceMinor : null);
        return {
          ...item,
          priceMinor: revertedPrice,
          regularPriceMinor: revertedRegular,
          comboDiscountBadge: undefined,
          comboBundleId: undefined,
          comboRequiredProductIds: undefined,
          comboDiscountedPriceMinor: undefined,
          normalPriceMinor: undefined,
          normalRegularPriceMinor: undefined,
        };
      }
    }

    // Clean up legacy items without bundle ID that may still have a lingering combo badge
    if (item.comboDiscountBadge && (!item.regularPriceMinor || item.regularPriceMinor <= item.priceMinor)) {
      return {
        ...item,
        comboDiscountBadge: undefined,
      };
    }

    return item;
  });
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCart(validateCartBundles(Array.isArray(parsed) ? parsed : []));
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
      let updated: CartItem[];
      if (existingIndex > -1) {
        updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + newItem.quantity,
        };
      } else {
        updated = [...prevCart, { ...newItem, id: cartItemId }];
      }
      return validateCartBundles(updated);
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
            normalPriceMinor: newItem.normalPriceMinor ?? updated[existingIndex].normalPriceMinor,
            normalRegularPriceMinor: newItem.normalRegularPriceMinor ?? updated[existingIndex].normalRegularPriceMinor,
            comboDiscountedPriceMinor: newItem.comboDiscountedPriceMinor ?? updated[existingIndex].comboDiscountedPriceMinor,
            comboBundleId: newItem.comboBundleId ?? updated[existingIndex].comboBundleId,
            comboRequiredProductIds: newItem.comboRequiredProductIds ?? updated[existingIndex].comboRequiredProductIds,
            comboDiscountBadge: newItem.comboDiscountBadge || updated[existingIndex].comboDiscountBadge,
          };
        } else {
          updated.push({ ...newItem, id: cartItemId });
        }
      });
      return validateCartBundles(updated);
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
    setCart((prev) => validateCartBundles(prev.filter((item) => item.id !== id)));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      validateCartBundles(
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      )
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
