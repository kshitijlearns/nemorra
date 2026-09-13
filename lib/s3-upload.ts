'use client';

export async function uploadToS3(file: File, userId: string) {
  const response = await fetch('/api/storage/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, fileName: file.name, contentType: file.type || 'application/octet-stream', size: file.size }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not prepare file upload.');
  if (!data.configured) return null;

  const formData = new FormData();
  for (const [key, value] of Object.entries(data.fields as Record<string, string>)) formData.append(key, value);
  formData.append('file', file);
  const upload = await fetch(data.url, { method: 'POST', body: formData });
  if (!upload.ok) throw new Error('Could not upload the file. Please try again.');
  return { key: data.key as string };
}
