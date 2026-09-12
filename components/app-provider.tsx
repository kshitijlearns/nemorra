'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import { demoProfile, initialRecordings, type Recording } from '@/lib/mock-data';

type AppState = {
  records: Recording[]; setRecords: React.Dispatch<React.SetStateAction<Recording[]>>;
  notes: string; setNotes: (value: string) => void;
  topic: string; setTopic: (value: string) => void;
  draft: string; setDraft: (value: string) => void;
  profile: typeof demoProfile; setProfile: React.Dispatch<React.SetStateAction<typeof demoProfile>>;
  calm: boolean; setCalm: (value: boolean) => void;
  splashSeen: boolean; setSplashSeen: (value: boolean) => void;
};
const Context = createContext<AppState | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState(initialRecordings);
  const [notes, setNotes] = useState('');
  const [topic, setTopic] = useState('Photosynthesis');
  const [draft, setDraft] = useState('');
  const [profile, setProfile] = useState(demoProfile);
  const [calm, setCalm] = useState(false);
  const [splashSeen, setSplashSeen] = useState(false);
  return <Context.Provider value={{ records, setRecords, notes, setNotes, topic, setTopic, draft, setDraft, profile, setProfile, calm, setCalm, splashSeen, setSplashSeen }}><MotionConfig reducedMotion={calm ? 'always' : 'user'}><div data-calm={calm || undefined}>{children}</div></MotionConfig></Context.Provider>;
}
export function useNemorra() { const value = useContext(Context); if (!value) throw new Error('Nemorra provider is missing'); return value; }
