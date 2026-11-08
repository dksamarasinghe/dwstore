import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { globalMemoryCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function getDirectorySize(dirPath: string): number {
  let size = 0;
  if (!fs.existsSync(dirPath)) return 0;
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        size += getDirectorySize(filePath);
      } else {
        size += stat.size;
      }
    }
  } catch (err) {
    // Ignore permission or transient errors
  }
  return size;
}

function clearDirectory(dirPath: string, deleteRoot = false): number {
  let freed = 0;
  if (!fs.existsSync(dirPath)) return 0;
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        freed += clearDirectory(filePath, true);
      } else {
        freed += stat.size;
        fs.unlinkSync(filePath);
      }
    }
    if (deleteRoot) {
      fs.rmdirSync(dirPath);
    }
  } catch (err) {
    // Ignore errors for locked files
  }
  return freed;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function GET() {
  const cwd = process.cwd();
  const nextCacheDir = path.join(cwd, '.next', 'cache');
  const imageCacheDir = path.join(nextCacheDir, 'images');
  const fetchCacheDir = path.join(nextCacheDir, 'fetch-cache');

  const totalCacheBytes = getDirectorySize(nextCacheDir);
  const imageCacheBytes = getDirectorySize(imageCacheDir);
  const fetchCacheBytes = getDirectorySize(fetchCacheDir);

  return NextResponse.json(
    {
      success: true,
      cacheStats: {
        totalSize: formatBytes(totalCacheBytes),
        totalBytes: totalCacheBytes,
        imageCacheSize: formatBytes(imageCacheBytes),
        fetchCacheSize: formatBytes(fetchCacheBytes),
        memoryCacheActive: true,
      },
    },
    { headers: CORS_HEADERS }
  );
}

export async function POST(req: NextRequest) {
  try {
    const cwd = process.cwd();
    const nextCacheDir = path.join(cwd, '.next', 'cache');
    const imageCacheDir = path.join(nextCacheDir, 'images');
    const fetchCacheDir = path.join(nextCacheDir, 'fetch-cache');

    let totalFreed = 0;

    // 1. Purge Next.js image cache
    if (fs.existsSync(imageCacheDir)) {
      totalFreed += clearDirectory(imageCacheDir, false);
    }

    // 2. Purge Next.js fetch cache
    if (fs.existsSync(fetchCacheDir)) {
      totalFreed += clearDirectory(fetchCacheDir, false);
    }

    // 3. Purge In-Memory RAM Caches
    globalMemoryCache.clear();

    return NextResponse.json(
      {
        success: true,
        freedBytes: totalFreed,
        freedSize: formatBytes(totalFreed),
        timestamp: new Date().toISOString(),
        message: `Successfully purged ${formatBytes(totalFreed)} of cached data. Server RAM & Disk storage optimized!`,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
