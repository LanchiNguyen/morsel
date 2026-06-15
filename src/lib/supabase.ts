// Morsel — Supabase client.
//
// The browser talks to Postgres directly through Supabase's REST layer; row
// level security (see supabase/schema.sql) is what makes the public anon key
// safe to ship. No server of our own to host.
//
// If the env vars are absent (local dev with no project wired up yet, or a
// preview build), `supabase` is null and the app transparently falls back to
// the bundled seed data — so it always runs, and goes live the moment real
// keys are present.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when a real Supabase project is configured. */
export const isLive = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isLive
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
