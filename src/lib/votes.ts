// Morsel — "% would order again" votes.
//
// This metric is the product: never a 1–5 star score. Until a dish has real
// diner votes it shows a *derived* read (from the catalog source's rating),
// clearly badged; once it crosses VOTE_THRESHOLD real votes, the genuine
// crowd number takes over automatically. Votes are captured from day one so
// the signal accrues even before there's a user base.
//
// Individual votes are private (RLS); only the aggregated counts are public,
// read through the `dish_vote_counts` view. No-ops without a Supabase session.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth";

export const VOTE_THRESHOLD = 5;

export interface EffectivePct {
  pct: number;
  /** true once real votes drive the number; false while it's a derived read. */
  real: boolean;
}

export function effectivePct(derivedPct: number, total: number, up: number): EffectivePct {
  if (total >= VOTE_THRESHOLD) return { pct: Math.round((up / total) * 100), real: true };
  return { pct: derivedPct, real: false };
}

export interface VoteState {
  total: number;
  up: number;
  myVote: boolean | null;
  /** Voting is possible: accounts are configured and the user is signed in. */
  canVote: boolean;
  cast: (wouldAgain: boolean) => void;
}

export function useDishVote(dishId: string): VoteState {
  const { enabled, user } = useAuth();
  const [s, setS] = useState<{ total: number; up: number; myVote: boolean | null }>({ total: 0, up: 0, myVote: null });

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    setS({ total: 0, up: 0, myVote: null });
    (async () => {
      try {
        const counts = await supabase!.from("dish_vote_counts").select("total,up").eq("dish_id", dishId).maybeSingle();
        const mine = user
          ? await supabase!.from("dish_votes").select("would_again").eq("dish_id", dishId).maybeSingle()
          : null;
        if (!active) return;
        setS({
          total: Number(counts.data?.total) || 0,
          up: Number(counts.data?.up) || 0,
          myVote: mine?.data ? Boolean(mine.data.would_again) : null,
        });
      } catch (e) {
        console.warn("[morsel] vote load failed:", e);
      }
    })();
    return () => {
      active = false;
    };
  }, [dishId, user]);

  const cast = useCallback(
    (wouldAgain: boolean) => {
      if (!supabase || !user) return;
      setS((prev) => {
        if (prev.myVote === wouldAgain) return prev;
        return {
          total: prev.total + (prev.myVote === null ? 1 : 0),
          up: prev.up + (wouldAgain ? 1 : 0) - (prev.myVote === true ? 1 : 0),
          myVote: wouldAgain,
        };
      });
      supabase
        .from("dish_votes")
        .upsert({ user_id: user.id, dish_id: dishId, would_again: wouldAgain })
        .then(({ error }) => {
          if (error) console.warn("[morsel] vote save failed:", error);
        });
    },
    [dishId, user],
  );

  return { total: s.total, up: s.up, myVote: s.myVote, canVote: enabled && Boolean(user), cast };
}
