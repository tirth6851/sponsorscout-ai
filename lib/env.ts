/**
 * Validates that a required environment variable is set.
 * Throws at runtime with a clear message if missing.
 */
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: "${key}". ` +
        `Add it to .env.local — see .env.example for reference.`
    );
  }
  return value;
}

export const SUPABASE_CONFIGURED = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const ANTHROPIC_CONFIGURED = !!process.env.ANTHROPIC_API_KEY;
