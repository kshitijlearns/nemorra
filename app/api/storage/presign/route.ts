import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createUploadPost, storageStatus } from '@/lib/server-storage';

const requestSchema = z.object({
  userId: z.string().min(1).max(200).regex(/^[a-zA-Z0-9_-]+$/),
  fileName: z.string().min(1).max(255),
  contentType: z.enum(['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'image/webp']),
  size: z.number().int().positive().max(50 * 1024 * 1024),
});

export async function POST(request: Request) {
  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid upload request.' }, { status: 400 });
    const result = await createUploadPost(parsed.data.userId, parsed.data.fileName, parsed.data.contentType, parsed.data.size);
    if (!result) return NextResponse.json({ configured: false, error: 'S3 is not configured yet.' }, { status: 503 });
    return NextResponse.json({ configured: true, ...result }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not prepare upload.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ configured: storageStatus() }, { headers: { 'Cache-Control': 'no-store' } });
}
