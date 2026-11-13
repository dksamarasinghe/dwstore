import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Private-Network': 'true',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

const ALLOWED_FOLDERS = [
  'products',
  'categories',
  'category-icons',
  'brands',
  'home-customizer',
  'gallery',
  'general',
];

/**
 * Returns all candidate directories where public/media lives
 */
function getMediaBaseDirs(): string[] {
  const candidates = [
    path.join(process.cwd(), 'apps', 'storefront', 'public', 'media'),
    path.join(process.cwd(), 'public', 'media'),
    '/var/www/dwstore/apps/storefront/public/media',
    '/var/www/dwstore/public/media',
    path.resolve(process.cwd(), '..', 'storefront', 'public', 'media'),
    path.resolve(process.cwd(), '..', 'public', 'media'),
  ];
  return Array.from(new Set(candidates));
}

/**
 * Returns candidate directory paths for a specific folder
 */
function getTargetFolderDirs(folder: string): string[] {
  const safeFolder = ALLOWED_FOLDERS.includes(folder) ? folder : 'products';
  return getMediaBaseDirs().map((base) => path.join(base, safeFolder));
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || 'products';
    const action = searchParams.get('action');
    const search = (searchParams.get('search') || '').toLowerCase().trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(200, Math.max(10, parseInt(searchParams.get('limit') || '48', 10)));

    // Return overview of all folders if requested
    if (action === 'folders' || folder === 'all') {
      const folderStats: any[] = [];
      let totalFiles = 0;
      let totalBytes = 0;

      for (const f of ALLOWED_FOLDERS) {
        const dirs = getTargetFolderDirs(f);
        const existingDir = dirs.find((d) => fs.existsSync(d));
        let count = 0;
        let bytes = 0;

        if (existingDir) {
          try {
            const names = fs.readdirSync(existingDir);
            for (const name of names) {
              if (/\.(jpg|jpeg|png|webp|svg|gif|avif|mp4)$/i.test(name)) {
                count++;
                try {
                  const s = fs.statSync(path.join(existingDir, name));
                  bytes += s.size;
                } catch {}
              }
            }
          } catch {}
        }

        totalFiles += count;
        totalBytes += bytes;
        folderStats.push({
          name: f,
          count,
          sizeBytes: bytes,
          sizeFormatted: formatBytes(bytes),
        });
      }

      return NextResponse.json(
        {
          success: true,
          folders: folderStats,
          stats: {
            totalFiles,
            totalSizeBytes: totalBytes,
            totalSizeFormatted: formatBytes(totalBytes),
          },
        },
        { headers: CORS_HEADERS }
      );
    }

    // List files: either from 'all' folders or a specific folder
    let files: any[] = [];
    let targetFolder = folder;

    if (folder === 'all') {
      targetFolder = 'all';
      for (const f of ALLOWED_FOLDERS) {
        const dirs = getTargetFolderDirs(f);
        const existingDir = dirs.find((d) => fs.existsSync(d));
        if (existingDir) {
          try {
            const fileNames = fs.readdirSync(existingDir);
            for (const name of fileNames) {
              if (/\.(jpg|jpeg|png|webp|svg|gif|avif|mp4)$/i.test(name)) {
                const filePath = path.join(existingDir, name);
                let size = 0;
                let createdAt = new Date();
                try {
                  const stats = fs.statSync(filePath);
                  size = stats.size;
                  createdAt = stats.birthtime || stats.mtime;
                } catch {}
                files.push({
                  name,
                  url: `/media/${f}/${name}`,
                  size,
                  sizeFormatted: formatBytes(size),
                  createdAt,
                  folder: f,
                });
              }
            }
          } catch {}
        }
      }
    } else {
      targetFolder = ALLOWED_FOLDERS.includes(folder) ? folder : 'products';
      const dirs = getTargetFolderDirs(targetFolder);
      const existingDir = dirs.find((d) => fs.existsSync(d));

      if (existingDir) {
        try {
          const fileNames = fs.readdirSync(existingDir);
          files = fileNames
            .filter((name) => /\.(jpg|jpeg|png|webp|svg|gif|avif|mp4)$/i.test(name))
            .map((name) => {
              const filePath = path.join(existingDir, name);
              let size = 0;
              let createdAt = new Date();
              try {
                const stats = fs.statSync(filePath);
                size = stats.size;
                createdAt = stats.birthtime || stats.mtime;
              } catch {}
              return {
                name,
                url: `/media/${targetFolder}/${name}`,
                size,
                sizeFormatted: formatBytes(size),
                createdAt,
                folder: targetFolder,
              };
            });
        } catch {}
      }
    }

    if (search) {
      files = files.filter((f) => f.name.toLowerCase().includes(search));
    }

    // Sort newest first
    files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = files.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = files.slice((page - 1) * limit, page * limit);

    return NextResponse.json(
      {
        success: true,
        folder: targetFolder,
        files: paginated,
        total,
        page,
        totalPages,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error('[Upload API GET] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: CORS_HEADERS }
    );
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

    // Sanitize and create unique filename
    const originalName = file.name || 'image.jpg';
    const ext = path.extname(originalName).toLowerCase() || '.jpg';

    // Anti-Malware: Only allow genuine image and video extensions
    const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.avif', '.mp4'];
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { success: false, error: 'Security Warning: Only image files (JPG, PNG, WebP, SVG, AVIF) and MP4 are permitted.' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Maximum file size limit: 30MB
    if (buffer.length > 30 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds the 30MB upload limit.' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const baseName =
      path
        .basename(originalName, ext)
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 40) || 'media';

    const uniqueName = `${baseName}-${Date.now()}${ext}`;

    // Ensure written to all candidate locations for the folder
    const targetDirs = getTargetFolderDirs(targetFolder);
    let writtenCount = 0;

    for (const dir of targetDirs) {
      try {
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, uniqueName), buffer);
        writtenCount++;
      } catch (writeErr) {
        // Silently skip paths that cannot be accessed in current environment
      }
    }

    if (writtenCount === 0) {
      // Fallback: write to default process.cwd() public/media
      const fallbackDir = path.join(process.cwd(), 'public', 'media', targetFolder);
      fs.mkdirSync(fallbackDir, { recursive: true });
      fs.writeFileSync(path.join(fallbackDir, uniqueName), buffer);
    }

    const relativeUrl = `/media/${targetFolder}/${uniqueName}`;

    return NextResponse.json(
      {
        success: true,
        url: relativeUrl,
        filename: uniqueName,
        folder: targetFolder,
        size: buffer.length,
        sizeFormatted: formatBytes(buffer.length),
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error('[Upload API POST] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'File upload failed' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let targetUrl = searchParams.get('url') || '';
    let targetFolder = searchParams.get('folder') || '';
    let targetFile = searchParams.get('filename') || '';

    // If json body provided
    try {
      const body = await req.json();
      if (body) {
        targetUrl = body.url || targetUrl;
        targetFolder = body.folder || targetFolder;
        targetFile = body.filename || targetFile;
      }
    } catch {}

    if (targetUrl) {
      // Parse /media/<folder>/<filename>
      const cleanUrl = targetUrl.replace(/^\/media\//, '');
      const parts = cleanUrl.split('/');
      if (parts.length >= 2) {
        targetFolder = parts[0];
        targetFile = parts.slice(1).join('/');
      }
    }

    if (!targetFolder || !targetFile) {
      return NextResponse.json(
        { success: false, error: 'Folder and filename are required to delete' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Security check: prevent directory traversal
    const safeFile = path.basename(targetFile);
    const targetDirs = getTargetFolderDirs(targetFolder);
    let deletedCount = 0;

    for (const dir of targetDirs) {
      const fullPath = path.join(dir, safeFile);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
          deletedCount++;
        } catch {}
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: deletedCount > 0 ? 'File deleted successfully' : 'File was already removed',
        deletedCount,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error('[Upload API DELETE] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'File deletion failed' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
