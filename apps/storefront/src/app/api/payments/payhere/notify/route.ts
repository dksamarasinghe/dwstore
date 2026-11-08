import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getPaymentGatewaysConfig } from '@/lib/payment-gateways';

export const dynamic = 'force-dynamic';

const ORDERS_FILE = path.join(process.cwd(), 'src', 'data', 'orders.json');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const merchant_id = formData.get('merchant_id')?.toString() || '';
    const order_id = formData.get('order_id')?.toString() || '';
    const payment_id = formData.get('payment_id')?.toString() || '';
    const payhere_amount = formData.get('payhere_amount')?.toString() || '';
    const payhere_currency = formData.get('payhere_currency')?.toString() || '';
    const status_code = formData.get('status_code')?.toString() || '';
    const md5sig = formData.get('md5sig')?.toString() || '';

    const gateways = getPaymentGatewaysConfig();
    const config = gateways?.payhere;
    const secret = config?.merchantSecret || '';

    // Verify MD5 signature
    const hashedSecret = crypto.createHash('md5').update(secret).digest('hex').toUpperCase();
    const checkString = `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${hashedSecret}`;
    const calculatedSig = crypto.createHash('md5').update(checkString).digest('hex').toUpperCase();

    if (calculatedSig !== md5sig.toUpperCase()) {
      console.warn(`[PayHere IPN] Invalid signature for Order ${order_id}`);
      return new NextResponse('Invalid signature', { status: 400 });
    }

    // Status code 2 = Success
    if (status_code === '2') {
      try {
        if (fs.existsSync(ORDERS_FILE)) {
          const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
          const orderIndex = orders.findIndex((o: any) => String(o.id) === order_id || String(o.orderId) === order_id);

          if (orderIndex !== -1) {
            orders[orderIndex].paymentStatus = 'paid';
            orders[orderIndex].status = 'confirmed';
            orders[orderIndex].paymentGateway = 'payhere';
            orders[orderIndex].transactionId = payment_id;
            orders[orderIndex].paidAt = new Date().toISOString();
            fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
            console.log(`[PayHere IPN] Order ${order_id} marked as PAID via PayHere (Transaction: ${payment_id})`);
          }
        }
      } catch (err) {
        console.error('Error updating order on PayHere IPN:', err);
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (err: any) {
    console.error('PayHere IPN error:', err);
    return new NextResponse('Server Error', { status: 500 });
  }
}
