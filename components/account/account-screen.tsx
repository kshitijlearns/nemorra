'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, Pencil, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { PageTransition } from '@/components/page-transition';
import { Mascot } from '@/components/mascot/mascot';
import { useNemorra } from '@/components/app-provider';
import { Modal } from '@/components/modals/modal';
import { getSubscriptionState, purchasePro } from '@/lib/revenuecat';

export function AccountScreen() {
  const { profile, setProfile, calm, setCalm, records, exportData, reset } = useNemorra();
  const [edit, setEdit] = useState(false); const [name, setName] = useState(profile.name); const [confirm, setConfirm] = useState(false);
  const [billing, setBilling] = useState<{ configured: boolean; isPro: boolean; loading: boolean; error: string }>({ configured: false, isPro: false, loading: true, error: '' });

  useEffect(() => {
    let alive = true;
    void getSubscriptionState().then(state => { if (alive) setBilling({ configured: state.configured, isPro: state.isPro, loading: false, error: '' }); });
    return () => { alive = false; };
  }, []);

  async function upgrade() {
    setBilling(s => ({ ...s, loading: true, error: '' }));
    try {
      const result = await purchasePro();
      setBilling({ configured: true, isPro: result.isPro, loading: false, error: result.isPro ? '' : 'Purchase completed, but the pro entitlement is not active yet.' });
    } catch (e) {
      setBilling(s => ({ ...s, loading: false, error: e instanceof Error ? e.message : 'Could not start checkout.' }));
    }
  }

  return <PageTransition><h1 className="page-title">Your corner.</h1><p className="page-subtitle mt-2">A little space for you and your learning.</p><section className="mt-8 flex items-center justify-between"><div className="flex items-center gap-4"><Mascot state="happy" className="size-20 [&_img]:size-full [&_img]:object-contain"/><div><h2 className="text-xl font-semibold tracking-tight">{profile.name}</h2><p className="quiet-note">Local profile · no sign-in</p></div></div><button aria-label="Edit local profile" className="icon-button outlined" onClick={() => { setName(profile.name); setEdit(true); }}><Pencil size={17}/></button></section>
    <section className="account-card mt-8"><div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-semibold">Nemorra Pro</h2><p className="page-subtitle mt-2">{billing.loading ? 'Checking your subscription…' : billing.isPro ? 'Pro is active on this browser.' : 'Unlock the full learning experience.'}</p></div><Sparkles size={24}/></div>{!billing.isPro && <button className="primary-button mt-5 w-full" disabled={billing.loading || !billing.configured} onClick={() => void upgrade()}>{billing.loading ? <><Loader2 className="animate-spin" size={18}/> Checking…</> : billing.configured ? <>Upgrade to Pro <Sparkles size={18}/></> : <>RevenueCat setup pending</>}</button>}{billing.isPro && <p className="quiet-note mt-4">Your active entitlement: pro</p>}{billing.error && <p role="alert" className="text-destructive mt-3 text-sm">{billing.error}</p>}{!billing.configured && <p className="quiet-note mt-3">Add a public RevenueCat Web Billing API key and configure an offering to enable checkout.</p>}</section>
    <section className="account-card mt-5"><h2 className="text-xl font-semibold">Your device, your learning.</h2><p className="page-subtitle mt-3">{records.length} saved {records.length === 1 ? 'session' : 'sessions'}</p><p className="quiet-note mt-3">Your browser remains the fast local cache. Cloud persistence is enabled when AWS DynamoDB is configured for this deployment.</p><div className="mt-5 flex flex-col gap-3"><button className="pill-button" onClick={exportData}><Download size={18}/>Export learning data</button><button className="pill-button" onClick={() => setConfirm(true)}><Trash2 size={18}/>Delete local data</button></div></section>
    <section className="mt-8"><h2 className="text-xl font-semibold">Settings</h2><div className="setting-row"><div><p>Quiet motion</p><p className="quiet-note mt-1">A little less movement.</p></div><button className="toggle" role="switch" aria-label="Quiet motion" aria-checked={calm} onClick={() => setCalm(!calm)}><span/></button></div></section>
    <section className="account-card mt-7"><h2 className="text-lg font-semibold">About your data</h2><p className="quiet-note mt-3">Notes and uploaded documents are processed through the configured AI service when you request processing. When AWS storage is configured, uploaded files can be stored in your private S3 bucket and sessions in DynamoDB.</p><p className="quiet-note mt-3">AI feedback can be wrong. Check important facts against your source. Subscription access is controlled by the RevenueCat <code>pro</code> entitlement.</p></section><Link href="/onboarding" className="pill-button mt-7">How Nemorra works</Link>
    <Modal open={edit} onClose={() => setEdit(false)} title="Make yourself at home"><form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); if (name.trim()) { setProfile({ name: name.trim() }); setEdit(false); } }}><label htmlFor="learner-name" className="text-sm">Your name</label><input id="learner-name" className="profile-input" autoComplete="nickname" maxLength={80} required value={name} onChange={e => setName(e.target.value)}/><button className="primary-button" disabled={!name.trim()}>Save profile</button></form></Modal>
    <Modal open={confirm} onClose={() => setConfirm(false)} title="Start with a clean page?"><p className="page-subtitle">This deletes all Nemorra sessions, notes, drafts, and preferences from this browser. Export a copy first if you want to keep them.</p><button className="primary-button" onClick={() => { reset(); setConfirm(false); }}>Delete all local data</button><button className="pill-button" onClick={() => setConfirm(false)}>Keep my learning</button></Modal></PageTransition>;
}
