import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getPaymentGatewaysConfig } from '@/lib/payment-gateways';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, amount, currency = 'LKR', customer, items = 'DWstore Electronics Order' } = body;

    if (!orderId || !amount) {
      return NextResponse.json({ success: false, error: 'Order ID and amount are required' }, { status: 400, headers: CORS_HEADERS });
    }

    const gateways = getPaymentGatewaysConfig();
    const config = gateways?.payhere;

    if (!config?.merchantId || !config?.merchantSecret) {
      return NextResponse.json(
        { success: false, error: 'PayHere is not configured in the Admin panel. Please add Merchant ID and Secret.' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const isLive = config.mode === 'live';
    const checkoutUrl = isLive
      ? 'https://www.payhere.lk/pay/checkout'
      : 'https://sandbox.payhere.lk/pay/checkout';

    const origin = req.nextUrl.origin || 'https://dwstore.lk';
    const amountFormatted = Number(amount).toFixed(2);

    // PayHere Hash Generation
    const hashedSecret = crypto
      .createHash('md5')
      .update(config.merchantSecret)
      .digest('hex')
      .toUpperCase();

    const dataToHash = `${config.merchantId}${orderId}${amountFormatted}${currency}${hashedSecret}`;
    const hash = crypto
      .createHash('md5')
      .update(dataToHash)
      .digest('hex')
      .toUpperCase();

    const payhereParams = {
      merchant_id: config.merchantId,
      return_url: `${origin}/order-success?orderId=${encodeURIComponent(orderId)}&gateway=payhere`,
      cancel_url: `${origin}/checkout?cancelled=true&orderId=${encodeURIComponent(orderId)}`,
      notify_url: `${origin}/api/payments/payhere/notify`,
      first_name: customer?.firstName || 'Valued',
      last_name: customer?.lastName || 'Customer',
      email: customer?.email || 'sales@dwstore.lk',
      phone: customer?.phone || '0712345678',
      address: customer?.address || 'Colombo',
      city: customer?.city || 'Colombo',
      country: 'Sri Lanka',
      order_id: String(orderId),
      items: String(items),
      currency: currency,
      amount: amountFormatted,
      hash: hash,
    };

    return NextResponse.json(
      {
        success: true,
        gateway: 'payhere',
        mode: config.mode,
        checkoutUrl,
        params: payhereParams,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error('PayHere initiation error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}
