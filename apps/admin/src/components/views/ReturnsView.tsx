import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Search,
  Filter,
  Plus,
  Truck,
  Package,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageCircle,
  Edit3,
  DollarSign,
  TrendingDown,
  ArrowUpRight,
  X,
} from 'lucide-react';
import { OrderItem, ReturnRecord } from '../../types';
import { ReturnClaimModal } from '../orders/ReturnClaimModal';

interface ReturnsViewProps {
  orders: OrderItem[];
  onUpdateOrder: (order: OrderItem) => void;
  onUpdateStatus: (orderId: string, status: string) => void;
  showNotification: (msg: string) => void;
  setSelectedOrder?: (order: OrderItem) => void;
}

export const ReturnsView: React.FC<ReturnsViewProps> = ({
  orders,
  onUpdateOrder,
  onUpdateStatus,
  showNotification,
  setSelectedOrder,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'replacement' | 'shipping_only' | 'refund' | 'investigating'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingReturnOrder, setEditingReturnOrder] = useState<OrderItem | null>(null);
  const [isNewReturnModalOpen, setIsNewReturnModalOpen] = useState(false);
  const [selectedNewOrderId, setSelectedNewOrderId] = useState('');

  // Extract all orders that have return records or status 'returned'
  const returnOrders = useMemo(() => {
    return orders.filter((o) => o?.status === 'returned' || Boolean(o?.returnRecord));
  }, [orders]);

  // Overall Financial Loss Calculations
  const totalReturnCount = returnOrders.length;
  const totalLoss = returnOrders.reduce((sum, o) => {
    if (o.returnRecord?.totalLoss !== undefined) return sum + o.returnRecord.totalLoss;
    return sum + (o.shippingCost || 400);
  }, 0);

  const totalShippingLoss = returnOrders.reduce((sum, o) => {
    return sum + (o.returnRecord?.shippingLoss ?? (o.shippingCost || 400));
  }, 0);

  const totalProductLoss = returnOrders.reduce((sum, o) => {
    return sum + (o.returnRecord?.productLoss || 0);
  }, 0);

  const warrantyReplacementsCount = returnOrders.filter(
    (o) => o.returnRecord?.warrantyAction === 'replacement'
  ).length;

  // Filtered returns list based on tab and search
  const filteredReturns = useMemo(() => {
    return returnOrders.filter((order) => {
      const rec = order.returnRecord;

      // Tab filter
      if (filterTab === 'replacement' && rec?.warrantyAction !== 'replacement') return false;
      if (filterTab === 'shipping_only' && rec?.warrantyAction !== 'shipping_only') return false;
      if (filterTab === 'refund' && rec?.warrantyAction !== 'refund') return false;
      if (filterTab === 'investigating' && rec?.resolutionStatus !== 'investigating') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = (order.orderId || '').toLowerCase().includes(q);
        const matchesCustomer = (order.customerName || '').toLowerCase().includes(q);
        const matchesPhone = (order.customerPhone || '').includes(q);
        const matchesReason = (rec?.reasonDescription || rec?.reason || '').toLowerCase().includes(q);
        const matchesItem = order.items?.some((i) => i.productTitle.toLowerCase().includes(q));
        if (!matchesId && !matchesCustomer && !matchesPhone && !matchesReason && !matchesItem) {
          return false;
        }
      }

      return true;
    });
  }, [returnOrders, filterTab, searchQuery]);

  const handleSaveReturnRecord = (orderId: string, record: ReturnRecord) => {
    const existing = orders.find((o) => o.orderId === orderId);
    if (!existing) return;

    const updatedOrder: OrderItem = {
      ...existing,
      status: 'returned',
      returnRecord: record,
    };

    onUpdateOrder(updatedOrder);
    showNotification(`Return & financial loss record for Order #${orderId} saved!`);
  };

  const handleStartNewReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNewOrderId) return;
    const ord = orders.find((o) => o.orderId === selectedNewOrderId);
    if (ord) {
      setEditingReturnOrder(ord);
      setIsNewReturnModalOpen(false);
      setSelectedNewOrderId('');
    } else {
      showNotification('Order not found with that ID');
    }
  };

  return (
    <div className="content">
      {/* Page Header */}
      <div className="page-head">
        <div>
          <h1 className="d-flex align-items-center gap-2">
            <RotateCcw size={24} className="text-danger" /> Warranty Claims & Return Loss Management
          </h1>
          <p>
            Track returned orders, warranty item replacements, courier returns, and analyze total financial losses.
          </p>
        </div>
        <button
          className="btn-dark-x d-flex align-items-center gap-2"
          style={{ background: '#f43f5e', borderColor: '#e11d48' }}
          onClick={() => setIsNewReturnModalOpen(true)}
          type="button"
        >
          <Plus size={16} /> Record Return for Order
        </button>
      </div>

      {/* 4 KPI Summary Cards for Return Losses */}
      <div className="row g-3 mb-4">
        {/* KPI 1: Total Loss */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card-x h-100 p-3" style={{ borderLeft: '4px solid #f43f5e' }}>
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="text-muted" style={{ fontSize: '12px', fontWeight: 600 }}>
                Total Return Losses
              </span>
              <span
                className="p-1.5 rounded-2"
                style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}
              >
                <TrendingDown size={16} />
              </span>
            </div>
            <h3 className="m-0 text-danger fw-black" style={{ fontSize: '22px' }}>
              Rs. {totalLoss.toLocaleString()}
            </h3>
            <small className="text-muted mt-1 d-block" style={{ fontSize: '11px' }}>
              Across <b>{totalReturnCount}</b> returned/claimed orders
            </small>
          </div>
        </div>

        {/* KPI 2: Product / Replacement Loss */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card-x h-100 p-3" style={{ borderLeft: '4px solid #8b5cf6' }}>
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="text-muted" style={{ fontSize: '12px', fontWeight: 600 }}>
                Warranty Replacement Loss
              </span>
              <span
                className="p-1.5 rounded-2"
                style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}
              >
                <Package size={16} />
              </span>
            </div>
            <h3 className="m-0 text-purple fw-black" style={{ fontSize: '22px', color: '#8b5cf6' }}>
              Rs. {totalProductLoss.toLocaleString()}
            </h3>
            <small className="text-muted mt-1 d-block" style={{ fontSize: '11px' }}>
              <b>{warrantyReplacementsCount}</b> items replaced under warranty
            </small>
          </div>
        </div>

        {/* KPI 3: Shipping / Courier Loss */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card-x h-100 p-3" style={{ borderLeft: '4px solid #0284c7' }}>
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="text-muted" style={{ fontSize: '12px', fontWeight: 600 }}>
                Courier & Delivery Losses
              </span>
              <span
                className="p-1.5 rounded-2"
                style={{ background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7' }}
              >
                <Truck size={16} />
              </span>
            </div>
            <h3 className="m-0 text-primary fw-black" style={{ fontSize: '22px' }}>
              Rs. {totalShippingLoss.toLocaleString()}
            </h3>
            <small className="text-muted mt-1 d-block" style={{ fontSize: '11px' }}>
              Return to origin (RTO) courier fees
            </small>
          </div>
        </div>

        {/* KPI 4: Return Rate */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card-x h-100 p-3" style={{ borderLeft: '4px solid #10b981' }}>
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="text-muted" style={{ fontSize: '12px', fontWeight: 600 }}>
                Overall Return Rate
              </span>
              <span
                className="p-1.5 rounded-2"
                style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}
              >
                <ShieldAlert size={16} />
              </span>
            </div>
            <h3 className="m-0 fw-black" style={{ fontSize: '22px', color: '#10b981' }}>
              {((totalReturnCount / Math.max(1, orders.length)) * 100).toFixed(1)}%
            </h3>
            <small className="text-muted mt-1 d-block" style={{ fontSize: '11px' }}>
              {totalReturnCount} of {orders.length.toLocaleString()} total orders
            </small>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="card-x mb-3 p-3">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          {/* Segmented Filter Tabs */}
          <div className="seg">
            <button
              type="button"
              className={filterTab === 'all' ? 'on' : ''}
              onClick={() => setFilterTab('all')}
            >
              All Returns ({returnOrders.length})
            </button>
            <button
              type="button"
              className={filterTab === 'replacement' ? 'on' : ''}
              onClick={() => setFilterTab('replacement')}
            >
              Warranty Replacements ({warrantyReplacementsCount})
            </button>
            <button
              type="button"
              className={filterTab === 'shipping_only' ? 'on' : ''}
              onClick={() => setFilterTab('shipping_only')}
            >
              Courier Shipping Only
            </button>
            <button
              type="button"
              className={filterTab === 'refund' ? 'on' : ''}
              onClick={() => setFilterTab('refund')}
            >
              Refunded
            </button>
            <button
              type="button"
              className={filterTab === 'investigating' ? 'on' : ''}
              onClick={() => setFilterTab('investigating')}
            >
              Under Inspection
            </button>
          </div>

          {/* Search Box */}
          <div className="search" style={{ minWidth: '260px' }}>
            <Search size={15} />
            <input
              type="text"
              placeholder="Search by order #, customer, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Returns List Table */}
      <div className="card-x p-0 overflow-hidden shadow-xs">
        <div className="table-responsive">
          <table className="table-x align-middle mb-0" style={{ minWidth: '1050px' }}>
            <thead>
              <tr>
                <th style={{ width: '110px', whiteSpace: 'nowrap' }}>Order #</th>
                <th style={{ width: '180px' }}>Customer</th>
                <th style={{ minWidth: '180px', maxWidth: '240px' }}>Purchased Items</th>
                <th style={{ width: '170px' }}>Claim Reason</th>
                <th style={{ width: '160px' }}>Warranty Action</th>
                <th style={{ textAlign: 'right', width: '110px', whiteSpace: 'nowrap' }}>Courier Loss</th>
                <th style={{ textAlign: 'right', width: '110px', whiteSpace: 'nowrap' }}>Product Loss</th>
                <th style={{ textAlign: 'right', width: '130px', whiteSpace: 'nowrap' }}>Total Net Loss</th>
                <th style={{ textAlign: 'center', width: '100px' }}>Status</th>
                <th style={{ textAlign: 'right', width: '90px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-5 text-muted">
                    <RotateCcw size={36} className="d-block mx-auto mb-2 opacity-50" />
                    <b>No returned orders found.</b>
                    <p className="m-0 mt-1" style={{ fontSize: '12px' }}>
                      To record a return, click the "+ Record Return for Order" button above or set any order's status to "Returned" in the Orders view.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredReturns.map((order) => {
                  const rec = order.returnRecord;
                  const cleanPhone = (order.customerPhone || '').replace(/\D/g, '');
                  const shipLoss = rec?.shippingLoss ?? (order.shippingCost || 400);
                  const prodLoss = rec?.productLoss ?? 0;
                  const itemTotalLoss = rec?.totalLoss ?? (shipLoss + prodLoss);

                  // Reason label
                  const reasonLabel =
                    rec?.reason === 'defective'
                      ? 'Manufacturing Defect'
                      : rec?.reason === 'warranty_fault'
                      ? 'Hardware Warranty Fault'
                      : rec?.reason === 'wrong_item'
                      ? 'Wrong Item Dispatched'
                      : rec?.reason === 'courier_failed'
                      ? 'Courier Delivery Failed'
                      : rec?.reason === 'customer_change'
                      ? 'Customer Returned'
                      : 'Warranty Inspection';

                  // Action label
                  const actionLabel =
                    rec?.warrantyAction === 'replacement'
                      ? '1-to-1 Replacement Given'
                      : rec?.warrantyAction === 'refund'
                      ? 'Refund Issued'
                      : rec?.warrantyAction === 'repair'
                      ? 'Repaired & Reshipped'
                      : rec?.warrantyAction === 'shipping_only'
                      ? 'Shipping Loss Only'
                      : 'Inspection Pending';

                  const resStatus = rec?.resolutionStatus || 'investigating';

                  return (
                    <tr key={order.orderId} style={{ verticalAlign: 'middle' }}>
                      {/* Order ID */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <b
                          className="font-monospace text-primary d-block"
                          style={{ cursor: 'pointer', fontSize: '13px' }}
                          onClick={() => setSelectedOrder && setSelectedOrder(order)}
                          title="View order details"
                        >
                          #{order.orderId}
                        </b>
                        <small className="text-muted" style={{ fontSize: '11px' }}>
                          {rec?.createdAt?.slice(0, 10) || order.createdAt?.slice(0, 10)}
                        </small>
                      </td>

                      {/* Customer */}
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{order.customerName}</div>
                        <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                          {order.customerPhone} ({order.city})
                        </small>
                      </td>

                      {/* Items */}
                      <td style={{ maxWidth: '240px' }}>
                        <div className="text-truncate fw-semibold" style={{ fontSize: '12px' }} title={order.items?.[0]?.productTitle}>
                          {order.items?.[0]?.productTitle || 'DWstore Electronics'}
                        </div>
                        {rec?.replacementItemTitle && (
                          <small className="text-purple d-block text-truncate fw-semibold" style={{ fontSize: '11px', color: '#8b5cf6' }}>
                            ↳ {rec.replacementItemTitle}
                          </small>
                        )}
                      </td>

                      {/* Claim Reason */}
                      <td>
                        <span className="badge bg-secondary-subtle text-body fw-bold" style={{ fontSize: '11px' }}>
                          {reasonLabel}
                        </span>
                        {rec?.reasonDescription && (
                          <small className="text-muted d-block text-truncate mt-1" style={{ fontSize: '11px', maxWidth: '160px' }}>
                            {rec.reasonDescription}
                          </small>
                        )}
                      </td>

                      {/* Warranty Action */}
                      <td>
                        <span
                          className="badge fw-bold"
                          style={{
                            fontSize: '11px',
                            background:
                              rec?.warrantyAction === 'replacement'
                                ? 'rgba(139, 92, 246, 0.15)'
                                : rec?.warrantyAction === 'refund'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(2, 132, 199, 0.15)',
                            color:
                              rec?.warrantyAction === 'replacement'
                                ? '#8b5cf6'
                                : rec?.warrantyAction === 'refund'
                                ? '#ef4444'
                                : '#0284c7',
                          }}
                        >
                          {actionLabel}
                        </span>
                      </td>

                      {/* Courier Loss */}
                      <td style={{ textAlign: 'right', fontSize: '12.5px', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                        Rs. {shipLoss.toLocaleString()}
                      </td>

                      {/* Product Loss */}
                      <td style={{ textAlign: 'right', fontSize: '12.5px', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                        Rs. {prodLoss.toLocaleString()}
                      </td>

                      {/* Total Net Loss */}
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span
                          className="badge bg-danger-subtle text-danger fw-bold font-monospace px-2.5 py-1"
                          style={{ fontSize: '12px' }}
                        >
                          - Rs. {itemTotalLoss.toLocaleString()}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span
                          className={`badge ${
                            resStatus === 'resolved' || resStatus === 'replacement_dispatched'
                              ? 'bg-success-subtle text-success'
                              : resStatus === 'refunded'
                              ? 'bg-primary-subtle text-primary'
                              : 'bg-warning-subtle text-warning'
                          } fw-bold`}
                          style={{ fontSize: '11px' }}
                        >
                          {resStatus === 'replacement_dispatched'
                            ? 'Replaced'
                            : resStatus === 'refunded'
                            ? 'Refunded'
                            : resStatus === 'resolved'
                            ? 'Closed'
                            : 'Inspecting'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary p-1.5"
                            style={{ borderRadius: '8px' }}
                            onClick={() => setEditingReturnOrder(order)}
                            title="Edit Return & Loss Record"
                          >
                            <Edit3 size={13} />
                          </button>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                `Hello ${order.customerName}, this is DWstore.lk regarding your warranty / return request for Order #${order.orderId}.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="icon-btn"
                              style={{ width: '32px', height: '32px', color: '#25D366' }}
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle size={15} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Return Record Modal */}
      {editingReturnOrder && (
        <ReturnClaimModal
          order={editingReturnOrder}
          onClose={() => setEditingReturnOrder(null)}
          onSave={handleSaveReturnRecord}
        />
      )}

      {/* Select Order to Record New Return Modal */}
      {isNewReturnModalOpen && (
        <div className="react-modal-backdrop" onClick={() => setIsNewReturnModalOpen(false)}>
          <div className="card-x" style={{ width: '100%', maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
              <h5 className="m-0 d-flex align-items-center gap-2">
                <RotateCcw size={18} className="text-danger" /> Record New Return / Claim
              </h5>
              <button
                type="button"
                className="icon-btn"
                style={{ width: '30px', height: '30px' }}
                onClick={() => setIsNewReturnModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleStartNewReturn}>
              <div className="mb-3">
                <label className="d-block mb-1 text-muted" style={{ fontSize: '13px' }}>
                  Select or Enter Order ID *
                </label>
                <select
                  className="sel-x w-100"
                  value={selectedNewOrderId}
                  onChange={(e) => setSelectedNewOrderId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Order to Return --</option>
                  {orders.slice(0, 80).map((o) => (
                    <option key={o.orderId} value={o.orderId}>
                      #{o.orderId} - {o.customerName} (Rs. {(o.total || 0).toLocaleString()})
                    </option>
                  ))}
                </select>
                <small className="text-muted mt-1 d-block" style={{ fontSize: '11px' }}>
                  You can also paste the Order ID below:
                </small>
                <input
                  type="text"
                  placeholder="e.g. DWS-35257"
                  className="w-100 p-2 mt-1 rounded-2 font-monospace uppercase"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  value={selectedNewOrderId}
                  onChange={(e) => setSelectedNewOrderId(e.target.value.trim().toUpperCase())}
                />
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top border-border">
                <button
                  type="button"
                  className="btn-soft"
                  onClick={() => setIsNewReturnModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedNewOrderId}
                  className="btn-dark-x"
                  style={{ background: '#f43f5e', borderColor: '#e11d48' }}
                >
                  Continue to Loss Details →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
