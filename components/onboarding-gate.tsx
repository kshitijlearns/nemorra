'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export const ONBOARDING_KEY = 'nemorra.onboarding.completed.v1';

export function OnboardingGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    if (localStorage.getItem(ONBOARDING_KEY) === 'true') {
      setChecking(false);
      return;
    }
    router.replace('/onboarding');
  }, [router]);
  if (checking) return <main className="min-h-dvh bg-background" aria-label="Loading Nemorra" />;
  return <>{children}</>;
}
