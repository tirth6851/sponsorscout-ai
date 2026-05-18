import { createBrowserClient } from '@supabase/ssr';
import { isSupabaseConfigured, getSupabaseUrl, getSupabasePublishableKey } from '@/lib/env';

export { isSupabaseConfigured };

export function createClient() {
  if (!isSupabaseConfigured()) return null;
  return createBrowserClient(
    getSupabaseUrl()!,
    getSupabasePublishableKey()!
  );
}
