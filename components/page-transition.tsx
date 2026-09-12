'use client';
import { motion, useReducedMotion } from 'motion/react';
import { pageVariants } from '@/lib/animations';
import { cn } from '@/lib/utils';
export function PageTransition({ children, className }: { children: React.ReactNode; className?: string }) {
 const reduce = useReducedMotion();
 return <motion.main id="main" className={cn('page-container',className)} variants={reduce ? undefined : pageVariants} initial="initial" animate="animate" exit="exit">{children}</motion.main>;
}
