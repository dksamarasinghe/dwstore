import React, { useState } from 'react';
import { Percent, Ticket, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { CouponItem } from '../../types';

interface DiscountsViewProps {
  coupons: CouponItem[];
  onAddCoupon: (coupon: CouponItem) => void;
  onDeleteCoupon: (id: string) => void;
}

export const DiscountsView: React.FC<DiscountsViewProps> = ({
  coupons,
  onAddCoupon,
  onDeleteCoupon,
}) => {
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [val, setVal] = useState('10');
  const [minSpend, setMinSpend] = useState('3000');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    const cp: CouponItem = {
      id: `cp-${Date.now()}`,
      code: code.trim().toUpperCase(),
      discountType: type,
      discountValue: parseFloat(val) || 0,
      minSpend: parseFloat(minSpend) || 0,
      usedCount: 0,
      maxUsage: 500,
      expiryDate: '2026-12-31',
      status: 'Active',
    };
    onAddCoupon(cp);
    setCode('');
    setIsModalOpen(false);
  };

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1>Promo Coupons</h1>
          <p>Create promotional vouchers, percentage discounts, and free shipping codes.</p>
        </div>
        <button className="btn-dark-x" onClick={() => setIsModalOpen(true)} type="button">
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      <div className="row g-3">
        {coupons.map((cp) => (
          <div key={cp.id} className="col-12 col-md-6 col-xl-4">
            <div className="card-x h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="thumb" style={{ background: '#ecf6ef', color: '#059669' }}>
                    <Ticket size={22} />
                  </span>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge-x s-Delivered">{cp.status}</span>
                    <button
                      type="button"
                      className="icon-btn text-danger"
                      style={{ width: '32px', height: '32px' }}
                      onClick={() => onDeleteCoupon(cp.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <h4 className="font-monospace text-primary mb-1">{cp.code}</h4>
                <p className="text-muted m-0" style={{ fontSize: '13px' }}>
                  {cp.discountType === 'percentage'
                    ? `${cp.discountValue}% Off on order`
                    : `Rs. ${cp.discountValue.toLocaleString()} Fixed Discount`}
                </p>
                <small className="text-muted d-block mt-1">Min. Spend: Rs. {cp.minSpend.toLocaleString()}</small>
              </div>

              <div className="pt-3 mt-3 border-top" style={{ borderColor: 'var(--border)' }}>
                <div className="d-flex justify-content-between text-muted" style={{ fontSize: '12px' }}>
                  <span>Usage: <b>{cp.usedCount}</b> / {cp.maxUsage}</span>
                  <span>Expires: {cp.expiryDate}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="react-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="card-x" style={{ width: '100%', maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <h5 className="mb-3">Create Promo Coupon</h5>
            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="d-block mb-1 text-muted" style={{ fontSize: '13px' }}>Coupon Code *</label>
                <input
                  type="text"
                  className="w-100 p-2 rounded-2 font-monospace text-uppercase"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  placeholder="e.g. FLASH20"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '13px' }}>Type</label>
                  <select
                    className="sel-x w-100"
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (LKR)</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '13px' }}>Value</label>
                  <input
                    type="number"
                    className="w-100 p-2 rounded-2"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="d-block mb-1 text-muted" style={{ fontSize: '13px' }}>Minimum Spend (LKR)</label>
                <input
                  type="number"
                  className="w-100 p-2 rounded-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  value={minSpend}
                  onChange={(e) => setMinSpend(e.target.value)}
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn-soft" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-dark-x">Save Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
