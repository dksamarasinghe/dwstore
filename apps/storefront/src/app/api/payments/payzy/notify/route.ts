import { NextRequest, NextResponse } from 'next/server';
import { readDataJson, writeDataJson } from '@/lib/data-paths';
import { sendPaymentReceivedEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

function markOrderPaid(orderId: string, gateway: string = 'payzy') {
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
      orders[idx].paymentMethod = 'Payzy (Buy Now Pay Later)';
      orders[idx].status = 'processing';
      orders[idx].paymentGateway = gateway;
      orders[idx].paidAt = new Date().toISOString();
      writeDataJson('orders.json', orders);
      console.log(`[Payzy Callback] Order ${orderId} successfully marked as PAID via Payzy!`);
      // Dispatch payment confirmed email
      Promise.allSettled([
        sendPaymentReceivedEmail(orders[idx]),
      ]).catch((err) => {
        console.error('[Payzy Email Error]', err);
      });
      return true;
    }
  } catch (err) {
    console.error('Error updating order on Payzy verification:', err);
  }
  return false;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('x_order_id') || searchParams.get('orderId') || '';
    const responseCode = searchParams.get('response_code') || '';
    const signature = searchParams.get('signature') || '';

    console.log(`[Payzy Return GET] Order: ${orderId}, Code: ${responseCode}`);

    // Strictly check official Payzy success response code: '00'
    if (orderId && responseCode === '00') {
      markOrderPaid(orderId, 'payzy');
      return NextResponse.redirect(new URL(`/order-success?orderId=${encodeURIComponent(orderId)}&gateway=payzy&status=SUCCESS`, req.url));
    }

    return NextResponse.redirect(new URL(`/checkout?cancelled=true&orderId=${encodeURIComponent(orderId)}`, req.url));
  } catch (err: any) {
    console.error('Payzy notify handler error:', err);
    return NextResponse.redirect(new URL(`/checkout?cancelled=true`, req.url));
  }
}

export async function POST(req: NextRequest) {
  try {
    let orderId = '';
    let responseCode = '';
    let signature = '';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json();
      orderId = body.x_order_id || body.orderId || '';
      responseCode = body.response_code || '';
      signature = body.signature || '';
    } else {
      const formData = await req.formData();
      orderId = formData.get('x_order_id')?.toString() || formData.get('orderId')?.toString() || '';
      responseCode = formData.get('response_code')?.toString() || '';
      signature = formData.get('signature')?.toString() || '';
    }

    if (!orderId) {
      const { searchParams } = new URL(req.url);
      orderId = searchParams.get('x_order_id') || searchParams.get('orderId') || '';
      responseCode = searchParams.get('response_code') || '';
      signature = searchParams.get('signature') || '';
    }

    console.log(`[Payzy Webhook POST] Order: ${orderId}, Code: ${responseCode}`);

    // Strictly check official Payzy success response code: '00'
    if (orderId && responseCode === '00') {
      markOrderPaid(orderId, 'payzy');
      return NextResponse.redirect(new URL(`/order-success?orderId=${encodeURIComponent(orderId)}&gateway=payzy&status=SUCCESS`, req.url));
    }

    return NextResponse.redirect(new URL(`/checkout?cancelled=true&orderId=${encodeURIComponent(orderId)}`, req.url));
  } catch (err: any) {
    console.error('Payzy POST notify error:', err);
    return NextResponse.redirect(new URL(`/checkout?cancelled=true`, req.url));
  }
}
