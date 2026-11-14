import { NextRequest, NextResponse } from 'next/server';
import { readDataJson, writeDataJson } from '@/lib/data-paths';
import { dispatchSingleWhatsAppMessage } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  const fileConfig = readDataJson<any>('email-config.json', {
    enabled: true,
    resendApiKey: '',
    fromEmail: 'DWstore.lk <orders@dwstore.lk>',
    adminEmail: 'support@dwstore.lk',
    customerEmailNotifications: true,
    adminEmailNotifications: true,
    ownerWhatsApp: '0756693358',
    ownerWhatsAppNotifications: true,
    customerWhatsAppNotifications: true,
  });

  const resendApiKey = fileConfig?.resendApiKey || process.env.RESEND_API_KEY || '';
  const fromEmail = fileConfig?.fromEmail || process.env.RESEND_FROM_EMAIL || 'DWstore.lk <orders@dwstore.lk>';
  const adminEmail = fileConfig?.adminEmail || process.env.ADMIN_NOTIFICATION_EMAIL || 'support@dwstore.lk';
  const ownerWhatsApp = fileConfig?.ownerWhatsApp || process.env.OWNER_WHATSAPP_PHONE || '0756693358';

  return NextResponse.json(
    {
      success: true,
      config: {
        enabled: fileConfig?.enabled !== false,
        resendApiKey,
        fromEmail,
        adminEmail,
        customerEmailNotifications: fileConfig?.customerEmailNotifications !== false,
        adminEmailNotifications: fileConfig?.adminEmailNotifications !== false,
        ownerWhatsApp,
        ownerWhatsAppNotifications: fileConfig?.ownerWhatsAppNotifications !== false,
        customerWhatsAppNotifications: fileConfig?.customerWhatsAppNotifications !== false,
        hasApiKey: Boolean(resendApiKey && resendApiKey.startsWith('re_')),
      },
    },
    { headers: CORS_HEADERS }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Send test email action
    if (body.action === 'test') {
      const apiKey = body.resendApiKey || process.env.RESEND_API_KEY;
      const targetEmail = body.testEmail || body.adminEmail || process.env.ADMIN_NOTIFICATION_EMAIL || 'support@dwstore.lk';
      const fromEmail = body.fromEmail || process.env.RESEND_FROM_EMAIL || 'DWstore.lk <orders@dwstore.lk>';

      if (!apiKey) {
        return NextResponse.json(
          { success: false, error: 'Resend API Key is required to send emails.' },
          { status: 400, headers: CORS_HEADERS }
        );
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [targetEmail],
          subject: '✅ DWstore.lk Resend Email Integration Test',
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
              <h2 style="color: #2563eb; margin-top: 0;">🎉 Resend Email Working!</h2>
              <p>Your <strong>dwstore.lk</strong> domain and Resend API Key are configured correctly.</p>
              <div style="background: #f8fafc; border-radius: 8px; padding: 12px; font-size: 13px; color: #334155;">
                <p style="margin: 4px 0;"><strong>Sender:</strong> ${fromEmail}</p>
                <p style="margin: 4px 0;"><strong>Recipient:</strong> ${targetEmail}</p>
                <p style="margin: 4px 0;"><strong>Status:</strong> Ready to deliver customer order receipts and owner alerts!</p>
              </div>
              <p style="font-size: 12px; color: #64748b; margin-top: 16px;">Sent from DWstore.lk Notification Engine.</p>
            </div>
          `,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json(
          { success: false, error: data.message || 'Resend API returned an error', details: data },
          { status: 400, headers: CORS_HEADERS }
        );
      }

      return NextResponse.json(
        { success: true, message: `Test email sent successfully to ${targetEmail}!`, resendId: data.id },
        { headers: CORS_HEADERS }
      );
    }

    // 2. Send test WhatsApp message action
    if (body.action === 'test-whatsapp') {
      const targetPhone = body.phone || body.ownerWhatsApp || '0756693358';
      const testMsg = `🔔 *DWstore.lk WhatsApp Notification Test!*\nThis is a test notification confirming that your WhatsApp order alert system is working. When a customer places an order on DWstore.lk, you will receive full details immediately!`;
      const result = await dispatchSingleWhatsAppMessage(targetPhone, testMsg, body);
      if (result.success) {
        return NextResponse.json(
          { success: true, message: `Test WhatsApp message sent successfully to ${targetPhone}!` },
          { headers: CORS_HEADERS }
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            error:
              result.error ||
              'Failed to reach WhatsApp Gateway. Make sure the WhatsApp Gateway is running (or QR code is linked).',
          },
          { status: 400, headers: CORS_HEADERS }
        );
      }
    }

    // 3. Save notification configuration
    const current = readDataJson<any>('email-config.json', {});
    const updated = {
      ...current,
      enabled: body.enabled !== false,
      resendApiKey: body.resendApiKey !== undefined ? body.resendApiKey.trim() : (current.resendApiKey || ''),
      fromEmail: body.fromEmail ? body.fromEmail.trim() : (current.fromEmail || 'DWstore.lk <orders@dwstore.lk>'),
      adminEmail: body.adminEmail ? body.adminEmail.trim() : (current.adminEmail || 'support@dwstore.lk'),
      customerEmailNotifications: body.customerEmailNotifications !== false,
      adminEmailNotifications: body.adminEmailNotifications !== false,
      ownerWhatsApp: body.ownerWhatsApp !== undefined ? body.ownerWhatsApp.trim() : (current.ownerWhatsApp || '0756693358'),
      ownerWhatsAppNotifications: body.ownerWhatsAppNotifications !== false,
      customerWhatsAppNotifications: body.customerWhatsAppNotifications !== false,
    };

    writeDataJson('email-config.json', updated);

    return NextResponse.json(
      { success: true, message: 'Notification settings saved successfully!', config: updated },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update notification settings' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
