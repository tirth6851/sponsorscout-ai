import Groq from 'groq-sdk';
import { getGroqApiKey } from '@/lib/env';

// Server-side only — never import this file in client components or pages
let _groq: Groq | null = null;

export function getGroqClient(): Groq {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set. Add it to .env.local (server-only, never expose to client).');
  }
  if (!_groq) {
    _groq = new Groq({ apiKey });
  }
  return _groq;
}

export const GROQ_MODEL = process.env.GROQ_MODEL?.trim() ?? 'llama-3.3-70b-versatile';
