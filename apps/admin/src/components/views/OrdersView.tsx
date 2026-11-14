import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  PackageOpen,
  Timer,
  Undo2,
  Search,
  MessageCircle,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Printer,
  Edit3,
  RotateCw,
  RotateCcw,
  Plus,
} from 'lucide-react';
import { OrderItem, ProductItem, CustomerItem } from '../../types';
import { WaybillSlipModal } from '../orders/WaybillSlipModal';
import { EditOrderModal } from '../orders/EditOrderModal';
import { DispatchOrderModal } from '../orders/DispatchOrderModal';
import { ReturnClaimModal } from '../orders/ReturnClaimModal';
import { CSVImportModal } from '../common/CSVImportModal';
import { CreateOrderModal } from '../orders/CreateOrderModal';
import { downloadCSV } from '../../utils/csv';

interface OrdersViewProps {
  orders: OrderItem[];
  onUpdateStatus: (orderId: string, newStatus: string) => Promise<void>;
  onUpdateOrder: (updatedOrder: OrderItem) => Promise<void>;
  onDispatchOrder: (orderId: string, carrier: string, trackingNumber: string, dispatchedDate: string) => Promise<void>;
  onCreateOrder?: (newOrder: OrderItem) => Promise<void> | void;
  onImportOrders?: (importedOrders: OrderItem[]) => void;
  products?: ProductItem[];
  customers?: CustomerItem[];
  selectedOrder: OrderItem | null;
  setSelectedOrder: (order: OrderItem | null) => void;
  showNotification: (msg: string) => void;
  onSyncCourier?: () => Promise<void>;
  syncingCourier?: boolean;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onUpdateStatus,
  onUpdateOrder,
  onDispatchOrder,
  onCreateOrder,
  onImportOrders,
  products = [],
  customers = [],
  selectedOrder,
  setSelectedOrder,
  showNotification,
  onSyncCourier,
  syncingCourier,
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [waybillOrders, setWaybillOrders] = useState<OrderItem[] | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderItem | null>(null);
  const [dispatchingOrder, setDispatchingOrder] = useState<OrderItem | null>(null);
  const [claimingReturnOrder, setClaimingReturnOrder] = useState<OrderItem | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Helper to robustly parse timestamps
  const parseOrderTime = (val?: string): number => {
    if (!val) return 0;
    const t = new Date(val).getTime();
    if (!isNaN(t)) return t;
    const t2 = new Date(val.replace(/-/g, '/')).getTime();
    if (!isNaN(t2)) return t2;
    return 0;
  };

  const parseOrderNumericId = (id?: string): number => {
    if (!id) return 0;
    const num = id.replace(/\D/g, '');
    return num ? parseInt(num, 10) : 0;
  };

  // Real Counts calculated from actual orders
  const totalCount = orders.length;
  const pendingCount = orders.filter((o) => o?.status === 'pending' || o?.status === 'processing').length;
  const shippedCount = orders.filter((o) => o?.status === 'shipped').length;
  const deliveredCount = orders.filter((o) => o?.status === 'delivered' || o?.status === 'completed').length;
  const returnedCount = orders.filter((o) => o?.status === 'returned' || Boolean(o?.returnRecord)).length;
  const cancelledCount = orders.filter((o) => o?.status === 'cancelled' || o?.status === 'failed').length;

