import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export const createBrowserSupabaseClient = (): SupabaseClient => {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error('Supabase env is missing');
  }

  // Use SSR browser client so OAuth uses PKCE and can be completed by /auth/callback.
  _client = createBrowserClient(url, anon);
  return _client;
};
