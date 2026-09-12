'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, ImagePlus } from 'lucide-react';
import { PageTransition } from '@/components/page-transition';
import { Mascot } from '@/components/mascot/mascot';
import { Modal } from '@/components/modals/modal';
import { useNemorra } from '@/components/app-provider';
import { SpeechInput } from '@/components/teach/speech-input';
import { assessmentSchema, encodeFile, learningRequest, score } from '@/lib/learning';

export function PracticeScreen({ mode }: { mode: 'teach' | 'write' }) {
  const { current, updateDraft, saveAssessment } = useNemorra();
  const [review, setReview] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null); const lock = useRef(false);
  if (!current) return <PageTransition><h1 className="page-title">Start with a little learning.</h1><p className="page-subtitle mt-5">Add some notes or try the sample first. Your practice will follow that material.</p><Link className="primary-button mt-7" href="/">Choose material <ArrowRight size={18}/></Link></PageTransition>;
  if (mode === 'write' && !current.teach) return <PageTransition><h1 className="page-title">Teach it first.</h1><p className="page-subtitle mt-5">Explain the ideas in your own words, then try writing from memory.</p><Link className="primary-button mt-7" href="/teach">Continue teaching <ArrowRight size={18}/></Link></PageTransition>;
  const session = current; const isTeach = mode === 'teach'; const field = isTeach ? 'explanation' : 'draft';
  const answer = session[field]; const assessment = session[mode];
  async function evaluate() {
    if (lock.current || answer.trim().length < 20) return;
    lock.current = true; setBusy(true); setError('');
    try { const result = assessmentSchema.parse(await learningRequest({ action: 'evaluate', material: session.material, answer })); saveAssessment(session.id, mode, result); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not evaluate your answer.'); }
    finally { lock.current = false; setBusy(false); }
  }
  async function transcribe(file: File) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try {
      const attachment = await encodeFile(file);
      if (attachment.mime === 'application/pdf') throw new Error('Choose a photo of your handwriting.');
      const result = await learningRequest({ action: 'transcribe', file: attachment });
      if (typeof result.text !== 'string' || !result.text.trim()) throw new Error('No handwriting found.');
      const combined = [answer, result.text].filter(Boolean).join('\n\n');
      if (combined.length > 12000) throw new Error('This would exceed 12,000 characters. Use a shorter answer.');
      updateDraft(field, combined);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not read handwriting.'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <PageTransition><div className="flow-top"><Link href={isTeach ? '/' : '/teach'} className="icon-button outlined" aria-label={isTeach ? 'Back home' : 'Back to Teach'}><ArrowLeft size={19}/></Link><div className="flow-steps"><span className={isTeach ? 'current' : ''}>Teach</span><span className="flow-line"/><span className={!isTeach ? 'current' : ''}>Write</span><span className="flow-line"/><span>Recall</span></div><button className="icon-button" aria-label="Review learning material" onClick={() => setReview(true)}><BookOpen size={22}/></button></div><h1 className="page-title">{isTeach ? 'Teach' : 'Write'}</h1><p className="page-subtitle mt-3">{isTeach ? 'Explain it in your own words. I’m listening.' : 'Without peeking, put what you remember into words.'}</p><p className="quiet-note mt-3">{session.material.title}</p>
    {assessment ? <section className="feedback-panel"><Mascot state="happy" className="feedback-mascot"/><h2 className="text-2xl font-semibold">{score(assessment)}% concept recall</h2><p className="page-subtitle">{assessment.summary}</p><p className="quiet-note">AI practice estimate, not a grade.</p><Link href={isTeach ? '/write' : '/results'} className="primary-button w-full">{isTeach ? 'Let’s write' : 'See what stuck'} <ArrowRight size={19}/></Link><details className="w-full text-left"><summary className="cursor-pointer text-sm">Review your answer</summary><p className="sample-passage mt-3 whitespace-pre-wrap">{answer}</p></details></section> : <>
      {isTeach && <><details className="account-card mt-6" open><summary className="cursor-pointer font-semibold">Read your learning material</summary><p className="page-subtitle mt-3 whitespace-pre-wrap">{session.material.text}</p><p className="quiet-note mt-3">Read, then close this section and explain what you remember.</p></details><div className="flex justify-center"><Mascot state="listening" className="feedback-mascot"/></div><SpeechInput value={answer} onChange={value => updateDraft(field, value)} disabled={busy}/></>}
      <div className="writing-box"><textarea aria-label={isTeach ? 'Your explanation' : 'What you remember'} value={answer} disabled={busy} placeholder={isTeach ? 'Teach me in your own words...' : 'No perfect sentences needed. Just you, your memory, and a blank page...'} maxLength={12000} onChange={e => updateDraft(field, e.target.value)}/><div className="writing-toolbar">{!isTeach && <button className="icon-button" disabled={busy} aria-label="Add handwritten image" onClick={() => input.current?.click()}><ImagePlus size={22}/></button>}<span className="quiet-note">{answer.length.toLocaleString()} / 12,000</span></div></div>
      <input ref={input} className="sr-only" tabIndex={-1} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { const file = e.target.files?.[0]; e.target.value = ''; if (file) void transcribe(file); }}/>
      <p className="quiet-note mt-3">{isTeach ? 'Use at least 20 characters. Review any dictated text before submitting.' : 'Optional: upload handwriting under 2 MB, review the transcription, then submit.'}</p>
      <button className="primary-button w-full mt-5" disabled={busy || answer.trim().length < 20} onClick={evaluate}>{busy ? 'Working with your words...' : 'Get feedback'} {!busy && <ArrowRight size={18}/>}</button>{busy && <p role="status" className="quiet-note mt-3">Please keep this page open. No results are invented if processing fails.</p>}
    </>}{error && <p role="alert" className="text-destructive mt-4 text-sm">{error}</p>}<Modal open={review} onClose={() => setReview(false)} title={session.material.title}><p className="sample-passage whitespace-pre-wrap">{session.material.text}</p></Modal></PageTransition>;
}
