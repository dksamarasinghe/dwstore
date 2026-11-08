import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// Possible local ports for WhatsApp gateway
const GATEWAY_URLS = [
  process.env.WHATSAPP_GATEWAY_INTERNAL_URL,
  'http://127.0.0.1:8080',
  'http://localhost:8080',
  'http://127.0.0.1:3002',
  'http://localhost:3002',
].filter(Boolean) as string[];

async function fetchFromGateway(endpoint: string, options: RequestInit = {}) {
  for (const baseUrl of GATEWAY_URLS) {
    try {
      const url = `${baseUrl.replace(/\/$/, '')}${endpoint}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });

      clearTimeout(timeoutId);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Try next candidate URL
    }
  }
  return null;
}

export async function GET() {
  const statusData = await fetchFromGateway('/status');

  if (statusData) {
    return NextResponse.json(
      {
        success: true,
        online: true,
        status: statusData.status || (statusData.isConnected ? 'connected' : 'waiting_for_qr'),
        isConnected: Boolean(statusData.isConnected),
        phone: statusData.phone || null,
        hasQr: Boolean(statusData.hasQr),
        qr: statusData.qr || null,
      },
      { headers: CORS_HEADERS }
    );
  }

  return NextResponse.json(
    {
      success: false,
      online: false,
      status: 'offline',
      isConnected: false,
      message: 'WhatsApp Gateway is currently offline. Please ensure the process is running.',
    },
    { headers: CORS_HEADERS }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || '';

    if (action === 'logout') {
      const result = await fetchFromGateway('/logout', { method: 'POST' });
      return NextResponse.json(
        result || { success: true, message: 'Logout command sent to WhatsApp gateway.' },
        { headers: CORS_HEADERS }
      );
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400, headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}
