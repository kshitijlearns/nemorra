'use client';
import { useRouter } from 'next/navigation';
import { Modal } from './modal';
import { samplePassage } from '@/lib/mock-data';
import { useNemorra } from '@/components/app-provider';
export function SampleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
 const router = useRouter(); const { startSession } = useNemorra();
 return <Modal open={open} onClose={onClose} title="Try this sample"><p className="page-subtitle">Here&apos;s a short passage you can learn and teach me. Take a moment to read it.</p><p className="sample-passage">{samplePassage}</p><button className="primary-button w-full" onClick={() => { startSession({ title: 'Photosynthesis', text: samplePassage, concepts: ['Plants make their own food through photosynthesis.', 'Leaves absorb sunlight.', 'Plants take carbon dioxide from the air.', 'Roots absorb water.', 'Sunlight, water and carbon dioxide help produce energy for growth.', 'Photosynthesis releases oxygen needed by humans and other living things.'] }); onClose(); router.push('/teach'); }}>Start learning</button></Modal>;
}
