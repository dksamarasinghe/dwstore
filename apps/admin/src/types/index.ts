export type TabType =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'add-product'
  | 'categories'
  | 'brands'
  | 'home-customizer'
  | 'media'
  | 'inventory'
  | 'customers'
  | 'reviews'
  | 'discounts'
  | 'payments'
  | 'analytics'
  | 'shipments'
  | 'returns'
  | 'abandoned-carts'
  | 'coupons'
  | 'logs'
  | 'settings'
  | 'integrations'
  | 'notifications'
  | 'help'
  | 'imports';

export interface AttributeItem {
  name: string;
  values: string;
}

export interface ProductVariationItem {
  id: string;
  attributes: Record<string, string>;
  sku?: string;
  regularPrice?: number;
  salePrice: number;
  costPrice?: number;
  stock: number;
  status?: string;
  stockStatus?: 'In Stock' | 'Out of Stock' | string;
  inStock?: boolean;
  image?: string;
  displayImage?: string;
}

export interface ShippingDetails {
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  shippingClass?: string;
  shippingFee?: number;
}

export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  productType?: 'simple' | 'variable' | 'grouped';
  type?: 'simple' | 'variable' | 'grouped';
  groupedProductIds?: string[];
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
  comboDeal?: {
    enabled: boolean;
    productIds: string[];
    discountAmount?: number;
    discountPrice?: number;
    companionProducts?: Array<{
      id: string;
      name: string;
      image?: string;
      price?: number;
      regularPrice?: number;
      salePrice?: number;
      sku?: string;
      slug?: string;
    }>;
  };
  regularPrice: number;
  salePrice: number;
  regularPriceMinor?: number;
  salePriceMinor?: number;
  costPrice?: number;
  stock: number;
  stockAlertLevel?: number;
  status: 'Active' | 'Low stock' | 'Out of stock' | 'Draft';
  salesCount: number;
  image?: string;
  displayImage?: string;
  galleryImages?: string[];
  imageUrls?: string[];
  rating: number;
  shortDesc?: string;
  description?: string;
  warrantyPeriod?: string;
  allowedPaymentMethods?: string[];
  seoTitle?: string;
  seoDescription?: string;
  shipping?: ShippingDetails;
  attributes?: AttributeItem[];
  variations?: ProductVariationItem[];
  createdAt?: string;
  createdAtTimestamp?: number;
  updatedAt?: string;
  updatedAtTimestamp?: number;
}

export type ReturnReason =
  | 'defective'
  | 'warranty_fault'
  | 'wrong_item'
  | 'courier_failed'
  | 'customer_change'
  | 'other';

export type WarrantyAction =
  | 'replacement'
  | 'refund'
  | 'repair'
  | 'shipping_only'
  | 'rejected';

export interface ReturnRecord {
  id: string;
  orderId: string;
  createdAt: string;
  reason: ReturnReason;
  reasonDescription?: string;
  warrantyAction: WarrantyAction;
  replacementItemTitle?: string;
  shippingLoss: number;
  productLoss: number;
  totalLoss: number;
  notes?: string;
  resolutionStatus: 'investigating' | 'resolved' | 'replacement_dispatched' | 'refunded';
}

export interface OrderItem {
  orderId: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  district?: string;
  postalCode?: string;
  carrier?: 'Koombiyo Delivery' | string;
  trackingNumber?: string;
  dispatchedDate?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | string;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Unpaid' | 'Refunded' | string;
  total: number;
  subtotal: number;
  shippingCost: number;
  items: {
    productId: string;
    productTitle: string;
    productSku?: string;
    variationId?: string;
    variationText?: string;
    variation?: any;
    attributes?: Record<string, string>;
    quantity: number;
    price: number;
    image?: string;
    isGrouped?: boolean;
    groupedProducts?: any[];
    componentsSnapshot?: Array<{
      originalProductId: string;
      name: string;
      type?: string;
      sku?: string;
      componentQty?: number;
      totalQty?: number;
      selectedVariationId?: string;
      selectedVariationSku?: string;
      selectedVariationAttributes?: Record<string, string>;
    }>;
  }[];
  notes?: string;
  returnRecord?: ReturnRecord;
}

export interface ReviewItem {
  id: string;
  name: string;
  time: string;
  rating: number;
  text: string;
  verified: boolean;
  location: string;
  response?: string;
}

export interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: 'Active' | 'VIP' | 'New' | 'Inactive';
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parentSlug?: string | null;
  description?: string;
  productCount: number;
  icon?: string;
  image?: string;
  imageUrl?: string;
  status: 'Active' | 'Hidden';
  featured?: boolean;
}

export interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  productCount?: number;
  featured?: boolean;
  status?: 'Active' | 'Hidden';
  description?: string;
}

export interface CouponItem {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend: number;
  usedCount: number;
  maxUsage: number;
  expiryDate: string;
  status: 'Active' | 'Expired' | 'Paused';
}

export interface ShipmentItem {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone?: string;
  carrier: 'Koombiyo Delivery' | string;
  trackingNumber: string;
  dispatchedDate: string;
  status: 'Dispatched' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Returned';
  destinationCity: string;
}

export interface AbandonedCartItem {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  itemCount: number;
  itemsSummary: string;
  totalValue: number;
  date: string;
  recoverySent: boolean;
}
