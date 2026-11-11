import { NextRequest } from 'next/server';
import { handleMediaGet, handleMediaOptions } from '@/lib/media-handler';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return handleMediaOptions();
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  return handleMediaGet(req, params.path || []);
}
