// Morsel web — sign-in control for the header, plus its modal. Renders nothing
// when accounts aren't configured (demo mode), so the companion is unchanged.
import { useState } from "react";
import { signIn, signUp, signOut, displayName, type AuthValue } from "../lib/auth";

export function WebAuth({ auth }: { auth: AuthValue }) {
  const [open, setOpen] = useState(false);
  if (!auth.enabled) return null;

  if (auth.user) {
    return (
      <button className="w-navlink" onClick={() => void signOut()} title={auth.user.email ?? undefined}>
        {displayName(auth.user)} · Sign out
      </button>
    );
  }

  return (
    <>
      <button className="w-navlink" data-on={open} onClick={() => setOpen(true)}>
        Sign in
      </button>
      {open && <AuthModal onClose={() => setOpen(false)} />}
    </>
  );
}

function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNote(null);
    setBusy(true);
    try {
      if (mode === "in") {
        await signIn(email.trim(), password);
        onClose();
      } else {
        const { needsConfirm } = await signUp(email.trim(), password);
        if (needsConfirm) setNote("Check your email to confirm, then sign in.");
        else onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-modal" role="dialog" aria-modal="true">
      <button className="w-modal-scrim" aria-label="Close" onClick={onClose} />
      <div className="w-modal-card">
        <h2>{mode === "in" ? "Welcome back" : "Create your account"}</h2>
        <p>{mode === "in" ? "Sign in to sync your saves across devices." : "Your saves follow you everywhere once you’re in."}</p>
        <form onSubmit={submit}>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Email" />
          <input type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" aria-label="Password" />
          {error && <div className="w-modal-msg w-modal-err">{error}</div>}
          {note && <div className="w-modal-msg">{note}</div>}
          <button type="submit" className="w-modal-submit" disabled={busy || !email || !password}>
            {busy ? "…" : mode === "in" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button className="w-modal-switch" onClick={() => { setMode((m) => (m === "in" ? "up" : "in")); setError(null); setNote(null); }}>
          {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
