'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageTransition } from '@/components/page-transition';
import { RecordingList } from '@/components/recordings/recording-list';
export default function RecordingsPage() {
 const [query,setQuery]=useState('');
 return <PageTransition><Link href="/" className="icon-button outlined mb-6" aria-label="Back home"><ArrowLeft size={19}/></Link><h1 className="page-title" style={{fontSize:42}}>Your recordings</h1><p className="page-subtitle mt-3">Little lessons. Lasting memories.</p><input className="search-input my-7" type="search" aria-label="Search recordings" placeholder="Find a memory..." value={query} onChange={(e)=>setQuery(e.target.value)}/><RecordingList query={query}/><p className="quiet-note mt-8 text-center">Sample library · preview only</p></PageTransition>;
}
