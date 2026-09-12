'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, House, UserRound, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
const links = [{ href: '/', label: 'Home', icon: House }, { href: '/teach', label: 'Teach & Write', icon: BookOpen }, { href: '/account', label: 'Account', icon: UserRound }];
export function Navigation() {
  const pathname = usePathname();
  if (pathname === '/onboarding') return null;
  const items = links.map(({ href, label, icon: Icon }) => {
    const active = href === '/' ? pathname === '/' : href === '/teach' ? ['/teach','/write','/results'].includes(pathname) : pathname === href;
    return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={cn('nav-link', active && 'active')}><motion.span animate={{ scale: active ? 1.06 : 1 }}><Icon size={20} strokeWidth={1.65} /></motion.span><span>{label}</span></Link>;
  });
  return <><a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:p-4">Skip to content</a><header className="app-header"><Link href="/" className="wordmark" aria-label="Nemorra home"><img className="brand-mark" src="/art/happy.webp" alt="" />nemorra<span className="text-muted-foreground">.</span></Link><nav className="desktop-nav" aria-label="Main navigation">{items}</nav><Link href="/onboarding" className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">How it works <ArrowUpRight size={15} /></Link></header><nav className="mobile-nav" aria-label="Mobile navigation">{items}</nav></>;
}
