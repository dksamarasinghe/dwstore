import React, { useState, useMemo } from 'react';
import { Users, Search, MessageCircle, ChevronLeft, ChevronRight, Phone, Mail, MapPin, Award, Download, Upload } from 'lucide-react';
import { CustomerItem } from '../../types';
import { CSVImportModal } from '../common/CSVImportModal';
import { downloadCSV } from '../../utils/csv';

interface CustomersViewProps {
  customers: CustomerItem[];
  onImportCustomers?: (importedCustomers: CustomerItem[]) => void;
  showNotification?: (msg: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onImportCustomers,
  showNotification,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const vipCount = customers.filter((c) => c.status === 'VIP').length;
  const totalSpentAll = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      const s = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(s) ||
        (c.phone && c.phone.includes(s)) ||
        (c.city && c.city.toLowerCase().includes(s)) ||
        (c.email && c.email.toLowerCase().includes(s))
      );
    });
  }, [customers, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Email', 'City', 'Total Orders', 'Total Spent (LKR)', 'Last Order Date', 'Status'];
    const rows = filtered.map((c) => [
      c.id,
      c.name,
      c.phone,
      c.email,
      c.city,
      c.totalOrders,
      c.totalSpent,
      c.lastOrderDate,
      c.status,
    ]);
    downloadCSV(`dwstore-customers-export-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    if (showNotification) {
      showNotification(`Exported ${filtered.length} customers to CSV successfully!`);
    }
  };

  const handleImportCSVData = (rows: string[][], headers: string[]) => {
    const lowerHeaders = headers.map((h) => h.trim().toLowerCase());
    const idIdx = lowerHeaders.findIndex((h) => h === 'id');
    const nameIdx = lowerHeaders.findIndex((h) => h.includes('name'));
    const phoneIdx = lowerHeaders.findIndex((h) => h.includes('phone'));
    const emailIdx = lowerHeaders.findIndex((h) => h.includes('email'));
    const cityIdx = lowerHeaders.findIndex((h) => h.includes('city'));
    const ordersIdx = lowerHeaders.findIndex((h) => h.includes('order'));
    const spentIdx = lowerHeaders.findIndex((h) => h.includes('spent') || h.includes('total'));
    const dateIdx = lowerHeaders.findIndex((h) => h.includes('date'));
    const statusIdx = lowerHeaders.findIndex((h) => h.includes('status'));

    const imported: CustomerItem[] = [];
    rows.forEach((row, idx) => {
      const name = nameIdx >= 0 && row[nameIdx] ? row[nameIdx].trim() : '';
      if (!name) return;
      const phone = phoneIdx >= 0 && row[phoneIdx] ? row[phoneIdx].trim() : '';
      const email = emailIdx >= 0 && row[emailIdx] ? row[emailIdx].trim() : `${phone || 'cust' + idx}@dwstore.lk`;
      const city = cityIdx >= 0 && row[cityIdx] ? row[cityIdx].trim() : 'Colombo';
      const totalOrders = ordersIdx >= 0 ? parseInt(row[ordersIdx]?.replace(/[^0-9]/g, '') || '1', 10) : 1;
      const totalSpent = spentIdx >= 0 ? parseFloat(row[spentIdx]?.replace(/[^0-9.]/g, '') || '0') || 0 : 0;
      const lastOrderDate = (dateIdx >= 0 && row[dateIdx]?.trim()) || new Date().toISOString().slice(0, 10);
      const rawStatus = (statusIdx >= 0 && row[statusIdx]?.trim()) || (totalSpent > 25000 ? 'VIP' : 'Active');
      const status = (['Active', 'VIP', 'New', 'Inactive'].includes(rawStatus) ? rawStatus : 'Active') as any;
      const id = (idIdx >= 0 && row[idIdx]?.trim()) || `cust-${Date.now().toString().slice(-4)}${idx}`;

      imported.push({
        id,
        name,
        phone,
        email,
        city,
        totalOrders,
        totalSpent,
        lastOrderDate,
        status,
      });
    });

    if (imported.length === 0) {
      throw new Error('No valid customer records found in CSV.');
    }

    if (onImportCustomers) {
      onImportCustomers(imported);
    }
  };

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1>Real Customer Directory ({customers.length} buyers)</h1>
          <p>Extracted from WooCommerce orders database with order count, total LKR spend & WhatsApp chat.</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button className="btn-soft d-flex align-items-center gap-1.5" onClick={handleExportCSV} type="button">
            <Download size={16} /> Export CSV ({filtered.length})
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

      <section className="row g-3 mb-4">
        <div className="col-6 col-xl-3">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#eef2fd', color: '#4f46e5' }}>
              <Users size={20} />
            </span>
            <div>
              <small>Total Customers</small>
              <b>{customers.length}</b>
              <span className="ms-note up">From 1,041 orders</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#ecf6ef', color: '#059669' }}>
              <Award size={20} />
            </span>
            <div>
              <small>VIP Repeat Buyers</small>
              <b>{vipCount}</b>
              <span className="ms-note up">&gt;Rs. 25,000 spend</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#fdf3ea', color: '#d97706' }}>
              <Users size={20} />
            </span>
            <div>
              <small>Total Customer Spend</small>
              <b>Rs. {totalSpentAll.toLocaleString()}</b>
              <span className="ms-note">Lifetime revenue</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#f6eff6', color: '#9333ea' }}>
              <MapPin size={20} />
            </span>
            <div>
              <small>Top Locations</small>
              <b>Colombo & Kandy</b>
              <span className="ms-note">Islandwide reach</span>
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
              placeholder="Search by customer name, phone, city, or email..."
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
            <option value="all">All Customers</option>
            <option value="VIP">VIP Buyers</option>
            <option value="Active">Active Customers</option>
          </select>
        </div>

        <div className="table-responsive">
          <table className="table-x">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>City</th>
                <th>Orders</th>
                <th>Total Spent (LKR)</th>
                <th>Status</th>
                <th className="text-end">WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    No customers match your search criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((c) => {
                  const cleanPhone = (c.phone || '').replace(/[^0-9]/g, '');
                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="cust">
                          <span className="mini-av" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                            {(c.name || 'CU').substring(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <b>{c.name}</b>
                            <small className="d-block text-muted">ID: #{c.id}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px' }}>{c.phone || 'No phone'}</div>
                        <small className="text-muted">{c.email || ''}</small>
                      </td>
                      <td>{c.city}</td>
                      <td>
                        <b>{c.totalOrders}</b> orders
                      </td>
                      <td>
                        <b className="text-primary">Rs. {c.totalSpent.toLocaleString()}</b>
                      </td>
                      <td>
                        <span
                          className={`badge-x ${
                            c.status === 'VIP'
                              ? 's-Delivered'
                              : c.status === 'Active'
                              ? 's-Processing'
                              : 's-Pending'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="text-end">
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                              `Hello ${c.name}, this is DWstore.lk!`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="icon-btn text-success"
                            style={{ width: '34px', height: '34px' }}
                            title="Message on WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="d-flex align-items-center justify-content-between pt-3 mt-3 border-top" style={{ borderColor: 'var(--border)' }}>
          <small className="text-muted">
            Showing <b>{(currentPage - 1) * pageSize + 1}</b> -{' '}
            <b>{Math.min(currentPage * pageSize, filtered.length)}</b> of <b>{filtered.length}</b> customers
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

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Customers Directory CSV"
        description="Upload a CSV file to bulk import customer records with contact details & order history."
        expectedColumns={['ID', 'Name', 'Phone', 'Email', 'City', 'Total Orders', 'Total Spent', 'Status']}
        sampleFilename="dwstore-sample-customers.csv"
        sampleHeaders={['ID', 'Name', 'Phone', 'Email', 'City', 'Total Orders', 'Total Spent (LKR)', 'Last Order Date', 'Status']}
        sampleRows={[
          ['cust-101', 'Abdul Muheed', '0721359138', 'muheed@gmail.com', 'Rajagiriya', 5, 28500, '2026-11-08', 'VIP'],
          ['cust-102', 'Sandun Fernando', '0772345678', 'sandun@gmail.com', 'Kandy', 2, 8500, '2026-11-06', 'Active'],
        ]}
        onImport={handleImportCSVData}
      />
    </div>
  );
};
