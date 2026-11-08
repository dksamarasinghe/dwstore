import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function getCouponsFilePath(): string {
  const p1 = path.join(process.cwd(), 'apps', 'storefront', 'src', 'data', 'coupons.json');
  if (fs.existsSync(p1)) return p1;
  const p2 = path.join(process.cwd(), 'src', 'data', 'coupons.json');
  if (fs.existsSync(p2)) return p2;
  return p1;
}

function readCoupons(): any[] {
  try {
    const filePath = getCouponsFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading coupons:', err);
  }
  return [];
}

function writeCoupons(coupons: any[]): boolean {
  try {
    const filePath = getCouponsFilePath();
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(coupons, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing coupons:', err);
    return false;
  }
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const subtotalParam = searchParams.get('subtotal');

  const coupons = readCoupons();

  // If validating a specific coupon code
  if (code) {
    const cleanCode = code.trim().toUpperCase();
    const coupon = coupons.find(
      (c) => c.code?.trim().toUpperCase() === cleanCode
    );

    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: `Invalid coupon code "${code}". Please check and try again.`,
        },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    if (coupon.status !== 'Active') {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: `Coupon "${coupon.code}" is currently disabled.`,
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Check expiry
    if (coupon.expiryDate) {
      const expiry = new Date(coupon.expiryDate);
      expiry.setHours(23, 59, 59);
      if (new Date() > expiry) {
        return NextResponse.json(
          {
            success: false,
            valid: false,
            error: `Coupon "${coupon.code}" expired on ${coupon.expiryDate}.`,
          },
          { status: 400, headers: CORS_HEADERS }
        );
      }
    }

    // Check usage limits
    if (coupon.maxUsage && coupon.usedCount >= coupon.maxUsage) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: `Coupon "${coupon.code}" usage limit has been reached.`,
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Check subtotal / minimum spend
    const subtotal = subtotalParam ? parseFloat(subtotalParam) : 0;
    if (coupon.minSpend && subtotal > 0 && subtotal < coupon.minSpend) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: `Minimum spend of LKR ${coupon.minSpend.toLocaleString()} required for this coupon. (Current: LKR ${subtotal.toLocaleString()})`,
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal || coupon.discountValue);
    }

    return NextResponse.json(
      {
        success: true,
        valid: true,
        coupon,
        discountAmount,
        message:
          coupon.discountType === 'percentage'
            ? `${coupon.discountValue}% discount applied!`
            : `LKR ${coupon.discountValue.toLocaleString()} discount applied!`,
      },
      { headers: CORS_HEADERS }
    );
  }

  // Return full list of coupons (for admin)
  return NextResponse.json(
    {
      success: true,
      coupons,
    },
    { headers: CORS_HEADERS }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const coupons = readCoupons();

    const cleanCode = (body.code || '').trim().toUpperCase();
    if (!cleanCode) {
      return NextResponse.json(
        { success: false, error: 'Coupon code is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const existingIndex = coupons.findIndex(
      (c) => c.id === body.id || c.code?.trim().toUpperCase() === cleanCode
    );

    const updatedCoupon = {
      id: body.id || `cp-${Date.now()}`,
      code: cleanCode,
      discountType: body.discountType === 'fixed' ? 'fixed' : 'percentage',
      discountValue: parseFloat(body.discountValue) || 0,
      minSpend: parseFloat(body.minSpend) || 0,
      usedCount: typeof body.usedCount === 'number' ? body.usedCount : 0,
      maxUsage: typeof body.maxUsage === 'number' ? body.maxUsage : 500,
      expiryDate: body.expiryDate || '2026-12-31',
      status: body.status || 'Active',
    };

    if (existingIndex >= 0) {
      coupons[existingIndex] = { ...coupons[existingIndex], ...updatedCoupon };
    } else {
      coupons.unshift(updatedCoupon);
    }

    writeCoupons(coupons);

    return NextResponse.json(
      {
        success: true,
        coupon: updatedCoupon,
        coupons,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Coupon ID is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    let coupons = readCoupons();
    coupons = coupons.filter((c) => c.id !== id);
    writeCoupons(coupons);

    return NextResponse.json(
      {
        success: true,
        coupons,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}
