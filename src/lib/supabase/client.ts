import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve environment variables safely
const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as unknown as { env?: Record<string, string> }).env : undefined;
const procEnv = typeof process !== 'undefined' ? process.env : undefined;

const envUrl =
  metaEnv?.VITE_SUPABASE_URL ||
  metaEnv?.NEXT_PUBLIC_SUPABASE_URL ||
  procEnv?.NEXT_PUBLIC_SUPABASE_URL ||
  procEnv?.VITE_SUPABASE_URL ||
  '';

const envAnonKey =
  metaEnv?.VITE_SUPABASE_ANON_KEY ||
  metaEnv?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  procEnv?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  procEnv?.VITE_SUPABASE_ANON_KEY ||
  '';

// Allow manual override stored in browser if user supplies their project keys in UI
const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('supabase_custom_url') || '' : '';
const storedAnonKey = typeof window !== 'undefined' ? localStorage.getItem('supabase_custom_key') || '' : '';

export const SUPABASE_URL = storedUrl || envUrl;
export const SUPABASE_ANON_KEY = storedAnonKey || envAnonKey;

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(SUPABASE_URL) &&
    Boolean(SUPABASE_ANON_KEY) &&
    SUPABASE_URL.startsWith('http') &&
    !SUPABASE_URL.includes('your-project.supabase.co')
  );
};

// Create Supabase client instance
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL || 'https://placeholder-project.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export function updateSupabaseConfig(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('supabase_custom_url', url.trim());
    localStorage.setItem('supabase_custom_key', key.trim());
    window.location.reload();
  }
}
