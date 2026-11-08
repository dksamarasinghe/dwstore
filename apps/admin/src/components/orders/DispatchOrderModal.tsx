import React, { useState, useEffect } from 'react';
import { Truck, X, Hash, Calendar, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { OrderItem } from '../../types';

interface DispatchOrderModalProps {
  isOpen: boolean;
  order: OrderItem | null;
  onClose: () => void;
  onDispatch: (orderId: string, carrier: string, trackingNumber: string, dispatchedDate: string) => Promise<void> | void;
}

const DEFAULT_CARRIER = 'Koombiyo Delivery';

export const DispatchOrderModal: React.FC<DispatchOrderModalProps> = ({
  isOpen,
  order,
  onClose,
  onDispatch,
}) => {
  const [carrier] = useState<string>(DEFAULT_CARRIER);
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [dispatchedDate, setDispatchedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate Koombiyo Waybill Number (e.g. 17535257 or KOOMBIYO-LK-35257)
  const generateTracking = (ordId: string) => {
    const cleanId = (ordId || '35000').replace(/[^0-9]/g, '') || Math.floor(10000 + Math.random() * 90000).toString();
    return `175${cleanId.slice(-5).padStart(5, '0')}`;
  };

  useEffect(() => {
    if (order) {
      setTrackingNumber(order.trackingNumber || generateTracking(order.orderId));
      setDispatchedDate(order.dispatchedDate || new Date().toISOString().split('T')[0]);
    }
  }, [order]);

  const handleRegenerate = () => {
    if (order) {
      setTrackingNumber(generateTracking(order.orderId));
    }
  };

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    setIsSubmitting(true);
    try {
      await onDispatch(order.orderId, DEFAULT_CARRIER, trackingNumber.trim(), dispatchedDate);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="react-modal-backdrop" onClick={onClose} style={{ zIndex: 1050 }}>
      <div
        className="card-x"
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '92vh',
          overflowY: 'auto',
          margin: 'auto',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          border: '1px solid var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="d-flex align-items-center justify-content-between pb-3 border-bottom"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="d-flex align-items-center gap-2">
            <span
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: '36px', height: '36px', background: '#e0f2fe', color: '#0284c7' }}
            >
              <Truck size={20} />
            </span>
            <div>
              <h5 className="m-0 fw-bold">Dispatch Order #{order.orderId}</h5>
              <small className="text-muted">
                Assign courier tracking & sync with Logistics Shipments
              </small>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn"
            style={{ width: '32px', height: '32px' }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Order Summary Pill */}
        <div
          className="my-3 p-3 rounded-3"
          style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <small className="text-muted d-block">Recipient</small>
              <b>{order.customerName}</b> &bull; {order.city}
            </div>
            <div className="text-end">
              <small className="text-muted d-block">Order Total</small>
              <b className="text-primary">Rs. {order.total.toLocaleString()}</b>
            </div>
          </div>
        </div>

        {/* Dispatch Form */}
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div>
            <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
              Courier Service Partner
            </label>
            <div
              className="d-flex align-items-center justify-content-between p-2.5 rounded-2"
              style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}
            >
              <div className="d-flex align-items-center gap-2">
                <span className="badge-x s-Processing fw-bold" style={{ fontSize: '12px' }}>
                  Koombiyo Delivery
                </span>
                <small className="text-muted">Exclusive Official Courier Partner</small>
              </div>
              <small className="text-success fw-bold">✓ Active</small>
            </div>
          </div>

          <div>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label fw-semibold m-0" style={{ fontSize: '13px' }}>
                Waybill / Tracking Number <span className="text-danger">*</span>
              </label>
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none"
                style={{ fontSize: '12px' }}
                onClick={handleRegenerate}
              >
                <RefreshCw size={12} className="me-1" /> Auto-generate
              </button>
            </div>
            <div className="input-group">
              <span className="input-group-text">
                <Hash size={14} />
              </span>
              <input
                type="text"
                className="form-control font-monospace fw-bold"
                placeholder="e.g. KOOMBIYO-LK-35257"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                required
              />
            </div>
            <small className="text-muted" style={{ fontSize: '11px' }}>
              This tracking number will be visible to the customer and added to Courier &amp; Logistics Shipments.
            </small>
          </div>

          <div>
            <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
              Dispatched Date
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <Calendar size={14} />
              </span>
              <input
                type="date"
                className="form-control"
                value={dispatchedDate}
                onChange={(e) => setDispatchedDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div
            className="d-flex align-items-center justify-content-end gap-2 pt-3 mt-2 border-top"
            style={{ borderColor: 'var(--border)' }}
          >
            <button
              type="button"
              className="btn btn-light border px-3"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-dark px-4 fw-bold d-flex align-items-center gap-2"
              disabled={isSubmitting}
            >
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? 'Saving...' : 'Confirm & Mark Shipped'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
