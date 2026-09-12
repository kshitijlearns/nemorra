'use client';
import { createContext, useContext, useEffect, useState, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import { MotionConfig } from 'motion/react';
import { emptyStore, newSession, STORAGE_KEY, storeSchema, type Material, type Session, type Assessment, type LearningStore } from '@/lib/learning';
import { getCloudUserId, loadCloudSessions, saveCloudSession } from '@/lib/cloud';

type AppState = LearningStore & {
  ready: boolean; storageError: string; splashSeen: boolean; setSplashSeen: (value: boolean) => void;
  setNotes: (value: string) => void; setCalm: (value: boolean) => void;
  setProfile: Dispatch<SetStateAction<LearningStore['profile']>>;
  setRecords: Dispatch<SetStateAction<Session[]>>;
  startSession: (material: Material) => void; openSession: (session: Session) => void;
  updateDraft: (field: 'explanation' | 'draft', value: string) => void;
  saveAssessment: (id: string, field: 'teach' | 'write', result: Assessment) => void;
  reset: () => void; exportData: () => void;
};
const Context = createContext<AppState | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<LearningStore>(emptyStore);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [canSave, setCanSave] = useState(true);
  const [splashSeen, setSplashSeen] = useState(false);
  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setStore(storeSchema.parse(JSON.parse(raw))); }
    catch { setCanSave(false); setStorageError('Saved data could not be loaded. It has not been overwritten. Export it or reset local data in Your corner.'); }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready || !canSave) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); setStorageError(''); }
    catch { setStorageError('Browser storage is unavailable or full. Changes are only in memory. Export your data before leaving.'); }
  }, [store, ready, canSave]);
  useEffect(() => {
    if (!ready) return;
    void loadCloudSessions().then(cloudRecords => {
      if (!cloudRecords?.length) return;
      setStore(current => {
        const byId = new Map(current.records.map(record => [record.id, record]));
        for (const record of cloudRecords) byId.set(record.id, record);
        return { ...current, records: [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 100) };
      });
    });
  }, [ready]);
  const value: AppState = {
    ...store, ready, storageError, splashSeen, setSplashSeen,
    setNotes: notes => setStore(s => ({ ...s, notes })),
    setCalm: calm => setStore(s => ({ ...s, calm })),
    setProfile: next => setStore(s => ({ ...s, profile: typeof next === 'function' ? next(s.profile) : next })),
    setRecords: next => setStore(s => { const records = typeof next === 'function' ? next(s.records) : next; const removed = s.current && s.records.some(r => r.id === s.current?.id) && !records.some(r => r.id === s.current?.id); return { ...s, records, current: removed ? null : s.current }; }),
    startSession: material => setStore(s => ({ ...s, current: newSession(material), notes: '' })),
    openSession: current => setStore(s => ({ ...s, current })),
    updateDraft: (field, text) => setStore(s => ({ ...s, current: s.current ? { ...s.current, [field]: text } : null })),
    saveAssessment: (id, field, result) => setStore(s => {
      if (!s.current || s.current.id !== id) return s;
      const current = { ...s.current, [field]: result };
      void saveCloudSession(current);
      return { ...s, current, records: current.teach && current.write ? [current, ...s.records.filter(r => r.id !== id)].slice(0, 100) : s.records };
    }),
    reset: () => { try { localStorage.removeItem(STORAGE_KEY); setStore(emptyStore()); setCanSave(true); setStorageError(''); } catch { setStorageError('Your browser blocked deletion. Clear site data in browser settings.'); } },
    exportData: () => {
      let content = JSON.stringify(store, null, 2);
      if (!canSave) { try { content = localStorage.getItem(STORAGE_KEY) || content; } catch {} }
      const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
      const link = document.createElement('a'); link.href = url; link.download = 'nemorra-learning.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
  };
  return <Context.Provider value={value}><MotionConfig reducedMotion={store.calm ? 'always' : 'user'}><div data-calm={store.calm || undefined}>{storageError && <p role="alert" className="bg-background text-foreground p-4 text-center text-sm">{storageError}</p>}{ready ? children : <p className="p-8 text-center" role="status">Opening your learning space...</p>}</div></MotionConfig></Context.Provider>;
}
export function useNemorra() { const value = useContext(Context); if (!value) throw new Error('Nemorra provider is missing'); return value; }
