import 'server-only';

import { GoogleGenAI } from '@google/genai';

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');
  return new GoogleGenAI({ apiKey });
}

export function geminiModel() {
  return MODEL;
}

export async function generateGeminiStructured<T>(args: {
  prompt: string;
  schema: Record<string, unknown>;
  systemInstruction?: string;
  files?: Array<{ data: Uint8Array; mimeType: string }>;
}) {
  const ai = getClient();
  const contents: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> = [
    ...(args.files ?? []).map((file) => ({
      inlineData: { data: Buffer.from(file.data).toString('base64'), mimeType: file.mimeType },
    })),
    { text: args.prompt },
  ];

  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: {
      systemInstruction: args.systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: args.schema,
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error('Gemini returned an empty response.');
  return JSON.parse(text) as T;
}
