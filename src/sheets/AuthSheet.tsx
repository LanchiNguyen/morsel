// Morsel — sign-in / create-account sheet. Saves sync to the cloud once you're
// in; signed out, they stay on this device.
import { useState } from "react";
import { signIn, signUp } from "../lib/auth";

export function AuthSheet({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const submit = async () => {
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 70, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <button aria-label="Close" onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(15,9,4,.45)", cursor: "pointer" }} />
      <div className="m-rise" style={{ position: "relative", background: "var(--surface)", borderRadius: "calc(var(--r) + 4px) calc(var(--r) + 4px) 0 0", padding: "10px 20px 28px", boxShadow: "var(--shadow-float)" }}>
        <div style={{ width: 36, height: 4, borderRadius: 99, background: "var(--line)", margin: "0 auto 14px" }} />
        <div className="m-heading" style={{ marginBottom: 4 }}>{mode === "in" ? "Welcome back" : "Create your account"}</div>
        <div className="m-caption" style={{ color: "var(--ink-3)", marginBottom: 16 }}>
          {mode === "in" ? "Sign in to sync your saves across devices." : "Your saves follow you everywhere once you’re in."}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!busy) submit();
          }}
        >
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            aria-label="Email"
            style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid var(--line)", background: "var(--sunken)", borderRadius: 14, padding: "13px 16px", font: "inherit", fontSize: 16, color: "var(--ink)", marginBottom: 10 }}
          />
          <input
            type="password"
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            aria-label="Password"
            style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid var(--line)", background: "var(--sunken)", borderRadius: 14, padding: "13px 16px", font: "inherit", fontSize: 16, color: "var(--ink)", marginBottom: 12 }}
          />
          {error && <div className="m-caption" style={{ color: "var(--accent)", marginBottom: 10 }}>{error}</div>}
          {note && <div className="m-caption" style={{ color: "var(--ink-2)", marginBottom: 10 }}>{note}</div>}
          <button type="submit" className="m-btn m-btn-primary" style={{ width: "100%" }} disabled={busy || !email || !password}>
            {busy ? "…" : mode === "in" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          className="m-caption"
          style={{ display: "block", width: "100%", textAlign: "center", color: "var(--ink-2)", fontWeight: 700, marginTop: 14 }}
          onClick={() => {
            setMode((m) => (m === "in" ? "up" : "in"));
            setError(null);
            setNote(null);
          }}
        >
          {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
