import { NextResponse } from 'next/server';
import { z } from 'zod';
import { deleteSession, getSession, listSessions, saveSession, storageStatus } from '@/lib/server-storage';
import { sessionSchema } from '@/lib/learning';

const userIdSchema = z.string().min(1).max(200).regex(/^[a-zA-Z0-9_-]+$/);
const sessionIdSchema = z.string().uuid();
function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (!origin || !host || request.headers.get('sec-fetch-site') === 'cross-site') return false;
  try { return new URL(origin).host === host; } catch { return false; }
}
function noStore(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function GET(request: Request) {
  const userIdResult = userIdSchema.safeParse(new URL(request.url).searchParams.get('userId'));
  if (!userIdResult.success) return noStore({ error: 'Invalid userId.' }, 400);
  if (!storageStatus().dynamo) return noStore({ configured: false, sessions: [] });
  try {
    return noStore({ configured: true, sessions: await listSessions(userIdResult.data) });
  } catch {
    return noStore({ error: 'Could not load cloud sessions.' }, 502);
  }
}
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return noStore({ error: 'Please submit from the Nemorra app.' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return noStore({ error: 'Expected JSON.' }, 415);
  try {
    const body = await request.json();
    const userId = userIdSchema.safeParse(body?.userId);
    const session = sessionSchema.safeParse(body?.session);
    if (!userId.success || !session.success) return noStore({ error: 'Invalid session.' }, 400);
    if (!storageStatus().dynamo) return noStore({ configured: false, saved: false });
    await saveSession(userId.data, session.data);
    return noStore({ configured: true, saved: true });
  } catch {
    return noStore({ error: 'Could not save session.' }, 502);
  }
}
export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) return noStore({ error: 'Please submit from the Nemorra app.' }, 403);
  try {
    const body = await request.json();
    const userId = userIdSchema.safeParse(body?.userId);
    const sessionId = sessionIdSchema.safeParse(body?.sessionId);
    if (!userId.success || !sessionId.success) return noStore({ error: 'userId and sessionId are required.' }, 400);
    const session = await getSession(userId.data, sessionId.data);
    if (!session) return noStore({ error: 'Session not found.' }, 404);
    return noStore({ session });
  } catch {
    return noStore({ error: 'Could not load session.' }, 502);
  }
}
export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return noStore({ error: 'Please submit from the Nemorra app.' }, 403);
  try {
    const body = await request.json();
    const userId = userIdSchema.safeParse(body?.userId);
    const sessionId = sessionIdSchema.safeParse(body?.sessionId);
    if (!userId.success || !sessionId.success) return noStore({ error: 'userId and sessionId are required.' }, 400);
    if (!storageStatus().dynamo) return noStore({ configured: false, deleted: false });
    await deleteSession(userId.data, sessionId.data);
    return noStore({ configured: true, deleted: true });
  } catch {
    return noStore({ error: 'Could not delete cloud session.' }, 502);
  }
}
