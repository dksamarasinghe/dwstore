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
    const { orderId, amount, customer } = body;

    if (!orderId || !amount) {
      return NextResponse.json({ success: false, error: 'Order ID and amount are required' }, { status: 400, headers: CORS_HEADERS });
    }

    const gateways = getPaymentGatewaysConfig();
    const config = gateways?.payzy;

    if (!config?.shopId || !config?.secretKey) {
      return NextResponse.json(
        { success: false, error: 'Payzy is not configured in the Admin panel. Please add Shop ID and Secret Key.' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const isLive = config.mode === 'live';
    const checkoutUrl = isLive
      ? 'https://api.payzy.lk/checkout/checkout-start'
      : 'https://api.payzypay.xyz/checkout/checkout-start';

    const origin = req.nextUrl.origin || 'https://dwstore.lk';
    const amountFormatted = Number(amount).toFixed(2);
    const relayUrl = `${origin}/api/payments/payzy/notify`;

    const firstName = customer?.firstName || 'Valued';
    const lastName = customer?.lastName || 'Customer';
    const email = customer?.email || 'sales@dwstore.lk';
    const phone = customer?.phone || '0712345678';
    const address = customer?.address || 'Colombo';
    const city = customer?.city || 'Colombo';
    const postalCode = customer?.postalCode || '10100';

    const postData: Record<string, string> = {
      x_test_mode: isLive ? 'no' : 'yes',
      x_shopid: config.shopId,
      x_amount: amountFormatted,
      x_order_id: String(orderId),
      x_response_url: relayUrl,
      x_first_name: firstName,
      x_last_name: lastName,
      x_company: 'DWstore',
      x_address: address,
      x_country: 'LK',
      x_state: 'Western',
      x_city: city,
      x_zip: postalCode,
      x_phone: phone,
      x_email: email,
      x_ship_to_first_name: firstName,
      x_ship_to_last_name: lastName,
      x_ship_to_company: 'DWstore',
      x_ship_to_address: address,
      x_ship_to_country: 'LK',
      x_ship_to_state: 'Western',
      x_ship_to_city: city,
      x_ship_to_zip: postalCode,
      x_freight: '0.00',
      x_platform: 'woocommerce',
      x_version: '1.7',
      signed_field_names:
        'x_test_mode,x_shopid,x_amount,x_order_id,x_response_url,x_first_name,x_last_name,x_company,x_address,x_country,x_state,x_city,x_zip,x_phone,x_email,x_ship_to_first_name,x_ship_to_last_name,x_ship_to_company,x_ship_to_address,x_ship_to_country,x_ship_to_state,x_ship_to_city,x_ship_to_zip,x_freight,x_platform,x_version,signed_field_names',
    };

    // Calculate HMAC-SHA256 signature
    const signedFieldNames = postData.signed_field_names.split(',');
    const dataToSign = signedFieldNames.map((field) => `${field}=${postData[field] || ''}`).join(',');
    const signature = crypto
      .createHmac('sha256', config.secretKey)
      .update(dataToSign)
      .digest('base64');

    postData['signature'] = signature;

    return NextResponse.json(
      {
        success: true,
        gateway: 'payzy',
        mode: config.mode,
        checkoutUrl,
        params: postData,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error('Payzy initiation error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}
