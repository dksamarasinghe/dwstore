import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  Calendar,
  CreditCard,
  DollarSign,
  Truck,
  Sparkles,
  Hash,
  ShoppingBag,
  RefreshCw,
  FileText,
  Search,
  Check
} from 'lucide-react';
import { OrderItem, ProductItem, CustomerItem } from '../../types';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOrder: (newOrder: OrderItem) => Promise<void> | void;
  products?: ProductItem[];
  customers?: CustomerItem[];
}

interface OrderLineItem {
  id: string;
  productId: string;
  productTitle: string;
  productSku?: string;
  variationId?: string;
  variationText?: string;
  quantity: number;
  price: number;
  image?: string;
}

const SRI_LANKA_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle'
];

const PAYMENT_METHODS = [
  'Cash on Delivery (COD)',
  'Direct Bank Transfer / Deposit',
  'Visa / Mastercard / PayHere',
  'Koko: Buy Now Pay Later',
  'Payzy: Buy Now Pay Later',
];

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onCreateOrder,
  products = [],
  customers = [],
}) => {
  // Generate random order ID
  const generateNewOrderId = () => {
    return `#DWS-${Math.floor(10000 + Math.random() * 90000)}`;
  };

  // Get current local ISO string for datetime-local
  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  };

  const [orderId, setOrderId] = useState(generateNewOrderId);
  const [orderDateTime, setOrderDateTime] = useState(getCurrentDateTimeLocal);
  const [orderStatus, setOrderStatus] = useState<string>('pending');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash on Delivery (COD)');
  const [paymentStatus, setPaymentStatus] = useState<string>('Unpaid');

  // Customer selection mode
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('new');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  // Customer details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('Colombo');
  const [postalCode, setPostalCode] = useState('');

  // Order items
  const [items, setItems] = useState<OrderLineItem[]>([
    {
      id: `item-${Date.now()}`,
      productId: '',
      productTitle: '',
      quantity: 1,
      price: 0,
      image: '/placeholder-product.png',
    },
  ]);

  // Pricing
  const [shippingCost, setShippingCost] = useState<string>('450');
  const [discountAmount, setDiscountAmount] = useState<string>('0');

  // Courier info
  const [carrier, setCarrier] = useState('Koombiyo Delivery');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [dispatchedDate, setDispatchedDate] = useState('');

  // Notes
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setOrderId(generateNewOrderId());
      setOrderDateTime(getCurrentDateTimeLocal());
      setOrderStatus('pending');
      setPaymentMethod('Cash on Delivery (COD)');
      setPaymentStatus('Unpaid');
      setCustomerMode('new');
      setCustomerSearch('');
      setSelectedCustomerId('');
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setShippingAddress('');
      setCity('');
      setDistrict('Colombo');
      setPostalCode('');
      setItems([
        {
          id: `item-${Date.now()}`,
          productId: '',
          productTitle: '',
          quantity: 1,
          price: 0,
          image: '/placeholder-product.png',
        },
      ]);
      setShippingCost('450');
      setDiscountAmount('0');
      setCarrier('Koombiyo Delivery');
      setTrackingNumber('');
      setDispatchedDate('');
      setNotes('');
      setFormError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle selecting an existing customer
  const handleSelectCustomer = (cust: CustomerItem) => {
    setSelectedCustomerId(cust.id);
    setCustomerName(cust.name || '');
    setCustomerPhone(cust.phone || '');
    setCustomerEmail(cust.email || '');
    setCity(cust.city || '');
  };

  // Add line item
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: '',
        productTitle: '',
        quantity: 1,
        price: 0,
        image: '/placeholder-product.png',
      },
    ]);
  };

  // Remove line item
  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Update line item
  const handleUpdateItem = (id: string, updates: Partial<OrderLineItem>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          return updated;
        }
        return item;
      })
    );
  };

  // When a product is selected from dropdown
  const handleProductSelect = (id: string, prodId: string) => {
    const selectedProd = products.find((p) => p.id === prodId);
    if (selectedProd) {
      const price = selectedProd.salePrice || selectedProd.regularPrice || 0;
      handleUpdateItem(id, {
        productId: selectedProd.id,
        productTitle: selectedProd.name,
        productSku: selectedProd.sku,
        price: price,
        image: selectedProd.image || selectedProd.displayImage || '/placeholder-product.png',
      });
    }
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const parsedShipping = Number(shippingCost) || 0;
  const parsedDiscount = Number(discountAmount) || 0;
  const total = Math.max(0, subtotal + parsedShipping - parsedDiscount);

  // Generate Koombiyo tracking number
  const handleGenerateTracking = () => {
    const cleanId = orderId.replace(/[^0-9]/g, '') || Math.floor(10000 + Math.random() * 90000).toString();
    setCarrier('Koombiyo Delivery');
    setTrackingNumber(`175${cleanId.slice(-5).padStart(5, '0')}`);
    if (!dispatchedDate) {
      setDispatchedDate(new Date().toISOString().split('T')[0]);
    }
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!orderId.trim()) {
      setFormError('Please provide an Order ID.');
      return;
    }
    if (!customerName.trim()) {
      setFormError('Customer Full Name is required.');
      return;
    }
    if (!customerPhone.trim()) {
      setFormError('Customer Phone number is required.');
      return;
    }
    if (!shippingAddress.trim()) {
      setFormError('Shipping address is required.');
      return;
    }
    if (!city.trim()) {
      setFormError('City / Town is required.');
      return;
    }

    const validItems = items.filter((it) => it.productTitle.trim().length > 0);
    if (validItems.length === 0) {
      setFormError('Please add at least one product / item to the order.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedDate = orderDateTime
        ? orderDateTime.replace('T', ' ')
        : new Date().toISOString().replace('T', ' ').slice(0, 19);

      const newOrderPayload: OrderItem = {
        orderId: orderId.startsWith('#') ? orderId : `#${orderId}`,
        createdAt: formattedDate,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || 'customer@dwstore.lk',
        customerPhone: customerPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        city: city.trim(),
        district: district || 'Colombo',
        postalCode: postalCode.trim() || undefined,
        carrier: carrier || 'Koombiyo Delivery',
        trackingNumber: trackingNumber.trim() || undefined,
        dispatchedDate: dispatchedDate || undefined,
        status: orderStatus,
        paymentMethod,
        paymentStatus,
        subtotal: subtotal,
        shippingCost: parsedShipping,
        total: total,
        items: validItems.map((it) => ({
          productId: it.productId || `custom-${Date.now()}`,
          productTitle: it.productTitle + (it.variationText ? ` (${it.variationText})` : ''),
          productSku: it.productSku || 'DWS-GEN',
          variationId: it.variationId,
          quantity: Number(it.quantity) || 1,
          price: Number(it.price) || 0,
          image: it.image || '/placeholder-product.png',
        })),
        notes: notes.trim() || undefined,
      };

      await onCreateOrder(newOrderPayload);
      onClose();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Failed to create order. Please check the inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (!customerSearch.trim()) return true;
    const q = customerSearch.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="modal-backdrop-custom d-flex align-items-center justify-content-center position-fixed top-0 start-0 w-100 h-100"
      style={{
        zIndex: 1060,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        padding: '1rem',
      }}
    >
      <div
        className="modal-dialog-custom bg-card rounded-4 shadow-2xl border border-secondary border-opacity-25 d-flex flex-column"
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '92vh',
          backgroundColor: 'var(--card-bg, #ffffff)',
          color: 'var(--text, #1e293b)',
        }}
      >
        {/* Modal Header */}
        <div className="d-flex align-items-center justify-between p-3.5 border-bottom border-secondary border-opacity-25 bg-primary bg-opacity-10 rounded-top-4">
          <div className="d-flex align-items-center gap-2.5">
            <div className="p-2 bg-primary text-white rounded-3 shadow-xs">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h5 className="m-0 fw-bold fs-6 d-flex items-center gap-2">
                Create Custom Order
                <span className="badge bg-primary text-white fs-7 py-1 px-2 rounded-pill font-mono">Manual Entry</span>
              </h5>
              <small className="text-muted" style={{ fontSize: '11px' }}>
                Manually record orders for phone, WhatsApp, emergency backup, or walk-in purchases.
              </small>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-icon text-muted hover:text-dark rounded-circle p-1"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body (Scrollable Form) */}
        <form onSubmit={handleSubmit} className="d-flex flex-column flex-grow-1 overflow-hidden">
          <div className="p-4 overflow-y-auto flex-grow-1 space-y-4" style={{ fontSize: '13px' }}>
            {formError && (
              <div className="alert alert-danger py-2 px-3 d-flex align-items-center gap-2 rounded-3 mb-3 text-xs">
                <X size={16} className="text-danger flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* 1. ORDER METADATA & STATUS */}
            <div className="p-3 bg-light rounded-3 border border-secondary border-opacity-25">
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-primary" style={{ fontSize: '13px' }}>
                <Hash size={15} /> Order Identification &amp; Status
              </h6>
              <div className="row g-2.5">
                <div className="col-12 col-sm-4">
                  <label className="form-label text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                    Order ID *
                  </label>
                  <div className="input-group input-group-sm">
                    <input
                      type="text"
                      className="form-control font-mono fw-bold"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="#DWS-35000"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setOrderId(generateNewOrderId())}
                      title="Generate new ID"
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>

                <div className="col-12 col-sm-4">
                  <label className="form-label text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                    Order Date &amp; Time *
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white">
                      <Calendar size={13} className="text-muted" />
                    </span>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={orderDateTime}
                      onChange={(e) => setOrderDateTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="col-12 col-sm-4">
                  <label className="form-label text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                    Order Status
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                  >
                    {ORDER_STATUSES.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-sm-6 mt-2">
                  <label className="form-label text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                    Payment Method
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-sm-6 mt-2">
                  <label className="form-label text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                    Payment Status
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                  >
                    <option value="Unpaid">Unpaid / Pending COD</option>
                    <option value="Paid">Paid / Verified</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. CUSTOMER & DELIVERY ADDRESS */}
            <div className="p-3 bg-light rounded-3 border border-secondary border-opacity-25">
              <div className="d-flex align-items-center justify-between mb-3">
                <h6 className="fw-bold m-0 d-flex align-items-center gap-2 text-primary" style={{ fontSize: '13px' }}>
                  <User size={15} /> Customer &amp; Shipping Details
                </h6>

                {/* Customer Mode Tabs */}
                {customers.length > 0 && (
                  <div className="btn-group btn-group-sm" role="group">
                    <button
                      type="button"
                      className={`btn ${customerMode === 'new' ? 'btn-primary' : 'btn-outline-secondary'}`}
                      style={{ fontSize: '11px', padding: '2px 8px' }}
                      onClick={() => {
                        setCustomerMode('new');
                        setSelectedCustomerId('');
                      }}
                    >
                      New Customer
                    </button>
                    <button
                      type="button"
                      className={`btn ${customerMode === 'existing' ? 'btn-primary' : 'btn-outline-secondary'}`}
                      style={{ fontSize: '11px', padding: '2px 8px' }}
                      onClick={() => setCustomerMode('existing')}
                    >
                      Existing Customer ({customers.length})
                    </button>
                  </div>
                )}
              </div>

              {/* Existing Customer Quick Search */}
              {customerMode === 'existing' && (
                <div className="mb-3 p-2.5 bg-white rounded-2 border border-secondary border-opacity-25">
                  <label className="form-label text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                    Select Customer from Database
                  </label>
                  <div className="input-group input-group-sm mb-2">
                    <span className="input-group-text bg-light">
                      <Search size={13} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name, phone, or email..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-36 overflow-y-auto border rounded-2 divide-y">
                    {filteredCustomers.slice(0, 8).map((c) => (
                      <div
                        key={c.id}
                        className={`p-2 d-flex align-items-center justify-between cursor-pointer hover-bg-light ${
                          selectedCustomerId === c.id ? 'bg-primary-subtle font-bold' : ''
                        }`}
                        onClick={() => handleSelectCustomer(c)}
                        style={{ fontSize: '12px' }}
                      >
                        <div>
                          <div className="fw-bold text-dark">{c.name}</div>
                          <div className="text-muted text-xs">
                            {c.phone} • {c.email || 'No email'}
                          </div>
                        </div>
                        {selectedCustomerId === c.id && <Check size={14} className="text-primary" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Inputs */}
              <div className="row g-2.5">
                <div className="col-12 col-sm-6">
                  <label className="form-label text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. Kasun Perera"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                    Phone Number (WhatsApp preferred) *
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white">
                      <Phone size={13} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="07XXXXXXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                    Email Address (Optional)
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white">
                      <Mail size={13} className="text-muted" />
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="customer@gmail.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                    City / Town *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. Maharagama"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12 col-sm-8">
                  <label className="form-label text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                    Street Address *
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white">
                      <MapPin size={13} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="No. 123, High Level Road..."
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="col-12 col-sm-4">
                  <label className="form-label text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                    District *
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    required
                  >
                    {SRI_LANKA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. ORDERED PRODUCTS / ITEMS */}
            <div className="p-3 bg-light rounded-3 border border-secondary border-opacity-25">
              <div className="d-flex align-items-center justify-between mb-3">
                <h6 className="fw-bold m-0 d-flex align-items-center gap-2 text-primary" style={{ fontSize: '13px' }}>
                  <Package size={15} /> Ordered Items ({items.length})
                </h6>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                  onClick={handleAddItem}
                  style={{ fontSize: '11px' }}
                >
                  <Plus size={13} /> Add Item
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-3 border border-secondary border-opacity-25 d-flex flex-column gap-2.5 shadow-2xs"
                  >
                    <div className="d-flex align-items-center justify-between gap-2">
                      <span className="badge bg-secondary-subtle text-dark fw-bold" style={{ fontSize: '10px' }}>
                        Item #{index + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm text-danger p-0"
                          onClick={() => handleRemoveItem(item.id)}
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div className="row g-2">
                      {/* Product Selector */}
                      <div className="col-12 col-md-6">
                        <label className="form-label text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                          Select from Catalog (or Type Name) *
                        </label>
                        {products.length > 0 && (
                          <select
                            className="form-select form-select-sm mb-1.5"
                            value={item.productId}
                            onChange={(e) => handleProductSelect(item.id, e.target.value)}
                          >
                            <option value="">-- Choose from Catalog --</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} (LKR {p.salePrice || p.regularPrice})
                              </option>
                            ))}
                          </select>
                        )}
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Item Name / Title"
                          value={item.productTitle}
                          onChange={(e) => handleUpdateItem(item.id, { productTitle: e.target.value })}
                          required
                        />
                      </div>

                      {/* Variation / Option details */}
                      <div className="col-12 col-md-6">
                        <label className="form-label text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                          Variation / Options (Color, Size)
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. Color: Black / Strap: Silicon"
                          value={item.variationText || ''}
                          onChange={(e) => handleUpdateItem(item.id, { variationText: e.target.value })}
                        />
                      </div>

                      {/* Quantity & Price */}
                      <div className="col-6 col-md-4">
                        <label className="form-label text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="form-control form-control-sm"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                          required
                        />
                      </div>

                      <div className="col-6 col-md-4">
                        <label className="form-label text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                          Unit Price (LKR) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="form-control form-control-sm"
                          value={item.price}
                          onChange={(e) => handleUpdateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                          required
                        />
                      </div>

                      <div className="col-12 col-md-4 d-flex flex-column justify-content-end">
                        <div className="p-2 bg-light rounded-2 text-end">
                          <small className="text-muted d-block" style={{ fontSize: '10px' }}>Item Total</small>
                          <b className="text-primary font-mono" style={{ fontSize: '13px' }}>
                            LKR {((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString()}
                          </b>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. TOTALS, SHIPPING & DISCOUNT */}
            <div className="p-3 bg-light rounded-3 border border-secondary border-opacity-25">
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-primary" style={{ fontSize: '13px' }}>
                <DollarSign size={15} /> Price Breakdown &amp; Calculation
              </h6>
              <div className="row g-2.5 align-items-center">
                <div className="col-12 col-sm-4">
                  <label className="form-label text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                    Subtotal (Items)
                  </label>
                  <div className="form-control form-control-sm bg-white font-mono fw-bold">
                    LKR {subtotal.toLocaleString()}
                  </div>
                </div>

                <div className="col-6 col-sm-4">
                  <label className="form-label text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                    Shipping Fee (LKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="form-control form-control-sm font-mono"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    placeholder="450"
                  />
                  <small className="text-muted" style={{ fontSize: '10px' }}>Enter 0 for Free Delivery</small>
                </div>

                <div className="col-6 col-sm-4">
                  <label className="form-label text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                    Discount (LKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="form-control form-control-sm font-mono"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="col-12 mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
                  <span className="fw-bold text-dark fs-6">Grand Total Payable:</span>
                  <span className="fw-black text-primary fs-5 font-mono">
                    LKR {total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* 5. COURIER FULFILLMENT & TRACKING */}
            <div className="p-3 bg-light rounded-3 border border-secondary border-opacity-25">
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-primary" style={{ fontSize: '13px' }}>
                <Truck size={15} /> Courier Dispatch &amp; Tracking (Optional)
              </h6>
              <div className="row g-2.5">
                <div className="col-12 col-sm-4">
                  <label className="form-label text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                    Courier Partner
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    placeholder="Koombiyo Delivery"
                  />
                </div>

                <div className="col-12 col-sm-4">
                  <label className="form-label text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                    Tracking Number
                  </label>
                  <div className="input-group input-group-sm">
                    <input
                      type="text"
                      className="form-control font-mono"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. 17523456"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={handleGenerateTracking}
                      title="Auto-generate tracking number"
                    >
                      <Sparkles size={13} />
                    </button>
                  </div>
                </div>

                <div className="col-12 col-sm-4">
                  <label className="form-label text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                    Dispatched Date
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={dispatchedDate}
                    onChange={(e) => setDispatchedDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 6. INTERNAL ORDER NOTES */}
            <div className="p-3 bg-light rounded-3 border border-secondary border-opacity-25">
              <h6 className="fw-bold mb-2 d-flex align-items-center gap-2 text-primary" style={{ fontSize: '13px' }}>
                <FileText size={15} /> Special Notes &amp; Delivery Instructions
              </h6>
              <textarea
                className="form-control form-control-sm"
                rows={2}
                placeholder="e.g. Customer requested call before delivery. Emergency phone order."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-3 border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-between bg-white rounded-bottom-4">
            <button
              type="button"
              className="btn btn-light btn-sm px-3 fw-bold border"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm px-4 fw-bold shadow-xs d-flex align-items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Order...' : `Create Order • LKR ${total.toLocaleString()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
