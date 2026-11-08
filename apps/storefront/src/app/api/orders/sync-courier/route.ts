import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  return handleSync();
}

export async function POST(req: NextRequest) {
  return handleSync();
}

async function handleSync() {
  try {
    const orders = getOrders();
    const shippedOrders = orders.filter(
      (o: any) =>
        (o.status === 'shipped' || o.status === 'processing') &&
        (o.trackingNumber || o.courierTrackingNumber)
    );

    const updatedOrders: string[] = [];

    // Query Koombiyo for active shipped orders (limit batch to 20 per request to stay fast)
    for (const order of shippedOrders.slice(0, 20)) {
      const trackingNo = (order.trackingNumber || order.courierTrackingNumber || '').trim();
      const cleanWaybill = trackingNo.replace(/^KOOMBIYO-LK-/i, '').replace(/^DWS-/i, '').trim();
      const phone = (order.customerPhone || order.customer?.phone || '').replace(/[^0-9]/g, '');

      try {
        const searchParams = new URLSearchParams({
          waybill_id: cleanWaybill,
          phone: phone || '0712345678',
        });

        const koombiyoRes = await fetch('https://koombiyodelivery.lk/api/track_order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: searchParams.toString(),
          signal: AbortSignal.timeout(5000), // 5s timeout
        });

        if (koombiyoRes.ok) {
          const data = await koombiyoRes.json();
          if (data && Number(data.status) === 200 && data.tracking) {
            const rawStatus = (data.tracking.order_status || '').toLowerCase();
            // If Koombiyo marks it delivered or completed
            if (rawStatus.includes('deliver') || rawStatus.includes('complete')) {
              order.status = 'delivered';
              order.paymentStatus = 'Paid';
              updatedOrders.push(order.orderId);
            }
          }
        }
      } catch (e) {
        // Continue with other orders if one times out or network blips
        console.warn(`Koombiyo sync check skipped for ${order.orderId}:`, e);
      }
    }

    if (updatedOrders.length > 0) {
      saveOrders(orders);
    }

    return NextResponse.json(
      {
        success: true,
        checkedCount: shippedOrders.length,
        updatedCount: updatedOrders.length,
        updatedOrderIds: updatedOrders,
        message:
          updatedOrders.length > 0
            ? `Successfully auto-synced ${updatedOrders.length} order(s) to Delivered via Koombiyo Delivery.`
            : 'All active shipments are currently in transit or up to date.',
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
