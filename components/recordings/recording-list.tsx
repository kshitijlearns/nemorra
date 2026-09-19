"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { Pin, Trash2, ArrowRight, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNemorra } from "@/components/app-provider";
import { Modal } from "@/components/modals/modal";
import { overall, score, type Session } from "@/lib/learning";

export function ScoreRing({ score: value, size = 62 }: { score: number; size?: number }) {
  return (
    <div className="score-ring" style={{ width: size, height: size }} aria-label={`${value}% recall`}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border)" strokeWidth="5" />
        <motion.circle cx="32" cy="32" r="28" fill="none" stroke="var(--foreground)" strokeWidth="5" initial={{ pathLength: 0 }} whileInView={{ pathLength: value / 100 }} viewport={{ once: true }} transition={{ duration: 1 }} />
      </svg>
      <span>{value}%</span>
    </div>
  );
}

export function ConceptDots({ total, filled }: { total: number; filled: number }) {
  return (
    <div className="concept-dots" aria-label={`${filled} of ${total} concepts remembered`}>
      {Array.from({ length: total }, (_, i) => <span key={i} className={`concept-dot ${i >= filled ? "empty" : ""}`} />)}
    </div>
  );
}

export function RecordingList({ query = "" }: { query?: string }) {
  const { records, setRecords, openSession, startSession } = useNemorra();
  const [selected, setSelected] = useState<Session | null>(null);
  const router = useRouter();

  const filtered = [...records]
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.createdAt.localeCompare(a.createdAt))
    .filter(record => record.material.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <div className="flex flex-col gap-3">
        {filtered.map(record => (
          <article key={record.id} className="recording-card">
            <button className="recording-main" onClick={() => setSelected(record)} aria-label={`Review ${record.material.title}, ${overall(record)}% recall`}>
              <ScoreRing score={overall(record)} />
              <div className="min-w-0">
                <h3 className="recording-title">{record.pinned && <Pin size={14} className="inline" />} {record.material.title}</h3>
                <p className="recording-meta">{new Date(record.createdAt).toLocaleDateString()} · {record.material.concepts.length} ideas</p>
                <ConceptDots total={record.material.concepts.length} filled={record.teach?.items.filter(item => item.status === "remembered").length || 0} />
              </div>
            </button>
          </article>
        ))}
        {!filtered.length && <p className="quiet-note py-8 text-center">{query ? "No sessions match your search." : "A fresh page. Complete a learning session to save your first memory."}</p>}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.material.title || "Learning session"}>
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-5">
              <ScoreRing score={overall(selected)} size={82} />
              <div>
                <h3 className="text-lg font-semibold">Your learning, revisited.</h3>
                <p className="quiet-note">{new Date(selected.createdAt).toLocaleDateString()} · {selected.material.concepts.length} concepts</p>
              </div>
            </div>
            <p className="page-subtitle">{selected.teach?.summary || "Teach this material again to refresh your recall."}</p>
            <button className="primary-button w-full" onClick={() => { openSession(selected); setSelected(null); router.push("/results"); }}>
              Open results <ArrowRight size={18} />
            </button>
            <button className="pill-button w-full" onClick={() => { startSession(selected.material); setSelected(null); router.push("/teach"); }}>
              <RotateCcw size={18} /> Practice this material again
            </button>
            <button className="pill-button w-full" onClick={() => {
              const next = { ...selected, pinned: !selected.pinned };
              setRecords(rows => rows.map(row => row.id === next.id ? next : row));
              setSelected(next);
            }}>
              <Pin size={18} /> {selected.pinned ? "Unpin session" : "Pin session"}
            </button>
            <button className="pill-button w-full" onClick={() => {
              if (window.confirm("Delete this saved session from this browser? This cannot be undone.")) {
                setRecords(rows => rows.filter(row => row.id !== selected.id));
                setSelected(null);
              }
            }}>
              <Trash2 size={18} /> Delete session
            </button>
          </div>
        )}
      </Modal>
    </>
  );
}
