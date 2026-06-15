// Morsel — authentication (Supabase Auth, email + password).
//
// `useAuth()` reports whether auth is even available (it isn't in demo mode,
// where Supabase isn't configured) and tracks the current user. When auth is
// disabled the UI hides every sign-in affordance, so the demo is unchanged.
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase, isLive } from "./supabase";

export interface AuthValue {
  /** Auth is only available when a Supabase project is configured. */
  enabled: boolean;
  /** False until the initial session check resolves. */
  ready: boolean;
  user: User | null;
}

export function useAuth(): AuthValue {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!isLive);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { enabled: isLive, ready, user };
}

/** Friendly label for the signed-in user — the part of the email before the @. */
export function displayName(user: User | null): string {
  const email = user?.email ?? "";
  return email ? email.split("@")[0] : "you";
}

export async function signIn(email: string, password: string): Promise<void> {
  if (!supabase) throw new Error("Accounts aren’t configured.");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUp(email: string, password: string): Promise<{ needsConfirm: boolean }> {
  if (!supabase) throw new Error("Accounts aren’t configured.");
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  // When email confirmation is on, there's a user but no active session yet.
  return { needsConfirm: Boolean(data.user) && !data.session };
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}
