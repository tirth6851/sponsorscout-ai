import Groq from 'groq-sdk';

// Server-side only — never import this file in client components
let _groq: Groq | null = null;

export function getGroqClient(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set. Add it to .env.local (server-only).');
  }
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

export const GROQ_MODEL = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';
