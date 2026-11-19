import { NextRequest, NextResponse } from 'next/server';
import { readDataJson, writeDataJson } from '@/lib/data-paths';

export const dynamic = 'force-dynamic';

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
        orders[idx].paymentGateway = 'koko';
        orders[idx].transactionId = trnId;
        orders[idx].paidAt = new Date().toISOString();
        writeDataJson('orders.json', orders);
        console.log(`[Koko Callback] Order ${orderId} successfully marked as PAID via Koko!`);
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
