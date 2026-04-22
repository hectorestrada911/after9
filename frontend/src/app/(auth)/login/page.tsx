"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ShieldCheck, Sparkles } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { readEventDraft, safeNextPath } from "@/lib/event-draft";
import { Button, Input } from "@/components/ui";
import { flushUi } from "@/lib/flush-ui";

type AuthMode = "password" | "magic";

function mapAuthError(raw: string | null): string | null {
  if (!raw) return null;
  if (raw === "session") return "Your sign-in link expired or was already used. Request a new one.";
  if (raw === "missing_token") return "That sign-in link is incomplete. Request a new magic link.";
  if (raw === "config") return "Login is not configured. Check environment variables.";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function mapPasswordError(raw: string): string {
  const msg = raw.toLowerCase();
  if (msg.includes("invalid login credentials")) return "Incorrect email or password.";
  if (msg.includes("email not confirmed")) return "Confirm your email first, then log in.";
  if (msg.includes("too many requests")) return "Too many attempts. Wait a moment and try again.";
  return raw;
}

function LoginForm() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const hasEventDraft = Boolean(readEventDraft());
  const effectiveNext = searchParams.get("next") ? next : hasEventDraft ? "/dashboard/events/new" : next;
  const justSignedUp = searchParams.get("justSignedUp") === "1";
  const verified = searchParams.get("verified") === "1";
  const urlError = mapAuthError(searchParams.get("error"));

  const [authMode, setAuthMode] = useState<AuthMode>("password");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);

  useEffect(() => {
    if (resendSecondsLeft <= 0) return;
    const id = window.setTimeout(() => setResendSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendSecondsLeft]);

  async function onPasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    flushUi(() => {
      setLoading(true);
      setError(null);
    });
    const formData = new FormData(e.currentTarget);
    const formEmail = String(formData.get("email"));
    const password = String(formData.get("password"));
    const { error: signErr } = await supabase.auth.signInWithPassword({ email: formEmail, password });
    if (signErr) {
      setLoading(false);
      return setError(mapPasswordError(signErr.message));
    }
    try {
      const shouldAutoRoute = !searchParams.get("next");
      if (!shouldAutoRoute) {
        setLoading(false);
        router.push(next);
        return;
      }
      if (hasEventDraft) {
        setLoading(false);
        router.push("/dashboard/events/new");
        return;
      }
      const res = await fetch("/api/auth/post-login", { method: "GET" });
      const payload = (await res.json()) as { path?: string };
      setLoading(false);
      router.push(payload.path || "/account");
    } catch {
      setLoading(false);
      router.push(effectiveNext);
    }
  }

  async function sendMagicLink() {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email so we can send the link.");
      return;
    }
    if (resendSecondsLeft > 0) return;

    flushUi(() => {
      setLoading(true);
      setError(null);
    });
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNextPath(effectiveNext))}`;
    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: false,
      },
    });
    setLoading(false);
    if (otpErr) {
      return setError(otpErr.message);
    }
    setMagicSent(true);
    setResendSecondsLeft(45);
  }

  async function sendPasswordReset() {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email first so we know where to send reset instructions.");
      return;
    }
    flushUi(() => {
      setLoading(true);
      setError(null);
    });
    const redirectTo = `${window.location.origin}/auth/callback?type=recovery`;
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(trimmed, { redirectTo });
    setLoading(false);
    if (resetErr) {
      return setError(resetErr.message);
    }
    setMagicSent(true);
  }

  const signupHref = `/signup?next=${encodeURIComponent(effectiveNext)}`;

  return (
    <main className="container-page relative min-w-0 py-16 sm:py-24">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 20% 12%, rgba(75,250,148,0.16), transparent 38%), radial-gradient(circle at 86% 0%, rgba(255,255,255,0.08), transparent 34%)",
        }}
      />
      <div className="mx-auto max-w-md min-w-0">
        <div className="rounded-3xl border border-white/[0.14] bg-gradient-to-b from-zinc-900/95 to-black p-5 shadow-[0_40px_120px_-55px_rgba(75,250,148,0.35)] backdrop-blur sm:p-7">
          <div className="mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-brand-green to-emerald-300" />
          <p className="inline-flex rounded-full border border-white/[0.14] bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
            Welcome back
          </p>
          <h1 className="mt-4 heading-display-fluid text-zinc-50">
            Account<br />
            login
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">Access tickets, orders, and host tools in one place.</p>
          {hasEventDraft ? (
            <p className="mt-3 rounded-xl border border-brand-green/25 bg-brand-green/10 px-3 py-2 text-sm text-zinc-100">
              Draft found. Logging in will take you back to event publishing.
            </p>
          ) : null}

          <div className="mt-5 flex rounded-full border border-white/[0.1] bg-black/40 p-1">
            <button
              type="button"
              className={`flex-1 rounded-full py-2 text-[11px] font-bold uppercase tracking-wide transition ${
                authMode === "password" ? "bg-white text-black" : "text-zinc-500 hover:text-zinc-300"
              }`}
              onClick={() => {
                setAuthMode("password");
                setMagicSent(false);
                setError(null);
              }}
            >
              Password
            </button>
            <button
              type="button"
              className={`flex-1 rounded-full py-2 text-[11px] font-bold uppercase tracking-wide transition ${
                authMode === "magic" ? "bg-white text-black" : "text-zinc-500 hover:text-zinc-300"
              }`}
              onClick={() => {
                setAuthMode("magic");
                setMagicSent(false);
                setError(null);
              }}
            >
              Email link
            </button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            <span className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-2 py-1.5">Buyer</span>
            <span className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-2 py-1.5">Host</span>
            <span className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-2 py-1.5">One account</span>
          </div>

          <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5 sm:p-4">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              {authMode === "password" ? "Secure sign in" : "Passwordless"}
            </p>

            {urlError && authMode === "password" ? (
              <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{urlError}</p>
            ) : null}

            {authMode === "password" ? (
              <form onSubmit={onPasswordSubmit} className="mt-3.5 space-y-3">
                {justSignedUp ? (
                  <p className="rounded-xl border border-brand-green/30 bg-brand-green/10 px-3 py-2 text-sm text-zinc-100">
                    {verified
                      ? "Email confirmed. You can log in now."
                      : "Account created. If confirmation email is required, verify it first, then log in."}
                  </p>
                ) : null}
                <Input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  inputMode="email"
                  dir="ltr"
                  className="h-12 text-left [unicode-bidi:plaintext]"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  dir="ltr"
                  className="h-12 text-left [unicode-bidi:plaintext]"
                  required
                />
                {error ? <p className="text-sm font-medium text-red-400">{error}</p> : null}
                <Button className="w-full bg-gradient-to-r from-brand-green to-emerald-300 text-black hover:brightness-105" disabled={loading}>
                  {loading ? "Logging in…" : "Login"}
                </Button>
                <button
                  type="button"
                  onClick={() => void sendPasswordReset()}
                  className="w-full text-center text-xs font-semibold uppercase tracking-wide text-zinc-400 underline-offset-4 transition hover:text-zinc-200 hover:underline"
                  disabled={loading}
                >
                  Forgot password?
                </button>
                {magicSent ? (
                  <p className="rounded-xl border border-brand-green/30 bg-brand-green/10 px-3 py-2 text-sm text-zinc-100">
                    Reset link sent. Open the email and choose a new password.
                  </p>
                ) : null}
              </form>
            ) : (
              <div className="mt-3.5 space-y-3">
                {urlError ? <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{urlError}</p> : null}
                <p className="text-sm text-zinc-400">
                  We will email you a one-time link. Use the <strong className="text-zinc-200">same email</strong> you use at checkout so{" "}
                  <strong className="text-zinc-200">My tickets</strong> lines up.
                </p>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  inputMode="email"
                  dir="ltr"
                  className="h-12 text-left [unicode-bidi:plaintext]"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {error ? <p className="text-sm font-medium text-red-400">{error}</p> : null}
                {magicSent ? (
                  <div className="rounded-xl border border-brand-green/30 bg-brand-green/10 px-3 py-3 text-sm text-zinc-100">
                    <p className="inline-flex items-center gap-2 font-semibold text-white">
                      <Mail className="h-4 w-4 shrink-0" aria-hidden />
                      Check your inbox
                    </p>
                    <p className="mt-2 text-zinc-300">Open the email link on this device to finish signing in.</p>
                  </div>
                ) : null}
                <Button
                  type="button"
                  className="w-full bg-gradient-to-r from-brand-green to-emerald-300 text-black hover:brightness-105"
                  disabled={loading || (magicSent && resendSecondsLeft > 0)}
                  onClick={() => void sendMagicLink()}
                >
                  {loading ? "Sending…" : magicSent ? `Resend link${resendSecondsLeft > 0 ? ` (${resendSecondsLeft}s)` : ""}` : "Email me a magic link"}
                </Button>
                {magicSent ? (
                  <p className="text-center text-xs text-zinc-500">
                    No email? Check spam. Or use{" "}
                    <button type="button" className="font-bold text-zinc-200 underline" onClick={() => setAuthMode("password")}>
                      password
                    </button>{" "}
                    instead.
                  </p>
                ) : null}
              </div>
            )}
          </div>

          <p className="mt-6 text-sm text-zinc-400">
            New here?{" "}
            <Link className="font-bold text-zinc-100 underline underline-offset-4 hover:text-white" href={signupHref}>
              Create account
            </Link>
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-zinc-500">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            One login for tickets, dashboard, and check-in tools.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-zinc-300">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-zinc-300">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="container-page min-w-0 py-16 sm:py-24">
          <p className="text-center text-sm text-muted">Loading…</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
