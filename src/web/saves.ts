// Morsel web — saved dishes, persisted to localStorage. Kept separate from the
// phone app's state blob so the two surfaces can't corrupt each other.
import { useCallback, useEffect, useState } from "react";

const KEY = "morsel_web_saves";

function load(): Set<string> {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) || "[]");
    return new Set(Array.isArray(arr) ? (arr as string[]) : []);
  } catch {
    return new Set();
  }
}

export function useSaves() {
  const [saved, setSaved] = useState<Set<string>>(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify([...saved]));
  }, [saved]);

  const toggle = useCallback((id: string) => {
    setSaved((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }, []);

  return { saved, toggle };
}
