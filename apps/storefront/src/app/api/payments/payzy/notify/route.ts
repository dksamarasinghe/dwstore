import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const ORDERS_FILE = path.join(process.cwd(), 'src', 'data', 'orders.json');

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('x_order_id') || searchParams.get('orderId') || '';
    const responseCode = searchParams.get('response_code') || '';
    const signature = searchParams.get('signature') || '';

    console.log(`[Payzy Return] Order: ${orderId}, Code: ${responseCode}`);

    if (orderId && responseCode === '00') {
      try {
        if (fs.existsSync(ORDERS_FILE)) {
          const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
          const idx = orders.findIndex((o: any) => String(o.id) === String(orderId) || String(o.orderId) === String(orderId));

          if (idx !== -1) {
            orders[idx].paymentStatus = 'paid';
            orders[idx].status = 'confirmed';
            orders[idx].paymentGateway = 'payzy';
            orders[idx].paidAt = new Date().toISOString();
            fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
            console.log(`[Payzy Return] Order ${orderId} successfully marked as PAID via Payzy!`);
          }
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
