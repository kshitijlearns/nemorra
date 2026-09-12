'use client';
import { HomeScreen } from '@/components/home-screen';
import { OnboardingGate } from '@/components/onboarding-gate';
export default function Page() {
  return <OnboardingGate><HomeScreen /></OnboardingGate>;
}
