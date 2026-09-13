'use client';

const USER_KEY = 'nemorra.cloud.user.v1';

export function getCloudUserId() {
  try {
    const existing = localStorage.getItem(USER_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(USER_KEY, id);
    return id;
  } catch {
    return 'anonymous';
  }
}

export async function saveCloudSession(session: unknown) {
  try {
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: getCloudUserId(), session }),
    });
    const data = await response.json().catch(() => ({}));
    return response.ok && data.saved === true;
  } catch {
    return false;
  }
}
export async function deleteCloudSession(sessionId: string) {
  try {
    const response = await fetch('/api/sessions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: getCloudUserId(), sessionId }),
    });
    const data = await response.json().catch(() => ({}));
    return response.ok && data.deleted === true;
  } catch {
    return false;
  }
}
export async function loadCloudSessions() {
  try {
    const response = await fetch(`/api/sessions?userId=${encodeURIComponent(getCloudUserId())}`, { cache: 'no-store' });
    if (!response.ok) return null;
    const data = await response.json();
    return Array.isArray(data.sessions) ? data.sessions : null;
  } catch {
    return null;
  }
}
