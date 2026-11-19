import { OrderItem } from '../types';

export function normalizeOrder(raw: any): OrderItem {
  if (!raw) return {} as OrderItem;

  // Name resolution
  const firstName = raw.customer?.firstName || '';
  const lastName = raw.customer?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const customerName = raw.customerName || fullName || raw.customer?.name || 'Customer';

  // Phone resolution
  const customerPhone = raw.customerPhone || raw.customer?.phone || '';

  // Email resolution
  const customerEmail = raw.customerEmail || raw.customer?.email || '';

  // Address & City resolution
  const shippingAddress = raw.shippingAddress || raw.customer?.address || '';
  const city = raw.city || raw.customer?.city || raw.customer?.district || 'Colombo';
  const postalCode = raw.postalCode || raw.customer?.postalCode || '';
  const notes = raw.notes || raw.customer?.orderNotes || '';

  // Total conversion (API provides totalMinor in cents e.g. 234000 = Rs. 2,340)
  let total = 0;
  if (typeof raw.total === 'number') {
    total = raw.total;
  } else if (typeof raw.totalMinor === 'number') {
    total = Math.round(raw.totalMinor / 100);
  }

  let subtotal = total;
  if (typeof raw.subtotal === 'number') {
    subtotal = raw.subtotal;
  } else if (typeof raw.subtotalMinor === 'number') {
    subtotal = Math.round(raw.subtotalMinor / 100);
  }

  let shippingCost = 350;
  if (typeof raw.shippingCost === 'number') {
    shippingCost = raw.shippingCost;
  } else if (typeof raw.shippingFeeMinor === 'number') {
    shippingCost = Math.round(raw.shippingFeeMinor / 100);
  }

  // Status mapping
  const status = (raw.status || 'pending').toLowerCase();

  // Payment method
  let paymentMethod = 'Cash on Delivery (COD)';
  if (raw.paymentMethod) {
    const pmLower = String(raw.paymentMethod).toLowerCase();
    if (pmLower.includes('koko')) {
      paymentMethod = 'Koko (Buy Now Pay Later)';
    } else if (pmLower.includes('payzy')) {
      paymentMethod = 'Payzy (Buy Now Pay Later)';
    } else if (pmLower.includes('mintpay')) {
      paymentMethod = 'Mintpay (3-Installments)';
    } else if (pmLower.includes('bank')) {
      paymentMethod = 'Bank Transfer';
    } else if (pmLower.includes('visa') || pmLower.includes('master') || pmLower.includes('card') || pmLower.includes('payhere')) {
      paymentMethod = 'Visa / Mastercard / PayHere';
    } else if (pmLower.includes('cod') || pmLower.includes('cash')) {
      paymentMethod = 'Cash on Delivery (COD)';
    } else {
      paymentMethod = raw.paymentMethod;
    }
  }

  // Payment status (strictly Title Case 'Paid' | 'Unpaid' | 'Refunded')
  let paymentStatus: 'Paid' | 'Unpaid' | 'Refunded' = 'Unpaid';
  const rawPs = String(raw.paymentStatus || '').trim().toLowerCase();
  const rawPm = String(raw.paymentMethod || '').toLowerCase();
  const isOnlinePayment = rawPm.includes('koko') ||
                          rawPm.includes('payzy') ||
                          rawPm.includes('mintpay') ||
                          rawPm.includes('visa') ||
                          rawPm.includes('master') ||
                          rawPm.includes('card') ||
                          rawPm.includes('payhere');

  if (rawPs === 'refunded') {
    paymentStatus = 'Refunded';
  } else if (rawPs === 'paid' || isOnlinePayment) {
    paymentStatus = 'Paid';
  } else if (status === 'delivered') {
    paymentStatus = 'Paid';
  } else if (rawPm.includes('cod') || rawPm.includes('cash') || rawPm.includes('bank')) {
    paymentStatus = 'Unpaid';
  } else {
    paymentStatus = 'Unpaid';
  }

  // Ordered items
  const items = Array.isArray(raw.items)
    ? raw.items.map((it: any) => {
        let varText = it.variationText || '';
        if (!varText && it.variation?.attributes && typeof it.variation.attributes === 'object') {
          varText = Object.entries(it.variation.attributes)
            .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
            .join(', ');
        } else if (!varText && it.attributes && typeof it.attributes === 'object') {
          varText = Object.entries(it.attributes)
            .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
            .join(', ');
        }

        return {
          productId: it.productId || it.id || 'p-1',
          productTitle: it.productTitle || it.name || it.title || 'DW Product',
          productSku: it.productSku || it.sku || '',
          quantity: it.quantity || 1,
          price:
            typeof it.price === 'number'
              ? it.price
              : typeof it.priceMinor === 'number'
              ? Math.round(it.priceMinor / 100)
              : 0,
          image: it.image || '',
          variation: it.variation || null,
          attributes: it.attributes || it.variation?.attributes || null,
          variationText: varText,
        };
      })
    : [];

  return {
    orderId: raw.orderId || `DWS-${Date.now().toString().slice(-6)}`,
    createdAt: (() => {
      if (!raw.createdAt) return new Date().toISOString().slice(0, 16).replace('T', ' ');
      try {
        const d = new Date(raw.createdAt);
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const hours = String(d.getHours()).padStart(2, '0');
          const minutes = String(d.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day} ${hours}:${minutes}`;
        }
      } catch (e) {}
      return String(raw.createdAt);
    })(),
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    city,
    district: raw.district || raw.customer?.district || undefined,
    postalCode,
    carrier: raw.carrier || undefined,
    trackingNumber: raw.trackingNumber || raw.courierTrackingNumber || undefined,
    dispatchedDate: raw.dispatchedDate || undefined,
    status: status as any,
    paymentMethod,
    paymentStatus: paymentStatus as any,
    total,
    subtotal,
    shippingCost,
    items,
    notes,
  };
}
