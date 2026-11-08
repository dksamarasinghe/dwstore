import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Private-Network': 'true',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

const ALLOWED_FOLDERS = ['products', 'brands', 'home-customizer', 'gallery', 'general'];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || 'products';
    const targetFolder = ALLOWED_FOLDERS.includes(folder) ? folder : 'products';

    const dirPath = path.join(process.cwd(), 'public', 'media', targetFolder);
    if (!fs.existsSync(dirPath)) {
      return NextResponse.json({ success: true, files: [] }, { headers: CORS_HEADERS });
    }

    const fileNames = fs.readdirSync(dirPath);
    const files = fileNames
      .filter((name) => /\.(jpg|jpeg|png|webp|svg|gif|avif)$/i.test(name))
      .map((name) => {
        const filePath = path.join(dirPath, name);
        const stats = fs.statSync(filePath);
        return {
          name,
          url: `/media/${targetFolder}/${name}`,
          size: stats.size,
          createdAt: stats.birthtime,
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({ success: true, folder: targetFolder, files }, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error('Error listing media:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'products';
    const targetFolder = ALLOWED_FOLDERS.includes(folder) ? folder : 'products';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided in form data' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'media', targetFolder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Sanitize and create unique filename
    const originalName = file.name || 'image.jpg';
    const ext = path.extname(originalName).toLowerCase() || '.jpg';
    const baseName = path.basename(originalName, ext)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 40) || 'media';

    const uniqueName = `${baseName}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, uniqueName);

    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/media/${targetFolder}/${uniqueName}`;

    return NextResponse.json(
      {
        success: true,
        url: relativeUrl,
        filename: uniqueName,
        folder: targetFolder,
        size: buffer.length,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error('Error uploading media file:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'File upload failed' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
