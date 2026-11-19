import { NextRequest, NextResponse } from 'next/server';
import { readDataJson, writeDataJson } from '@/lib/data-paths';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('x_order_id') || searchParams.get('orderId') || '';
    const responseCode = searchParams.get('response_code') || '';
    const signature = searchParams.get('signature') || '';

    console.log(`[Payzy Return] Order: ${orderId}, Code: ${responseCode}`);

    if (orderId && responseCode === '00') {
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
          orders[idx].paymentGateway = 'payzy';
          orders[idx].paidAt = new Date().toISOString();
          writeDataJson('orders.json', orders);
          console.log(`[Payzy Return] Order ${orderId} successfully marked as PAID via Payzy!`);
        }
      } catch (err) {
        console.error('Error updating order on Payzy return:', err);
      }

      return NextResponse.redirect(new URL(`/order-success?orderId=${encodeURIComponent(orderId)}&gateway=payzy`, req.url));
    }

    return NextResponse.redirect(new URL(`/checkout?cancelled=true&orderId=${encodeURIComponent(orderId)}`, req.url));
  } catch (err: any) {
    console.error('Payzy notify handler error:', err);
    return NextResponse.redirect(new URL(`/checkout?cancelled=true`, req.url));
  }
}

export async function POST(req: NextRequest) {
  // Same handling for POST callbacks
  return GET(req);
}
