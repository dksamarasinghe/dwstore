import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  User, 
  MapPin, 
  Truck, 
  CreditCard, 
  FileText, 
  Hash, 
  Phone, 
  Mail, 
  DollarSign, 
  Calendar,
  RefreshCw 
} from 'lucide-react';
import { OrderItem } from '../../types';

interface EditOrderModalProps {
  isOpen: boolean;
  order: OrderItem | null;
  onClose: () => void;
  onSave: (updatedOrder: OrderItem) => Promise<void> | void;
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
  'Bank Transfer',
  'Visa / Mastercard / PayHere',
  'Koko: Buy Now Pay Later',
  'Payzy: Buy Now Pay Later',
];

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  isOpen,
  order,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<OrderItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      setFormData({
        ...order,
        district: order.district || 'Colombo',
        carrier: order.carrier || 'Koombiyo Delivery',
        trackingNumber: order.trackingNumber || '',
        dispatchedDate: order.dispatchedDate || '',
      });
    }
  }, [order]);

  if (!isOpen || !formData) return null;

  const handleChange = (field: keyof OrderItem, value: any) => {
    setFormData((prev) => {
      if (!prev) return null;
      const updated = { ...prev, [field]: value };
      // Recalculate total if subtotal or shipping cost changed
      if (field === 'subtotal' || field === 'shippingCost') {
        const sub = field === 'subtotal' ? Number(value) || 0 : prev.subtotal || 0;
        const ship = field === 'shippingCost' ? Number(value) || 0 : prev.shippingCost || 0;
        updated.total = sub + ship;
      }
      return updated;
    });
  };

  const handleGenerateTracking = () => {
    if (!formData) return;
    const cleanId = (formData.orderId || '35000').replace(/[^0-9]/g, '') || Math.floor(10000 + Math.random() * 90000).toString();
    handleChange('carrier', 'Koombiyo Delivery');
    handleChange('trackingNumber', `175${cleanId.slice(-5).padStart(5, '0')}`);
    if (!formData.dispatchedDate) {
      handleChange('dispatchedDate', new Date().toISOString().split('T')[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="react-modal-backdrop" onClick={onClose} style={{ zIndex: 1050 }}>
      <div
        className="card-x p-0 overflow-hidden"
        style={{
          width: '100%',
          maxWidth: '760px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          margin: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="d-flex align-items-center justify-content-between p-3 px-4 border-bottom"
          style={{ borderColor: 'var(--border)', background: 'var(--card-bg, #fff)' }}
        >
          <div className="d-flex align-items-center gap-2">
            <span
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: '36px', height: '36px', background: '#f1f5f9', color: '#0f172a' }}
            >
              <FileText size={18} />
            </span>
            <div>
              <h5 className="m-0 fw-bold">Edit Order #{formData.orderId}</h5>
              <small className="text-muted">Modify customer, shipping, status, or courier details</small>
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1 }} className="p-4">
          <div className="d-flex flex-column gap-4">

            {/* Section 1: Order & Status */}
            <div>
              <div className="d-flex align-items-center gap-2 mb-3">
                <CreditCard size={16} className="text-primary" />
                <h6 className="m-0 fw-bold">Order &amp; Payment Status</h6>
              </div>
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '12px' }}>
                    Order Status
                  </label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '12px' }}>
                    Payment Status
                  </label>
                  <select
                    className="form-select"
                    value={formData.paymentStatus}
                    onChange={(e) => handleChange('paymentStatus', e.target.value)}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '12px' }}>
                    Payment Method
                  </label>
                  <select
                    className="form-select"
                    value={formData.paymentMethod}
                    onChange={(e) => handleChange('paymentMethod', e.target.value)}
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Customer Details */}
            <div className="pt-3 border-top" style={{ borderColor: 'var(--border)' }}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <User size={16} className="text-primary" />
                <h6 className="m-0 fw-bold">Customer Contact</h6>
              </div>
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '12px' }}>
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.customerName}
                    onChange={(e) => handleChange('customerName', e.target.value)}
                    required
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '12px' }}>
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.customerPhone}
                    onChange={(e) => handleChange('customerPhone', e.target.value)}
                    required
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '12px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.customerEmail}
                    onChange={(e) => handleChange('customerEmail', e.target.value)}
                    placeholder="customer@gmail.com"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Delivery Address */}
            <div className="pt-3 border-top" style={{ borderColor: 'var(--border)' }}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <MapPin size={16} className="text-primary" />
                <h6 className="m-0 fw-bold">Delivery Address</h6>
              </div>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: '12px' }}>
                    Street Address / House No. <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.shippingAddress}
                    onChange={(e) => handleChange('shippingAddress', e.target.value)}
                    required
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '12px' }}>
                    City / Town <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    required
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '12px' }}>
                    District
                  </label>
                  <select
                    className="form-select"
                    value={formData.district || 'Colombo'}
                    onChange={(e) => handleChange('district', e.target.value)}
                  >
                    {SRI_LANKA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '12px' }}>
                    Postal Code
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.postalCode || ''}
                    onChange={(e) => handleChange('postalCode', e.target.value)}
                    placeholder="e.g. 10280"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Courier Logistics & Tracking */}
            <div className="pt-3 border-top" style={{ borderColor: 'var(--border)' }}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <Truck size={16} className="text-primary" />
                  <h6 className="m-0 fw-bold">Courier &amp; Tracking Logistics</h6>
                </div>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none"
                  style={{ fontSize: '12px' }}
                  onClick={handleGenerateTracking}
                >
                  <RefreshCw size={12} className="me-1" /> Generate Tracking No
                </button>
              </div>
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '12px' }}>
                    Courier Service Partner
                  </label>
                  <div
                    className="p-2 rounded-2 d-flex align-items-center justify-content-between"
                    style={{ background: 'var(--hover)', border: '1px solid var(--border)', height: '38px' }}
                  >
                    <b style={{ fontSize: '12px' }}>Koombiyo Delivery</b>
                    <span className="badge-x s-Paid" style={{ fontSize: '10px' }}>Exclusive</span>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '12px' }}>
                    Tracking / Waybill Number
                  </label>
                  <input
                    type="text"
                    className="form-control font-monospace fw-bold"
                    value={formData.trackingNumber || ''}
                    onChange={(e) => handleChange('trackingNumber', e.target.value)}
                    placeholder="e.g. KOOMBIYO-LK-35257"
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '12px' }}>
                    Dispatched Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.dispatchedDate || ''}
                    onChange={(e) => handleChange('dispatchedDate', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Order Totals & Notes */}
            <div className="pt-3 border-top" style={{ borderColor: 'var(--border)' }}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <DollarSign size={16} className="text-primary" />
                <h6 className="m-0 fw-bold">Order Amounts (LKR) &amp; Notes</h6>
              </div>
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '12px' }}>
                    Subtotal (Rs.)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.subtotal}
                    onChange={(e) => handleChange('subtotal', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '12px' }}>
                    Shipping Cost (Rs.)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.shippingCost}
                    onChange={(e) => handleChange('shippingCost', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '12px' }}>
                    Final Total (Rs.)
                  </label>
                  <input
                    type="number"
                    className="form-control fw-bold text-primary"
                    value={formData.total}
                    onChange={(e) => handleChange('total', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: '12px' }}>
                    Customer / Internal Notes
                  </label>
                  <textarea
                    rows={2}
                    className="form-control"
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Delivery instructions, customer preferences..."
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div
            className="d-flex align-items-center justify-content-end gap-2 pt-3 mt-4 border-top"
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
              <Save size={16} />
              <span>{isSubmitting ? 'Saving Changes...' : 'Save Order Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
