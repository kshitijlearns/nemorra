'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Mascot } from '@/components/mascot/mascot';
import { learningRequest, memoryPlanItemSchema, type Material } from '@/lib/learning';

export function MemoryPlanCard({ material, onContinue }: { material: Material; onContinue?: () => void }) {
  const [items, setItems] = useState(material.memoryPlan ?? []);
  const [busy, setBusy] = useState(!material.memoryPlan?.length);
  const [error, setError] = useState('');

  useEffect(() => {
    if (material.memoryPlan?.length) return;
    let alive = true;
    void learningRequest({ action: 'memory-plan', material }).then(result => {
      if (!alive) return;
      const next = Array.isArray(result.memoryPlan) ? result.memoryPlan : [];
      const parsed = next.map((item: unknown) => memoryPlanItemSchema.safeParse(item)).filter((x: any) => x.success).map((x: any) => x.data);
      setItems(parsed);
      setBusy(false);
      if (!parsed.length) setError('Could not create the memory cues yet.');
    }).catch(e => {
      if (!alive) return;
      setBusy(false); setError(e instanceof Error ? e.message : 'Could not create your memory cues.');
    });
    return () => { alive = false; };
  }, [material]);

  return <section className="account-card mt-7 overflow-hidden"><div className="flex items-start gap-4"><Mascot state={busy ? 'thinking' : 'happy'} className="size-20 shrink-0"/><div><div className="flex items-center gap-2"><Sparkles size={17}/><h2 className="text-xl font-semibold">Your memory map</h2></div><p className="page-subtitle mt-2">I turned the key ideas into quick visual cues. They are here to make recall easier, not to replace understanding.</p></div></div>{busy ? <p className="quiet-note mt-6">Building memorable associations…</p> : error ? <p role="alert" className="text-destructive mt-5 text-sm">{error}</p> : <div className="mt-6 flex flex-col gap-3">{items.map((item, index) => <div key={`${item.concept}-${index}`} className="rounded-2xl border border-border/70 p-4"><p className="text-sm font-semibold">{index + 1}. {item.concept}</p><p className="mt-2 font-serif text-lg">{item.cue}</p><p className="quiet-note mt-1">{item.association}</p></div>)}</div>}{onContinue && <button className="primary-button mt-6 w-full" disabled={busy || !!error} onClick={onContinue}>Continue <ArrowRight size={18}/></button>}</section>;
}
