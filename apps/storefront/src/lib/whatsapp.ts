import { formatPriceLKR } from '@/lib/catalog';

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
    orderNotes?: string;
  };
  items: OrderItem[];
  subtotalMinor: number;
  shippingFeeMinor: number;
  totalMinor: number;
  paymentMethod: string;
}

/**
 * Builds the exact WhatsApp text message sent to the customer
 */
export function buildCustomerWhatsAppMessage(order: OrderData): string {
  const customerName = `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || 'Valued Customer';
  const paymentText = order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod.toUpperCase();

  let text = `📦 *DWstore.lk - ඇණවුම් තහවුරු කිරීම (Order Confirmed)*\n\n`;
  text += `ආයුබෝවන් ${customerName}, ඔබගේ ඇණවුම සාර්ථකව අප වෙත ලැබුණි!\n\n`;
  text += `*Order ID:* #${order.orderId}\n`;
  text += `*Payment:* ${paymentText}\n`;
  text += `*Courier:* Island-wide Express Delivery\n\n`;

  text += `*ඇණවුම් කළ භාණ්ඩ (Items):*\n`;
  order.items.forEach((item, index) => {
    const varText = item.variation
      ? ` (${Object.entries(item.variation.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')})`
      : '';
    text += `${index + 1}. *${item.name}*${varText}\n   Qty: ${item.quantity} x LKR ${formatPriceLKR(item.priceMinor)} = LKR ${formatPriceLKR(item.priceMinor * item.quantity)}\n`;
  });

  text += `\n*Subtotal:* LKR ${formatPriceLKR(order.subtotalMinor)}\n`;
  text += `*Delivery Fee:* ${order.shippingFeeMinor === 0 ? 'FREE' : `LKR ${formatPriceLKR(order.shippingFeeMinor)}`}\n`;
  text += `*Grand Total:* *LKR ${formatPriceLKR(order.totalMinor)}*\n\n`;

  text += `*Delivery Address:*\n`;
  text += `📍 ${order.customer.address}, ${order.customer.city}${order.customer.district ? `, ${order.customer.district}` : ''}\n`;
  text += `📞 ${order.customer.phone || ''}\n\n`;

  text += `අපගේ Dispatch කණ්ඩායම විසින් පැය 24-48ක් ඇතුලත ඔබගේ ඇණවුම Delivery වෙත භාරදෙනු ඇත.\n`;
  text += `ඕනෑම ගැටළුවක් සඳහා අප අමතන්න: +94 75 669 3358\n`;
  text += `Showroom: No.55/1/2, Borella road, Pannipitiya\n`;
  text += `ස්තූතියි! DWstore.lk`;

  return text;
}

/**
 * Normalizes phone number to international format (e.g. 0756693358 -> 94756693358)
 */
export function normalizePhoneForWhatsApp(phoneStr: string): string {
  let cleaned = phoneStr.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '94' + cleaned.slice(1);
  } else if (!cleaned.startsWith('94') && cleaned.length === 9) {
    cleaned = '94' + cleaned;
  }
  return cleaned;
}

/**
 * Dispatches an automated WhatsApp message to the customer:
 * - Method 1: Official Meta WhatsApp Business Cloud API (if configured)
 * - Method 2: Self-hosted Node.js WhatsApp Gateway (Baileys / Evolution API / WPPConnect)
 */
export async function sendOrderWhatsAppNotification(order: OrderData) {
  const customerPhone = order.customer?.phone;
  if (!customerPhone) return { success: false, message: 'No phone number provided' };

  const toPhone = normalizePhoneForWhatsApp(customerPhone);
  const messageText = buildCustomerWhatsAppMessage(order);

  // 1. Meta WhatsApp Cloud API
  const metaToken = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (metaToken && metaPhoneId) {
    try {
      const res = await fetch(`https://graph.facebook.com/v21.0/${metaPhoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${metaToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: toPhone,
          type: 'text',
          text: { preview_url: false, body: messageText },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log(`[Meta WhatsApp] Notification sent to ${toPhone} for order #${order.orderId}`);
        return { success: true, method: 'meta_cloud_api', data };
      } else {
        console.error(`[Meta WhatsApp Error]`, data);
        return { success: false, method: 'meta_cloud_api', error: data };
      }
    } catch (err: any) {
      console.error(`[Meta WhatsApp Exception]`, err);
      return { success: false, error: err.message };
    }
  }

  // 2. Self-Hosted Free WhatsApp Web Gateway (e.g., Baileys / Evolution API / UltraMsg)
  const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL;
  if (gatewayUrl) {
    try {
      const res = await fetch(gatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.WHATSAPP_GATEWAY_API_KEY
            ? { 'apikey': process.env.WHATSAPP_GATEWAY_API_KEY, 'Authorization': `Bearer ${process.env.WHATSAPP_GATEWAY_API_KEY}` }
            : {}),
        },
        body: JSON.stringify({
          number: toPhone,
          phone: toPhone,
          message: messageText,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log(`[WhatsApp Gateway] Notification sent to ${toPhone} for order #${order.orderId}`);
        return { success: true, method: 'gateway', data };
      } else {
        console.error(`[WhatsApp Gateway Error]`, data);
        return { success: false, method: 'gateway', error: data };
      }
    } catch (err: any) {
      console.error(`[WhatsApp Gateway Exception]`, err);
      return { success: false, error: err.message };
    }
  }

  // Fallback: Log info
  console.log(
    `[WhatsApp Info] Order #${order.orderId} placed for ${toPhone}. Configure WHATSAPP_CLOUD_API_TOKEN or WHATSAPP_GATEWAY_URL to send automated WhatsApp messages.`
  );
  return {
    success: false,
    message: 'No automated WhatsApp credentials configured. See setup guide.',
  };
}
