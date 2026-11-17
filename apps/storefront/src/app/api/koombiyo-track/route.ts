import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const ORDERS_FILE = path.join(process.cwd(), 'src', 'data', 'orders.json');

function getLocalOrders() {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading orders:', err);
  }
  return [];
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function formatCollectedDate(rawDate: string) {
  if (!rawDate) return '';
  const d = new Date(rawDate.replace(' ', 'T'));
  if (isNaN(d.getTime())) return rawDate;
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatAge(rawDate: string) {
  if (!rawDate) return '';
  const d = new Date(rawDate.replace(' ', 'T'));
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  let years = now.getFullYear() - d.getFullYear();
  let months = now.getMonth() - d.getMonth();
  let days = now.getDate() - d.getDate();
  if (days < 0) {
    months--;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  return `${years} Years, ${months} Months, ${days} Days`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const waybillId = (body.waybillId || body.waybill_id || body.trackingNumber || body.orderId || '').toString().trim();
    const phone = (body.phone || body.phoneNumber || '').toString().trim().replace(/[^0-9]/g, '');

    if (!waybillId && !phone) {
      return NextResponse.json(
        { success: false, error: 'Tracking ID or Phone Number is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Clean waybill for Koombiyo (e.g. strip KOOMBIYO-LK- if user entered full string, or pass as is)
    const cleanWaybill = waybillId.replace(/^KOOMBIYO-LK-/i, '').replace(/^DWS-/i, '').trim();

    // 1. Try querying Koombiyo Delivery Live API
    let koombiyoLiveResult: any = null;
    try {
      const searchParams = new URLSearchParams({
        waybill_id: cleanWaybill || waybillId,
        phone: phone || '0712345678',
      });

      const koombiyoRes = await fetch('https://koombiyodelivery.lk/api/track_order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: searchParams.toString(),
      });

      if (koombiyoRes.ok) {
        const data = await koombiyoRes.json();
        if (data && Number(data.status) === 200 && data.tracking) {
          koombiyoLiveResult = {
            trackingId: cleanWaybill || waybillId,
            trackingNumber: cleanWaybill || waybillId,
            orderId: cleanWaybill || waybillId,
            phone,
            status: data.tracking.order_status || 'In Transit',
            collectedDate: formatCollectedDate(data.tracking.collected_date),
            recipientName: data.tracking.name || '',
            destinationBranch: data.tracking.destination_branch || '',
            weight: data.tracking.weight || '1.00',
            age: formatAge(data.tracking.collected_date),
            raw: data.tracking,
          };
        }
      }
    } catch (e) {
      console.warn('Koombiyo live API error:', e);
    }

    // If Koombiyo live API returned real tracking
    if (koombiyoLiveResult) {
      // Auto-update order to delivered in system if Koombiyo reports delivered
      const statusLower = (koombiyoLiveResult.status || '').toLowerCase();
      if (statusLower.includes('deliver') || statusLower.includes('complete')) {
        try {
          const allOrders = getLocalOrders();
          const cleanRef = (cleanWaybill || waybillId).toUpperCase().replace('DWS-', '');
          let hasChange = false;
          for (const ord of allOrders) {
            const ordRef = (ord.orderId || '').toUpperCase().replace('DWS-', '');
            const ordTrk = (ord.trackingNumber || ord.courierTrackingNumber || '').toUpperCase();
            if (ordRef === cleanRef || (ordTrk && (ordTrk === cleanRef || cleanRef.includes(ordTrk)))) {
              if (ord.status !== 'delivered') {
                ord.status = 'delivered';
                ord.paymentStatus = 'Paid';
                hasChange = true;
              }
            }
          }
          if (hasChange) {
            fs.writeFileSync(ORDERS_FILE, JSON.stringify(allOrders, null, 2), 'utf-8');
          }
        } catch (syncErr) {
          console.warn('Auto-status update error:', syncErr);
        }
      }

      return NextResponse.json(
        {
          success: true,
          source: 'koombiyo_live',
          carrier: 'Koombiyo Delivery',
          tracking: koombiyoLiveResult,
        },
        { headers: CORS_HEADERS }
      );
    }

    // 2. Otherwise match from DWstore Orders database
    const localOrders = getLocalOrders();
    const cleanId = waybillId.toUpperCase();
    const matchedOrder = localOrders.find((o: any) => {
      const oId = (o.orderId || '').toUpperCase();
      const oTrk = (o.courierTrackingNumber || o.trackingNumber || '').toUpperCase();
      const oPhone = (o.customerPhone || o.customer?.phone || '').replace(/[^0-9]/g, '');

      const idMatch = oId === cleanId || oId.replace('DWS-', '') === cleanId.replace('DWS-', '');
      const trkMatch = oTrk && (oTrk === cleanId || oTrk.includes(cleanId) || cleanId.includes(oTrk));
      const phoneMatch = phone && oPhone && (oPhone.includes(phone) || phone.includes(oPhone));

      return idMatch || trkMatch || (phone && phoneMatch && idMatch);
    });

    if (matchedOrder) {
      const recipient = matchedOrder.customerName || `${matchedOrder.customer?.firstName || ''} ${matchedOrder.customer?.lastName || ''}`.trim() || 'Customer';
      const resolvedPhone = matchedOrder.customerPhone || matchedOrder.customer?.phone || phone;
      const destCity = matchedOrder.city || matchedOrder.customer?.city || 'Colombo';
      const destDist = matchedOrder.district || matchedOrder.customer?.district || 'Western Province';
      const manualTracking = (matchedOrder.courierTrackingNumber || matchedOrder.trackingNumber || '').trim();

      // If the admin HAS manually added a courier tracking number
      if (manualTracking) {
        // If Koombiyo live API wasn't checked with this manualTracking yet, try it now
        if (manualTracking !== cleanWaybill) {
          try {
            const koombiyoRes = await fetch('https://koombiyodelivery.lk/api/track_order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                waybill_id: manualTracking.replace(/^KOOMBIYO-LK-/i, '').replace(/^DWS-/i, '').trim(),
                phone: resolvedPhone || '0712345678',
              }).toString(),
            });
            if (koombiyoRes.ok) {
              const data = await koombiyoRes.json();
              if (data && Number(data.status) === 200 && data.tracking) {
                return NextResponse.json(
                  {
                    success: true,
                    source: 'koombiyo_live',
                    carrier: 'Koombiyo Delivery',
                    tracking: {
                      trackingId: manualTracking,
                      trackingNumber: manualTracking,
                      orderId: matchedOrder.orderId,
                      phone: resolvedPhone,
                      status: data.tracking.order_status || 'In Transit',
                      collectedDate: formatCollectedDate(data.tracking.collected_date),
                      recipientName: data.tracking.name || recipient,
                      destinationBranch: data.tracking.destination_branch || destCity,
                      weight: data.tracking.weight || '1.00',
                      age: formatAge(data.tracking.collected_date),
                      hasCourierTracking: true,
                      raw: data.tracking,
                    },
                  },
                  { headers: CORS_HEADERS }
                );
              }
            }
          } catch {}
        }

        const statusMap: Record<string, string> = {
          pending: 'Order Confirmed',
          processing: 'Processing',
          shipped: 'Out for Delivery',
          dispatched: 'Received at Destination',
          delivered: 'Delivered',
          cancelled: 'Returned',
        };

        const resolvedStatus = statusMap[matchedOrder.status?.toLowerCase()] || 'In Transit';

        return NextResponse.json(
          {
            success: true,
            source: 'dwstore_system',
            carrier: matchedOrder.carrier || 'Koombiyo Delivery',
            tracking: {
              orderId: matchedOrder.orderId,
              trackingNumber: manualTracking,
              hasCourierTracking: true,
              status: resolvedStatus,
              collectedDate: matchedOrder.dispatchedDate || (matchedOrder.createdAt ? new Date(matchedOrder.createdAt).toLocaleDateString('en-GB') : 'Recent'),
              recipientName: recipient,
              phone: resolvedPhone,
              destinationBranch: `${destCity} (${destDist})`,
              destinationAddress: matchedOrder.shippingAddress || matchedOrder.customer?.address || '',
              weight: '1.0 kg',
              items: matchedOrder.items || [],
              total: matchedOrder.total || Math.round((matchedOrder.totalMinor || 0) / 100),
              paymentMethod: matchedOrder.paymentMethod || 'COD',
            },
          },
          { headers: CORS_HEADERS }
        );
      }

      // NO MANUAL TRACKING NUMBER ENTERED YET
      // Order is still being processed/packed by store team - DO NOT fake a tracking number!
      return NextResponse.json(
        {
          success: true,
          source: 'dwstore_system',
          carrier: 'Pending Courier Dispatch',
          tracking: {
            orderId: matchedOrder.orderId,
            trackingNumber: '',
            hasCourierTracking: false,
            status: 'Processing (Pending Courier Dispatch)',
            orderStatus: matchedOrder.status || 'processing',
            collectedDate: matchedOrder.createdAt ? new Date(matchedOrder.createdAt).toLocaleDateString('en-GB') : 'Recent',
            recipientName: recipient,
            phone: resolvedPhone,
            destinationBranch: `${destCity} (${destDist})`,
            destinationAddress: matchedOrder.shippingAddress || matchedOrder.customer?.address || '',
            items: matchedOrder.items || [],
            total: matchedOrder.total || Math.round((matchedOrder.totalMinor || 0) / 100),
            paymentMethod: matchedOrder.paymentMethod || 'COD',
            message: 'Your order has been confirmed and is currently being processed by our store. A tracking number will be assigned as soon as the package is handed over to the courier service.',
          },
        },
        { headers: CORS_HEADERS }
      );
    }

    // 3. Not found in Koombiyo Live API and not found in DWstore Orders database:
    return NextResponse.json(
      {
        success: false,
        error: 'No shipment or order found for the provided Tracking ID and Phone Number. Please verify your details or contact customer care.',
      },
      { status: 404, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
