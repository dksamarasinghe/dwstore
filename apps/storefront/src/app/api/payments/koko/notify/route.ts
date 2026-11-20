import { NextRequest, NextResponse } from 'next/server';
import { readDataJson, writeDataJson } from '@/lib/data-paths';

export const dynamic = 'force-dynamic';

function markOrderPaid(orderId: string, trnId?: string, gateway: string = 'koko') {
  if (!orderId) return false;
  try {
    const orders = readDataJson<any[]>('orders.json', []);
    const targetClean = String(orderId).replace(/^#+/, '').trim().toLowerCase();
    const targetDigits = String(orderId).replace(/\D/g, '');

    const idx = orders.findIndex((o: any) => {
      const oId = String(o.orderId || o.id || '').replace(/^#+/, '').trim().toLowerCase();
      if (oId === targetClean) return true;
      const oDigits = String(o.orderId || o.id || '').replace(/\D/g, '');
      if (targetDigits && oDigits && targetDigits === oDigits) return true;
      return false;
    });

    if (idx !== -1) {
      orders[idx].paymentStatus = 'Paid';
      orders[idx].paymentMethod = 'Koko (Buy Now Pay Later)';
      orders[idx].status = 'processing';
      orders[idx].paymentGateway = gateway;
      if (trnId) orders[idx].transactionId = trnId;
      orders[idx].paidAt = new Date().toISOString();
      writeDataJson('orders.json', orders);
      console.log(`[Koko Callback] Order ${orderId} successfully marked as PAID via Koko!`);
      return true;
    }
  } catch (err) {
    console.error('Error updating order on Koko verification:', err);
  }
  return false;
}

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

    console.log(`[Koko Webhook] Received webhook for order: ${orderId}, status: ${status}, trnId: ${trnId}`);

    // Strictly check official status codes: SUCCESS, APPROVED, COMPLETED
    if (orderId && ['SUCCESS', 'APPROVED', 'COMPLETED'].includes(status)) {
      markOrderPaid(orderId, trnId, 'koko');
    }

    return new NextResponse('OK', { status: 200 });
  } catch (err: any) {
    console.error('Koko notify error:', err);
    return new NextResponse('Error', { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Support browser redirect callback
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId') || searchParams.get('_orderId') || '';
  const status = (searchParams.get('status') || '').toUpperCase();
  const trnId = searchParams.get('trnId') || '';

  console.log(`[Koko Browser Return] orderId: ${orderId}, status: ${status}, trnId: ${trnId}`);

  // Strictly check official status codes: SUCCESS, APPROVED, COMPLETED
  if (orderId && ['SUCCESS', 'APPROVED', 'COMPLETED'].includes(status)) {
    markOrderPaid(orderId, trnId, 'koko');
    return NextResponse.redirect(new URL(`/order-success?orderId=${encodeURIComponent(orderId)}&gateway=koko&status=SUCCESS`, req.url));
  }

  // Cancelled or Failed
  return NextResponse.redirect(new URL(`/checkout?cancelled=true&orderId=${encodeURIComponent(orderId)}`, req.url));
}
