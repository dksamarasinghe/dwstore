import { NextResponse } from 'next/server';
import { readDataJson } from '@/lib/data-paths';

export const dynamic = 'force-dynamic';

export async function GET() {
  const orders = readDataJson<any[]>('orders.json', []);
  const targetOrder = orders.find((o) => String(o.orderId || '').includes('175747'));

  return NextResponse.json({
    version: '2.1.0',
    commit: 'cb7865f-and-fixes',
    timestamp: new Date().toISOString(),
    totalOrdersInDb: orders.length,
    order175747: targetOrder
      ? { orderId: targetOrder.orderId, status: targetOrder.status, paymentStatus: targetOrder.paymentStatus }
      : null,
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
