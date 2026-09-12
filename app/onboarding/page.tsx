'use client';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useNemorra } from '@/components/app-provider';
const chapters = [
 { title:'Learn', image:'learn', copy:'Snap a photo of your notes, textbook or any content.', detail:'We’ll turn it into something easier to remember.' },
 { title:'Teach', image:'teach', copy:'Explain what you learned to Nemorra in your own words.', detail:'Teaching helps you spot gaps and remember better.' },
 { title:'Write', image:'write', copy:'Write what you remember and make it yours.', detail:'Putting it into words strengthens your memory.' },
];
export default function OnboardingPage() {
 const reduce=useReducedMotion(); const {calm,setSplashSeen}=useNemorra();
 return <main id="main" className="onboarding-page font-serif"><header className="flex items-center justify-between font-sans"><Link className="icon-button" href="/" aria-label="Back to home"><ArrowLeft size={21}/></Link><span className="text-sm tracking-widest">NEMORRA</span><Link href="/" className="text-sm">Skip</Link></header>{chapters.map((chapter,i)=><motion.section key={chapter.title} className="onboarding-chapter" initial={{opacity:0,y:reduce||calm?0:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.15}} transition={{duration:.7}}><div className="chapter-art"><img src={`/art/chapter-${chapter.image}.webp`} alt={`Nemorra ${chapter.image === 'learn' ? 'studying a book in a cozy mountain cabin' : chapter.image === 'teach' ? 'listening attentively by a lantern' : 'writing down memories at a desk'}`} loading={i===0?'eager':'lazy'}/></div><div className="chapter-copy"><span className="chapter-number">0{i+1} —</span><h2>{chapter.title}</h2><p>{chapter.copy}</p><p>{chapter.detail}</p></div></motion.section>)}<Link href="/" className="primary-button w-full font-serif" onClick={() => setSplashSeen(false)}>Get started <ArrowRight size={21}/></Link><p className="mt-7 text-center font-sans text-sm tracking-widest text-background/60">LEARN · TEACH · WRITE · REMEMBER</p></main>;
}
