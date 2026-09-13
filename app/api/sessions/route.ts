import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession, listSessions, saveSession, storageStatus } from '@/lib/server-storage';
import { sessionSchema } from '@/lib/learning';

const userIdSchema = z.string().min(1).max(200).regex(/^[a-zA-Z0-9_-]+$/);

export async function GET(request: Request) {
  const userIdResult = userIdSchema.safeParse(new URL(request.url).searchParams.get('userId'));
  if (!userIdResult.success) return NextResponse.json({ error: 'Invalid userId.' }, { status: 400 });
  if (!storageStatus().dynamo) return NextResponse.json({ configured: false, sessions: [] });
  try {
    return NextResponse.json({ configured: true, sessions: await listSessions(userIdResult.data) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Could not load cloud sessions.' }, { status: 502 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = userIdSchema.safeParse(body?.userId);
    const session = sessionSchema.safeParse(body?.session);
    if (!userId.success || !session.success) return NextResponse.json({ error: 'Invalid session.' }, { status: 400 });
    if (!storageStatus().dynamo) return NextResponse.json({ configured: false, saved: false });
    await saveSession(userId.data, session.data);
    return NextResponse.json({ configured: true, saved: true });
  } catch {
    return NextResponse.json({ error: 'Could not save session.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const userId = userIdSchema.safeParse(body?.userId);
    const sessionId = z.string().uuid().safeParse(body?.sessionId);
    if (!userId.success || !sessionId.success) return NextResponse.json({ error: 'userId and sessionId are required.' }, { status: 400 });
    const session = await getSession(userId.data, sessionId.data);
    if (!session) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
    return NextResponse.json({ session }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Could not load session.' }, { status: 500 });
  }
}