  // Filtered & strictly sorted orders (latest to oldest by default)
  const filteredOrders = useMemo(() => {
    const list = orders.filter((order) => {
      const oStatus = (order?.status || '').toLowerCase();
      let matchesTab = true;
      if (activeTab === 'pending') {
        matchesTab = oStatus === 'pending' || oStatus === 'processing' || oStatus === 'on-hold';
      } else if (activeTab === 'delivered') {
        matchesTab = oStatus === 'delivered' || oStatus === 'completed';
      } else if (activeTab === 'returned') {
        matchesTab = oStatus === 'returned' || Boolean(order?.returnRecord);
      } else if (activeTab === 'cancelled') {
        matchesTab = oStatus === 'cancelled' || oStatus === 'failed' || oStatus === 'refunded';
      } else if (activeTab !== 'all') {
        matchesTab = oStatus === activeTab.toLowerCase();
      }

      const searchLower = searchTerm.toLowerCase();
      const oId = (order?.orderId || '').toLowerCase();
      const cName = (order?.customerName || '').toLowerCase();
      const cPhone = order?.customerPhone || '';
      const cCity = (order?.city || '').toLowerCase();

      const matchesSearch =
        oId.includes(searchLower) ||
        cName.includes(searchLower) ||
        cPhone.includes(searchLower) ||
        cCity.includes(searchLower);

      const matchesPayment = !paymentFilter || order?.paymentStatus === paymentFilter;
      return matchesTab && matchesSearch && matchesPayment;
    });

    return [...list].sort((a, b) => {
      const timeA = parseOrderTime(a?.createdAt);
      const timeB = parseOrderTime(b?.createdAt);
      if (timeA !== timeB && timeA > 0 && timeB > 0) {
        return sortOrder === 'latest' ? timeB - timeA : timeA - timeB;
      }
      const idA = parseOrderNumericId(a?.orderId);
      const idB = parseOrderNumericId(b?.orderId);
      if (idA !== idB && idA > 0 && idB > 0) {
        return sortOrder === 'latest' ? idB - idA : idA - idB;
      }
      return 0;
    });
  }, [orders, activeTab, searchTerm, paymentFilter, sortOrder]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage]);

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedOrders.map((o) => o.orderId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Address', 'City', 'Status', 'Payment Method', 'Payment Status', 'Total LKR'];
    const rows = filteredOrders.map((o) => [
      o.orderId,
      o.createdAt,
      o.customerName || '',
      o.customerPhone,
      o.shippingAddress || '',
      o.city,
      o.status,
      o.paymentMethod || '',
      o.paymentStatus,
      o.total,
    ]);
    downloadCSV(`dwstore-orders-export-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    showNotification(`Exported ${filteredOrders.length} orders to CSV successfully!`);
  };

  const handleImportCSVData = (rows: string[][], headers: string[]) => {
    const lowerHeaders = headers.map((h) => h.trim().toLowerCase());
    const idIdx = lowerHeaders.findIndex((h) => h.includes('order') || h === 'id');
    const dateIdx = lowerHeaders.findIndex((h) => h.includes('date') || h.includes('created'));
    const nameIdx = lowerHeaders.findIndex((h) => h.includes('customer') || h.includes('name'));
    const phoneIdx = lowerHeaders.findIndex((h) => h.includes('phone'));
    const addrIdx = lowerHeaders.findIndex((h) => h.includes('address'));
    const cityIdx = lowerHeaders.findIndex((h) => h.includes('city'));
    const statusIdx = lowerHeaders.findIndex((h) => h.includes('status') && !h.includes('payment'));
    const methodIdx = lowerHeaders.findIndex((h) => h.includes('method') || h.includes('payment method'));
    const payStatusIdx = lowerHeaders.findIndex((h) => h.includes('payment status'));
    const totalIdx = lowerHeaders.findIndex((h) => h.includes('total') || h.includes('amount') || h.includes('price'));

    const imported: OrderItem[] = [];
    rows.forEach((row, idx) => {
      const orderId = idIdx >= 0 && row[idIdx]?.trim() ? row[idIdx].trim() : `DWS-${Date.now().toString().slice(-5)}${idx}`;
      const customerName = nameIdx >= 0 && row[nameIdx] ? row[nameIdx].trim() : 'Customer';
      const customerPhone = phoneIdx >= 0 && row[phoneIdx] ? row[phoneIdx].trim() : '';
      const shippingAddress = addrIdx >= 0 && row[addrIdx] ? row[addrIdx].trim() : '';
      const city = cityIdx >= 0 && row[cityIdx] ? row[cityIdx].trim() : 'Colombo';
      const rawStatus = (statusIdx >= 0 && row[statusIdx]?.trim().toLowerCase()) || 'pending';
      const status = rawStatus as any;
      const paymentMethod = methodIdx >= 0 && row[methodIdx] ? row[methodIdx].trim() : 'Cash on Delivery';
      const paymentStatus = (payStatusIdx >= 0 && (row[payStatusIdx]?.trim().toLowerCase() as any)) ||
        (paymentMethod.includes('Direct') || paymentMethod.includes('COD') ? 'unpaid' : 'paid');
      const total = totalIdx >= 0 ? parseFloat(row[totalIdx]?.replace(/[^0-9.]/g, '') || '0') || 0 : 0;
      const createdAt = (dateIdx >= 0 && row[dateIdx]?.trim()) || new Date().toISOString().slice(0, 10);

      const existing = orders.find((o) => o.orderId.toLowerCase() === orderId.toLowerCase());
      imported.push({
        orderId,
        customerName,
        customerPhone,
        customerEmail: existing?.customerEmail || `${customerPhone || 'cust'}@dwstore.lk`,
        shippingAddress,
        city,
        postalCode: existing?.postalCode || '10100',
        items: existing?.items && existing.items.length > 0 ? existing.items : [
          {
            productId: `prod-imp-${idx}`,
            productTitle: 'DWstore Imported Item',
            productSku: 'IMP-001',
            quantity: 1,
            price: total,
          },
        ],
        subtotal: existing?.subtotal || total,
        shippingCost: existing?.shippingCost || 0,
        total,
        status,
        paymentStatus,
        paymentMethod,
        createdAt,
        carrier: existing?.carrier || 'Koombiyo Delivery',
        trackingNumber: existing?.trackingNumber || '',
        dispatchedDate: existing?.dispatchedDate || '',
        returnRecord: existing?.returnRecord,
      });
    });

    if (imported.length === 0) {
      throw new Error('No valid orders found in CSV.');
    }

    if (onImportOrders) {
      onImportOrders(imported);
    }
  };

  const openOrderDetail = (order: OrderItem) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  return (
    <div className="content">
      {/* Header */}
      <div className="page-head">
        <div>
          <h1>Real WooCommerce Orders ({totalCount.toLocaleString()} total)</h1>
          <p>Full order database with customer names, delivery addresses, phones & direct WhatsApp fulfillment.</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-primary d-flex align-items-center gap-1.5 shadow-sm"
            onClick={() => setIsCreateModalOpen(true)}
            type="button"
            style={{ fontSize: '13px', borderRadius: '10px', height: '36px', fontWeight: 600 }}
          >
            <Plus size={16} /> Create Order
          </button>
          {onSyncCourier && (
            <button
              className="btn btn-outline-primary d-flex align-items-center gap-1.5"
              onClick={onSyncCourier}
              type="button"
              disabled={syncingCourier}
              title="Auto-sync orders with live Koombiyo Delivery tracking status"
              style={{ fontSize: '13px', borderRadius: '10px', height: '36px' }}
            >
              <RotateCw size={14} className={syncingCourier ? 'animate-spin' : ''} />
              <span>{syncingCourier ? 'Syncing...' : 'Sync Koombiyo Status'}</span>
            </button>
          )}
          <button className="btn-soft d-flex align-items-center gap-1.5" onClick={handleExportCSV} type="button">
            <Download size={16} /> Export CSV ({filteredOrders.length})
          </button>
          <button
            className="btn-soft d-flex align-items-center gap-1.5"
            onClick={() => setIsImportModalOpen(true)}
            type="button"
          >
            <Upload size={16} /> Import CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <section className="row g-3 mb-4">
        <div className="col-6 col-xl-3">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#eef2fd', color: '#4f46e5' }}>
              <ShoppingBag size={20} />
            </span>
            <div>
              <small>Total Orders</small>
              <b>{totalCount.toLocaleString()}</b>
              <span className="ms-note up">100% Real Database</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#fef3c7', color: '#d97706' }}>
              <PackageOpen size={20} />
            </span>
            <div>
              <small>Pending / Processing</small>
              <b>{pendingCount.toLocaleString()}</b>
              <span className="ms-note">Awaiting delivery</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#ecf6ef', color: '#059669' }}>
              <Timer size={20} />
            </span>
            <div>
              <small>Completed / Delivered</small>
              <b>{deliveredCount.toLocaleString()}</b>
              <span className="ms-note up">Islandwide fulfilled</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#f6eff6', color: '#9333ea' }}>
              <Undo2 size={20} />
            </span>
            <div>
              <small>Cancelled / Refunded</small>
              <b>{cancelledCount.toLocaleString()}</b>
              <span className="ms-note down">Cancelled orders</span>
            </div>
          </div>
        </div>
      </section>

      {/* Orders Filter Card */}
      <div className="card-x">
        {/* Status Tabs with counts */}
        <div className="tabs">
          <button
            className={activeTab === 'all' ? 'on' : ''}
            onClick={() => {
              setActiveTab('all');
              setCurrentPage(1);
            }}
            type="button"
          >
            All <em>{totalCount}</em>
          </button>
          <button
            className={activeTab === 'pending' ? 'on' : ''}
            onClick={() => {
              setActiveTab('pending');
              setCurrentPage(1);
            }}
            type="button"
          >
            Pending / Processing <em>{pendingCount}</em>
          </button>
          <button
            className={activeTab === 'delivered' ? 'on' : ''}
            onClick={() => {
              setActiveTab('delivered');
              setCurrentPage(1);
            }}
            type="button"
          >
            Delivered <em>{deliveredCount}</em>
          </button>
          <button
            className={activeTab === 'returned' ? 'on' : ''}
            onClick={() => {
              setActiveTab('returned');
              setCurrentPage(1);
            }}
            type="button"
          >
            Returned <em>{returnedCount}</em>
          </button>
          <button
            className={activeTab === 'cancelled' ? 'on' : ''}
            onClick={() => {
              setActiveTab('cancelled');
              setCurrentPage(1);
            }}
            type="button"
          >
            Cancelled <em>{cancelledCount}</em>
          </button>
        </div>

        {/* Filter controls */}
        <div className="ord-filters">
          <div className="search flex-grow-1">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by order ID, customer name, city, phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <select
            className="sel-x"
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid / COD</option>
          </select>
          <select
            className="sel-x"
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as 'latest' | 'oldest');
              setCurrentPage(1);
            }}
            title="Sort orders by date"
          >
            <option value="latest">↓ Latest to Oldest (Newest First)</option>
            <option value="oldest">↑ Oldest to Latest</option>
          </select>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="bulk-bar" style={{ display: 'flex' }}>
            <b>{selectedIds.length} orders selected</b>
            <button
              className="btn-soft"
              type="button"
              style={{ background: '#0284c7', color: '#fff', borderColor: '#0284c7' }}
              onClick={() => {
                const selected = orders.filter((o) => selectedIds.includes(o.orderId));
                setWaybillOrders(selected);
              }}
            >
              <Printer size={15} /> Print {selectedIds.length} Invoice / Bill Slips
            </button>
            <button
              className="btn-soft"
              type="button"
              onClick={() => {
                selectedIds.forEach((id) => onUpdateStatus(id, 'shipped'));
                setSelectedIds([]);
              }}
            >
              <Truck size={15} /> Mark Shipped
            </button>
            <button
              className="btn-soft text-danger"
              type="button"
              onClick={() => {
                selectedIds.forEach((id) => onUpdateStatus(id, 'cancelled'));
                setSelectedIds([]);
              }}
            >
              <XCircle size={15} /> Cancel Selected
            </button>
            <button
              className="btn-soft"
              type="button"
              onClick={() => setSelectedIds([])}
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Table */}
        <div className="table-responsive">
          <table className="table-x">
            <thead>
              <tr>
                <th style={{ width: '36px' }}>
                  <input
                    type="checkbox"
                    checked={
                      paginatedOrders.length > 0 &&
                      selectedIds.length === paginatedOrders.length
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => setSortOrder((prev) => (prev === 'latest' ? 'oldest' : 'latest'))}
                  title="Click to toggle sorting (Latest vs Oldest)"
                >
                  <span className="d-inline-flex align-items-center gap-1">
                    Order <span style={{ color: '#2563eb', fontWeight: 800 }}>{sortOrder === 'latest' ? '↓ (Latest)' : '↑ (Oldest)'}</span>
                  </span>
                </th>
                <th>Customer</th>
                <th>Purchased Items</th>
                <th>Total (LKR)</th>
                <th>Payment</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const status = (order?.status || 'pending').toLowerCase();
                  const statusClass =
                    status === 'delivered' || status === 'completed'
                      ? 's-Delivered'
                      : status === 'shipped'
                      ? 's-Shipped'
                      : status === 'processing' || status === 'pending'
                      ? 's-Processing'
                      : status === 'returned'
                      ? 's-Returned'
                      : 's-Cancelled';

                  const customerName = order?.customerName || 'Customer';
                  const customerPhone = order?.customerPhone || '';
                  const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
                  const totalVal = order?.total || 0;
                  const waMessage = `Hello ${customerName}, this is DWstore.lk regarding your Order #${order?.orderId} (Rs. ${totalVal.toLocaleString()}). Delivery status: ${status.toUpperCase()}.`;

                  return (
                    <tr key={order?.orderId || Math.random()}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(order?.orderId)}
                          onChange={() => handleToggleSelect(order?.orderId)}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="oid border-0 bg-transparent p-0 text-start"
                          onClick={() => openOrderDetail(order)}
                        >
                          <b>#{order?.orderId}</b>
                        </button>
                        <small className="d-block text-muted">{order?.createdAt}</small>
                        {order?.trackingNumber && (
                          <div className="d-flex align-items-center gap-1 mt-1">
                            <Truck size={11} className="text-primary flex-shrink-0" />
                            <small
                              className="font-monospace text-primary text-truncate"
                              style={{ fontSize: '10px', maxWidth: '140px' }}
                              title={`${order.carrier || 'Courier'}: ${order.trackingNumber}`}
                            >
                              {order.trackingNumber}
                            </small>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="cust">
                          <span className="mini-av" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                            {customerName.substring(0, 2).toUpperCase()}
                          </span>
                          <div style={{ maxWidth: '220px' }}>
                            <b className="text-truncate d-block">{customerName}</b>
                            <small className="d-block text-muted text-truncate">
                              {order?.city || 'Sri Lanka'} • {customerPhone}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ maxWidth: '240px' }}>
                          <small className="d-block text-truncate" title={order?.items?.[0]?.productTitle}>
                            {order?.items?.[0]?.productTitle || 'DW Product'}
                          </small>
                          <small className="text-muted">
                            {order?.items?.length || 1} item(s) • Qty: {order?.items?.[0]?.quantity || 1}
                          </small>
                        </div>
                      </td>
                      <td>
                        <b>Rs. {totalVal.toLocaleString()}</b>
                      </td>
                      <td>
                        <span className={`badge-x ${order?.paymentStatus === 'Paid' ? 's-Paid' : 's-Unpaid'}`}>
                          {order?.paymentStatus || 'Unpaid'}
                        </span>
                        <small className="d-block text-muted text-truncate" style={{ fontSize: '11px', maxWidth: '140px' }}>
                          {order?.paymentMethod || 'COD'}
                        </small>
                      </td>
                      <td>
                        {/* Live Quick Status Selector */}
                        <select
                          className={`badge-x ${statusClass} border-0 py-1 pe-3`}
                          style={{ cursor: 'pointer', outline: 'none' }}
                          value={status}
                          onChange={(e) => {
                            const newSt = e.target.value;
                            if (newSt === 'returned') {
                              setClaimingReturnOrder(order);
                            } else if (newSt === 'shipped' && !order?.trackingNumber) {
                              setDispatchingOrder(order);
                            } else {
                              onUpdateStatus(order?.orderId, newSt);
                            }
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="returned">Returned</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="text-end">
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          <button
                            type="button"
                            className="icon-btn"
                            style={{ width: '34px', height: '34px' }}
                            onClick={() => setEditingOrder(order)}
                            title="Edit Order Details"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn"
                            style={{ width: '34px', height: '34px' }}
                            onClick={() => setWaybillOrders([order])}
                            title="Print Order Invoice / Bill Slip"
                          >
                            <Printer size={16} className="text-primary" />
                          </button>
                          <button
                            type="button"
                            className="icon-btn"
                            style={{
                              width: '34px',
                              height: '34px',
                              color: order?.status === 'returned' || order?.returnRecord ? '#f43f5e' : undefined,
                            }}
                            onClick={() => setClaimingReturnOrder(order)}
                            title="Record / View Return & Warranty Loss"
                          >
                            <RotateCcw size={15} />
                          </button>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="icon-btn"
                              style={{ width: '34px', height: '34px', color: '#25D366' }}
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle size={16} />
                            </a>
                          )}
                          <button
                            type="button"
                            className="icon-btn"
                            style={{ width: '34px', height: '34px' }}
                            onClick={() => openOrderDetail(order)}
                            title="Inspect Order"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="d-flex align-items-center justify-content-between pt-3 mt-3 border-top" style={{ borderColor: 'var(--border)' }}>
          <small className="text-muted">
            Showing <b>{(currentPage - 1) * pageSize + 1}</b> -{' '}
            <b>{Math.min(currentPage * pageSize, filteredOrders.length)}</b> of <b>{filteredOrders.length}</b> orders
          </small>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn-soft"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              style={{ height: '34px', padding: '0 10px' }}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="btn-soft"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              style={{ height: '34px', padding: '0 10px' }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {detailModalOpen && selectedOrder && (
        <div className="react-modal-backdrop" onClick={() => setDetailModalOpen(false)}>
          <div
            className="card-x"
            style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h4 className="m-0">Order #{selectedOrder.orderId}</h4>
                <small className="text-muted">Placed on {selectedOrder.createdAt}</small>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                  style={{ height: '32px', fontSize: '12px' }}
                  onClick={() => {
                    setDetailModalOpen(false);
                    setEditingOrder(selectedOrder);
                  }}
                >
                  <Edit3 size={13} /> Edit Order
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  style={{ width: '32px', height: '32px' }}
                  onClick={() => setDetailModalOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Courier Dispatch Info (if assigned) */}
            {selectedOrder.trackingNumber && (
              <div className="mt-3 p-3 rounded-3" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-success fw-bold d-block" style={{ fontSize: '11px' }}>
                      COURIER &amp; LOGISTICS DISPATCH
                    </small>
                    <b>{selectedOrder.carrier || 'Koombiyo Delivery'}</b>
                    <div className="font-monospace text-primary fw-bold" style={{ fontSize: '13px' }}>
                      {selectedOrder.trackingNumber}
                    </div>
                  </div>
                  {selectedOrder.dispatchedDate && (
                    <span className="badge-x s-Processing" style={{ fontSize: '11px' }}>
                      Dispatched {selectedOrder.dispatchedDate}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Status & Quick Change */}
            <div className="d-flex align-items-center justify-content-between my-3 p-3 rounded-3" style={{ background: 'var(--hover)' }}>
              <div>
                <small className="text-muted d-block">Current Order Status</small>
                <b className="fs-6 text-uppercase">{selectedOrder.status}</b>
              </div>
              <div className="d-flex gap-2">
                {['processing', 'shipped', 'delivered'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`btn-soft text-capitalize ${selectedOrder.status === st ? 'btn-dark-x' : ''}`}
                    style={{ height: '34px', fontSize: '12px' }}
                    onClick={() => {
                      onUpdateStatus(selectedOrder.orderId, st);
                      setSelectedOrder({ ...selectedOrder, status: st as any });
                    }}
                  >
                    Mark {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Details */}
            <div className="row g-3 mb-3">
              <div className="col-12 col-sm-6">
                <div className="p-3 rounded-3" style={{ border: '1px solid var(--border)' }}>
                  <small className="text-muted d-block mb-1">Customer Information</small>
                  <b>{selectedOrder.customerName}</b>
                  <div className="d-flex align-items-center gap-2 mt-2 text-muted" style={{ fontSize: '13px' }}>
                    <Phone size={14} /> {selectedOrder.customerPhone || 'Not provided'}
                  </div>
                  {selectedOrder.customerEmail && (
                    <div className="d-flex align-items-center gap-2 mt-1 text-muted" style={{ fontSize: '13px' }}>
                      <Mail size={14} /> {selectedOrder.customerEmail}
                    </div>
                  )}
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div className="p-3 rounded-3" style={{ border: '1px solid var(--border)' }}>
                  <small className="text-muted d-block mb-1">Delivery Address</small>
                  <div className="d-flex align-items-start gap-2 text-muted" style={{ fontSize: '13px' }}>
                    <MapPin size={15} className="mt-1 flex-shrink-0" />
                    <div>
                      {selectedOrder.shippingAddress || 'Islandwide Delivery'}
                      <b className="d-block text-body mt-1">{selectedOrder.city}</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ordered Items List */}
            <div className="mb-3">
              <h6 className="mb-2">Purchased Items</h6>
              <div className="d-flex flex-column gap-2">
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="d-flex align-items-center justify-content-between p-2 rounded-2"
                    style={{ background: 'var(--hover)' }}
                  >
                    <div>
                      <b>{item.productTitle}</b>
                      <small className="d-block text-muted">
                        Qty: {item.quantity} × Rs. {item.price.toLocaleString()}
                      </small>
                    </div>
                    <b>Rs. {(item.quantity * item.price).toLocaleString()}</b>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-3 rounded-3 mb-3" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div className="d-flex justify-content-between mb-1" style={{ fontSize: '13px' }}>
                <span className="text-muted">Subtotal:</span>
                <span>Rs. {(selectedOrder.subtotal || selectedOrder.total).toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-1" style={{ fontSize: '13px' }}>
                <span className="text-muted">Islandwide Shipping:</span>
                <span>Rs. {(selectedOrder.shippingCost || 350).toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between pt-2 border-top mt-2" style={{ borderColor: 'var(--border)' }}>
                <b>Total Amount:</b>
                <b className="fs-5 text-primary">Rs. {selectedOrder.total.toLocaleString()}</b>
              </div>
              <div className="mt-2 text-muted" style={{ fontSize: '12px' }}>
                Payment Method: <b>{selectedOrder.paymentMethod}</b> ({selectedOrder.paymentStatus})
              </div>
              {selectedOrder.notes && (
                <div className="mt-2 p-2 rounded-2" style={{ background: 'var(--hover)', fontSize: '12px' }}>
                  <b>Customer Note:</b> {selectedOrder.notes}
                </div>
              )}
            </div>

            {/* Action Buttons: Print Waybill Slip & WhatsApp */}
            <div className="d-flex flex-column gap-2 mb-2">
              <button
                type="button"
                className="btn-dark-x w-100 justify-content-center d-flex align-items-center gap-2"
                style={{ height: '42px', background: '#0284c7', borderColor: '#0284c7' }}
                onClick={() => setWaybillOrders([selectedOrder])}
              >
                <Printer size={16} /> Print Order Invoice / Bill Slip
              </button>

              {selectedOrder.customerPhone && (
                <a
                  href={`https://wa.me/${selectedOrder.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello ${selectedOrder.customerName}, this is DWstore.lk regarding your order #${selectedOrder.orderId}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-soft w-100 justify-content-center text-success"
                  style={{ height: '40px' }}
                >
                  <MessageCircle size={16} /> Open Direct WhatsApp Chat
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Printable Courier Waybill Modal */}
      {waybillOrders && (
        <WaybillSlipModal
          orders={waybillOrders}
          onClose={() => setWaybillOrders(null)}
        />
      )}

      {/* Full Edit Order Modal */}
      {editingOrder && (
        <EditOrderModal
          isOpen={!!editingOrder}
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={async (updated) => {
            await onUpdateOrder(updated);
            setEditingOrder(null);
            showNotification(`Order #${updated.orderId} successfully saved!`);
          }}
        />
      )}

      {/* Dispatch Order / Assign Courier Modal */}
      {dispatchingOrder && (
        <DispatchOrderModal
          isOpen={!!dispatchingOrder}
          order={dispatchingOrder}
          onClose={() => setDispatchingOrder(null)}
          onDispatch={async (ordId, carrier, trk, dt) => {
            await onDispatchOrder(ordId, carrier, trk, dt);
            setDispatchingOrder(null);
            showNotification(`Order #${ordId} dispatched via ${carrier} (${trk})!`);
          }}
        />
      )}

      {/* Return & Warranty Claim Modal */}
      {claimingReturnOrder && (
        <ReturnClaimModal
          order={claimingReturnOrder}
          onClose={() => setClaimingReturnOrder(null)}
          onSave={async (orderId, returnRecord) => {
            const ord = orders.find((o) => o.orderId === orderId);
            if (ord) {
              await onUpdateOrder({ ...ord, status: 'returned', returnRecord });
            } else {
              await onUpdateStatus(orderId, 'returned');
            }
            showNotification(`Order #${orderId} marked as RETURNED & financial loss recorded!`);
            setClaimingReturnOrder(null);
          }}
        />
      )}

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Orders CSV"
        description="Upload a CSV file to bulk import new orders or update existing order records."
        expectedColumns={['Order ID', 'Date', 'Customer Name', 'Phone', 'Address', 'City', 'Status', 'Payment Method', 'Payment Status', 'Total LKR']}
        sampleFilename="dwstore-sample-orders.csv"
        sampleHeaders={['Order ID', 'Date', 'Customer Name', 'Phone', 'Address', 'City', 'Status', 'Payment Method', 'Payment Status', 'Total LKR']}
        sampleRows={[
          ['DWS-35257', '2026-11-08', 'Abdul Muheed', '0721359138', '320, Ue Perera Mawatha, Obeysekarapura', 'Rajagiriya', 'pending', 'Direct Bank Transfer / Deposit', 'unpaid', 4850],
          ['DWS-35258', '2026-11-08', 'Kamal Perera', '0771234567', 'No. 45 Galle Road', 'Colombo', 'delivered', 'Cash on Delivery (COD)', 'paid', 2950],
        ]}
        onImport={handleImportCSVData}
      />

      {/* Manual / Custom Order Creation Modal */}
      {isCreateModalOpen && (
        <CreateOrderModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateOrder={onCreateOrder || (async () => {})}
          products={products}
          customers={customers}
        />
      )}
    </div>
  );
};
