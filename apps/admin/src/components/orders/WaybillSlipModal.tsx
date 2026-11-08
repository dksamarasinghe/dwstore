import React from 'react';
import { Printer, X, Download, Receipt } from 'lucide-react';
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
    const clean = (code || 'DWS0000').replace(/[^0-9A-Z]/gi, '');
    const bars: boolean[] = [];
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
      <div className="d-flex flex-column align-items-center my-2">
        <svg
          height="38"
          width="100%"
          viewBox={`0 0 ${bars.length * 3} 38`}
          preserveAspectRatio="none"
          style={{ maxWidth: '200px' }}
        >
          {bars.map((isBlack, idx) =>
            isBlack ? (
              <rect
                key={idx}
                x={idx * 3}
                y="0"
                width="2.5"
                height="38"
                fill="#000"
              />
            ) : null
          )}
        </svg>
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            letterSpacing: '2px',
            color: '#111',
            fontWeight: 700,
            marginTop: '2px',
          }}
        >
          *{code}*
        </span>
      </div>
    );
  };

  const formatPrice = (val: number | undefined | null) => {
    return Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <>
      {/* Screen Backdrop & Modal Dialog (hidden on print) */}
      <div className="react-modal-backdrop d-print-none" onClick={onClose}>
        <div
          className="card-x p-0 overflow-hidden"
          style={{
            width: '100%',
            maxWidth: '560px',
            maxHeight: '94vh',
            display: 'flex',
            flexDirection: 'column',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Top Bar */}
          <div
            className="p-3 d-flex align-items-center justify-content-between border-bottom"
            style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
          >
            <div>
              <h5 className="m-0 d-flex align-items-center gap-2" style={{ fontSize: '15px' }}>
                <Receipt size={18} className="text-primary" /> Order Invoice & Waybill Slip
              </h5>
              <small className="text-muted">
                {orders.length === 1
                  ? `Invoice for Order #${orders[0].orderId}`
                  : `Batch of ${orders.length} Invoices ready for printing`}
              </small>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn-dark-x d-flex align-items-center gap-2"
                style={{ height: '36px', padding: '0 14px', background: '#0284c7', borderColor: '#0284c7' }}
                onClick={handlePrint}
              >
                <Printer size={15} /> Print {orders.length === 1 ? 'Invoice' : `All (${orders.length})`}
              </button>
              <button
                type="button"
                className="icon-btn"
                style={{ width: '34px', height: '34px' }}
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable Preview Area */}
          <div
            className="p-3 overflow-y-auto"
            style={{
              background: '#f1f5f9',
              flex: 1,
            }}
          >
            <div className="d-flex flex-column gap-4 align-items-center">
              {orders.map((order, orderIdx) => {
                const isPaid = order.paymentStatus === 'Paid';
                const subtotal = order.subtotal || order.total || 0;
                const shipping = order.shippingCost ?? 0;
                const total = order.total || subtotal + shipping;
                const orderDate = order.createdAt
                  ? new Date(order.createdAt).toISOString().slice(0, 10)
                  : new Date().toISOString().slice(0, 10);

                return (
                  <div
                    key={order.orderId || orderIdx}
                    className="tm_pos_invoice_wrap tm_receipt_print"
                  >
                    {/* Header: Logo, Company Name, Address, Contact */}
                    <div className="tm_pos_invoice_top">
                      <div className="tm_pos_company_logo">
                        <img
                          src="/dwstoreicon_logo.png"
                          alt="DWstore.lk"
                          onError={(e) => {
                            // Fallback to text if image not loaded
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="tm_pos_company_name">DWSTORE (PVT) LTD</div>
                      <div className="tm_pos_company_address">
                        No.55/1/2, Borella road, Pannipitiya, Sri Lanka
                      </div>
                      <div className="tm_pos_company_mobile">
                        Hotline: +94 75 669 3358 | Email: support@dwstore.lk
                      </div>
                    </div>

                    {/* Receipt Heading with Dashed Line */}
                    <div className="tm_pos_invoice_body">
                      <div className="tm_pos_invoice_heading">
                        <span>Retail Receipt / Waybill</span>
                      </div>

                      {/* Customer & Order Metadata List */}
                      <ul className="tm_list tm_style1">
                        <li>
                          <div className="tm_list_title">Name:</div>
                          <div className="tm_list_desc">{order.customerName || 'Customer'}</div>
                        </li>
                        <li className="text-right">
                          <div className="tm_list_title">Invoice No:</div>
                          <div className="tm_list_desc">{order.orderId}</div>
                        </li>
                        <li>
                          <div className="tm_list_title">Phone:</div>
                          <div className="tm_list_desc">{order.customerPhone || 'N/A'}</div>
                        </li>
                        <li className="text-right">
                          <div className="tm_list_title">Date:</div>
                          <div className="tm_list_desc">{orderDate}</div>
                        </li>
                        <li className="tm_list_full">
                          <div className="tm_list_title">Deliver To:</div>
                          <div className="tm_list_desc">
                            {order.shippingAddress}
                            {order.city ? `, ${order.city}` : ''}
                            {order.district ? `, ${order.district}` : ''}
                          </div>
                        </li>
                      </ul>

                      {/* Items Table */}
                      <table className="tm_pos_invoice_table">
                        <thead>
                          <tr>
                            <th style={{ width: '24px' }}>SL</th>
                            <th>Item</th>
                            <th style={{ textAlign: 'right' }}>Price</th>
                            <th style={{ textAlign: 'center', width: '32px' }}>Qty</th>
                            <th style={{ textAlign: 'right' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, idx) => (
                              <tr key={idx}>
                                <td>{idx + 1}.</td>
                                <td>
                                  <div style={{ fontWeight: 600, color: '#111' }}>
                                    {item.productTitle}
                                  </div>
                                  {item.productSku && (
                                    <div style={{ fontSize: '9.5px', color: '#777' }}>
                                      SKU: {item.productSku}
                                    </div>
                                  )}
                                </td>
                                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                  {formatPrice(item.price)}
                                </td>
                                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                <td style={{ textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                  {formatPrice((item.price || 0) * (item.quantity || 1))}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td>1.</td>
                              <td>DWstore Gadgets & Electronics</td>
                              <td style={{ textAlign: 'right' }}>{formatPrice(subtotal)}</td>
                              <td style={{ textAlign: 'center' }}>1</td>
                              <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                {formatPrice(subtotal)}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      {/* Calculations / Subtotal / Shipping / Total Breakdown */}
                      <div className="tm_bill_list">
                        <div className="tm_bill_list_in">
                          <div className="tm_bill_title">Sub-Total:</div>
                          <div className="tm_bill_value">LKR {formatPrice(subtotal)}</div>
                        </div>

                        <div className="tm_bill_list_in">
                          <div className="tm_bill_title">Shipping:</div>
                          <div className="tm_bill_value">
                            {shipping === 0 ? 'FREE' : `LKR ${formatPrice(shipping)}`}
                          </div>
                        </div>

                        <div className="tm_invoice_seperator" />

                        <div className="tm_bill_list_in">
                          <div className="tm_bill_title">Payment Method:</div>
                          <div className="tm_bill_value" style={{ textTransform: 'capitalize' }}>
                            {order.paymentMethod || 'COD'}
                          </div>
                        </div>

                        <div className="tm_bill_list_in">
                          <div className="tm_bill_title">Payment Status:</div>
                          <div
                            className="tm_bill_value"
                            style={{
                              fontWeight: 700,
                              color: isPaid ? '#15803d' : '#b91c1c',
                            }}
                          >
                            {isPaid ? 'PAID (Verified)' : 'UNPAID (Collect Cash)'}
                          </div>
                        </div>

                        <div className="tm_invoice_seperator" />

                        <div className="tm_bill_list_in">
                          <div className="tm_bill_title tm_bill_focus">
                            {isPaid ? 'Total Amount:' : 'Total Payable (COD):'}
                          </div>
                          <div className="tm_bill_value tm_bill_focus" style={{ fontSize: '14px', color: '#000' }}>
                            LKR {formatPrice(total)}
                          </div>
                        </div>
                      </div>

                      {/* Special Delivery Note if provided */}
                      {order.notes && (
                        <div
                          style={{
                            padding: '6px 8px',
                            background: '#fef2f2',
                            border: '1px dashed #ef4444',
                            borderRadius: '4px',
                            margin: '8px 0',
                            fontSize: '10px',
                            color: '#991b1b',
                          }}
                        >
                          <b>Note:</b> {order.notes}
                        </div>
                      )}

                      {/* Barcode for Courier / Handover Scanning */}
                      <div className="tm_pos_barcode_wrap">
                        {renderBarcode(order.orderId)}
                      </div>

                      {/* Footer notice */}
                      <div className="tm_pos_sample_text">
                        Thank you for your purchase with DWstore.lk!<br />
                        Please retain this receipt for warranty claims & service support.
                      </div>
                      <div className="tm_pos_invoice_footer">
                        Powered by DWstore.lk | All Rights Reserved
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Embedded CSS matching Waybill Slip template + Print Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        .tm_pos_invoice_wrap {
          width: 100%;
          max-width: 380px;
          margin: 0 auto;
          padding: 24px 20px;
          background-color: #ffffff;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
          border-radius: 8px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #444;
          font-size: 11.5px;
          line-height: 1.4em;
          box-sizing: border-box;
        }

        .tm_pos_company_logo {
          display: flex;
          justify-content: center;
          margin-bottom: 8px;
        }

        .tm_pos_company_logo img {
          max-height: 52px;
          width: 52px;
          object-fit: contain;
          border-radius: 8px;
        }

        .tm_pos_invoice_top {
          text-align: center;
          margin-bottom: 12px;
        }

        .tm_pos_company_name {
          font-weight: 700;
          color: #111;
          font-size: 14px;
          line-height: 1.3em;
          letter-spacing: -0.01em;
        }

        .tm_pos_company_address,
        .tm_pos_company_mobile {
          font-size: 10.5px;
          color: #666;
          margin-top: 2px;
        }

        .tm_pos_invoice_heading {
          display: flex;
          justify-content: center;
          position: relative;
          text-transform: uppercase;
          font-size: 11px;
          font-weight: 700;
          margin: 12px 0 10px 0;
          letter-spacing: 0.04em;
        }

        .tm_pos_invoice_heading:before {
          content: '';
          position: absolute;
          height: 0;
          width: 100%;
          left: 0;
          top: 50%;
          border-top: 1px dashed #777;
        }

        .tm_pos_invoice_heading span {
          display: inline-flex;
          padding: 0 8px;
          background-color: #fff;
          z-index: 1;
          font-weight: 700;
          position: relative;
          color: #111;
        }

        .tm_list.tm_style1 {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-wrap: wrap;
        }

        .tm_list.tm_style1 li {
          display: flex;
          width: 50%;
          font-size: 11px;
          line-height: 1.3em;
          margin-bottom: 6px;
        }

        .tm_list.tm_style1 li.tm_list_full {
          width: 100%;
        }

        .tm_list.tm_style1 .text-right {
          text-align: right;
          justify-content: flex-end;
        }

        .tm_list_title {
          color: #111;
          margin-right: 4px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .tm_list_desc {
          color: #333;
          word-break: break-word;
        }

        .tm_invoice_seperator {
          width: 130px;
          border-top: 1px dashed #888;
          margin: 6px 0 6px auto;
        }

        .tm_pos_invoice_table {
          width: 100%;
          margin-top: 8px;
          line-height: 1.3em;
          border-collapse: collapse;
          font-size: 11px;
        }

        .tm_pos_invoice_table thead th {
          font-weight: 700;
          color: #111;
          text-align: left;
          padding: 6px 3px;
          border-top: 1px dashed #666;
          border-bottom: 1px dashed #666;
        }

        .tm_pos_invoice_table td {
          padding: 5px 3px;
          vertical-align: top;
        }

        .tm_pos_invoice_table tbody tr:first-child td {
          padding-top: 8px;
        }

        .tm_pos_invoice_table tbody tr:last-child td {
          padding-bottom: 8px;
          border-bottom: 1px dashed #666;
        }

        .tm_bill_list {
          list-style: none;
          margin: 0;
          padding: 8px 0;
          border-bottom: 1px dashed #666;
        }

        .tm_bill_list_in {
          display: flex;
          text-align: right;
          justify-content: flex-end;
          padding: 2.5px 0;
          font-size: 11px;
        }

        .tm_bill_title {
          padding-right: 16px;
          color: #555;
        }

        .tm_bill_value {
          width: 130px;
          color: #111;
        }

        .tm_bill_value.tm_bill_focus,
        .tm_bill_title.tm_bill_focus {
          font-weight: 700;
          color: #111;
          font-size: 12.5px;
        }

        .tm_pos_barcode_wrap {
          text-align: center;
          padding: 8px 0 4px 0;
        }

        .tm_pos_sample_text {
          text-align: center;
          padding: 8px 0;
          border-top: 1px dashed #888;
          border-bottom: 1px dashed #888;
          line-height: 1.4em;
          color: #666;
          font-size: 10px;
          margin-top: 6px;
        }

        .tm_pos_invoice_footer {
          text-align: center;
          margin-top: 10px;
          font-size: 9.5px;
          color: #888;
        }

        /* Pure Print Viewport Styles */
        @media print {
          body * {
            visibility: hidden !important;
          }
          .tm_receipt_print,
          .tm_receipt_print * {
            visibility: visible !important;
          }
          .tm_receipt_print {
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            margin: 0 auto 20px auto !important;
            page-break-after: always;
            break-after: page;
            box-shadow: none !important;
            border: 1px solid #ddd !important;
            width: 100% !important;
            max-width: 380px !important;
            background: #fff !important;
            padding: 20px !important;
          }
          .d-print-none,
          .react-modal-backdrop,
          .sidebar,
          .topbar,
          header,
          nav,
          aside {
            display: none !important;
          }
          @page {
            size: auto;
            margin: 8mm;
          }
        }
      `}</style>
    </>
  );
};
