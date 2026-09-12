'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageTransition } from '@/components/page-transition';
import { Mascot } from '@/components/mascot/mascot';
import { UploadComposer } from '@/components/upload/upload-composer';
import { RecordingList } from '@/components/recordings/recording-list';
import { AppSplash } from '@/components/loaders/nemorra-loader';
export function HomeScreen() {
 return <><AppSplash /><PageTransition className="home-page"><header><h1 className="page-title">Nemorra</h1><p className="page-subtitle mt-2">Give me anything you need to remember.<br />I&apos;ll help you make it stick.</p></header><Mascot state="idle" className="home-hero" priority /><UploadComposer /><section className="recordings-section" aria-labelledby="previous-title"><div className="section-heading"><h2 id="previous-title">Previous sessions</h2><Link href="/recordings" className="icon-button" aria-label="See all sessions"><ArrowRight size={25} strokeWidth={1.5}/></Link></div><RecordingList /></section><div className="home-help"><span>Small steps. Big memory.</span><Link href="/onboarding">How it works <ArrowRight size={14}/></Link></div></PageTransition></>;
}
