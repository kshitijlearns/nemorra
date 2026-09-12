import { NextResponse } from 'next/server';
import { createUploadPost, storageStatus } from '@/lib/server-storage';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, fileName, contentType, size } = body ?? {};
    if (typeof userId !== 'string' || !userId || typeof fileName !== 'string' || typeof contentType !== 'string' || !Number.isFinite(size)) {
      return NextResponse.json({ error: 'Invalid upload request.' }, { status: 400 });
    }
    const allowed = new Set(['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'image/webp']);
    if (!allowed.has(contentType)) return NextResponse.json({ error: 'Unsupported file type.' }, { status: 415 });
    const result = await createUploadPost(userId, fileName, contentType, size);
    if (!result) return NextResponse.json({ configured: false, error: 'S3 is not configured yet.' }, { status: 503 });
    return NextResponse.json({ configured: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not prepare upload.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ configured: storageStatus() });
}
