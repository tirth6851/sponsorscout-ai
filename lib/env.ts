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

// ── Module-level flags (evaluated once at startup) ────────────────────────────

export const SUPABASE_CONFIGURED = isSupabaseConfigured();
export const GROQ_CONFIGURED = isGroqConfigured();
