// Morsel — cloud-synced saves.
//
// Saves live in the `saved_dishes` table (one row per user per dish), guarded
// by row level security so a user only ever sees their own. These helpers are
// no-ops unless a signed-in Supabase session exists, so callers can invoke them
// unconditionally and let the demo / signed-out paths keep using localStorage.
import { supabase } from "./supabase";

async function uid(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

/** All dish ids the current user has saved (empty when signed out). */
export async function fetchCloudSaves(): Promise<string[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("saved_dishes").select("dish_id");
  if (error) throw error;
  return (data ?? []).map((r) => r.dish_id as string);
}

export async function addCloudSave(dishId: string): Promise<void> {
  const user = await uid();
  if (!supabase || !user) return;
  const { error } = await supabase.from("saved_dishes").upsert({ user_id: user, dish_id: dishId });
  if (error) throw error;
}

export async function removeCloudSave(dishId: string): Promise<void> {
  const user = await uid();
  if (!supabase || !user) return;
  const { error } = await supabase.from("saved_dishes").delete().eq("user_id", user).eq("dish_id", dishId);
  if (error) throw error;
}

/**
 * Push a set of local (guest) saves up to the cloud on sign-in. Additive —
 * never deletes — so signing in merges a guest's saves with their account.
 */
export async function mergeLocalSaves(dishIds: string[]): Promise<void> {
  const user = await uid();
  if (!supabase || !user || !dishIds.length) return;
  const rows = dishIds.map((dish_id) => ({ user_id: user, dish_id }));
  const { error } = await supabase.from("saved_dishes").upsert(rows, { ignoreDuplicates: true });
  if (error) throw error;
}
