export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: "${key}". ` +
        `Add it to .env.local — see .env.example for reference.`
    );
  }
  return value.trim();
}

// ── Supabase helpers ──────────────────────────────────────────────────────────

export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
}

export function getSupabasePublishableKey(): string | undefined {
  // Accept either the new publishable key name or the legacy anon key name
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    undefined
  );
}

export function isValidSupabaseUrl(url: string | undefined): url is string {
  return typeof url === 'string' && url.startsWith('https://') && url.length > 10;
}

export function isSupabaseConfigured(): boolean {
  return isValidSupabaseUrl(getSupabaseUrl()) && !!getSupabasePublishableKey();
}

// ── Groq helpers ──────────────────────────────────────────────────────────────

export function getGroqApiKey(): string | undefined {
  return process.env.GROQ_API_KEY?.trim() || undefined;
}

export function isGroqConfigured(): boolean {
  return !!getGroqApiKey();
}

// ── Job API helpers ───────────────────────────────────────────────────────────

export function getAdzunaAppId(): string | undefined {
  return process.env.ADZUNA_APP_ID?.trim() || undefined;
}

export function getAdzunaAppKey(): string | undefined {
  return process.env.ADZUNA_APP_KEY?.trim() || undefined;
}

export function getSerpApiKey(): string | undefined {
  return process.env.SERPAPI_API_KEY?.trim() || undefined;
}

export function getUSAJobsApiKey(): string | undefined {
  return process.env.USAJOBS_API_KEY?.trim() || undefined;
}

export function getUSAJobsUserAgent(): string | undefined {
  return process.env.USAJOBS_USER_AGENT?.trim() || undefined;
}

export function isAdzunaConfigured(): boolean {
  return !!getAdzunaAppId() && !!getAdzunaAppKey();
}

export function isSerpApiConfigured(): boolean {
  return !!getSerpApiKey();
}

export function isUSAJobsConfigured(): boolean {
  return !!getUSAJobsApiKey() && !!getUSAJobsUserAgent();
}

// ── Module-level flags (evaluated once at startup) ────────────────────────────

export const SUPABASE_CONFIGURED = isSupabaseConfigured();
export const GROQ_CONFIGURED = isGroqConfigured();
