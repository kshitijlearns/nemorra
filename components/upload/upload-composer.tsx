'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp, Plus, FileText, X } from 'lucide-react';
import { useNemorra } from '@/components/app-provider';
import { SampleModal } from '@/components/modals/sample-modal';
import { encodeFile, learningRequest, materialSchema } from '@/lib/learning';
import { getCloudUserId } from '@/lib/cloud';
import { uploadToS3 } from '@/lib/s3-upload';
export function UploadComposer() {
  const { notes, setNotes, startSession } = useNemorra();
  const [sample, setSample] = useState(false); const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null); const lock = useRef(false); const router = useRouter();
  async function submit() {
    if (lock.current) return;
    if (!file && notes.trim().length < 20) { setError('Add at least 20 characters to learn from.'); return; }
    lock.current = true; setBusy(true); setError('');
    try {
      let text = notes; let attachment;
      if (file) {
        if (file.name.toLowerCase().endsWith('.txt')) text = [notes, await file.text()].filter(Boolean).join('\n\n');
        else {
          const cloudUpload = await uploadToS3(file, getCloudUserId());
          if (cloudUpload) {
            const response = await fetch('/api/learning/from-s3', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: getCloudUserId(), key: cloudUpload.key, notes }) });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Could not process the uploaded file.');
            const material = materialSchema.parse(data); startSession(material); router.push('/teach'); return;
          }
          if (file.size > 2 * 1024 * 1024) throw new Error('AWS storage is not configured yet. For local mode, choose a file smaller than 2 MB.');
          attachment = await encodeFile(file);
        }
      }
      if (text.length > 20000) throw new Error('Use at most 20,000 characters. Split longer notes into smaller lessons.');
      const material = materialSchema.parse(await learningRequest({ action: 'prepare', text, file: attachment }));
      startSession(material); router.push('/teach');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not process this material.'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <><div className="upload-box"><textarea aria-label="Learning notes" placeholder="Add your notes, PDF, image..." rows={3} maxLength={20000} value={notes} disabled={busy} onChange={e => setNotes(e.target.value)} />{file && <div className="attachment-label"><FileText size={15}/><span className="truncate">{file.name}</span><button disabled={busy} aria-label="Remove attachment" onClick={() => setFile(null)}><X size={16}/></button></div>}<div className="upload-controls"><button disabled={busy} className="icon-button outlined" aria-label="Add document or image" onClick={() => input.current?.click()}><Plus size={25}/></button><div className="flex items-center gap-2"><button disabled={busy} className="pill-button" onClick={() => setSample(true)}>Try a sample</button><button className="icon-button solid" aria-label="Start learning from notes" disabled={busy || (!file && notes.trim().length < 20)} onClick={submit}><ArrowUp size={26}/></button></div></div><input ref={input} type="file" className="sr-only" tabIndex={-1} accept=".txt,.pdf,image/jpeg,image/png,image/webp" onChange={e => { setFile(e.target.files?.[0] || null); setError(''); e.target.value = ''; }}/></div>{busy && <p role="status" className="quiet-note mt-3">Reading your material and finding key ideas...</p>}{error && <p role="alert" className="text-destructive text-sm mt-3">{error}</p>}<p className="quiet-note mt-3">PDF, TXT, JPG, PNG, WebP. Cloud mode uploads documents to private S3 before Gemini processing. Local fallback remains available when AWS is not configured.</p><SampleModal open={sample} onClose={() => setSample(false)}/></>;
}
