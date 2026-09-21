'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { PageTransition } from '@/components/page-transition';
import { Mascot } from '@/components/mascot/mascot';
import { Modal } from '@/components/modals/modal';
import { useNemorra } from '@/components/app-provider';
import { SpeechInput } from '@/components/teach/speech-input';
import { assessmentSchema, learningRequest, score } from '@/lib/learning';

export function TeachScreen() {
  const { current, updateDraft, saveAssessment } = useNemorra();
  const [review, setReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);

  if (!current) return <PageTransition><h1 className="page-title">Start with a little learning.</h1><p className="page-subtitle mt-5">Add some notes or try the sample first. Your practice will follow that material.</p><Link className="primary-button mt-7" href="/">Choose material <ArrowRight size={18}/></Link></PageTransition>;

  const session = current;
  const assessment = session.teach;

  async function evaluate(answer: string) {
    if (locked || answer.trim().length < 20) {
      if (answer.trim().length < 20) setError('Speak a little more, then finish your explanation.');
      return;
    }
    setLocked(true);
    setBusy(true);
    setError('');
    try {
      const result = assessmentSchema.parse(await learningRequest({ action: 'evaluate', material: session.material, answer }));
      saveAssessment(session.id, 'teach', result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not evaluate your explanation.');
    } finally {
      setLocked(false);
      setBusy(false);
    }
  }

  return <PageTransition><div className="flow-top"><Link href="/" className="icon-button outlined" aria-label="Back home"><ArrowLeft size={19}/></Link><div className="flow-steps"><span className="current">Teach</span></div><button className="icon-button" aria-label="Review learning material" onClick={() => setReview(true)}><BookOpen size={22}/></button></div><h1 className="page-title">Teach</h1><p className="page-subtitle mt-3">Explain it in your own words. I’m listening.</p><p className="quiet-note mt-3">{session.material.title}</p>
    {assessment ? <section className="feedback-panel"><Mascot state="happy" className="feedback-mascot"/><h2 className="text-2xl font-semibold">{score(assessment)}% concept recall</h2><p className="page-subtitle">{assessment.summary}</p><p className="quiet-note">AI practice estimate, not a grade.</p><Link href="/results" className="primary-button w-full">See what stuck <ArrowRight size={19}/></Link></section> : <><div className="mt-10 flex justify-center"><Mascot state="listening" className="feedback-mascot"/></div><div className="mt-8"><SpeechInput value={session.explanation} onChange={value => updateDraft('explanation', value)} onSubmit={evaluate} disabled={busy}/></div>{busy && <p role="status" className="quiet-note mt-3">Listening to your explanation…</p>}{error && <p role="alert" className="text-destructive mt-4 text-sm">{error}</p>}</>}
    <Modal open={review} onClose={() => setReview(false)} title={session.material.title}><p className="sample-passage whitespace-pre-wrap">{session.material.text}</p></Modal>
  </PageTransition>;
}
