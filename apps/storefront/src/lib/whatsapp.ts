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
  customer?: {
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
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  shippingAddress?: string;
  city?: string;
  district?: string;
  notes?: string;
  items: OrderItem[];
  subtotalMinor?: number;
  shippingFeeMinor?: number;
  totalMinor?: number;
  subtotal?: number;
  shippingCost?: number;
  total?: number;
  paymentMethod: string;
}

/**
 * Builds the WhatsApp confirmation message sent to the customer
 */
export function buildCustomerWhatsAppMessage(order: any): string {
  const customerName =
    `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() ||
    order.customerName ||
    'Valued Customer';
  const paymentText =
    (order.paymentMethod || 'cod').toLowerCase() === 'cod'
      ? 'Cash on Delivery (COD)'
      : String(order.paymentMethod || '').toUpperCase();

  const totalStr = order.totalMinor
    ? formatPriceLKR(order.totalMinor)
    : order.total
    ? Number(order.total).toLocaleString('en-US', { minimumFractionDigits: 2 })
    : '0.00';

  const subtotalStr = order.subtotalMinor
    ? formatPriceLKR(order.subtotalMinor)
    : order.subtotal
    ? Number(order.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })
    : totalStr;

  const deliveryStr =
    order.shippingFeeMinor === 0 || order.shippingCost === 0
      ? 'FREE'
      : order.shippingFeeMinor
      ? `LKR ${formatPriceLKR(order.shippingFeeMinor)}`
      : order.shippingCost
      ? `LKR ${Number(order.shippingCost).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      : 'FREE';

  const address =
    order.customer?.address ||
    order.shippingAddress ||
    '';
  const city = order.customer?.city || order.city || 'Colombo';
  const phone = order.customer?.phone || order.customerPhone || '';

  let text = `📦 *DWstore.lk - ඇණවුම් තහවුරු කිරීම (Order Confirmed)*\n\n`;
  text += `ආයුබෝවන් ${customerName}, ඔබගේ ඇණවුම සාර්ථකව අප වෙත ලැබුණි!\n\n`;
  text += `*Order ID:* #${order.orderId}\n`;
  text += `*Payment:* ${paymentText}\n`;
  text += `*Courier:* Island-wide Express Delivery\n\n`;

  text += `*ඇණවුම් කළ භාණ්ඩ (Items):*\n`;
  (order.items || []).forEach((item: any, index: number) => {
    const varText = item.variation?.attributes
      ? ` (${Object.entries(item.variation.attributes)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')})`
      : '';
    const itemPrice = item.priceMinor
      ? formatPriceLKR(item.priceMinor)
      : item.price
      ? Number(item.price).toLocaleString('en-US', { minimumFractionDigits: 2 })
      : '0.00';
    text += `${index + 1}. *${item.name}*${varText}\n   Qty: ${item.quantity} x LKR ${itemPrice}\n`;
  });

  text += `\n*Subtotal:* LKR ${subtotalStr}\n`;
  text += `*Delivery Fee:* ${deliveryStr}\n`;
  text += `*Grand Total:* *LKR ${totalStr}*\n\n`;

  text += `*Delivery Address:*\n`;
  text += `📍 ${address ? `${address}, ` : ''}${city}\n`;
  text += `📞 ${phone}\n\n`;

  text += `අපගේ Dispatch කණ්ඩායම විසින් පැය 24-48ක් ඇතුලත ඔබගේ ඇණවුම Delivery වෙත භාරදෙනු ඇත.\n`;
  text += `ඕනෑම ගැටළුවක් සඳහා අප අමතන්න: +94 75 669 3358\n`;
  text += `Showroom: No.55/1/2, Borella road, Pannipitiya\n`;
  text += `ස්තූතියි! DWstore.lk`;

  return text;
}

/**
 * Builds the urgent order notification message sent to the Website Owner
 */
export function buildOwnerWhatsAppAlertMessage(order: any): string {
  const customerName =
    `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() ||
    order.customerName ||
    'Customer';
  const customerPhone = order.customer?.phone || order.customerPhone || 'N/A';
  const customerEmail = order.customer?.email || order.customerEmail || 'N/A';
  const paymentMethod = String(order.paymentMethod || 'COD').toUpperCase();
  const address = `${order.customer?.address || order.shippingAddress || ''}, ${order.customer?.city || order.city || ''}`.trim();

  const totalStr = order.totalMinor
    ? formatPriceLKR(order.totalMinor)
    : order.total
    ? Number(order.total).toLocaleString('en-US', { minimumFractionDigits: 2 })
    : '0.00';

  let text = `🚨 *NEW DWSTORE.LK ORDER RECEIVED!* 🚨\n\n`;
  text += `*Order ID:* #${order.orderId}\n`;
  text += `*Total Amount:* LKR ${totalStr} (${paymentMethod})\n`;
  text += `*Customer:* ${customerName}\n`;
  text += `*Phone:* ${customerPhone}\n`;
  if (customerEmail && customerEmail !== 'N/A') {
    text += `*Email:* ${customerEmail}\n`;
  }
  text += `*Delivery Address:* ${address}\n\n`;

  text += `*Purchased Items:*\n`;
  (order.items || []).forEach((item: any, i: number) => {
    const varText = item.variation?.attributes
      ? ` (${Object.entries(item.variation.attributes)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')})`
      : '';
    text += `${i + 1}. *${item.name}*${varText} x ${item.quantity}\n`;
  });

  const notes = order.customer?.orderNotes || order.notes;
  if (notes) {
    text += `\n*Customer Note:* ${notes}\n`;
  }

  text += `\n🔗 *Open Admin Dashboard:* https://dwstore.lk/sudo-sudo/admin`;
  return text;
}

/**
 * Normalizes phone number to international format without plus (e.g. 0756693358 -> 94756693358)
 */
export function normalizePhoneForWhatsApp(phoneStr: string): string {
  let cleaned = String(phoneStr || '').replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '94' + cleaned.slice(1);
  } else if (!cleaned.startsWith('94') && cleaned.length === 9) {
    cleaned = '94' + cleaned;
  }
  return cleaned;
}

