import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables. ' +
        'Copy .env.local.example to .env.local and fill in your Supabase credentials.'
      );
    }

    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

// Convenience getter (lazy)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// Session management using localStorage
export function getSessionToken(shareCode: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`dp_session_${shareCode}`);
}

export function setSessionToken(shareCode: string, token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`dp_session_${shareCode}`, token);
}

export function generateSessionToken(): string {
  return crypto.randomUUID();
}
