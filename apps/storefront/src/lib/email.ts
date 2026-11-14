import { formatPriceLKR } from '@/lib/catalog';
import { readDataJson } from '@/lib/data-paths';

interface OrderItem {
  id: string | number;
  name: string;
  quantity: number;
  priceMinor: number;
  variation?: {
    attributes: Record<string, string>;
  };
}

interface OrderData {
  orderId: string;
  createdAt: string;
  customer: {
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
  items: OrderItem[];
  subtotalMinor: number;
  shippingFeeMinor: number;
  totalMinor: number;
  paymentMethod: string;
}

/**
 * Generate responsive, modern HTML email template for the Customer
 */
function generateCustomerEmailHtml(order: OrderData): string {
  const customerName = `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || 'Valued Customer';
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const itemsHtml = order.items
    .map((item) => {
      const varText = item.variation
        ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">${Object.entries(item.variation.attributes)
            .map(([k, v]) => `${k}: <strong>${v}</strong>`)
            .join(' | ')}</div>`
        : '';
      const itemSubtotal = formatPriceLKR(item.priceMinor * item.quantity);

      return `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 12px 8px; vertical-align: top;">
          <strong style="color: #0f172a; font-size: 13px;">${item.name}</strong>
          ${varText}
          <div style="font-size: 11px; color: #94a3b8; margin-top: 3px;">Qty: ${item.quantity} &times; LKR ${formatPriceLKR(item.priceMinor)}</div>
        </td>
        <td style="padding: 12px 8px; text-align: right; vertical-align: top; font-weight: 700; color: #0f172a; font-size: 13px; font-family: monospace;">
          LKR ${itemSubtotal}
        </td>
      </tr>`;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Confirmation #${order.orderId} - DWstore.lk</title>
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
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 32px 30px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; margin: 0 0 6px 0; text-transform: uppercase;">
                DWstore.lk
              </h1>
              <p style="color: #bfdbfe; font-size: 12px; margin: 0; letter-spacing: 1px; font-weight: 600; text-transform: uppercase;">
                Order Confirmation &bull; Sri Lanka's Trusted Tech Store
              </p>
            </td>
          </tr>

          <!-- Thank You Message -->
          <tr>
            <td style="padding: 28px 30px 10px 30px;">
              <div style="display: inline-block; background-color: #ecfdf5; color: #059669; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; border: 1px solid #a7f3d0;">
                ✓ Order Confirmed
              </div>
              <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin: 0 0 10px 0;">
                Thank you for your order, ${customerName}!
              </h2>
              <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0;">
                We have received your order <strong>#${order.orderId}</strong>. Our dispatch team is currently preparing your parcel for island-wide delivery.
              </p>
            </td>
          </tr>

          <!-- Order Summary Card -->
          <tr>
            <td style="padding: 20px 30px;">
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
                  <td style="font-size: 12px; font-weight: 700; color: #059669; text-align: right; padding: 4px 8px; text-transform: uppercase;">${order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 10px 30px;">
              <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                Ordered Items (${order.items.length})
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
                  <td style="padding: 6px 8px; font-size: 12px; text-align: right; font-weight: 700; color: #334155; font-family: monospace;">LKR ${formatPriceLKR(order.subtotalMinor)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 8px; font-size: 12px; color: #64748b;">Island-wide Delivery:</td>
                  <td style="padding: 6px 8px; font-size: 12px; text-align: right; font-weight: 700; color: #334155; font-family: monospace;">
                    ${order.shippingFeeMinor === 0 ? '<span style="color: #059669;">FREE</span>' : `LKR ${formatPriceLKR(order.shippingFeeMinor)}`}
                  </td>
                </tr>
                <tr style="border-top: 2px solid #e2e8f0;">
                  <td style="padding: 12px 8px; font-size: 15px; font-weight: 900; color: #0f172a;">Grand Total:</td>
                  <td style="padding: 12px 8px; font-size: 16px; text-align: right; font-weight: 900; color: #2563eb; font-family: monospace;">LKR ${formatPriceLKR(order.totalMinor)}</td>
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
                      ${order.customer.address || ''}<br>
                      ${order.customer.city || ''}${order.customer.district ? `, ${order.customer.district}` : ''} ${order.customer.postalCode || ''}<br>
                      <strong>Phone:</strong> ${order.customer.phone || ''} ${order.customer.altPhone ? ` / ${order.customer.altPhone}` : ''}<br>
                      ${order.customer.email ? `<strong>Email:</strong> ${order.customer.email}` : ''}
                      ${order.customer.orderNotes ? `<br><br><em>Note: ${order.customer.orderNotes}</em>` : ''}
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
function generateAdminEmailHtml(order: OrderData): string {
  const customerName = `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || 'New Customer';
  const cleanPhone = (order.customer.phone || '').replace(/[^0-9]/g, '');

  const itemsList = order.items
    .map(
      (i) =>
        `<li><strong>${i.name}</strong> &times; ${i.quantity} (LKR ${formatPriceLKR(i.priceMinor * i.quantity)})</li>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; color: #1e293b; line-height: 1.6; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px;">
    <h2 style="color: #1e40af; margin-top: 0;">🔔 New Order Received: #${order.orderId}</h2>
    <p>A new order has been placed on <strong>DWstore.lk</strong>!</p>
    
    <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <h3 style="margin-top: 0; font-size: 14px;">Customer & Delivery Details:</h3>
      <p style="margin: 0; font-size: 13px;">
        <strong>Customer:</strong> ${customerName}<br>
        <strong>Phone:</strong> <a href="tel:${order.customer.phone}">${order.customer.phone}</a><br>
        <strong>WhatsApp:</strong> <a href="https://wa.me/${cleanPhone}">Chat on WhatsApp</a><br>
        <strong>Email:</strong> ${order.customer.email || 'None provided'}<br>
        <strong>Address:</strong> ${order.customer.address}, ${order.customer.city}, ${order.customer.district || ''}<br>
        <strong>Notes:</strong> ${order.customer.orderNotes || 'None'}
      </p>
    </div>

    <h3 style="font-size: 14px;">Ordered Items (${order.items.length}):</h3>
    <ul style="font-size: 13px;">
      ${itemsList}
    </ul>

    <table style="width: 100%; border-top: 2px solid #e2e8f0; padding-top: 8px; margin-top: 12px; font-size: 13px;">
      <tr><td>Subtotal:</td><td align="right">LKR ${formatPriceLKR(order.subtotalMinor)}</td></tr>
      <tr><td>Delivery:</td><td align="right">LKR ${formatPriceLKR(order.shippingFeeMinor)}</td></tr>
      <tr><td><strong>Grand Total:</strong></td><td align="right"><strong>LKR ${formatPriceLKR(order.totalMinor)}</strong></td></tr>
      <tr><td>Payment Method:</td><td align="right"><strong>${order.paymentMethod.toUpperCase()}</strong></td></tr>
    </table>

    <div style="margin-top: 24px; text-align: center;">
      <a href="https://dwstore.lk/sudo-sudo/admin" style="background: #2563eb; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">
        Open in DWstore Admin Dashboard
      </a>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Dispatch emails via Resend REST API
 */
export async function sendOrderEmails(order: any) {
  const emailConfig = readDataJson<any>('email-config.json', null) || {};
  const apiKey = emailConfig.resendApiKey || process.env.RESEND_API_KEY;
  const adminEmail = emailConfig.adminEmail || process.env.ADMIN_NOTIFICATION_EMAIL || 'support@dwstore.lk';
  // With dwstore.lk verified on Resend, default to orders@dwstore.lk
  const fromEmail = emailConfig.fromEmail || process.env.RESEND_FROM_EMAIL || 'DWstore.lk <orders@dwstore.lk>';
  const customerNotifyEnabled = emailConfig.customerEmailNotifications !== false;
  const adminNotifyEnabled = emailConfig.adminEmailNotifications !== false;

  if (!apiKey) {
    console.log(
      `[Resend Info] RESEND_API_KEY is not set. Order #${order.orderId} confirmation email logged locally.`
    );
    return {
      success: false,
      message: 'RESEND_API_KEY not configured. Add Resend API Key in Admin > Integrations or in .env.local to send live emails.',
    };
  }

  const results: { customerEmailSent?: boolean; adminEmailSent?: boolean; errors: any[] } = {
    errors: [],
  };

  const customerEmail = (order?.customer?.email || order?.customerEmail || order?.email || '').trim();

  // 1. Send confirmation email to Customer (if email is provided)
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
          subject: `Order Confirmation #${order.orderId} - DWstore.lk`,
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
      const totalDisplay = order.totalMinor ? formatPriceLKR(order.totalMinor) : (order.total ? order.total.toLocaleString() : '0');
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [adminEmail],
          subject: `🔔 New Order Received: #${order.orderId} (LKR ${totalDisplay})`,
          html: generateAdminEmailHtml(order),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        results.adminEmailSent = true;
        console.log(`[Resend Success] Admin notification email sent to ${adminEmail} for order #${order.orderId} (ID: ${data.id})`);
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
