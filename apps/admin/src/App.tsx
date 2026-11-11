import React, { useState, useEffect } from 'react';
import { TabType, ProductItem, OrderItem, ReviewItem, CategoryItem, BrandItem, CouponItem, ShipmentItem, AbandonedCartItem, CustomerItem } from './types';
import {
  initialReviews,
  initialCoupons,
  initialAbandonedCarts
} from './data/mockData';
import { realProducts, realCategories } from './data/realCatalog';
import { realBrands } from './data/realBrands';
import { realOrders, realCustomers, realShipments } from './data/realOrdersData';
import { normalizeOrder } from './utils/normalizer';
import { getStorefrontUrl } from './config';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { NotificationToast } from './components/layout/NotificationToast';

import { DashboardView } from './components/views/DashboardView';
import { OrdersView } from './components/views/OrdersView';
import { ProductsView } from './components/views/ProductsView';
import { AddProductView } from './components/views/AddProductView';
import { CategoriesView } from './components/views/CategoriesView';
import { BrandsView } from './components/views/BrandsView';
import { HomeCustomizerView } from './components/views/HomeCustomizerView';
import { MediaLibraryView } from './components/views/MediaLibraryView';
import { InventoryView } from './components/views/InventoryView';
import { CustomersView } from './components/views/CustomersView';
import { ReviewsView } from './components/views/ReviewsView';
import { DiscountsView } from './components/views/DiscountsView';
import { PaymentsView } from './components/views/PaymentsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { ShipmentsView } from './components/views/ShipmentsView';
import { ReturnsView } from './components/views/ReturnsView';
import { AbandonedCartsView } from './components/views/AbandonedCartsView';
import { ImportsView } from './components/views/ImportsView';
import { SettingsView } from './components/views/SettingsView';
import { IntegrationsView } from './components/views/IntegrationsView';
import { LoginView } from './components/auth/LoginView';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [userSession, setUserSession] = useState<{
    authenticated: boolean;
    name?: string;
    email?: string;
    role?: string;
  }>(() => {
    try {
      const saved = localStorage.getItem('dwstore_admin_auth');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      authenticated: true,
      name: 'DWstore Admin',
      email: 'admin@dwstore.lk',
      role: 'Super Administrator'
    };
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('khamba-theme') as 'light' | 'dark') || 'dark';
  });
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('khamba-collapsed') === '1';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Main entity states with 100% Real WooCommerce Database & Koombiyo Logistics
  const [products, setProducts] = useState<ProductItem[]>(() => {
    try {
      const saved = localStorage.getItem('dwstore_admin_products_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return realProducts;
  });
  const [orders, setOrders] = useState<OrderItem[]>(() => {
    try {
      const saved = localStorage.getItem('dwstore_admin_orders_v3');
      if (saved) return JSON.parse(saved);

      const oldSaved = localStorage.getItem('dwstore_admin_orders');
      if (oldSaved) {
        const parsed: OrderItem[] = JSON.parse(oldSaved);
        const map = new Map(realOrders.map(ro => [ro.orderId, ro]));
        return parsed.map(o => {
          const ro = map.get(o.orderId);
          return {
            ...o,
            carrier: 'Koombiyo Delivery',
            trackingNumber: o.trackingNumber || ro?.trackingNumber || '',
            dispatchedDate: o.dispatchedDate || ro?.dispatchedDate || ''
          };
        });
      }
    } catch (e) {}
    return realOrders;
  });
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [revStats, setRevStats] = useState({ rating: 4.9, totalReviews: 112 });
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('dwstore_admin_categories');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return realCategories;
  });
  const [brands, setBrands] = useState<BrandItem[]>(() => {
    try {
      const savedV2 = localStorage.getItem('dwstore_admin_brands_v2');
      if (savedV2) return JSON.parse(savedV2);
      const saved = localStorage.getItem('dwstore_admin_brands');
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasLogos = Array.isArray(parsed) && parsed.filter((b: any) => Boolean(b.logo)).length > 10;
        if (hasLogos) return parsed;
      }
    } catch (e) {}
    return realBrands;
  });

  useEffect(() => {
    try {
      localStorage.setItem('dwstore_admin_products_v1', JSON.stringify(products));
    } catch (e) {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('dwstore_admin_orders_v3', JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('dwstore_admin_categories', JSON.stringify(categories));
    } catch (e) {}
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('dwstore_admin_brands_v2', JSON.stringify(brands));
      localStorage.setItem('dwstore_admin_brands', JSON.stringify(brands));
    } catch (e) {}
  }, [brands]);

  // Sync brands with Storefront API
  useEffect(() => {
    fetch(`${getStorefrontUrl()}/api/brands?t=${Date.now()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.brands) && data.brands.length > 0) {
          setBrands(data.brands);
          try {
            localStorage.setItem('dwstore_admin_brands_v2', JSON.stringify(data.brands));
            localStorage.setItem('dwstore_admin_brands', JSON.stringify(data.brands));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const [coupons, setCoupons] = useState<CouponItem[]>(initialCoupons);

  // Sync coupons with Storefront API
  useEffect(() => {
    fetch(`${getStorefrontUrl()}/api/coupons`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.coupons)) {
          setCoupons(data.coupons);
        }
      })
      .catch((err) => console.warn('Failed to load coupons from API:', err));

    // Sync categories with Storefront API
    fetch(`${getStorefrontUrl()}/api/categories`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.warn('Failed to load categories from API:', err));
  }, []);
  const [shipments, setShipments] = useState<ShipmentItem[]>(() => {
    try {
      const saved = localStorage.getItem('dwstore_admin_shipments_v3');
      if (saved) {
        const parsed: ShipmentItem[] = JSON.parse(saved);
        const hasLegacyCarrier = parsed.some(s => s.carrier !== 'Koombiyo Delivery');
        if (!hasLegacyCarrier && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return realShipments;
  });

  useEffect(() => {
    try {
      localStorage.setItem('dwstore_admin_shipments_v3', JSON.stringify(shipments));
    } catch (e) {}
  }, [shipments]);
  const [syncingCourier, setSyncingCourier] = useState(false);

  // Auto-sync active shipments against live Koombiyo Delivery status
  const handleSyncCourierStatus = async (isManual = false) => {
    setSyncingCourier(true);
    try {
      const res = await fetch(`${getStorefrontUrl()}/api/orders/sync-courier`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data && data.success) {
        if (data.updatedCount > 0 && Array.isArray(data.updatedOrderIds)) {
          const updatedSet = new Set(data.updatedOrderIds);
          setOrders((prev) =>
            prev.map((o) =>
              updatedSet.has(o.orderId)
                ? { ...o, status: 'delivered', paymentStatus: 'Paid' }
                : o
            )
          );
          setShipments((prev) =>
            prev.map((s) =>
              updatedSet.has(s.orderId)
                ? { ...s, status: 'Delivered' }
                : s
            )
          );
          showNotification(
            `⚡ Koombiyo Auto-Sync: ${data.updatedCount} order(s) marked as Delivered!`
          );
        } else if (isManual) {
          showNotification('⚡ Koombiyo Delivery Sync: All shipments are up to date.');
        }
      }
    } catch (e) {
      console.warn('Sync courier error:', e);
    } finally {
      setSyncingCourier(false);
    }
  };

  // Background sync every 1 hour (3600000 ms)
  useEffect(() => {
    handleSyncCourierStatus(false);
    const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hour
    const interval = setInterval(() => {
      handleSyncCourierStatus(false);
    }, ONE_HOUR_MS);
    return () => clearInterval(interval);
  }, []);

  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCartItem[]>(initialAbandonedCarts);
  const [customers, setCustomers] = useState<CustomerItem[]>(() => {
    try {
      const saved = localStorage.getItem('dwstore_admin_customers_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return realCustomers;
  });

  useEffect(() => {
    try {
      localStorage.setItem('dwstore_admin_customers_v1', JSON.stringify(customers));
    } catch (e) {}
  }, [customers]);
  const [editingProductForForm, setEditingProductForForm] = useState<ProductItem | null>(null);

  const handleStartEditProduct = (prod: ProductItem) => {
    setEditingProductForForm(prod);
    setActiveTab('add-product');
  };

  const handleOpenAddProduct = () => {
    setEditingProductForForm(null);
    setActiveTab('add-product');
  };

  // Sync theme changes with HTML document
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('khamba-theme', theme);
  }, [theme]);

  // Sync sidebar collapsed state
  useEffect(() => {
    localStorage.setItem('khamba-collapsed', collapsed ? '1' : '0');
    if (collapsed) {
      document.body.classList.add('collapsed');
    } else {
      document.body.classList.remove('collapsed');
    }
  }, [collapsed]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // Fetch orders from API with normalization (syncs latest status & customer updates)
  const fetchOrders = () => {
    fetch(`${getStorefrontUrl()}/api/orders`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.orders) && data.orders.length > 0) {
          const normalized = data.orders.map(normalizeOrder);
          setOrders((prev) => {
            const map = new Map(prev.map((o) => [o.orderId, o]));
            normalized.forEach((n) => {
              const existing = map.get(n.orderId);
              if (existing) {
                // If status changed to delivered (e.g. from customer portal)
                if (n.status === 'delivered' && existing.status !== 'delivered') {
                  setShipments((shps) =>
                    shps.map((s) => (s.orderId === n.orderId ? { ...s, status: 'Delivered' } : s))
                  );
                }
                map.set(n.orderId, { ...existing, ...n });
              } else {
                map.set(n.orderId, n);
              }
            });
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});
  };

  // Sync reviews from Storefront API
  const fetchReviews = () => {
    fetch(`${getStorefrontUrl()}/api/reviews`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviews(data.reviews);
          if (data.stats) setRevStats(data.stats);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchOrders();
    fetchReviews();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  // Update order status PATCH API
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    // 1. Update order status locally
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus as any } : o))
    );
    if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus as any } : null));
    }

    // 2. If status is delivered, update matching shipment in ShipmentsView
    if (newStatus === 'delivered') {
      setShipments((prev) =>
        prev.map((s) => (s.orderId === orderId ? { ...s, status: 'Delivered' } : s))
      );
    } else if (newStatus === 'shipped') {
      const ord = orders.find((o) => o.orderId === orderId);
      if (ord) {
        const carrier = (ord.carrier || 'Koombiyo Delivery') as any;
        const trackingNumber = ord.trackingNumber || `DWS-TRK-${orderId}`;
        const dispatchedDate = ord.dispatchedDate || new Date().toISOString().split('T')[0];
        setShipments((prev) => {
          const idx = prev.findIndex((s) => s.orderId === orderId);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], status: 'In Transit', carrier, trackingNumber, dispatchedDate };
            return copy;
          }
          return [
            {
              id: `shp-${orderId}`,
              orderId,
              customerName: ord.customerName,
              carrier,
              trackingNumber,
              dispatchedDate,
              status: 'In Transit',
              destinationCity: ord.city,
            },
            ...prev,
          ];
        });
      }
    }

    showNotification(`Order #${orderId} status set to ${newStatus.toUpperCase()}`);

    try {
      await fetch(`${getStorefrontUrl()}/api/orders`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
    } catch {
      // ignore
    }
  };

  // Dispatch Order with Courier Partner and Tracking Number
  const handleDispatchOrder = async (
    orderId: string,
    carrier: string,
    trackingNumber: string,
    dispatchedDate: string
  ) => {
    // 1. Update orders state
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId
          ? {
              ...o,
              status: 'shipped',
              carrier: carrier as any,
              trackingNumber,
              dispatchedDate,
            }
          : o
      )
    );

    // 2. Add or update Shipment in ShipmentsView
    const ord = orders.find((o) => o.orderId === orderId);
    const customerName = ord?.customerName || 'Customer';
    const destinationCity = ord?.city || 'Colombo';

    setShipments((prev) => {
      const idx = prev.findIndex((s) => s.orderId === orderId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          carrier: carrier as any,
          trackingNumber,
          dispatchedDate,
          customerName,
          destinationCity,
          status: 'In Transit',
        };
        return copy;
      }
      const newShipment: ShipmentItem = {
        id: `shp-${orderId}`,
        orderId,
        customerName,
        carrier: carrier as any,
        trackingNumber,
        dispatchedDate,
        status: 'In Transit',
        destinationCity,
      };
      return [newShipment, ...prev];
    });

    // 3. Sync to Storefront API
    try {
      await fetch(`${getStorefrontUrl()}/api/orders`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: 'shipped',
          carrier,
          trackingNumber,
          courierTrackingNumber: trackingNumber,
          dispatchedDate,
        }),
      });
    } catch (e) {
      console.warn('Sync dispatch error:', e);
    }
  };

  // Full Order Update
  const handleUpdateFullOrder = async (updatedOrder: OrderItem) => {
    // 1. Update orders state
    setOrders((prev) =>
      prev.map((o) => (o.orderId === updatedOrder.orderId ? updatedOrder : o))
    );

    if (selectedOrder && selectedOrder.orderId === updatedOrder.orderId) {
      setSelectedOrder(updatedOrder);
    }

    // 2. Sync shipments if shipped or tracking number is present
    if (
      updatedOrder.status === 'shipped' ||
      updatedOrder.status === 'delivered' ||
      updatedOrder.trackingNumber
    ) {
      const carrier = (updatedOrder.carrier || 'Koombiyo Delivery') as any;
      const trackingNumber = updatedOrder.trackingNumber || `DWS-TRK-${updatedOrder.orderId}`;
      const dispatchedDate =
        updatedOrder.dispatchedDate || new Date().toISOString().split('T')[0];
      const shipmentStatus =
        updatedOrder.status === 'delivered' ? 'Delivered' : 'In Transit';

      setShipments((prev) => {
        const idx = prev.findIndex((s) => s.orderId === updatedOrder.orderId);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = {
            ...copy[idx],
            carrier,
            trackingNumber,
            dispatchedDate,
            customerName: updatedOrder.customerName,
            destinationCity: updatedOrder.city,
            status: shipmentStatus,
          };
          return copy;
        }
        const newShipment: ShipmentItem = {
          id: `shp-${updatedOrder.orderId}`,
          orderId: updatedOrder.orderId,
          customerName: updatedOrder.customerName,
          carrier,
          trackingNumber,
          dispatchedDate,
          status: shipmentStatus,
          destinationCity: updatedOrder.city,
        };
        return [newShipment, ...prev];
      });
    }

    // 3. Sync to Storefront API
    try {
      await fetch(`${getStorefrontUrl()}/api/orders`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: updatedOrder.orderId,
          status: updatedOrder.status,
          carrier: updatedOrder.carrier,
          trackingNumber: updatedOrder.trackingNumber,
          courierTrackingNumber: updatedOrder.trackingNumber,
          dispatchedDate: updatedOrder.dispatchedDate,
          customerName: updatedOrder.customerName,
          customerPhone: updatedOrder.customerPhone,
          customerEmail: updatedOrder.customerEmail,
          shippingAddress: updatedOrder.shippingAddress,
          city: updatedOrder.city,
          district: updatedOrder.district,
          postalCode: updatedOrder.postalCode,
          paymentStatus: updatedOrder.paymentStatus,
          paymentMethod: updatedOrder.paymentMethod,
          total: updatedOrder.total,
          notes: updatedOrder.notes,
        }),
      });
    } catch (e) {
      console.warn('Sync order update error:', e);
    }
  };

  // Create custom manual order
  const handleCreateOrder = async (newOrder: OrderItem) => {
    setOrders((prev) => [newOrder, ...prev]);

    if (newOrder.carrier && newOrder.trackingNumber) {
      const newShipment: ShipmentItem = {
        id: `shp-${newOrder.orderId}`,
        orderId: newOrder.orderId,
        customerName: newOrder.customerName,
        carrier: newOrder.carrier,
        trackingNumber: newOrder.trackingNumber,
        dispatchedDate: newOrder.dispatchedDate || new Date().toISOString().split('T')[0],
        status: newOrder.status === 'delivered' ? 'Delivered' : 'In Transit',
        destinationCity: newOrder.city,
      };
      setShipments((prev) => [newShipment, ...prev]);
    }

    if (newOrder.customerPhone || newOrder.customerName) {
      setCustomers((prev) => {
        const existingIdx = prev.findIndex(
          (c) =>
            (c.phone && newOrder.customerPhone && c.phone === newOrder.customerPhone) ||
            (c.email && newOrder.customerEmail && c.email.toLowerCase() === newOrder.customerEmail.toLowerCase())
        );
        if (existingIdx >= 0) {
          const updated = [...prev];
          const curr = updated[existingIdx];
          updated[existingIdx] = {
            ...curr,
            totalOrders: (curr.totalOrders || 0) + 1,
            totalSpent: (curr.totalSpent || 0) + (newOrder.total || 0),
            lastOrderDate: newOrder.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
          };
          return updated;
        } else {
          const newCust: CustomerItem = {
            id: `cust-${Date.now().toString().slice(-5)}`,
            name: newOrder.customerName,
            phone: newOrder.customerPhone,
            email: newOrder.customerEmail || '',
            city: newOrder.city,
            totalOrders: 1,
            totalSpent: newOrder.total || 0,
            lastOrderDate: newOrder.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
            status: 'New',
          };
          return [newCust, ...prev];
        }
      });
    }

    try {
      await fetch(`${getStorefrontUrl()}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
    } catch (e) {
      console.warn('Sync custom order error:', e);
    }
  };

  // Add review POST API
  const handleAddReview = async (reviewPayload: any) => {
    try {
      const res = await fetch(`${getStorefrontUrl()}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewPayload),
      });
      const result = await res.json();
      if (result.success && result.data?.reviews) {
        setReviews(result.data.reviews);
        if (result.data.stats) setRevStats(result.data.stats);
      } else {
        setReviews((prev) => [{ id: `rev-${Date.now()}`, ...reviewPayload }, ...prev]);
      }
    } catch {
      setReviews((prev) => [{ id: `rev-${Date.now()}`, ...reviewPayload }, ...prev]);
    }
    showNotification('Google review successfully published to Storefront!');
  };

  // Delete review DELETE API
  const handleDeleteReview = async (id: string) => {
    try {
      const res = await fetch(`${getStorefrontUrl()}/api/reviews?id=${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.success && result.data?.reviews) {
        setReviews(result.data.reviews);
      } else {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    }
    showNotification('Review removed successfully.');
  };

  // Products CRUD
  const handleAddProduct = async (newProd: ProductItem) => {
    setProducts((prev) => [newProd, ...prev]);
    try {
      await fetch(`${getStorefrontUrl()}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd),
      });
    } catch (e) {
      console.warn('Storefront product sync:', e);
    }
  };

  const handleUpdateProduct = async (updatedProduct: ProductItem) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    try {
      await fetch(`${getStorefrontUrl()}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
    } catch (e) {
      console.warn('Storefront product sync:', e);
    }
    showNotification(`Product "${updatedProduct.name.slice(0, 24)}..." updated successfully!`);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showNotification('Product removed from catalog.');
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              stock: newStock,
              status: newStock === 0 ? 'Out of stock' : newStock <= 10 ? 'Low stock' : 'Active',
            }
          : p
      )
    );
  };

  // Category handlers
  const handleAddCategory = async (cat: CategoryItem) => {
    setCategories((prev) => [...prev, cat]);
    showNotification(`Category "${cat.name}" created!`);
    try {
      await fetch(`${getStorefrontUrl()}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat),
      });
    } catch (e) {
      console.warn('Failed to sync category create with API:', e);
    }
  };

  const handleUpdateCategory = async (cat: CategoryItem) => {
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
    showNotification(`Category "${cat.name}" updated!`);
    try {
      await fetch(`${getStorefrontUrl()}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat),
      });
    } catch (e) {
      console.warn('Failed to sync category update with API:', e);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showNotification('Category removed.');
    try {
      await fetch(`${getStorefrontUrl()}/api/categories?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('Failed to sync category delete with API:', e);
    }
  };

  // Brand handlers with Storefront API sync
  const handleAddBrand = async (brand: BrandItem) => {
    setBrands((prev) => [brand, ...prev]);
    try {
      await fetch(`${getStorefrontUrl()}/api/brands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brand),
      });
    } catch (e) {
      console.warn('Failed to sync brand with API:', e);
    }
  };

  const handleUpdateBrand = async (brand: BrandItem) => {
    setBrands((prev) => prev.map((b) => (b.id === brand.id ? brand : b)));
    try {
      await fetch(`${getStorefrontUrl()}/api/brands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brand),
      });
    } catch (e) {
      console.warn('Failed to sync brand update with API:', e);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
    showNotification('Brand deleted.');
    try {
      await fetch(`${getStorefrontUrl()}/api/brands?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('Failed to sync brand delete with API:', e);
    }
  };

  // Bulk CSV Import Handlers
  const handleImportProducts = (importedProducts: ProductItem[]) => {
    setProducts((prev) => {
      const map = new Map(prev.map((p) => [p.id, p]));
      importedProducts.forEach((ip) => {
        const existingBySku = prev.find((p) => p.sku && p.sku.toLowerCase() === ip.sku.toLowerCase());
        if (existingBySku) {
          map.set(existingBySku.id, { ...existingBySku, ...ip, id: existingBySku.id });
        } else {
          map.set(ip.id, ip);
        }
      });
      return Array.from(map.values());
    });
    showNotification(`Imported ${importedProducts.length} products to catalog successfully!`);
  };

  const handleImportOrders = (importedOrders: OrderItem[]) => {
    setOrders((prev) => {
      const map = new Map(prev.map((o) => [o.orderId.toLowerCase(), o]));
      importedOrders.forEach((io) => {
        const existing = map.get(io.orderId.toLowerCase());
        if (existing) {
          map.set(io.orderId.toLowerCase(), { ...existing, ...io });
        } else {
          map.set(io.orderId.toLowerCase(), io);
        }
      });
      return Array.from(map.values());
    });
    showNotification(`Imported ${importedOrders.length} orders successfully!`);
  };

  const handleImportCustomers = (importedCustomers: CustomerItem[]) => {
    setCustomers((prev) => {
      const map = new Map(prev.map((c) => [c.id, c]));
      importedCustomers.forEach((ic) => {
        const existingByPhone = prev.find((c) => c.phone && c.phone === ic.phone);
        if (existingByPhone) {
          map.set(existingByPhone.id, { ...existingByPhone, ...ic, id: existingByPhone.id });
        } else {
          map.set(ic.id, ic);
        }
      });
      return Array.from(map.values());
    });
    showNotification(`Imported ${importedCustomers.length} customers successfully!`);
  };

  // Coupon handlers with API persistence
  const handleAddCoupon = async (cp: CouponItem) => {
    setCoupons((prev) => [cp, ...prev]);
    try {
      const res = await fetch(`${getStorefrontUrl()}/api/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cp),
      });
      const data = await res.json();
      if (data?.success && Array.isArray(data.coupons)) {
        setCoupons(data.coupons);
      }
    } catch (e) {
      console.warn('API coupon save error:', e);
    }
    showNotification(`Coupon "${cp.code}" is live on Storefront cart & checkout!`);
  };

  const handleDeleteCoupon = async (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    try {
      const res = await fetch(`${getStorefrontUrl()}/api/coupons?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data?.success && Array.isArray(data.coupons)) {
        setCoupons(data.coupons);
      }
    } catch (e) {
      console.warn('API coupon delete error:', e);
    }
    showNotification('Coupon deleted.');
  };

  // Abandoned recovery
  const handleSendRecovery = (id: string) => {
    setAbandonedCarts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, recoverySent: true } : c))
    );
  };

  // Authentication session handlers
  const handleLogin = (user: { name: string; email: string; role: string }) => {
    const session = { authenticated: true, ...user };
    setUserSession(session);
    localStorage.setItem('dwstore_admin_auth', JSON.stringify(session));
    showNotification(`Welcome, ${user.name}! Terminal unlocked.`);
  };

  const handleLogout = () => {
    const session = { authenticated: false };
    setUserSession(session);
    localStorage.setItem('dwstore_admin_auth', JSON.stringify(session));
    showNotification('Session locked. Enter credentials or PIN to re-enter.');
  };

  // If not authenticated, show modern login view
  if (!userSession.authenticated) {
    return (
      <LoginView
        onLogin={handleLogin}
        theme={theme}
        setTheme={setTheme}
      />
    );
  }

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="d-flex min-vh-100">
      {/* 1. SaaS Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        pendingOrdersCount={pendingOrdersCount}
        reviewsCount={reviews.length}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* 2. Main Area */}
      <div
        className="main flex-grow-1 d-flex flex-column"
        style={{
          marginLeft: collapsed ? 'var(--sb-w-c, 76px)' : 'var(--sb-w, 264px)',
          minHeight: '100vh',
        }}
      >
        {/* Topbar */}
        <Topbar
          theme={theme}
          setTheme={setTheme}
          onMobileToggle={() => setMobileOpen(true)}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onLogout={handleLogout}
        />

        {/* View Content based on activeTab */}
        <div className="flex-grow-1">
          {activeTab === 'dashboard' && (
            <DashboardView
              orders={orders}
              products={products}
              reviews={reviews}
              setActiveTab={(tab) => {
                if (tab === 'add-product') setEditingProductForForm(null);
                setActiveTab(tab);
              }}
              setSelectedOrder={setSelectedOrder}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              orders={orders}
              onUpdateStatus={handleUpdateOrderStatus}
              onUpdateOrder={handleUpdateFullOrder}
              onDispatchOrder={handleDispatchOrder}
              onCreateOrder={handleCreateOrder}
              onImportOrders={handleImportOrders}
              products={products}
              customers={customers}
              selectedOrder={selectedOrder}
              setSelectedOrder={setSelectedOrder}
              showNotification={showNotification}
              onSyncCourier={() => handleSyncCourierStatus(true)}
              syncingCourier={syncingCourier}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              products={products}
              brands={brands}
              onDeleteProduct={handleDeleteProduct}
              onUpdateProduct={handleUpdateProduct}
              onImportProducts={handleImportProducts}
              onStartEditProduct={handleStartEditProduct}
              onOpenAddProduct={handleOpenAddProduct}
              setActiveTab={(tab) => {
                if (tab === 'add-product') setEditingProductForForm(null);
                setActiveTab(tab);
              }}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'add-product' && (
            <AddProductView
              initialProduct={editingProductForForm}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              categories={categories}
              onAddCategory={handleAddCategory}
              brands={brands}
              onAddBrand={handleAddBrand}
              setActiveTab={(tab) => {
                if (tab !== 'add-product') setEditingProductForForm(null);
                setActiveTab(tab);
              }}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesView
              categories={categories}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'brands' && (
            <BrandsView
              brands={brands}
              onAddBrand={handleAddBrand}
              onUpdateBrand={handleUpdateBrand}
              onDeleteBrand={handleDeleteBrand}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'home-customizer' && (
            <HomeCustomizerView
              products={products}
              categories={categories}
              brands={brands}
              showNotification={showNotification}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'media' && (
            <MediaLibraryView showNotification={showNotification} />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              products={products}
              onUpdateStock={handleUpdateStock}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              customers={customers}
              onImportCustomers={handleImportCustomers}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewsView
              reviews={reviews}
              stats={revStats}
              onAddReview={handleAddReview}
              onDeleteReview={handleDeleteReview}
            />
          )}

          {(activeTab === 'discounts' || activeTab === 'coupons') && (
            <DiscountsView
              coupons={coupons}
              onAddCoupon={handleAddCoupon}
              onDeleteCoupon={handleDeleteCoupon}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView orders={orders} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView products={products} orders={orders} />
          )}

          {activeTab === 'shipments' && (
            <ShipmentsView
              shipments={shipments}
              onSyncCourier={() => handleSyncCourierStatus(true)}
              syncingCourier={syncingCourier}
            />
          )}

          {activeTab === 'returns' && (
            <ReturnsView
              orders={orders}
              onUpdateOrder={handleUpdateFullOrder}
              onUpdateStatus={handleUpdateOrderStatus}
              showNotification={showNotification}
              setSelectedOrder={setSelectedOrder}
            />
          )}

          {activeTab === 'abandoned-carts' && (
            <AbandonedCartsView
              carts={abandonedCarts}
              onSendRecovery={handleSendRecovery}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'imports' && (
            <ImportsView showNotification={showNotification} />
          )}

          {activeTab === 'logs' && (
            <div className="content">
              <div className="page-head">
                <div>
                  <h1>System Activity Logs</h1>
                  <p>Audit trail of admin operations, status changes, and catalog updates.</p>
                </div>
              </div>
              <div className="card-x">
                <div className="d-flex flex-column gap-2" style={{ fontSize: '13px' }}>
                  <div className="d-flex justify-content-between p-2 rounded-2" style={{ background: 'var(--hover)' }}>
                    <span>Order #DW-10482 status updated to <b>PROCESSING</b></span>
                    <small className="text-muted">10 minutes ago</small>
                  </div>
                  <div className="d-flex justify-content-between p-2 rounded-2" style={{ background: 'var(--hover)' }}>
                    <span>Google review by <b>Sisira Ranasinghe</b> published to homepage</span>
                    <small className="text-muted">2 hours ago</small>
                  </div>
                  <div className="d-flex justify-content-between p-2 rounded-2" style={{ background: 'var(--hover)' }}>
                    <span>Stock updated (+50 units) on <b>T900 Ultra 2</b></span>
                    <small className="text-muted">Yesterday</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <SettingsView showNotification={showNotification} />
          )}

          {activeTab === 'integrations' && (
            <IntegrationsView showNotification={showNotification} />
          )}
        </div>
      </div>

      {/* Floating Toast Notification */}
      <NotificationToast
        message={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
}
