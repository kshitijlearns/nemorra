'use client';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNemorra } from '@/components/app-provider';
export function NemorraLoader({ label = 'Getting things ready...' }: { label?: string }) {
 return <div className="flex flex-col items-center gap-5" role="status"><div className="loader-track" aria-hidden="true"><div className="running-mascot"><img src="/art/running.webp" alt="" /></div></div><p className="quiet-note">{label}</p></div>;
}
export function AppSplash() {
 const { splashSeen, setSplashSeen } = useNemorra();
 useEffect(() => { if (splashSeen) return; const timer = setTimeout(() => setSplashSeen(true),1600); return () => clearTimeout(timer); }, [splashSeen,setSplashSeen]);
 return <AnimatePresence>{!splashSeen && <motion.div className="loader-overlay" initial={{opacity:1}} exit={{opacity:0}} transition={{duration:.45}}><NemorraLoader /></motion.div>}</AnimatePresence>;
}
