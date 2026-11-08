import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const ORDERS_FILE = path.join(process.cwd(), 'src', 'data', 'orders.json');

export async function POST(req: NextRequest) {
  try {
    let payload: any = {};
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      payload = await req.json();
    } else {
      const formData = await req.formData();
      formData.forEach((val, key) => {
        payload[key] = val.toString();
      });
    }

    const orderId = payload.orderId || payload._orderId || '';
    const status = (payload.status || '').toUpperCase();
    const trnId = payload.trnId || payload.transactionId || '';

    console.log(`[Koko Callback] Received webhook for order: ${orderId}, status: ${status}, trnId: ${trnId}`);

    if (orderId && ['SUCCESS', 'APPROVED', 'COMPLETED'].includes(status)) {
      if (fs.existsSync(ORDERS_FILE)) {
        const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
        const idx = orders.findIndex((o: any) => String(o.id) === String(orderId) || String(o.orderId) === String(orderId));

        if (idx !== -1) {
          orders[idx].paymentStatus = 'paid';
          orders[idx].status = 'confirmed';
          orders[idx].paymentGateway = 'koko';
          orders[idx].transactionId = trnId;
          orders[idx].paidAt = new Date().toISOString();
          fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
          console.log(`[Koko Callback] Order ${orderId} successfully marked as PAID via Koko!`);
        }
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (err: any) {
    console.error('Koko notify error:', err);
    return new NextResponse('Error', { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Support browser redirect fallback
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId') || '';
  const status = (searchParams.get('status') || '').toUpperCase();

  if (orderId && ['SUCCESS', 'APPROVED', 'COMPLETED'].includes(status)) {
    return NextResponse.redirect(new URL(`/order-success?orderId=${encodeURIComponent(orderId)}&gateway=koko`, req.url));
  }

  return NextResponse.redirect(new URL(`/checkout?cancelled=true`, req.url));
}
