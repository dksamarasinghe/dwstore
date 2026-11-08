import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const REVIEWS_FILE = path.join(process.cwd(), 'src', 'data', 'reviews.json');

function getReviewsData() {
  try {
    if (fs.existsSync(REVIEWS_FILE)) {
      const content = fs.readFileSync(REVIEWS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading reviews:', err);
  }
  return {
    stats: {
      storeName: 'DWStore',
      rating: 4.9,
      totalReviews: 111,
      mapsUrl: 'https://maps.google.com/?q=DWStore+No.55/1/2+Borella+Rd+Pannipitiya',
    },
    reviews: [],
  };
}

function saveReviewsData(data: any) {
  try {
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing reviews:', err);
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

export async function GET() {
  const data = getReviewsData();
  return NextResponse.json(data, { headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = getReviewsData();

    if (body.action === 'update-stats' && body.stats) {
      data.stats = { ...data.stats, ...body.stats };
    } else if (body.name && body.text) {
      const avatarColors = [
        'bg-blue-600',
        'bg-indigo-600',
        'bg-emerald-600',
        'bg-purple-600',
        'bg-teal-600',
        'bg-amber-600',
        'bg-rose-600',
        'bg-cyan-600',
      ];
      const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

      const newReview = {
        id: `rev-${Date.now()}`,
        name: body.name.trim(),
        time: body.time?.trim() || 'Just now',
        rating: Number(body.rating) || 5,
        text: body.text.trim(),
        verified: body.verified !== false,
        location: body.location || 'Borella Rd Store',
        avatarBg: body.avatarBg || randomColor,
      };

      // Add to front of list
      data.reviews.unshift(newReview);
      data.stats.totalReviews = (data.stats.totalReviews || 111) + 1;
    }

    saveReviewsData(data);
    return NextResponse.json({ success: true, data }, { headers: CORS_HEADERS });
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
        { success: false, error: 'Review ID is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const data = getReviewsData();
    data.reviews = data.reviews.filter((r: any) => r.id !== id);
    saveReviewsData(data);

    return NextResponse.json({ success: true, data }, { headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}
