import React, { useState, useMemo } from 'react';
import { Truck, CheckCircle2, Clock, MapPin, ChevronLeft, ChevronRight, Search, RotateCw } from 'lucide-react';
import { ShipmentItem } from '../../types';

interface ShipmentsViewProps {
  shipments: ShipmentItem[];
  onSyncCourier?: () => Promise<void>;
  syncingCourier?: boolean;
}

export const ShipmentsView: React.FC<ShipmentsViewProps> = ({
  shipments,
  onSyncCourier,
  syncingCourier,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'In Transit' | 'Delivered'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const inTransitCount = shipments.filter((s) => s.status === 'In Transit').length;
  const deliveredCount = shipments.filter((s) => s.status === 'Delivered').length;

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return shipments.filter((shp) => {
      const matchesSearch =
        shp.orderId.toLowerCase().includes(s) ||
        shp.customerName.toLowerCase().includes(s) ||
        shp.trackingNumber.toLowerCase().includes(s) ||
        shp.destinationCity.toLowerCase().includes(s) ||
        shp.carrier.toLowerCase().includes(s);

      const matchesStatus = statusFilter === 'all' || shp.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [shipments, searchTerm, statusFilter]);

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
      <div className="page-head d-flex justify-content-between align-items-center">
        <div>
          <h1>Courier & Logistics Shipments ({shipments.length})</h1>
          <p>Real courier waybills dispatched exclusively via Koombiyo Delivery islandwide network.</p>
        </div>
        {onSyncCourier && (
          <button
            className="btn btn-primary d-flex align-items-center gap-1.5"
            onClick={onSyncCourier}
            type="button"
            disabled={syncingCourier}
            title="Auto-sync live delivery status with Koombiyo"
            style={{ fontSize: '13px', borderRadius: '10px', height: '36px' }}
          >
            <RotateCw size={14} className={syncingCourier ? 'animate-spin' : ''} />
            <span>{syncingCourier ? 'Syncing with Koombiyo...' : '⚡ Auto-Sync Live Status'}</span>
          </button>
        )}
      </div>

      <div className="card-x">
        {/* Status Filter Tabs */}
        <div className="tabs mb-3">
          <button
            type="button"
            className={statusFilter === 'all' ? 'on' : ''}
            onClick={() => {
              setStatusFilter('all');
              setCurrentPage(1);
            }}
          >
            All Shipments <em>{shipments.length}</em>
          </button>
          <button
            type="button"
            className={statusFilter === 'In Transit' ? 'on' : ''}
            onClick={() => {
              setStatusFilter('In Transit');
              setCurrentPage(1);
            }}
          >
            In Transit <em>{inTransitCount}</em>
          </button>
          <button
            type="button"
            className={statusFilter === 'Delivered' ? 'on' : ''}
            onClick={() => {
              setStatusFilter('Delivered');
              setCurrentPage(1);
            }}
          >
            Delivered <em>{deliveredCount}</em>
          </button>
        </div>

        <div className="ord-filters mb-3">
          <div className="search flex-grow-1">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by tracking number, order ID, or customer..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table-x">
            <thead>
              <tr>
                <th>Tracking Number</th>
                <th>Order Ref</th>
                <th>Recipient Name</th>
                <th>Courier Partner</th>
                <th>Destination City</th>
                <th>Status</th>
                <th className="text-end">Live Track</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    No shipments match your search.
                  </td>
                </tr>
              ) : (
                paginated.map((s) => {
                  const statusClass =
                    s.status === 'Delivered'
                      ? 's-Delivered'
                      : s.status === 'In Transit'
                      ? 's-Processing'
                      : 's-Pending';

                  const trackUrl = `http://localhost:3000/track-order?trackingId=${encodeURIComponent(s.trackingNumber)}${s.customerPhone ? `&phone=${encodeURIComponent(s.customerPhone)}` : ''}&orderId=${encodeURIComponent(s.orderId)}`;

                  return (
                    <tr key={s.id}>
                      <td>
                        <a
                          href={trackUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-monospace text-primary fw-bold text-decoration-none"
                          title="Track on DWstore Tracking Portal"
                        >
                          {s.trackingNumber}
                        </a>
                        <small className="d-block text-muted" style={{ fontSize: '11px' }}>Dispatched {s.dispatchedDate}</small>
                      </td>
                      <td>
                        <b>#{s.orderId}</b>
                      </td>
                      <td>
                        <div>{s.customerName}</div>
                        {s.customerPhone && (
                          <small className="text-muted font-monospace" style={{ fontSize: '11px' }}>
                            {s.customerPhone}
                          </small>
                        )}
                      </td>
                      <td>
                        <span className="badge-x s-Processing" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0284c7' }}></span>
                          Koombiyo Delivery
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <MapPin size={13} className="text-muted" /> {s.destinationCity}
                        </div>
                      </td>
                      <td>
                        <span className={`badge-x ${statusClass}`}>{s.status}</span>
                      </td>
                      <td className="text-end">
                        <a
                          href={trackUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline-primary"
                          style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px' }}
                        >
                          Track ↗
                        </a>
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
            <b>{Math.min(currentPage * pageSize, filtered.length)}</b> of <b>{filtered.length}</b> shipments
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
