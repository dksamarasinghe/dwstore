import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { sendOrderEmails } from '@/lib/email';
import { sendOrderWhatsAppNotification } from '@/lib/whatsapp';

const ORDERS_FILE = path.join(process.cwd(), 'src', 'data', 'orders.json');

function getOrders() {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const content = fs.readFileSync(ORDERS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading orders:', err);
  }
  return [];
}

function saveOrders(orders: any[]) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving orders:', err);
    return false;
  }
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
    const cleanId = orderId.trim().toUpperCase();
    const order = orders.find(
      (o: any) =>
        o.orderId?.toUpperCase() === cleanId ||
        (cleanId.startsWith('DWS-') && o.orderId?.toUpperCase() === cleanId) ||
        o.orderId?.toUpperCase().replace('DWS-', '') === cleanId.replace('DWS-', '')
    );

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

    const newOrder = {
      orderId: body.orderId || `DWS-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      customer: body.customer || {
        firstName: body.firstName || '',
        lastName: body.lastName || '',
        phone: body.phone || '',
        email: body.email || '',
        address: body.address || '',
        city: body.city || '',
        district: body.district || 'Colombo',
        postalCode: body.postalCode || '',
        orderNotes: body.orderNotes || '',
      },
      items: body.items || [],
      subtotalMinor: body.subtotalMinor || 0,
      shippingFeeMinor: body.shippingFeeMinor || 0,
      totalMinor: body.totalMinor || 0,
      paymentMethod: body.paymentMethod || 'cod',
      status: 'processing',
      courierTrackingNumber: '',
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
      totalMinor
    } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const orders = getOrders();
    const cleanId = orderId.toString().trim();
    const index = orders.findIndex((o: any) => 
      o.orderId === cleanId || 
      o.orderId?.replace('DWS-', '') === cleanId.replace('DWS-', '')
    );

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
    if (total !== undefined) {
      orders[index].total = total;
      orders[index].totalMinor = Math.round(total * 100);
    } else if (totalMinor !== undefined) {
      orders[index].totalMinor = totalMinor;
      orders[index].total = Math.round(totalMinor / 100);
    }

    // Update customer details if provided
    if (!orders[index].customer) {
      orders[index].customer = {};
    }
    if (customer) {
      orders[index].customer = { ...orders[index].customer, ...customer };
    }
    if (customerName) {
      const parts = customerName.split(' ');
      orders[index].customer.firstName = parts[0] || '';
      orders[index].customer.lastName = parts.slice(1).join(' ') || '';
    }
    if (customerPhone) orders[index].customer.phone = customerPhone;
    if (customerEmail) orders[index].customer.email = customerEmail;
    if (shippingAddress) orders[index].customer.address = shippingAddress;
    if (city) orders[index].customer.city = city;
    if (district) orders[index].customer.district = district;
    if (postalCode) orders[index].customer.postalCode = postalCode;
    if (notes) orders[index].customer.orderNotes = notes;

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
