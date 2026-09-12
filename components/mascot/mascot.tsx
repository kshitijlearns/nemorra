'use client';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';
import { cn } from '@/lib/utils';
export type MascotState = 'idle' | 'curious' | 'listening' | 'thinking' | 'happy' | 'surprised' | 'confused' | 'sleeping' | 'celebrating' | 'running' | 'writing';
const artwork: Record<MascotState,string> = { idle:'reading', curious:'curious', listening:'listening', thinking:'sleeping', happy:'happy', surprised:'surprised', confused:'curious', sleeping:'sleeping', celebrating:'happy', running:'running', writing:'reading' };
export function Mascot({ state = 'idle', className, priority = false, audioLevel = 0 }: { state?: MascotState; className?: string; priority?: boolean; audioLevel?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const reduce = useReducedMotion();
  return <div ref={ref} className={cn(className)}><AnimatePresence mode="wait"><motion.div key={artwork[state]} initial={{ opacity:0, y:reduce ? 0 : 14 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:reduce ? 0 : 8 }} transition={{ duration:.35 }} className="h-full w-full"><motion.div animate={state === 'listening' && !reduce ? { rotate:audioLevel * 1.1, scale:1 + audioLevel * .008 } : { rotate:0, scale:1 }} transition={{ duration:.7 }} className={cn('h-full w-full', !reduce && 'idle-mascot', !visible && 'mascot-paused')}><img src={`/art/${artwork[state]}.webp`} alt={`Nemorra, your little learning companion, ${state === 'idle' ? 'reading a book' : state}`} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} draggable={false} /></motion.div></motion.div></AnimatePresence></div>;
}
