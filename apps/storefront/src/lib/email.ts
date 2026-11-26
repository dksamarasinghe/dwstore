import { formatPriceLKR } from '@/lib/catalog';
import { readDataJson } from '@/lib/data-paths';

interface OrderItem {
  id?: string | number;
  productId?: string | number;
  name?: string;
  productTitle?: string;
  quantity: number;
  priceMinor: number;
  price?: number;
  variation?: {
    attributes?: Record<string, string>;
  };
  attributes?: Record<string, string>;
  variationText?: string;
}

interface OrderData {
  orderId: string;
  createdAt: string;
  customer?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    altPhone?: string;
    email?: string;
    address?: string;
    city?: string;
    district?: string;
    postalCode?: string;
    orderNotes?: string;
  };
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  shippingAddress?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  notes?: string;
  items: OrderItem[];
  subtotalMinor?: number;
  shippingFeeMinor?: number;
  totalMinor?: number;
  subtotal?: number;
  shippingCost?: number;
  total?: number;
  paymentMethod?: string;
  paymentStatus?: string;
}

/**
 * Generate responsive, modern HTML email template for the Customer
 */
export function generateCustomerEmailHtml(order: OrderData): string {
  const customerName =
    (order.customer
      ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
      : '') ||
    order.customerName ||
    'Valued Customer';

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('en-US');

  const rawPm = String(order.paymentMethod || '').toLowerCase();
  const isOnlineGateway =
    rawPm.includes('koko') ||
    rawPm.includes('payzy') ||
    rawPm.includes('card') ||
    rawPm.includes('payhere') ||
    rawPm.includes('mintpay') ||
    rawPm.includes('visa') ||
    rawPm.includes('master');
  const isBankTransfer = rawPm.includes('bank');
  const isCod = rawPm.includes('cod') || rawPm.includes('cash');
  const isPaid = String(order.paymentStatus || '').toLowerCase() === 'paid';

  const totalMinor =
    order.totalMinor || (order.total ? Math.round(order.total * 100) : 0);
  const subtotalMinor =
    order.subtotalMinor ||
    (order.subtotal ? Math.round(order.subtotal * 100) : totalMinor);
  const shippingFeeMinor =
    order.shippingFeeMinor !== undefined
      ? order.shippingFeeMinor
      : order.shippingCost !== undefined
      ? Math.round(order.shippingCost * 100)
      : 35000;

  const itemsHtml = (order.items || [])
    .map((item) => {
      let varStr = '';
      if (item.variation?.attributes && typeof item.variation.attributes === 'object') {
        varStr = Object.entries(item.variation.attributes)
          .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: <strong>${v}</strong>`)
          .join(' | ');
      } else if (item.attributes && typeof item.attributes === 'object') {
        varStr = Object.entries(item.attributes)
          .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: <strong>${v}</strong>`)
          .join(' | ');
      } else if (item.variationText) {
        varStr = `<strong>${item.variationText}</strong>`;
      }
      const varText = varStr ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">${varStr}</div>` : '';
      const priceVal =
        typeof item.priceMinor === 'number'
          ? item.priceMinor
          : typeof item.price === 'number'
          ? Math.round(item.price * 100)
          : 0;
      const itemSubtotal = formatPriceLKR(priceVal * (item.quantity || 1));
      const displayName = item.name || item.productTitle || 'Product';

      return `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 12px 8px; vertical-align: top;">
          <strong style="color: #0f172a; font-size: 13px;">${displayName}</strong>
          ${varText}
          <div style="font-size: 11px; color: #94a3b8; margin-top: 3px;">Qty: ${item.quantity || 1} &times; LKR ${formatPriceLKR(priceVal)}</div>
        </td>
        <td style="padding: 12px 8px; text-align: right; vertical-align: top; font-weight: 700; color: #0f172a; font-size: 13px; font-family: monospace;">
          LKR ${itemSubtotal}
        </td>
      </tr>`;
    })
    .join('');

  // Determine Banner Badge and Status Message based on payment method and paymentStatus
  let statusBadgeHtml = '';
  let statusHeading = '';
  let statusNoticeBoxHtml = '';

  if (isPaid) {
    statusBadgeHtml = `
      <div style="display: inline-block; background-color: #ecfdf5; color: #059669; padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px; border: 1px solid #a7f3d0;">
        ✓ Payment Confirmed &amp; Paid
      </div>`;
    statusHeading = `Payment Received &amp; Order Confirmed, ${customerName}!`;
    statusNoticeBoxHtml = `
      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; margin: 16px 0; color: #065f46; font-size: 13px; line-height: 1.6;">
        <strong>Payment Status: PAID</strong><br>
        We have verified and received your payment of <strong>LKR ${formatPriceLKR(totalMinor)}</strong> via <strong>${order.paymentMethod || 'Online Payment'}</strong>.<br>
        Your order is now confirmed and our dispatch team is preparing your parcel for island-wide delivery.
      </div>`;
  } else if (isOnlineGateway) {
    // Online gateway selected, but payment is NOT completed / Unpaid
    statusBadgeHtml = `
      <div style="display: inline-block; background-color: #fef2f2; color: #dc2626; padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px; border: 1px solid #fecaca;">
        ⚠️ Payment Unsuccessful / Pending
      </div>`;
    statusHeading = `Action Required: Payment Not Completed, ${customerName}`;
    statusNoticeBoxHtml = `
      <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 16px; margin: 16px 0; color: #9f1239; font-size: 13px; line-height: 1.6;">
        <strong>⚠️ Online Payment Not Received:</strong><br>
        You selected <strong>${order.paymentMethod || 'Online Gateway'}</strong>, but the transaction was <strong>not completed or was unsuccessful</strong>. Your order is currently on hold (Unpaid).<br><br>
        <strong>What to do next:</strong><br>
        1. <strong>Retry Payment or Switch to Cash on Delivery:</strong> Contact our team on WhatsApp to confirm delivery via COD, or place a new order on our website.<br>
        2. <strong>Bank Transfer:</strong> You can also transfer the amount to our bank account below and send us the slip to release your parcel.<br><br>
        💬 <strong>Quick WhatsApp Support:</strong> <a href="https://wa.me/94756693358?text=${encodeURIComponent(`Hello DWstore, I attempted to place order #${order.orderId} via ${order.paymentMethod || 'Online Gateway'}. Please assist me with payment/delivery.`)}" style="color: #be123c; font-weight: bold; text-decoration: underline;">Click here to chat on WhatsApp (+94 75 669 3358)</a>
      </div>`;
  } else if (isBankTransfer) {
    statusBadgeHtml = `
      <div style="display: inline-block; background-color: #eff6ff; color: #2563eb; padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px; border: 1px solid #bfdbfe;">
        🏦 Bank Transfer (Payment Pending)
      </div>`;
    statusHeading = `Order Received: Bank Deposit Required, ${customerName}`;
    statusNoticeBoxHtml = `
      <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 16px; margin: 16px 0; color: #0369a1; font-size: 13px; line-height: 1.6;">
        <strong>Official Bank Deposit Details:</strong><br>
        Please deposit or transfer the total amount <strong>LKR ${formatPriceLKR(totalMinor)}</strong> to our official bank account below and send the deposit slip via WhatsApp to <strong>+94 75 669 3358</strong>.<br><br>
        &bull; <strong>Bank:</strong> Commercial Bank<br>
        &bull; <strong>Account Name:</strong> DW Store (Pvt) Ltd<br>
        &bull; <strong>Account Number:</strong> 8010052341<br>
        &bull; <strong>Branch:</strong> Pannipitiya<br><br>
        <em>Once your slip is verified by our finance team, your order status will be marked as "Paid" and dispatched immediately.</em>
      </div>`;
  } else {
    // Default: Cash on Delivery (COD) - Unpaid initially until delivered
    statusBadgeHtml = `
      <div style="display: inline-block; background-color: #f0fdf4; color: #16a34a; padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px; border: 1px solid #bbf7d0;">
        💵 Cash on Delivery (Pay on Receipt)
      </div>`;
    statusHeading = `Order Placed: Cash on Delivery Confirmed, ${customerName}!`;
    statusNoticeBoxHtml = `
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 16px 0; color: #166534; font-size: 13px; line-height: 1.6;">
        <strong>Cash on Delivery (Payment Status: Unpaid):</strong><br>
        Your order <strong>#${order.orderId}</strong> has been placed under Cash on Delivery.<br>
        Please have the exact cash amount <strong>LKR ${formatPriceLKR(totalMinor)}</strong> ready for the courier rider upon delivery.<br>
        Our dispatch team will contact you via phone/WhatsApp prior to delivery.
      </div>`;
  }

  const customerAddr =
    order.customer?.address || order.shippingAddress || '';
  const customerCity =
    order.customer?.city || order.city || 'Colombo';
  const customerDistrict =
    order.customer?.district || order.district || '';
  const customerPostal =
    order.customer?.postalCode || order.postalCode || '';
  const customerPhone =
    order.customer?.phone || order.customerPhone || '';
  const customerEmail =
    order.customer?.email || order.customerEmail || '';
  const orderNotes =
    order.customer?.orderNotes || order.notes || '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order #${order.orderId} - DWstore.lk</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;" cellspacing="0" cellpadding="0">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #000000; padding: 32px 30px; text-align: center;">
              <a href="https://dwstore.lk" target="_blank" style="text-decoration: none; display: inline-block;">
                <img
                  src="https://dwstore.lk/dwstore_logo_white.png"
                  alt="DWstore.lk"
                  width="200"
                  style="display: block; margin: 0 auto 12px auto; max-width: 200px; width: 100%; height: auto; border: 0;"
                />
              </a>
              <p style="color: #94a3b8; font-size: 11px; margin: 0; letter-spacing: 1px; font-weight: 600; text-transform: uppercase;">
                Official Order Notification &bull; Sri Lanka's Trusted Tech Store
              </p>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding: 28px 30px 10px 30px;">
              ${statusBadgeHtml}
              <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin: 0 0 10px 0;">
                ${statusHeading}
              </h2>
              ${statusNoticeBoxHtml}
            </td>
          </tr>

          <!-- Order Summary Card -->
          <tr>
            <td style="padding: 10px 30px 20px 30px;">
              <table role="presentation" width="100%" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 16px;" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-size: 12px; color: #64748b; padding: 4px 8px;">Order ID:</td>
                  <td style="font-size: 13px; font-weight: 800; color: #1e40af; text-align: right; padding: 4px 8px; font-family: monospace;">#${order.orderId}</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #64748b; padding: 4px 8px;">Order Date:</td>
                  <td style="font-size: 12px; font-weight: 600; color: #334155; text-align: right; padding: 4px 8px;">${orderDate}</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #64748b; padding: 4px 8px;">Payment Method:</td>
                  <td style="font-size: 12px; font-weight: 700; color: #334155; text-align: right; padding: 4px 8px; text-transform: uppercase;">${order.paymentMethod || 'Cash on Delivery'}</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #64748b; padding: 4px 8px;">Payment Status:</td>
                  <td style="font-size: 12px; font-weight: 800; color: ${isPaid ? '#059669' : '#dc2626'}; text-align: right; padding: 4px 8px; text-transform: uppercase;">${isPaid ? 'PAID' : 'UNPAID'}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 10px 30px;">
              <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                Ordered Items (${(order.items || []).length})
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 2px solid #e2e8f0; background-color: #f8fafc;">
                    <th style="padding: 8px; text-align: left; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Product</th>
                    <th style="padding: 8px; text-align: right; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Pricing Totals -->
          <tr>
            <td style="padding: 10px 30px 20px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 10px;">
                <tr>
                  <td style="padding: 6px 8px; font-size: 12px; color: #64748b;">Subtotal:</td>
                  <td style="padding: 6px 8px; font-size: 12px; text-align: right; font-weight: 700; color: #334155; font-family: monospace;">LKR ${formatPriceLKR(subtotalMinor)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 8px; font-size: 12px; color: #64748b;">Island-wide Delivery:</td>
                  <td style="padding: 6px 8px; font-size: 12px; text-align: right; font-weight: 700; color: #334155; font-family: monospace;">
                    ${shippingFeeMinor === 0 ? '<span style="color: #059669;">FREE</span>' : `LKR ${formatPriceLKR(shippingFeeMinor)}`}
                  </td>
                </tr>
                <tr style="border-top: 2px solid #e2e8f0;">
                  <td style="padding: 12px 8px; font-size: 15px; font-weight: 900; color: #0f172a;">Grand Total:</td>
                  <td style="padding: 12px 8px; font-size: 16px; text-align: right; font-weight: 900; color: #2563eb; font-family: monospace;">LKR ${formatPriceLKR(totalMinor)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Delivery & Billing Address -->
          <tr>
            <td style="padding: 10px 30px 25px 30px;">
              <table role="presentation" width="100%" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 16px;" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase;">
                      📍 Delivery Address &amp; Customer Info
                    </h4>
                    <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.6;">
                      <strong>${customerName}</strong><br>
                      ${customerAddr}<br>
                      ${customerCity}${customerDistrict ? `, ${customerDistrict}` : ''} ${customerPostal}<br>
                      <strong>Phone:</strong> ${customerPhone}<br>
                      ${customerEmail ? `<strong>Email:</strong> ${customerEmail}` : ''}
                      ${orderNotes ? `<br><br><em>Note: ${orderNotes}</em>` : ''}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Help & Contact CTA -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #475569; font-weight: 600;">
                Need help or have questions regarding your order?
              </p>
              <div>
                <a href="https://wa.me/94756693358" style="display: inline-block; background-color: #059669; color: #ffffff; padding: 10px 20px; border-radius: 10px; font-size: 12px; font-weight: 700; text-decoration: none; margin: 4px;">
                  💬 WhatsApp Support: +94 75 669 3358
                </a>
                <a href="tel:+94756693358" style="display: inline-block; background-color: #1e293b; color: #ffffff; padding: 10px 20px; border-radius: 10px; font-size: 12px; font-weight: 700; text-decoration: none; margin: 4px;">
                  📞 Call Hotline: +94 75 669 3358
                </a>
              </div>
              <p style="margin: 16px 0 0 0; font-size: 11px; color: #94a3b8;">
                DWstore.lk Showroom: No.55/1/2, Borella road, Pannipitiya &bull; <a href="https://www.dwstore.lk" style="color: #2563eb; text-decoration: none;">www.dwstore.lk</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate admin notification HTML email template
 */
export function generateAdminEmailHtml(order: OrderData): string {
  const customerName =
    (order.customer
      ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
      : '') ||
    order.customerName ||
    'New Customer';
  const customerPhone = order.customer?.phone || order.customerPhone || '';
  const cleanPhone = customerPhone.replace(/[^0-9]/g, '');

  const rawPm = String(order.paymentMethod || '').toLowerCase();
  const isOnlineGateway =
    rawPm.includes('koko') ||
    rawPm.includes('payzy') ||
    rawPm.includes('card') ||
    rawPm.includes('payhere') ||
    rawPm.includes('mintpay') ||
    rawPm.includes('visa') ||
    rawPm.includes('master');
  const isPaid = String(order.paymentStatus || '').toLowerCase() === 'paid';
  const isBank = rawPm.includes('bank');

  const totalMinor =
    order.totalMinor || (order.total ? Math.round(order.total * 100) : 0);
  const subtotalMinor =
    order.subtotalMinor ||
    (order.subtotal ? Math.round(order.subtotal * 100) : totalMinor);
  const shippingFeeMinor =
    order.shippingFeeMinor !== undefined
      ? order.shippingFeeMinor
      : order.shippingCost !== undefined
      ? Math.round(order.shippingCost * 100)
      : 35000;

  const itemsList = (order.items || [])
    .map((i) => {
      let varStr = '';
      if (i.variation?.attributes && typeof i.variation.attributes === 'object') {
        varStr = Object.entries(i.variation.attributes)
          .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
          .join(', ');
      } else if (i.attributes && typeof i.attributes === 'object') {
        varStr = Object.entries(i.attributes)
          .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
          .join(', ');
      } else if (i.variationText) {
        varStr = i.variationText;
      }
      const varBadge = varStr
        ? ` <span style="background: #e2e8f0; color: #334155; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600;">(${varStr})</span>`
        : '';
      const priceVal =
        typeof i.priceMinor === 'number'
          ? i.priceMinor
          : typeof i.price === 'number'
          ? Math.round(i.price * 100)
          : 0;
      const displayName = i.name || i.productTitle || 'Product';
      return `<li style="margin-bottom: 6px;"><strong>${displayName}</strong>${varBadge} &times; ${i.quantity || 1} (LKR ${formatPriceLKR(priceVal * (i.quantity || 1))})</li>`;
    })
    .join('');

  let adminAlertStatus = '';
  if (isPaid) {
    adminAlertStatus = `<span style="background: #10b981; color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold;">PAID (${order.paymentMethod})</span>`;
  } else if (isOnlineGateway) {
    adminAlertStatus = `<span style="background: #ef4444; color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold;">UNPAID / ABANDONED ONLINE (${order.paymentMethod})</span>`;
  } else if (isBank) {
    adminAlertStatus = `<span style="background: #3b82f6; color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold;">UNPAID (Pending Bank Slip)</span>`;
  } else {
    adminAlertStatus = `<span style="background: #f59e0b; color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold;">UNPAID (Cash on Delivery)</span>`;
  }

  const customerAddr = order.customer?.address || order.shippingAddress || '';
  const customerCity = order.customer?.city || order.city || 'Colombo';
  const customerDistrict = order.customer?.district || order.district || '';
  const customerEmail = order.customer?.email || order.customerEmail || 'None provided';
  const orderNotes = order.customer?.orderNotes || order.notes || 'None';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; color: #1e293b; line-height: 1.6; padding: 20px; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.05);">
    <div style="background-color: #000000; padding: 24px 20px; text-align: center;">
      <a href="https://dwstore.lk" target="_blank" style="text-decoration: none; display: inline-block;">
        <img
          src="https://dwstore.lk/dwstore_logo_white.png"
          alt="DWstore.lk"
          width="180"
          style="display: block; margin: 0 auto; max-width: 180px; width: 100%; height: auto; border: 0;"
        />
      </a>
      <p style="color: #94a3b8; font-size: 11px; margin: 8px 0 0 0; letter-spacing: 1px; font-weight: 600; text-transform: uppercase;">
        Store Admin Alert &bull; Sri Lanka's Trusted Tech Store
      </p>
    </div>
    <div style="padding: 24px;">
      <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">
        Order #${order.orderId} Notification
      </h2>
      <div style="margin-bottom: 16px;">
        Payment Status: ${adminAlertStatus}
      </div>
    
      <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h3 style="margin-top: 0; font-size: 14px;">Customer & Delivery Details:</h3>
        <p style="margin: 0; font-size: 13px;">
          <strong>Customer:</strong> ${customerName}<br>
          <strong>Phone:</strong> <a href="tel:${customerPhone}">${customerPhone}</a><br>
          <strong>WhatsApp:</strong> <a href="https://wa.me/${cleanPhone}">Chat on WhatsApp</a><br>
          <strong>Email:</strong> ${customerEmail}<br>
          <strong>Address:</strong> ${customerAddr}, ${customerCity}${customerDistrict ? `, ${customerDistrict}` : ''}<br>
          <strong>Notes:</strong> ${orderNotes}
        </p>
      </div>

      <h3 style="font-size: 14px;">Ordered Items (${(order.items || []).length}):</h3>
      <ul style="font-size: 13px;">
        ${itemsList}
      </ul>

      <table style="width: 100%; border-top: 2px solid #e2e8f0; padding-top: 8px; margin-top: 12px; font-size: 13px;">
        <tr><td>Subtotal:</td><td align="right">LKR ${formatPriceLKR(subtotalMinor)}</td></tr>
        <tr><td>Delivery:</td><td align="right">LKR ${formatPriceLKR(shippingFeeMinor)}</td></tr>
        <tr><td><strong>Grand Total:</strong></td><td align="right"><strong>LKR ${formatPriceLKR(totalMinor)}</strong></td></tr>
        <tr><td>Payment Method:</td><td align="right"><strong>${(order.paymentMethod || 'COD').toUpperCase()}</strong></td></tr>
        <tr><td>Payment Status:</td><td align="right"><strong>${(order.paymentStatus || 'UNPAID').toUpperCase()}</strong></td></tr>
      </table>

      <div style="margin-top: 24px; text-align: center;">
        <a href="https://dwstore.lk/sudo-sudo/admin" style="background: #2563eb; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">
          Open in DWstore Admin Dashboard
        </a>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Dispatch initial order emails via Resend REST API
 */
export async function sendOrderEmails(order: any) {
  const emailConfig = readDataJson<any>('email-config.json', null) || {};
  const apiKey = emailConfig.resendApiKey || process.env.RESEND_API_KEY;
  const adminEmail = emailConfig.adminEmail || process.env.ADMIN_NOTIFICATION_EMAIL || 'support@dwstore.lk';
  const rawFrom = emailConfig.fromEmail || process.env.RESEND_FROM_EMAIL || 'DWstore.lk <orders@dwstore.lk>';
  const fromEmail =
    rawFrom.toLowerCase().includes('@gmail.com') ||
    rawFrom.toLowerCase().includes('@yahoo.com') ||
    !rawFrom.includes('@dwstore.lk')
      ? 'DWstore.lk <orders@dwstore.lk>'
      : rawFrom;
  const customerNotifyEnabled = emailConfig.customerEmailNotifications !== false;
  const adminNotifyEnabled = emailConfig.adminEmailNotifications !== false;

  if (!apiKey) {
    console.log(
      `[Resend Info] RESEND_API_KEY is not set. Order #${order.orderId} email logged.`
    );
    return {
      success: false,
      message: 'RESEND_API_KEY not configured.',
    };
  }

  const results: { customerEmailSent?: boolean; adminEmailSent?: boolean; errors: any[] } = {
    errors: [],
  };

  const rawPm = String(order.paymentMethod || '').toLowerCase();
  const isOnlineGateway =
    rawPm.includes('koko') ||
    rawPm.includes('payzy') ||
    rawPm.includes('card') ||
    rawPm.includes('payhere') ||
    rawPm.includes('mintpay') ||
    rawPm.includes('visa') ||
    rawPm.includes('master');
  const isPaid = String(order.paymentStatus || '').toLowerCase() === 'paid';
  const isBank = rawPm.includes('bank');

  // Customer subject line
  let customerSubject = `Order Confirmed #${order.orderId} - DWstore.lk`;
  if (isPaid) {
    customerSubject = `✅ Payment Received & Order Confirmed #${order.orderId} - DWstore.lk`;
  } else if (isOnlineGateway) {
    customerSubject = `⚠️ Payment Unsuccessful / Pending: Order #${order.orderId} - DWstore.lk`;
  } else if (isBank) {
    customerSubject = `🏦 Order Received (Bank Transfer Required): #${order.orderId} - DWstore.lk`;
  } else {
    customerSubject = `Order Placed (Cash on Delivery): #${order.orderId} - DWstore.lk`;
  }

  // Admin subject line
  const totalDisplay = order.totalMinor ? formatPriceLKR(order.totalMinor) : (order.total ? order.total.toLocaleString() : '0');
  let adminSubject = `🔔 New Order: #${order.orderId} (LKR ${totalDisplay})`;
  if (isPaid) {
    adminSubject = `💰 [PAID] Order #${order.orderId} (LKR ${totalDisplay}) via ${order.paymentMethod}`;
  } else if (isOnlineGateway) {
    adminSubject = `⚠️ [UNPAID ONLINE] Order #${order.orderId} (LKR ${totalDisplay}) via ${order.paymentMethod}`;
  } else if (isBank) {
    adminSubject = `🏦 [PENDING BANK TRANSFER] Order #${order.orderId} (LKR ${totalDisplay})`;
  } else {
    adminSubject = `📦 [COD - UNPAID] New Order #${order.orderId} (LKR ${totalDisplay})`;
  }

  const customerEmail = (order?.customer?.email || order?.customerEmail || order?.email || '').trim();

  // 1. Send email to Customer
  if (customerNotifyEnabled && customerEmail && customerEmail.includes('@')) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [customerEmail],
          subject: customerSubject,
          html: generateCustomerEmailHtml(order),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        results.customerEmailSent = true;
        console.log(`[Resend Success] Customer email sent to ${customerEmail} for order #${order.orderId} (ID: ${data.id})`);
      } else {
        results.errors.push({ type: 'customer', error: data });
        console.error(`[Resend Error] Customer email failed for order #${order.orderId}:`, data);
      }
    } catch (err: any) {
      results.errors.push({ type: 'customer', error: err.message });
      console.error(`[Resend Exception] Customer email error:`, err);
    }
  }

  // 2. Send notification email to Admin
  if (adminNotifyEnabled && adminEmail && adminEmail.includes('@')) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [adminEmail],
          subject: adminSubject,
          html: generateAdminEmailHtml(order),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        results.adminEmailSent = true;
        console.log(`[Resend Success] Admin notification sent to ${adminEmail} for order #${order.orderId} (ID: ${data.id})`);
      } else {
        results.errors.push({ type: 'admin', error: data });
        console.error(`[Resend Error] Admin email failed for order #${order.orderId}:`, data);
      }
    } catch (err: any) {
      results.errors.push({ type: 'admin', error: err.message });
      console.error(`[Resend Exception] Admin email error:`, err);
    }
  }

  return results;
}

/**
 * Dispatch Payment Confirmation Email when an order is successfully marked as PAID
 * (e.g. gateway verified webhook callback or manual Admin confirmation)
 */
export async function sendPaymentReceivedEmail(order: any) {
  const paidOrder = { ...order, paymentStatus: 'Paid' };
  return sendOrderEmails(paidOrder);
}
