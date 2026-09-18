"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { Mascot } from "@/components/mascot/mascot";
import { useNemorra } from "@/components/app-provider";
import { overall, score } from "@/lib/learning";

export function ResultsScreen() {
  const { current, startSession, storageError } = useNemorra();
  const router = useRouter();

  if (!current?.teach) return <PageTransition><h1 className="page-title">A memory in progress.</h1><p className="page-subtitle mt-5">Complete Teach to see your recall feedback.</p><Link href={current ? "/teach" : "/"} className="primary-button mt-7">Continue learning <ArrowRight size={18}/></Link></PageTransition>;

  const session = current;
  const assessment = session.teach;
  const teachScore = score(assessment);

  return <PageTransition>
    <div className="flow-top"><Link href="/" className="icon-button outlined" aria-label="Back home"><ArrowLeft size={19}/></Link><span className="quiet-note">Session complete</span></div>
    <h1 className="page-title text-balance" style={{fontSize:43}}>Here&apos;s what stuck.</h1>
    <p className="page-subtitle mt-4">{session.material.title}</p>
    <div className="flex items-center justify-center py-7"><div><p className="result-score">{overall(session)}<span className="text-4xl">%</span></p><p className="page-subtitle mt-2">A little more yours.</p></div><Mascot state="celebrating" className="feedback-mascot"/></div>
    <div className="results-breakdown"><div className="text-center"><p className="quiet-note">Teach</p><p className="mt-2 text-2xl font-semibold">{teachScore}%</p></div><div className="text-center"><p className="quiet-note">Overall</p><p className="mt-2 text-2xl font-semibold">{teachScore}%</p></div></div>
    <p className="quiet-note mt-4">AI practice estimate based on how accurately your explanation covered each concept.</p>
    <p className="page-subtitle mt-6">{assessment.summary}</p>
    {(["remembered","partial","missing"] as const).map(status => <section className="mt-7" key={status}><h2 className="text-xl font-semibold">{status === "remembered" ? "Remembered" : status === "partial" ? "Almost there" : "Needs another look"}</h2><div className="flex flex-col gap-3 mt-4">{assessment.items.map((item,i)=>item.status===status && <article className="account-card" key={i}><h3 className="font-semibold">{session.material.concepts[i]}</h3><p className="quiet-note mt-2">{item.feedback}</p></article>)}{!assessment.items.some(item=>item.status===status)&&<p className="quiet-note">No concepts in this group.</p>}</div></section>)}
    <details className="account-card mt-7"><summary className="cursor-pointer font-semibold">Review the material</summary><p className="page-subtitle mt-3 whitespace-pre-wrap">{session.material.text}</p></details>
    <div className="mt-7 flex flex-col gap-3"><p className="quiet-note text-center" role="status">{storageError ? "Not saved to this browser. Export from Your corner." : "Saved on this device. Cloud backup is used when configured."}</p><Link href="/recordings" className="primary-button">Your sessions <ArrowRight size={18}/></Link><button className="pill-button" onClick={()=>{startSession(session.material);router.push("/teach");}}><RotateCcw size={18}/> Practice again</button><Link href="/" className="pill-button">Learn something new</Link></div>
  </PageTransition>;
}