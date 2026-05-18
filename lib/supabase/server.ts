import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isSupabaseConfigured, getSupabaseUrl, getSupabasePublishableKey } from '@/lib/env';

export { isSupabaseConfigured };

export function createClient() {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = cookies();
  return createServerClient(
    getSupabaseUrl()!,
    getSupabasePublishableKey()!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server Components cannot set cookies directly; handled by middleware
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Server Components cannot set cookies directly; handled by middleware
          }
        },
      },
    }
  );
}
