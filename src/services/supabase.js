import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Auth will operate in degraded/mock mode.'
  );
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

/**
 * Create a new account with email + password.
 * @param {string} email
 * @param {string} password
 * @returns {{ data, error }}
 */
export async function signUp(email, password) {
  if (!supabase) return { data: { user: null, session: null }, error: new Error('Supabase not configured') };
  return supabase.auth.signUp({ email, password });
}

/**
 * Sign in with existing email + password.
 * @param {string} email
 * @param {string} password
 * @returns {{ data, error }}
 */
export async function signIn(email, password) {
  if (!supabase) return { data: { user: null, session: null }, error: new Error('Supabase not configured') };
  return supabase.auth.signInWithPassword({ email, password });
}

/**
 * Sign in with Google OAuth via Supabase.
 * @returns {{ data, error }}
 */
export async function signInWithGoogle() {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
}

/**
 * End the current session.
 * @returns {{ error }}
 */
export async function signOut() {
  if (!supabase) return { error: null };
  return supabase.auth.signOut();
}

// ---------------------------------------------------------------------------
// Profile helpers
// ---------------------------------------------------------------------------

/**
 * Fetch the profile row for the currently authenticated user.
 * @param {string} userId
 * @returns {{ data, error }}
 */
export async function getProfile(userId) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  return supabase.from('profiles').select('*').eq('user_id', userId).single();
}

/**
 * Insert or update a profile row (upsert by user_id).
 * @param {{ user_id: string, full_name?: string, avatar_url?: string }} profile
 * @returns {{ data, error }}
 */
export async function upsertProfile(profile) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  return supabase.from('profiles').upsert(profile, { onConflict: 'user_id' });
}