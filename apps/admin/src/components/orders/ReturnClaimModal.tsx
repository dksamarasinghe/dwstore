import React, { useState } from 'react';
import {
  RotateCcw,
  X,
  AlertTriangle,
  DollarSign,
  Package,
  Truck,
  CheckCircle2,
  Save,
  ShieldAlert,
} from 'lucide-react';
import { OrderItem, ReturnRecord, ReturnReason, WarrantyAction } from '../../types';

interface ReturnClaimModalProps {
  order: OrderItem;
  onClose: () => void;
  onSave: (orderId: string, returnRecord: ReturnRecord) => void;
}

export const ReturnClaimModal: React.FC<ReturnClaimModalProps> = ({
  order,
  onClose,
  onSave,
}) => {
  const existing = order.returnRecord;

  const [reason, setReason] = useState<ReturnReason>(existing?.reason || 'defective');
  const [reasonDescription, setReasonDescription] = useState(existing?.reasonDescription || '');
  const [warrantyAction, setWarrantyAction] = useState<WarrantyAction>(existing?.warrantyAction || 'replacement');
  const [replacementItemTitle, setReplacementItemTitle] = useState(
    existing?.replacementItemTitle || (order.items?.[0]?.productTitle ? `Replacement: ${order.items[0].productTitle}` : '')
  );
  
  // Default shipping loss to order's shipping cost or standard Rs. 400
  const [shippingLoss, setShippingLoss] = useState<string>(
    existing?.shippingLoss !== undefined ? String(existing.shippingLoss) : String(order.shippingCost || 400)
  );
  
  // Default product loss to order subtotal if replacement/refund
  const [productLoss, setProductLoss] = useState<string>(
    existing?.productLoss !== undefined
      ? String(existing.productLoss)
      : warrantyAction === 'replacement' || warrantyAction === 'refund'
      ? String(order.subtotal || order.total || 0)
      : '0'
  );

  const [resolutionStatus, setResolutionStatus] = useState<
    'investigating' | 'resolved' | 'replacement_dispatched' | 'refunded'
  >(existing?.resolutionStatus || 'investigating');
  
  const [notes, setNotes] = useState(existing?.notes || '');

  // Calculate total net loss
  const numShipping = parseFloat(shippingLoss) || 0;
  const numProduct = parseFloat(productLoss) || 0;
  const totalLoss = Math.round(numShipping + numProduct);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const record: ReturnRecord = {
      id: existing?.id || `ret-${Date.now()}`,
      orderId: order.orderId,
      createdAt: existing?.createdAt || new Date().toISOString(),
      reason,
      reasonDescription,
      warrantyAction,
      replacementItemTitle: warrantyAction === 'replacement' ? replacementItemTitle : '',
      shippingLoss: numShipping,
      productLoss: numProduct,
      totalLoss,
      notes,
      resolutionStatus,
    };

    onSave(order.orderId, record);
    onClose();
  };

  return (
    <div className="react-modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="card-x p-0 overflow-hidden shadow-lg"
        style={{ width: '100%', maxWidth: '600px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="p-3 d-flex align-items-center justify-content-between border-bottom"
          style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
        >
          <div className="d-flex align-items-center gap-2">
            <span
              className="p-2 rounded-2"
              style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}
            >
              <RotateCcw size={18} />
            </span>
            <div>
              <h5 className="m-0" style={{ fontSize: '15px' }}>
                Order Return & Warranty Claim
              </h5>
              <small className="text-muted">
                Order #{order.orderId} — {order.customerName} ({order.city})
              </small>
            </div>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-3 overflow-y-auto" style={{ flex: 1 }}>
          <div className="d-flex flex-column gap-3">
            {/* Order Brief Info */}
            <div
              className="p-2.5 rounded-2 d-flex align-items-center justify-content-between"
              style={{ background: 'var(--hover)', border: '1px solid var(--border)', fontSize: '12px' }}
            >
              <div>
                <span className="text-muted">Order Total: </span>
                <b className="text-primary">Rs. {(order.total || 0).toLocaleString()}</b>
                <span className="text-muted ms-3">Payment: </span>
                <b>{order.paymentMethod || 'COD'} ({order.paymentStatus || 'Paid'})</b>
              </div>
              <div className="text-muted">
                Items: <b>{order.items?.length || 1}</b>
              </div>
            </div>

            {/* 1. Return Reason */}
            <div>
              <label className="d-block mb-1 text-muted" style={{ fontSize: '12px', fontWeight: 600 }}>
                Return / Claim Reason *
              </label>
              <select
                className="sel-x w-100"
                value={reason}
                onChange={(e) => setReason(e.target.value as ReturnReason)}
                required
              >
                <option value="defective">Manufacturing Defect / Dead on Arrival (DOA)</option>
                <option value="warranty_fault">Hardware / Technical Fault under Warranty</option>
                <option value="wrong_item">Wrong Item Sent by Warehouse</option>
                <option value="courier_failed">Courier Delivery Failed (Return to Origin)</option>
                <option value="customer_change">Customer Changed Mind / Rejected at Doorstep</option>
                <option value="other">Other / Custom Inquiries</option>
              </select>
            </div>

            {/* Reason Description */}
            <div>
              <label className="d-block mb-1 text-muted" style={{ fontSize: '12px', fontWeight: 600 }}>
                Customer Issue / Fault Description
              </label>
              <textarea
                rows={2}
                className="w-100 p-2 rounded-2"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px' }}
                placeholder="Describe the issue reported by the customer (e.g. Battery not charging, display glitch)..."
                value={reasonDescription}
                onChange={(e) => setReasonDescription(e.target.value)}
              />
            </div>

            {/* 2. Warranty / Store Resolution Action */}
            <div className="p-3 rounded-2 border border-border" style={{ background: 'var(--hover)' }}>
              <label className="d-block mb-2 fw-bold text-dark-emphasis" style={{ fontSize: '13px' }}>
                Store Resolution / Warranty Action Taken *
              </label>
              <select
                className="sel-x w-100 mb-2"
                value={warrantyAction}
                onChange={(e) => {
                  const act = e.target.value as WarrantyAction;
                  setWarrantyAction(act);
                  if (act === 'shipping_only' || act === 'rejected') {
                    setProductLoss('0');
                  } else if (act === 'replacement' || act === 'refund') {
                    setProductLoss(String(order.subtotal || order.total || 0));
                  }
                }}
              >
                <option value="replacement">Warranty Replacement (1-to-1 Item Exchange)</option>
                <option value="refund">Full or Partial Refund to Customer</option>
                <option value="repair">Repaired Unit & Returned</option>
                <option value="shipping_only">Courier Return (Item Intact - Shipping Loss Only)</option>
                <option value="rejected">Warranty Claim Rejected (No Replacement)</option>
              </select>

              {warrantyAction === 'replacement' && (
                <div className="mt-2">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '11px' }}>
                    Replacement Item Dispatched:
                  </label>
                  <input
                    type="text"
                    className="w-100 p-2 rounded-2"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px' }}
                    placeholder="e.g. Brand New T800 Ultra Smartwatch (Black)"
                    value={replacementItemTitle}
                    onChange={(e) => setReplacementItemTitle(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* 3. Financial Loss / Cost Breakdown (THE CRITICAL RECORD) */}
            <div className="p-3 rounded-2 border border-danger-subtle" style={{ background: 'rgba(244, 63, 94, 0.04)' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-bold text-danger d-flex align-items-center gap-1.5" style={{ fontSize: '13px' }}>
                  <ShieldAlert size={16} /> Financial Loss Recorded (පාඩුව ගණනය)
                </span>
                <span className="badge-x bg-danger text-white font-monospace" style={{ fontSize: '12px' }}>
                  Total Loss: Rs. {totalLoss.toLocaleString()}
                </span>
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '11px' }}>
                    <Truck size={12} className="me-1" /> Courier Shipping Loss (LKR)
                  </label>
                  <input
                    type="number"
                    className="w-100 p-2 rounded-2 font-monospace"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '13px' }}
                    placeholder="e.g. 400"
                    value={shippingLoss}
                    onChange={(e) => setShippingLoss(e.target.value)}
                  />
                  <small className="text-muted d-block mt-0.5" style={{ fontSize: '10px' }}>
                    Delivery & return courier charges
                  </small>
                </div>

                <div className="col-6">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '11px' }}>
                    <Package size={12} className="me-1" /> Product / Replacement Loss (LKR)
                  </label>
                  <input
                    type="number"
                    className="w-100 p-2 rounded-2 font-monospace"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '13px' }}
                    placeholder="e.g. 2500"
                    value={productLoss}
                    onChange={(e) => setProductLoss(e.target.value)}
                  />
                  <small className="text-muted d-block mt-0.5" style={{ fontSize: '10px' }}>
                    Cost of replacement item or refund
                  </small>
                </div>
              </div>
            </div>

            {/* Resolution Status & Internal Notes */}
            <div className="row g-2">
              <div className="col-6">
                <label className="d-block mb-1 text-muted" style={{ fontSize: '12px' }}>Resolution Status</label>
                <select
                  className="sel-x w-100"
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value as any)}
                >
                  <option value="investigating">Under Inspection</option>
                  <option value="replacement_dispatched">Replacement Dispatched</option>
                  <option value="refunded">Refund Completed</option>
                  <option value="resolved">Case Closed / Resolved</option>
                </select>
              </div>

              <div className="col-6">
                <label className="d-block mb-1 text-muted" style={{ fontSize: '12px' }}>Return Tracking / Serial No</label>
                <input
                  type="text"
                  className="w-100 p-2 rounded-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px' }}
                  placeholder="e.g. KMB-RET-9921 / IMEI"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="d-flex align-items-center justify-content-end gap-2 pt-3 mt-3 border-top border-border">
            <button type="button" className="btn-soft" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-dark-x d-flex align-items-center gap-1.5"
              style={{ background: '#f43f5e', borderColor: '#e11d48' }}
            >
              <Save size={15} /> Save Return & Record Loss
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
