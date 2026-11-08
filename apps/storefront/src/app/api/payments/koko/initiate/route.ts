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
    const config = gateways?.koko;

    if (!config?.merchantId || !config?.apiKey || !config?.privateKey) {
      return NextResponse.json(
        { success: false, error: 'Koko is not configured in the Admin panel. Please add Merchant ID, API Key, and Private Key.' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const isLive = config.mode === 'live';
    const checkoutUrl = isLive
      ? 'https://prodapi.paykoko.com/api/merchants/orderCreate'
      : 'https://qaapi.paykoko.com/api/merchants/orderCreate';

    const origin = req.nextUrl.origin || 'https://dwstore.lk';
    const amountFormatted = Number(amount).toFixed(2);
    const returnUrl = `${origin}/order-success?orderId=${encodeURIComponent(orderId)}&gateway=koko`;
    const cancelUrl = `${origin}/checkout?cancelled=true&orderId=${encodeURIComponent(orderId)}`;
    const responseUrl = `${origin}/api/payments/koko/notify`;

    const pluginName = 'woocommerce';
    const pluginVersion = '3.0.4';
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const reference = `${config.merchantId}${randomSuffix}-${orderId}`;

    const firstName = customer?.firstName || 'Valued';
    const lastName = customer?.lastName || 'Customer';
    const email = customer?.email || 'sales@dwstore.lk';
    const mobile = customer?.phone || '0712345678';
    const description = String(items || 'DWstore Electronics');

    // Koko dataString format according to official Koko plugin specification
    const dataString =
      config.merchantId +
      amountFormatted +
      currency +
      pluginName +
      pluginVersion +
      returnUrl +
      cancelUrl +
      orderId +
      reference +
      firstName +
      lastName +
      email +
      description +
      config.apiKey +
      responseUrl;

    // RSA-SHA256 signature using Merchant Private Key
    let signatureEncoded = '';
    try {
      let formattedKey = config.privateKey.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      if (!formattedKey.includes('-----BEGIN PRIVATE KEY-----') && !formattedKey.includes('-----BEGIN RSA PRIVATE KEY-----')) {
        formattedKey = `-----BEGIN RSA PRIVATE KEY-----\n${formattedKey}\n-----END RSA PRIVATE KEY-----`;
      }
      const signer = crypto.createSign('SHA256');
      signer.update(dataString);
      signer.end();
      signatureEncoded = signer.sign(formattedKey, 'base64');
    } catch (keyErr: any) {
      console.error('Koko RSA signature failed:', keyErr);
      return NextResponse.json(
        { success: false, error: 'Invalid Koko Private Key format. Please verify your RSA key in Admin Integrations.' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const kokoParams = {
      _mId: config.merchantId,
      api_key: config.apiKey,
      _returnUrl: returnUrl,
      _responseUrl: responseUrl,
      _cancelUrl: cancelUrl,
      _currency: currency,
      _amount: amountFormatted,
      _reference: reference,
      _pluginName: pluginName,
      _pluginVersion: pluginVersion,
      _orderId: String(orderId),
      _firstName: firstName,
      _lastName: lastName,
      _email: email,
      _description: description,
      _mobileNo: mobile,
      dataString: dataString,
      signature: signatureEncoded,
    };

    return NextResponse.json(
      {
        success: true,
        gateway: 'koko',
        mode: config.mode,
        checkoutUrl,
        params: kokoParams,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error('Koko initiation error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}
