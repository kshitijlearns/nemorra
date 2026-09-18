import { z } from "zod";

export const memoryPlanItemSchema = z.object({
  concept: z.string().min(1).max(400),
  cue: z.string().min(1).max(180),
  association: z.string().min(1).max(300),
});

export const materialSchema = z.object({
  title: z.string().min(1).max(120),
  text: z.string().min(20).max(20_000),
  concepts: z.array(z.string().min(1).max(400)).min(1).max(12),
  memoryPlan: z.array(memoryPlanItemSchema).max(12).optional(),
});

export const assessmentSchema = z.object({
  summary: z.string().min(1).max(1500),
  items: z.array(z.object({
    status: z.enum(["remembered", "partial", "missing"]),
    feedback: z.string().min(1).max(600),
  })).min(1).max(12),
});

export const sessionSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  material: materialSchema,
  explanation: z.string().max(12_000),
  teach: assessmentSchema.nullable(),
  pinned: z.boolean().optional(),
});

export const storeSchema = z.object({
  version: z.literal(1),
  current: sessionSchema.nullable(),
  records: z.array(sessionSchema).max(100),
  notes: z.string().max(20_000),
  profile: z.object({ name: z.string().max(80) }),
  calm: z.boolean(),
});

export type MemoryPlanItem = z.infer<typeof memoryPlanItemSchema>;
export type Material = z.infer<typeof materialSchema>;
export type Assessment = z.infer<typeof assessmentSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type LearningStore = z.infer<typeof storeSchema>;

export const STORAGE_KEY = "nemorra.learning.v1";
export const emptyStore = (): LearningStore => ({
  version: 1,
  current: null,
  records: [],
  notes: "",
  profile: { name: "Local learner" },
  calm: false,
});

export function score(assessment: Assessment | null) {
  if (!assessment) return 0;
  return Math.round(
    assessment.items.reduce((sum, item) => sum + (
      item.status === "remembered" ? 1 :
      item.status === "partial" ? 0.5 : 0
    ), 0) / assessment.items.length * 100,
  );
}

export function overall(session: Session) {
  return score(session.teach);
}

export function newSession(material: Material): Session {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    material,
    explanation: "",
    teach: null,
  };
}

export async function learningRequest(body: unknown) {
  const response = await fetch("/api/learning", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(65_000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Learning service unavailable. Please try again.");
  return data;
}

export async function saveCloudSession(session: Session, userId: string) {
  const response = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, session }),
    keepalive: true,
  });
  if (!response.ok) throw new Error("Could not save this session to the cloud.");
}

export function getClientUserId() {
  const key = "nemorra.user.v1";
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(key, id);
    return id;
  } catch {
    return "local-" + crypto.randomUUID();
  }
}

export async function uploadToS3(file: File, userId: string) {
  const prepare = await fetch("/api/storage/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
    }),
  });
  const data = await prepare.json().catch(() => ({}));
  if (!prepare.ok) throw new Error(data.error || "Could not prepare file upload.");
  if (!data.fields || !data.url || !data.key) throw new Error("Upload service returned an invalid response.");

  const form = new FormData();
  for (const [key, value] of Object.entries(data.fields as Record<string, string>)) form.append(key, value);
  form.append("file", file);

  const response = await fetch(data.url, { method: "POST", body: form });
  if (!response.ok) throw new Error("The file could not be uploaded.");
  return { key: data.key as string, configured: true };
}

export async function encodeFile(file: File) {
  if (file.size > 2 * 1024 * 1024) throw new Error("Choose a file smaller than 2 MB.");
  const mime = file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "");
  if (!["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(mime)) {
    throw new Error("Use a PDF, JPG, PNG, WebP, or paste plain text.");
  }
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("Could not read this file."));
    reader.readAsDataURL(file);
  });
  return { mime, data };
}
