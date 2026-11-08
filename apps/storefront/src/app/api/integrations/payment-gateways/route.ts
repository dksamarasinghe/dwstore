import { NextRequest, NextResponse } from 'next/server';
import { getPaymentGatewaysConfig, savePaymentGatewaysConfig } from '@/lib/payment-gateways';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isPublic = searchParams.get('public') === 'true';
  const config = getPaymentGatewaysConfig();

  if (isPublic) {
    // Strip sensitive secrets for frontend checkout
    const sanitized: Record<string, any> = {};
    for (const [key, val] of Object.entries(config) as any) {
      sanitized[key] = {
        enabled: val?.enabled !== false,
        title: val?.title || key,
        description: val?.description || '',
        mode: val?.mode || 'test',
        discountEnabled: Boolean(val?.discountEnabled),
        discountType: val?.discountType || 'percentage',
        discountValue: Number(val?.discountValue || 0),
        discountBadge: val?.discountBadge || '',
        hasKeys: Boolean(
          (key === 'payhere' && val?.merchantId && val?.merchantSecret) ||
          (key === 'koko' && val?.merchantId && val?.apiKey && val?.privateKey) ||
          (key === 'payzy' && val?.shopId && val?.secretKey) ||
          key === 'bank' ||
          key === 'cod'
        ),
        ...(key === 'bank'
          ? {
              accounts: val?.accounts || [],
              instructions: val?.instructions || '',
            }
          : {}),
      };
    }
    return NextResponse.json({ success: true, gateways: sanitized }, { headers: CORS_HEADERS });
  }

  // Full config for Admin portal
  return NextResponse.json({ success: true, gateways: config }, { headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400, headers: CORS_HEADERS });
    }

    const success = savePaymentGatewaysConfig(body);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Failed to write config file' }, { status: 500, headers: CORS_HEADERS });
    }

    const updated = getPaymentGatewaysConfig();
    return NextResponse.json(
      { success: true, message: 'Payment gateway configurations saved successfully!', gateways: updated },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error('Error saving payment gateways config:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}
