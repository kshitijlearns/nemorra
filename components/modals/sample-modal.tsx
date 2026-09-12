'use client';
import { useRouter } from 'next/navigation';
import { Modal } from './modal';
import { samplePassage } from '@/lib/mock-data';
import { useNemorra } from '@/components/app-provider';
export function SampleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
 const router = useRouter(); const { setNotes, setTopic, setDraft } = useNemorra();
 return <Modal open={open} onClose={onClose} title="Try this sample"><p className="page-subtitle">Here&apos;s a short passage you can learn and teach me. Take a moment to read it.</p><p className="sample-passage">{samplePassage}</p><button className="primary-button w-full" onClick={() => { setNotes(samplePassage); setTopic('Photosynthesis'); setDraft(''); onClose(); router.push('/teach'); }}>Start learning</button></Modal>;
}
