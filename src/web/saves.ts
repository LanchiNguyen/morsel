// Morsel web — saved dishes. Persist to localStorage for guests, and sync to
// the cloud (Supabase) once signed in. Kept separate from the phone app's state
// blob so the two surfaces can't corrupt each other; both share one account.
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth, type AuthValue } from "../lib/auth";
import { addCloudSave, removeCloudSave, fetchCloudSaves, mergeLocalSaves } from "../lib/cloudSaves";

const KEY = "morsel_web_saves";

function load(): Set<string> {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) || "[]");
    return new Set(Array.isArray(arr) ? (arr as string[]) : []);
  } catch {
    return new Set();
  }
}

export function useSaves(): { saved: Set<string>; toggle: (id: string) => void; auth: AuthValue } {
  const auth = useAuth();
  const [saved, setSaved] = useState<Set<string>>(load);

  // Guest fallback: always mirror to localStorage so saves survive a reload
  // even when signed out.
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify([...saved]));
  }, [saved]);

  // On sign-in, merge this device's saves up to the account, then adopt the
  // cloud set as the source of truth.
  const syncedUser = useRef<string | null>(null);
  useEffect(() => {
    if (!auth.enabled) return;
    const u = auth.user?.id ?? null;
    if (u === syncedUser.current) return;
    syncedUser.current = u;
    if (!u) return;
    (async () => {
      try {
        await mergeLocalSaves([...saved]);
        setSaved(new Set(await fetchCloudSaves()));
      } catch (e) {
        console.warn("[morsel] saves sync failed:", e);
      }
    })();
    // `saved` read once at sign-in time, deliberately not a dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.enabled, auth.user]);

  const toggle = useCallback(
    (id: string) => {
      setSaved((s) => {
        const n = new Set(s);
        const adding = !n.has(id);
        if (adding) n.add(id);
        else n.delete(id);
        if (auth.user) {
          (adding ? addCloudSave(id) : removeCloudSave(id)).catch((e) => console.warn("[morsel] save sync failed:", e));
        }
        return n;
      });
    },
    [auth.user],
  );

  return { saved, toggle, auth };
}
