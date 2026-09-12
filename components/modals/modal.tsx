'use client';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
 const ref = useRef<HTMLDialogElement>(null); const titleId = useId();
 useEffect(() => { const dialog=ref.current; if(open) { dialog?.showModal(); const old=document.body.style.overflow; document.body.style.overflow='hidden'; return () => { document.body.style.overflow=old; }; } else dialog?.close(); },[open]);
 return <dialog ref={ref} className="modal-dialog" aria-labelledby={titleId} onCancel={(e)=>{e.preventDefault();onClose();}} onClick={(e)=>{if(e.target===ref.current)onClose();}}>{open && <motion.div className="modal-content" initial={{ opacity:0,scale:.96,y:12 }} animate={{ opacity:1,scale:1,y:0 }} transition={{duration:.25}}><button className="icon-button modal-close" aria-label="Close dialog" onClick={onClose}><X size={24} strokeWidth={1.5}/></button><h2 id={titleId} className="modal-title">{title}</h2><div className="mt-4 flex flex-col gap-5">{children}</div></motion.div>}</dialog>;
}
