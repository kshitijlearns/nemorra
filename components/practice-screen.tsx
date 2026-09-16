'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageTransition } from '@/components/page-transition';
import { Mascot } from '@/components/mascot/mascot';
import { SpeechInput } from '@/components/teach/speech-input';
import { assessmentSchema, learningRequest, score } from '@/lib/learning';

export function PracticeScreen() {
  const { current, saveAssessment } = useNemorra();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);

  if (!current) return <PageTransition><div className="teach-empty"><h1 className="page-title">Start with a little learning.</h1><p className="page-subtitle mt-5">Add some notes or try the sample first. Your practice will follow that material.</p><Link className="primary-button mt-7" href="/">Choose material <ArrowRight size={18}/></Link></div></PageTransition>;

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

  return <PageTransition><main className="teach-page-redesign" aria-label="Teach">
    <section className="teach-copy">
      <h1>Teach</h1>
      <p>I’m listening. Teach me what you just learned.</p>
    </section>
    {assessment ? <section className="feedback-panel">
      <Mascot state="happy" className="feedback-mascot"/>
      <h2 className="text-2xl font-semibold">{score(assessment)}% concept recall</h2>
      <p className="page-subtitle">{assessment.summary}</p>
      <p className="quiet-note">AI practice estimate, not a grade.</p>
      <Link href="/results" className="primary-button w-full">See what stuck <ArrowRight size={19}/></Link>
    </section> : <section className="teach-redesign-stage">
      <Mascot state="listening" priority className="teach-redesign-mascot"/>
      <div className="teach-redesign-action">
        <SpeechInput value={session.explanation} onChange={() => undefined} onSubmit={evaluate} disabled={busy}/>
        {busy && <p role="status" className="quiet-note">Listening to your explanation…</p>}
        {error && <p role="alert" className="text-destructive">{error}</p>}
      </div>
    </section>}
  </main></PageTransition>;
}
