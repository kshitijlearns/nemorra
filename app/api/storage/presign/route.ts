import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createUploadPost, storageStatus } from '@/lib/server-storage';

const maxFileBytes = 15 * 1024 * 1024;
const requestSchema = z.object({
  userId: z.string().min(1).max(200).regex(/^[a-zA-Z0-9_-]+$/),
  fileName: z.string().min(1).max(255),
  contentType: z.enum(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  size: z.number().int().positive().max(maxFileBytes),
});
function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (!origin || !host || request.headers.get('sec-fetch-site') === 'cross-site') return false;
  try { return new URL(origin).host === host; } catch { return false; }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Please submit from the Nemorra app.' }, { status: 403 });
  if (!request.headers.get('content-type')?.startsWith('application/json')) return NextResponse.json({ error: 'Expected JSON.' }, { status: 415 });
  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Use a PDF, JPG, PNG, or WebP file up to 15 MB.' }, { status: 400 });
    const result = await createUploadPost(parsed.data.userId, parsed.data.fileName, parsed.data.contentType, parsed.data.size);
    if (!result) return NextResponse.json({ configured: false, error: 'S3 is not configured yet.' }, { status: 503 });
    return NextResponse.json({ configured: true, ...result }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not prepare upload.' }, { status: 500 });
  }
}
export async function GET() {
  return NextResponse.json({ configured: storageStatus().s3 }, { headers: { 'Cache-Control': 'no-store' } });
}
