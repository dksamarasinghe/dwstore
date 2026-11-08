import React from 'react';
import { Printer, X, Download, Package, MapPin, Phone, Truck, ShieldCheck } from 'lucide-react';
import { OrderItem } from '../../types';

interface WaybillSlipModalProps {
  orders: OrderItem[];
  onClose: () => void;
}

export const WaybillSlipModal: React.FC<WaybillSlipModalProps> = ({ orders, onClose }) => {
  if (!orders || orders.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  // Generate SVG barcode stripes deterministically from orderId
  const renderBarcode = (code: string) => {
    const clean = code.replace(/[^0-9A-Z]/gi, '');
    const bars: boolean[] = [];
    // Standard barcode pattern generator
    bars.push(true, false, true); // start guard
    for (let i = 0; i < clean.length; i++) {
      const charCode = clean.charCodeAt(i);
      for (let b = 0; b < 6; b++) {
        bars.push((charCode >> b) % 2 === 1);
        if (b % 2 === 1) bars.push(false);
      }
    }
    bars.push(true, false, true, true); // stop guard

    return (
      <div className="d-flex flex-column align-items-center">
        <svg
          height="46"
          width="100%"
          viewBox={`0 0 ${bars.length * 3} 46`}
          preserveAspectRatio="none"
          style={{ maxWidth: '240px' }}
        >
          {bars.map((isBlack, idx) =>
            isBlack ? (
              <rect
                key={idx}
                x={idx * 3}
                y="0"
                width="2.5"
                height="46"
                fill="#000"
              />
            ) : null
          )}
        </svg>
        <span
          className="font-monospace fw-bold mt-1"
          style={{ fontSize: '12px', letterSpacing: '3px', color: '#111' }}
        >
          *{code}*
        </span>
      </div>
    );
  };

  return (
    <>
      {/* Screen Backdrop & Container (hidden on print) */}
      <div className="react-modal-backdrop d-print-none" onClick={onClose}>
        <div
          className="card-x p-0 overflow-hidden"
          style={{ width: '100%', maxWidth: '820px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header Control Bar */}
          <div
            className="p-3 d-flex align-items-center justify-content-between border-bottom"
            style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
          >
            <div>
              <h5 className="m-0 d-flex align-items-center gap-2">
                <Truck size={20} className="text-primary" /> Courier Waybill Slip Preview
              </h5>
              <small className="text-muted">
                {orders.length === 1
                  ? `Waybill for Order #${orders[0].orderId}`
                  : `Batch of ${orders.length} Waybill Slips ready for courier dispatch`}
              </small>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn-dark-x d-flex align-items-center gap-2"
                style={{ height: '38px', padding: '0 16px', background: '#4f46e5', borderColor: '#4338ca' }}
                onClick={handlePrint}
              >
                <Printer size={16} /> Print {orders.length === 1 ? 'Waybill Slip' : `All (${orders.length}) Slips`}
              </button>
              <button
                type="button"
                className="icon-btn"
                style={{ width: '36px', height: '36px' }}
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable Waybills Preview Area */}
          <div
            className="p-4 overflow-y-auto"
            style={{
              background: '#e2e8f0',
              flex: 1,
            }}
          >
            <div className="d-flex flex-column gap-4 align-items-center">
              {orders.map((order, index) => {
                const isPaid = order.paymentStatus === 'Paid';
                const totalAmount = order.total || 0;
                const cleanPhone = order.customerPhone || '';

                return (
                  <div
                    key={order.orderId || index}
                    className="waybill-slip bg-white text-dark p-4 rounded-2 shadow-sm"
                    style={{
                      width: '100%',
                      maxWidth: '650px',
                      color: '#0f172a',
                      fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      border: '2px solid #000',
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* Top Dispatcher & Barcode Row */}
                    <div className="row g-2 align-items-center pb-3 border-bottom border-2 border-dark">
                      <div className="col-7">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <div
                            style={{
                              background: '#0f172a',
                              color: '#fff',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontWeight: 900,
                              fontSize: '14px',
                              letterSpacing: '0.05em',
                            }}
                          >
                            DWSTORE
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#4338ca' }}>
                            PRIORITY EXPRESS
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', lineHeight: '1.4', color: '#334155' }}>
                          <b>Sender Hub:</b> DWstore.lk Showroom & Fulfillment Hub<br />
                          No.55/1/2, Borella road, Pannipitiya<br />
                          <b>Hotline / WhatsApp:</b> +94 75 669 3358
                        </div>
                      </div>
                      <div className="col-5 text-end">
                        {renderBarcode(order.orderId)}
                        <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>
                          WAYBILL REF: {order.orderId}
                        </div>
                      </div>
                    </div>

                    {/* Destination Banner */}
                    <div
                      className="d-flex align-items-center justify-content-between my-2 p-2 px-3 border border-2 border-dark"
                      style={{ background: '#f1f5f9' }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <MapPin size={18} className="text-dark" />
                        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                          DESTINATION CITY / DISTRICT:
                        </span>
                      </div>
                      <b style={{ fontSize: '18px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        {order.city || 'COLOMBO'}
                      </b>
                    </div>

                    {/* Customer Deliver To Section */}
                    <div className="row g-2 py-2 border-bottom border-2 border-dark">
                      <div className="col-12">
                        <small
                          className="d-block text-uppercase fw-bold text-muted mb-1"
                          style={{ fontSize: '10px', letterSpacing: '0.08em' }}
                        >
                          CONSIGNEE (DELIVER TO):
                        </small>
                        <h4 className="fw-bolder mb-1" style={{ fontSize: '20px', color: '#0f172a' }}>
                          {order.customerName}
                        </h4>
                        <div className="fw-bold mb-1" style={{ fontSize: '14px', color: '#0f172a' }}>
                          {order.shippingAddress}
                          {order.postalCode ? `, ${order.postalCode}` : ''}
                        </div>
                        <div className="d-flex flex-wrap align-items-center gap-3 mt-2">
                          <span
                            className="d-flex align-items-center gap-1 border border-2 border-dark px-2 py-1 rounded"
                            style={{ background: '#fef08a', fontSize: '14px', fontWeight: 800 }}
                          >
                            <Phone size={14} /> TEL: {cleanPhone || 'Not Available'}
                          </span>
                          {order.customerEmail && (
                            <span style={{ fontSize: '12px', color: '#475569' }}>
                              Email: {order.customerEmail}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Payment / COD Collection Box - THE MOST CRITICAL PART */}
                    <div className="row g-2 my-2 align-items-stretch">
                      <div className="col-7">
                        <div
                          className="p-3 border border-3 border-dark rounded h-100 d-flex flex-column justify-content-center"
                          style={{
                            background: isPaid ? '#dcfce7' : '#fee2e2',
                            borderColor: isPaid ? '#15803d' : '#b91c1c',
                          }}
                        >
                          <small
                            className="d-block text-uppercase fw-bolder mb-1"
                            style={{ fontSize: '11px', color: isPaid ? '#166534' : '#991b1b', letterSpacing: '0.05em' }}
                          >
                            {isPaid ? '✔ PAYMENT VERIFIED (PREPAID)' : '⚠ CASH ON DELIVERY (COD) COLLECTION:'}
                          </small>
                          {isPaid ? (
                            <div>
                              <b style={{ fontSize: '20px', color: '#166534' }}>DO NOT COLLECT CASH</b>
                              <small className="d-block text-muted" style={{ fontSize: '11px' }}>
                                Fully Settled via {order.paymentMethod || 'Online Payment'}
                              </small>
                            </div>
                          ) : (
                            <div>
                              <b style={{ fontSize: '24px', color: '#b91c1c' }}>
                                Rs. {totalAmount.toLocaleString()}
                              </b>
                              <small className="d-block" style={{ fontSize: '11px', color: '#7f1d1d', fontWeight: 600 }}>
                                Exact Cash Collection required upon handover
                              </small>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-5">
                        <div className="p-2 border border-2 border-dark rounded h-100 d-flex flex-column justify-content-between" style={{ background: '#f8fafc', fontSize: '11px' }}>
                          <div>
                            <div className="d-flex justify-content-between mb-1">
                              <span className="text-muted">Order Date:</span>
                              <b>{order.createdAt?.slice(0, 10)}</b>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                              <span className="text-muted">Weight:</span>
                              <b>0.50 kg</b>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                              <span className="text-muted">Pieces:</span>
                              <b>{order.items?.length || 1} pkg</b>
                            </div>
                          </div>
                          <div className="pt-1 border-top border-dark" style={{ fontSize: '10px' }}>
                            <span>Partner: <b>DW Express / Koombiyo</b></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Items Summary */}
                    <div className="my-2 p-2 border border-dark rounded" style={{ background: '#f8fafc', fontSize: '11px' }}>
                      <div className="fw-bold mb-1 text-uppercase" style={{ fontSize: '10px', color: '#475569' }}>
                        Package Contents:
                      </div>
                      <div className="d-flex flex-column gap-1">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, i) => (
                            <div key={i} className="d-flex justify-content-between align-items-center">
                              <span className="text-truncate" style={{ maxWidth: '440px' }}>
                                • <b>{item.productTitle}</b>
                              </span>
                              <b className="font-monospace">Qty: {item.quantity}</b>
                            </div>
                          ))
                        ) : (
                          <div>• DWstore Smart Gadget Goods (Qty: 1)</div>
                        )}
                      </div>
                      {order.notes && (
                        <div className="mt-1 pt-1 border-top text-danger fw-bold" style={{ fontSize: '11px' }}>
                          Special Note: {order.notes}
                        </div>
                      )}
                    </div>

                    {/* Delivery Agent Instructions & Signature Box */}
                    <div className="row g-2 mt-2 pt-2 border-top border-2 border-dark" style={{ fontSize: '10px' }}>
                      <div className="col-8">
                        <b>COURIER INSTRUCTIONS:</b>
                        <ul className="m-0 p-0 ps-3 text-muted" style={{ lineHeight: '1.4' }}>
                          <li>Please phone the customer prior to delivery attempt.</li>
                          <li>Do NOT allow parcel opening before full COD settlement.</li>
                          <li>If unreachable, hold for 24h & contact DWstore hub hotline.</li>
                        </ul>
                      </div>
                      <div className="col-4 border-start border-dark ps-2">
                        <div className="text-center" style={{ height: '38px', borderBottom: '1px dashed #000' }} />
                        <div className="text-center mt-1" style={{ fontSize: '9px', fontWeight: 600 }}>
                          Receiver Signature & Date
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Pure Print-Only Viewport Styles (Triggers on window.print()) */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .waybill-slip, .waybill-slip * {
            visibility: visible;
          }
          .waybill-slip {
            position: relative;
            left: 0;
            top: 0;
            margin: 0 auto 30px auto !important;
            page-break-after: always;
            break-after: page;
            box-shadow: none !important;
            border: 2px solid #000 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .d-print-none, .sidebar, .topbar, .backdrop, header, nav, aside {
            display: none !important;
          }
          @page {
            size: auto;
            margin: 12mm;
          }
        }
      `}</style>
    </>
  );
};
