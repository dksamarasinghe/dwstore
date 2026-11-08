import React, { useState, useMemo } from 'react';
import { CreditCard, CheckCircle2, Clock, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { OrderItem } from '../../types';

interface PaymentsViewProps {
  orders: OrderItem[];
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ orders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const paidTotal = orders
    .filter((o) => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const pendingCodTotal = orders
    .filter((o) => o.paymentStatus === 'Unpaid' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.paymentStatus !== statusFilter) return false;
      const s = searchTerm.toLowerCase();
      return (
        o.orderId.toLowerCase().includes(s) ||
        o.customerName.toLowerCase().includes(s) ||
        o.paymentMethod.toLowerCase().includes(s)
      );
    });
  }, [orders, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1>Payment Gateways & Transactions</h1>
          <p>Real transaction history from WooCommerce database (COD, Card, Koko BNPL, Mintpay).</p>
        </div>
      </div>

      <section className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#ecf6ef', color: '#059669' }}>
              <CreditCard size={20} />
            </span>
            <div>
              <small>Settled Payments</small>
              <b>Rs. {paidTotal.toLocaleString()}</b>
              <span className="ms-note up">Verified transactions</span>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Clock size={20} />
            </span>
            <div>
              <small>Pending COD Collections</small>
              <b className="text-warning">Rs. {pendingCodTotal.toLocaleString()}</b>
              <span className="ms-note">With courier partners</span>
            </div>
          </div>
        </div>
      </section>

      <div className="card-x">
        <div className="ord-filters mb-3">
          <div className="search flex-grow-1">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search payments by Order ID, customer, or payment method..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <select
            className="sel-x"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Payments</option>
            <option value="Paid">Paid Only</option>
            <option value="Unpaid">Unpaid / COD Only</option>
          </select>
        </div>

        <div className="table-responsive">
          <table className="table-x">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Payment Method</th>
                <th>Amount (LKR)</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-muted">
                    No payment records match your search.
                  </td>
                </tr>
              ) : (
                paginated.map((o) => (
                  <tr key={o.orderId}>
                    <td>
                      <b>#{o.orderId}</b>
                      <small className="d-block text-muted">{o.createdAt}</small>
                    </td>
                    <td>{o.customerName}</td>
                    <td>
                      <b style={{ fontSize: '13px' }}>{o.paymentMethod}</b>
                    </td>
                    <td>
                      <b>Rs. {o.total.toLocaleString()}</b>
                    </td>
                    <td>
                      <span className={`badge-x ${o.paymentStatus === 'Paid' ? 's-Paid' : 's-Unpaid'}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="d-flex align-items-center justify-content-between pt-3 mt-3 border-top" style={{ borderColor: 'var(--border)' }}>
          <small className="text-muted">
            Showing <b>{(currentPage - 1) * pageSize + 1}</b> -{' '}
            <b>{Math.min(currentPage * pageSize, filtered.length)}</b> of <b>{filtered.length}</b> records
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
    </div>
  );
};