/**
 * Helper to dispatch a single WhatsApp message to a specific number
 */
export async function dispatchSingleWhatsAppMessage(
  targetPhone: string,
  messageText: string,
  config: any = {}
): Promise<{ success: boolean; method?: string; error?: string }> {
  const normalizedPhone = normalizePhoneForWhatsApp(targetPhone);
  if (!normalizedPhone || normalizedPhone.length < 9) {
    return { success: false, error: 'Invalid phone number format' };
  }

  // Method 1: Meta Official WhatsApp Cloud API (if configured)
  const metaToken = config.whatsappCloudToken || process.env.WHATSAPP_CLOUD_API_TOKEN;
  const metaPhoneId = config.whatsappPhoneId || process.env.WHATSAPP_PHONE_NUMBER_ID;

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
          to: normalizedPhone,
          type: 'text',
          text: { preview_url: false, body: messageText },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        return { success: true, method: 'meta_cloud_api' };
      }
    } catch (e: any) {
      console.warn('[WhatsApp Meta Error]', e.message);
    }
  }

  // Method 2: CallMeBot Free WhatsApp API (Personal notification fallback)
  const callmebotKey = config.callMeBotApiKey || process.env.CALLMEBOT_API_KEY;
  if (callmebotKey) {
    try {
      const callmebotUrl = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
        normalizedPhone
      )}&text=${encodeURIComponent(messageText)}&apikey=${encodeURIComponent(callmebotKey)}`;
      const res = await fetch(callmebotUrl);
      if (res.ok) {
        return { success: true, method: 'callmebot' };
      }
    } catch (e: any) {
      console.warn('[CallMeBot Error]', e.message);
    }
  }

  // Method 3: Self-Hosted Baileys WhatsApp Gateway (runs on VPS port 8080 or localhost:8080)
  const candidateUrls = [
    config.whatsappGatewayUrl,
    process.env.WHATSAPP_GATEWAY_URL,
    process.env.WHATSAPP_GATEWAY_INTERNAL_URL,
    'http://127.0.0.1:8080/send',
    'http://localhost:8080/send',
  ].filter(Boolean) as string[];

  for (const rawUrl of candidateUrls) {
    try {
      const endpoint = rawUrl.endsWith('/send') ? rawUrl : `${rawUrl.replace(/\/$/, '')}/send`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(endpoint, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.WHATSAPP_GATEWAY_API_KEY
            ? {
                apikey: process.env.WHATSAPP_GATEWAY_API_KEY,
                Authorization: `Bearer ${process.env.WHATSAPP_GATEWAY_API_KEY}`,
              }
            : {}),
        },
        body: JSON.stringify({
          number: normalizedPhone,
          phone: normalizedPhone,
          message: messageText,
        }),
      });

      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success) {
        return { success: true, method: 'baileys_gateway' };
      }
    } catch (e) {
      // Continue trying next candidate endpoint
    }
  }

  return { success: false, error: 'No WhatsApp gateway or credentials reachable' };
}

/**
 * Dispatches automated WhatsApp messages for a new order:
 * 1. Alert to Website Owner's WhatsApp
 * 2. Order confirmation to Customer's WhatsApp
 */
export async function sendOrderWhatsAppNotification(order: any) {
  const notificationConfig = readDataJson<any>('email-config.json', {}) || {};
  const ownerPhone =
    notificationConfig.ownerWhatsApp ||
    process.env.OWNER_WHATSAPP_PHONE ||
    '0756693358';
  const ownerNotifyEnabled = notificationConfig.ownerWhatsAppNotifications !== false;

  const customerPhone = order.customer?.phone || order.customerPhone;
  const customerNotifyEnabled = notificationConfig.customerWhatsAppNotifications !== false;

  const results: { customerSent?: boolean; ownerSent?: boolean; errors: any[] } = {
    errors: [],
  };

  // 1. Send Instant Alert to Website Owner's WhatsApp
  if (ownerNotifyEnabled && ownerPhone) {
    try {
      const ownerMessage = buildOwnerWhatsAppAlertMessage(order);
      const ownerRes = await dispatchSingleWhatsAppMessage(ownerPhone, ownerMessage, notificationConfig);
      results.ownerSent = ownerRes.success;
      if (ownerRes.success) {
        console.log(`[WhatsApp Success] Owner order alert sent to ${ownerPhone} for order #${order.orderId}`);
      } else {
        console.log(`[WhatsApp Info] Owner alert not sent (${ownerRes.error}). Check if WhatsApp gateway is running.`);
      }
    } catch (err: any) {
      results.errors.push({ type: 'owner', error: err.message });
    }
  }

  // 2. Send Order Confirmation Receipt to Customer's WhatsApp
  if (customerNotifyEnabled && customerPhone) {
    try {
      const customerMessage = buildCustomerWhatsAppMessage(order);
      const custRes = await dispatchSingleWhatsAppMessage(customerPhone, customerMessage, notificationConfig);
      results.customerSent = custRes.success;
      if (custRes.success) {
        console.log(`[WhatsApp Success] Customer confirmation sent to ${customerPhone} for order #${order.orderId}`);
      }
    } catch (err: any) {
      results.errors.push({ type: 'customer', error: err.message });
    }
  }

  return results;
}
