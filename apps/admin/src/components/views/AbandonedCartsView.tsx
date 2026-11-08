import React from 'react';
import { ShoppingCart, MessageCircle, AlertCircle, ArrowUpRight } from 'lucide-react';
import { AbandonedCartItem } from '../../types';

interface AbandonedCartsViewProps {
  carts: AbandonedCartItem[];
  onSendRecovery: (id: string) => void;
  showNotification: (msg: string) => void;
}

export const AbandonedCartsView: React.FC<AbandonedCartsViewProps> = ({
  carts,
  onSendRecovery,
  showNotification,
}) => {
  const totalRecoverable = carts.reduce((sum, c) => sum + c.totalValue, 0);

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1>Abandoned Carts Recovery</h1>
          <p>Recover lost sales by reaching out to buyers who left items in their checkout cart.</p>
        </div>
      </div>

      <section className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#fdf3ea', color: '#d97706' }}>
              <ShoppingCart size={20} />
            </span>
            <div>
              <small>Recoverable Revenue</small>
              <b className="text-warning">Rs. {totalRecoverable.toLocaleString()}</b>
              <span className="ms-note">{carts.length} active abandoned sessions</span>
            </div>
          </div>
        </div>
      </section>

      <div className="card-x">
        <div className="table-responsive">
          <table className="table-x">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Cart Items</th>
                <th>Cart Value</th>
                <th>Abandoned</th>
                <th>Recovery Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {carts.map((c) => {
                const cleanPhone = c.phone.replace(/[^0-9]/g, '');
                const waMessage = `Hello ${c.customerName}! We noticed you left ${c.itemsSummary} in your cart at DWstore.lk. Complete your order today and get FREE delivery with coupon FREESHIP! https://dwstore.lk/checkout`;

                return (
                  <tr key={c.id}>
                    <td>
                      <div className="cust">
                        <span className="mini-av" style={{ background: '#fce7f3', color: '#be185d' }}>
                          {c.customerName.substring(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <b>{c.customerName}</b>
                          <small className="d-block text-muted">{c.phone}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <b>{c.itemsSummary}</b>
                      <small className="d-block text-muted">{c.itemCount} item(s)</small>
                    </td>
                    <td>
                      <b className="text-primary">Rs. {c.totalValue.toLocaleString()}</b>
                    </td>
                    <td>
                      <span className="text-muted">{c.date}</span>
                    </td>
                    <td>
                      <span
                        className={`badge-x ${c.recoverySent ? 's-Delivered' : 's-Pending'}`}
                      >
                        {c.recoverySent ? 'WhatsApp Sent' : 'Not Contacted'}
                      </span>
                    </td>
                    <td className="text-end">
                      {cleanPhone && (
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-soft text-success d-inline-flex"
                          style={{ height: '34px', fontSize: '12px' }}
                          onClick={() => {
                            onSendRecovery(c.id);
                            showNotification(`Recovery offer sent to ${c.customerName}!`);
                          }}
                        >
                          <MessageCircle size={15} /> Send WhatsApp Offer
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
