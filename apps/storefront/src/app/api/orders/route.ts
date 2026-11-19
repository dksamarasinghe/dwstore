import { NextRequest, NextResponse } from 'next/server';
import { readDataJson, writeDataJson } from '@/lib/data-paths';
import { sendOrderEmails } from '@/lib/email';
import { sendOrderWhatsAppNotification } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

function getOrders(): any[] {
  return readDataJson<any[]>('orders.json', []);
}

function saveOrders(orders: any[]): boolean {
  return writeDataJson('orders.json', orders);
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');
  const phone = searchParams.get('phone');

  const orders = getOrders();

  if (orderId) {
    const targetClean = String(orderId).replace(/^#+/, '').trim().toUpperCase();
    const targetDigits = String(orderId).replace(/\D/g, '');
    const order = orders.find((o: any) => {
      const oId = String(o.orderId || '').replace(/^#+/, '').trim().toUpperCase();
      if (oId === targetClean) return true;
      const oDigits = String(o.orderId || '').replace(/\D/g, '');
      if (targetDigits && oDigits && targetDigits === oDigits) return true;
      return false;
    });

    if (order) {
      return NextResponse.json({ success: true, order }, { headers: CORS_HEADERS });
    }
    return NextResponse.json(
      { success: false, message: 'Order not found' },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  if (phone) {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const userOrders = orders.filter((o: any) => {
      const p = (o.customer?.phone || '').replace(/\D/g, '');
      return p && (p.includes(cleanPhone) || cleanPhone.includes(p));
    });
    return NextResponse.json({ success: true, orders: userOrders }, { headers: CORS_HEADERS });
  }

  return NextResponse.json({ success: true, orders }, { headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orders = getOrders();

    const rawPm = String(body.paymentMethod || 'cod').toLowerCase();
    const isOnlineGateway = rawPm.includes('koko') ||
                            rawPm.includes('payzy') ||
                            rawPm.includes('card') ||
                            rawPm.includes('payhere') ||
                            rawPm.includes('mintpay') ||
                            rawPm.includes('visa') ||
                            rawPm.includes('master');

    let initialPaymentStatus = isOnlineGateway ? 'Paid' : 'Unpaid';
    if (body.paymentStatus) {
      const psLower = String(body.paymentStatus).toLowerCase();
      if (psLower === 'paid' || isOnlineGateway) {
        initialPaymentStatus = 'Paid';
      } else if (psLower === 'refunded') {
        initialPaymentStatus = 'Refunded';
      }
    }

    let cleanPaymentMethod = body.paymentMethod || 'Cash on Delivery (COD)';
    if (rawPm.includes('koko')) {
      cleanPaymentMethod = 'Koko (Buy Now Pay Later)';
    } else if (rawPm.includes('payzy')) {
      cleanPaymentMethod = 'Payzy (Buy Now Pay Later)';
    } else if (rawPm.includes('mintpay')) {
      cleanPaymentMethod = 'Mintpay (3-Installments)';
    } else if (rawPm.includes('card') || rawPm.includes('payhere') || rawPm.includes('visa') || rawPm.includes('master')) {
      cleanPaymentMethod = 'Visa / Mastercard / PayHere';
    } else if (rawPm.includes('bank')) {
      cleanPaymentMethod = 'Bank Transfer';
    } else if (rawPm.includes('cod') || rawPm.includes('cash')) {
      cleanPaymentMethod = 'Cash on Delivery (COD)';
    }

    const newOrder = {
      orderId: body.orderId || `DWS-${Date.now().toString().slice(-6)}`,
      createdAt: body.createdAt || new Date().toISOString(),
      customer: body.customer || {
        firstName: body.firstName || body.customerName?.split(' ')[0] || '',
        lastName: body.lastName || body.customerName?.split(' ').slice(1).join(' ') || '',
        phone: body.phone || body.customerPhone || '',
        email: body.email || body.customerEmail || '',
        address: body.address || body.shippingAddress || '',
        city: body.city || '',
        district: body.district || 'Colombo',
        postalCode: body.postalCode || '',
        orderNotes: body.orderNotes || body.notes || '',
      },
      customerName: body.customerName || (body.customer ? `${body.customer.firstName || ''} ${body.customer.lastName || ''}`.trim() : ''),
      customerPhone: body.customerPhone || body.customer?.phone || body.phone || '',
      customerEmail: body.customerEmail || body.customer?.email || body.email || '',
      shippingAddress: body.shippingAddress || body.customer?.address || body.address || '',
      city: body.city || body.customer?.city || 'Colombo',
      district: body.district || body.customer?.district || 'Colombo',
      postalCode: body.postalCode || body.customer?.postalCode || '',
      notes: body.notes || body.orderNotes || body.customer?.orderNotes || '',
      items: (body.items || []).map((it: any) => {
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
          ...it,
          productTitle: it.productTitle || it.name || it.title || 'Product',
          variationText: varText,
        };
      }),
      subtotalMinor: body.subtotalMinor || (body.subtotal ? Math.round(body.subtotal * 100) : 0),
      shippingFeeMinor: body.shippingFeeMinor || (body.shippingCost ? Math.round(body.shippingCost * 100) : 0),
      totalMinor: body.totalMinor || (body.total ? Math.round(body.total * 100) : 0),
      subtotal: body.subtotal || (body.subtotalMinor ? body.subtotalMinor / 100 : 0),
      shippingCost: body.shippingCost !== undefined ? body.shippingCost : (body.shippingFeeMinor ? body.shippingFeeMinor / 100 : 0),
      total: body.total || (body.totalMinor ? body.totalMinor / 100 : 0),
      paymentMethod: cleanPaymentMethod,
      paymentStatus: initialPaymentStatus,
      status: body.status || 'processing',
      carrier: body.carrier || 'Koombiyo Delivery',
      trackingNumber: body.trackingNumber || body.courierTrackingNumber || '',
      courierTrackingNumber: body.courierTrackingNumber || body.trackingNumber || '',
      dispatchedDate: body.dispatchedDate || '',
    };

    orders.unshift(newOrder);
    saveOrders(orders);

    // Asynchronously dispatch Resend Email & WhatsApp notifications
    Promise.allSettled([
      sendOrderEmails(newOrder),
      sendOrderWhatsAppNotification(newOrder),
    ]).catch((err) => {
      console.error('[Notification Dispatch Error]', err);
    });

    return NextResponse.json(
      { success: true, order: newOrder },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      orderId, 
      status, 
      courierTrackingNumber, 
      trackingNumber,
      carrier,
      dispatchedDate,
      customer,
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      city,
      district,
      postalCode,
      notes,
      paymentStatus,
      paymentMethod,
      total,
      totalMinor,
      returnRecord,
    } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const orders = getOrders();
    const targetClean = String(orderId).replace(/^#+/, '').trim().toLowerCase();
    const targetDigits = String(orderId).replace(/\D/g, '');

    const index = orders.findIndex((o: any) => {
      const oId = String(o.orderId || '').replace(/^#+/, '').trim().toLowerCase();
      if (oId === targetClean) return true;
      const oDigits = String(o.orderId || '').replace(/\D/g, '');
      if (targetDigits && oDigits && targetDigits === oDigits) return true;
      return false;
    });

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    if (status) orders[index].status = status;
    const finalTracking = courierTrackingNumber !== undefined ? courierTrackingNumber : trackingNumber;
    if (finalTracking !== undefined) {
      orders[index].courierTrackingNumber = finalTracking;
      orders[index].trackingNumber = finalTracking;
    }
    if (carrier !== undefined) orders[index].carrier = carrier;
    if (dispatchedDate !== undefined) orders[index].dispatchedDate = dispatchedDate;
    if (paymentStatus !== undefined) orders[index].paymentStatus = paymentStatus;
    if (paymentMethod !== undefined) orders[index].paymentMethod = paymentMethod;
    if (returnRecord !== undefined) orders[index].returnRecord = returnRecord;
    if (total !== undefined) {
      orders[index].total = total;
      orders[index].totalMinor = Math.round(total * 100);
    } else if (totalMinor !== undefined) {
      orders[index].totalMinor = totalMinor;
      orders[index].total = Math.round(totalMinor / 100);
    }

    // Update customer details if provided (both nested customer and top-level fields)
    if (!orders[index].customer) {
      orders[index].customer = {};
    }
    if (customer) {
      orders[index].customer = { ...orders[index].customer, ...customer };
    }
    if (customerName) {
      orders[index].customerName = customerName;
      const parts = customerName.split(' ');
      orders[index].customer.firstName = parts[0] || '';
      orders[index].customer.lastName = parts.slice(1).join(' ') || '';
    }
    if (customerPhone) {
      orders[index].customerPhone = customerPhone;
      orders[index].customer.phone = customerPhone;
    }
    if (customerEmail) {
      orders[index].customerEmail = customerEmail;
      orders[index].customer.email = customerEmail;
    }
    if (shippingAddress) {
      orders[index].shippingAddress = shippingAddress;
      orders[index].customer.address = shippingAddress;
    }
    if (city) {
      orders[index].city = city;
      orders[index].customer.city = city;
    }
    if (district) {
      orders[index].district = district;
      orders[index].customer.district = district;
    }
    if (postalCode) {
      orders[index].postalCode = postalCode;
      orders[index].customer.postalCode = postalCode;
    }
    if (notes) {
      orders[index].notes = notes;
      orders[index].customer.orderNotes = notes;
    }

    saveOrders(orders);

    return NextResponse.json(
      { success: true, order: orders[index] },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}
