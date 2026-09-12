import { NextResponse } from 'next/server';
import { getSession, listSessions, saveSession, storageStatus } from '@/lib/server-storage';

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId is required.' }, { status: 400 });
  if (!storageStatus().dynamo) return NextResponse.json({ configured: false, sessions: [] });
  return NextResponse.json({ configured: true, sessions: await listSessions(userId) });
}

export async function POST(request: Request) {
  try {
    const { userId, session } = await request.json();
    if (typeof userId !== 'string' || !userId || !session?.id) return NextResponse.json({ error: 'Invalid session.' }, { status: 400 });
    if (!storageStatus().dynamo) return NextResponse.json({ configured: false, saved: false });
    await saveSession(userId, session);
    return NextResponse.json({ configured: true, saved: true });
  } catch {
    return NextResponse.json({ error: 'Could not save session.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId, sessionId } = await request.json();
    if (!userId || !sessionId) return NextResponse.json({ error: 'userId and sessionId are required.' }, { status: 400 });
    const session = await getSession(userId, sessionId);
    if (!session) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
    return NextResponse.json({ session });
  } catch {
    return NextResponse.json({ error: 'Could not load session.' }, { status: 500 });
  }
}
