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
    if (raw.paymentMethod.toLowerCase() === 'cod') {
      paymentMethod = 'Cash on Delivery (COD)';
    } else if (raw.paymentMethod.toLowerCase() === 'koko') {
      paymentMethod = 'Koko (Buy Now Pay Later)';
    } else if (raw.paymentMethod.toLowerCase() === 'mintpay') {
      paymentMethod = 'Mintpay (3-Installments)';
    } else {
      paymentMethod = raw.paymentMethod;
    }
  }

  // Payment status
  const paymentStatus =
    raw.paymentStatus ||
    (status === 'delivered' ? 'Paid' : raw.paymentMethod?.toLowerCase() === 'cod' ? 'Unpaid' : 'Paid');

  // Ordered items
  const items = Array.isArray(raw.items)
    ? raw.items.map((it: any) => ({
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
      }))
    : [];

  return {
    orderId: raw.orderId || `DW-${Date.now()}`,
    createdAt: raw.createdAt
      ? raw.createdAt.includes('T')
        ? new Date(raw.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : raw.createdAt
      : 'Recently',
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
