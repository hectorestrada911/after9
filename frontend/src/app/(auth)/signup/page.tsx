"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ShieldCheck, Sparkles } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { readEventDraft, safeNextPath } from "@/lib/event-draft";
import { Button, Input } from "@/components/ui";

type AuthMode = "password" | "magic";

function SignupForm() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const next = safeNextPath(nextParam);
  const hasEventDraft = Boolean(readEventDraft());
  const hostIntent = next.startsWith("/dashboard") || hasEventDraft;
  const hostNext = next.startsWith("/dashboard") ? next : "/dashboard/events/new";
  const urlError = searchParams.get("error");

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
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const formEmail = String(formData.get("email"));
    const password = String(formData.get("password"));
    const { data, error: signErr } = await supabase.auth.signUp({ email: formEmail, password });
    if (signErr) {
      setLoading(false);
      return setError(signErr.message);
    }
    if (!data.session) {
      setLoading(false);
      const loginTarget = hostIntent ? hostNext : "/account";
      router.push(`/login?next=${encodeURIComponent(loginTarget)}&justSignedUp=1`);
      return;
    }
    if (hostIntent) {
      const { data: profile } = await supabase.from("profiles").select("id").eq("id", data.session.user.id).maybeSingle();
      setLoading(false);
      if (profile) {
        router.push(hostNext);
        return;
      }
      router.push(`/onboarding?next=${encodeURIComponent(hostNext)}`);
      return;
    }
    setLoading(false);
    router.push("/account");
  }

  async function sendMagicLink() {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email so we can send the link.");
      return;
    }
    if (resendSecondsLeft > 0) return;

    setLoading(true);
    setError(null);
    const destination = hostIntent ? hostNext : "/account";
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNextPath(destination))}`;
    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
      },
    });
    setLoading(false);
    if (otpErr) {
      return setError(otpErr.message);
    }
    setMagicSent(true);
    setResendSecondsLeft(45);
  }

  const loginHref = `/login?next=${encodeURIComponent(hostIntent ? hostNext : next)}`;

  return (
    <main className="container-page relative min-w-0 py-16 sm:py-24">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 15% 12%, rgba(75,250,148,0.18), transparent 40%), radial-gradient(circle at 85% 0%, rgba(255,255,255,0.08), transparent 34%)",
        }}
      />
      <div className="mx-auto max-w-md min-w-0">
        <div className="rounded-3xl border border-white/[0.14] bg-gradient-to-b from-zinc-900/95 to-black p-5 shadow-[0_40px_120px_-55px_rgba(75,250,148,0.35)] backdrop-blur sm:p-7">
          <div className="mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-brand-green to-emerald-300" />
          <p className="inline-flex rounded-full border border-white/[0.14] bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
            Get started
          </p>
          <h1 className="mt-4 heading-display-fluid text-zinc-50">
            Create<br />
            account
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">Launch trusted event pages and monetize your community.</p>
          {hasEventDraft ? (
            <p className="mt-3 rounded-xl border border-brand-green/25 bg-brand-green/10 px-3 py-2 text-sm text-zinc-100">
              Draft found. After signup, we will return you to publish that event.
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
            <span className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-2 py-1.5">One login</span>
            <span className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-2 py-1.5">My tickets</span>
            <span className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-2 py-1.5">Host tools</span>
          </div>

          <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5 sm:p-4">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              {authMode === "password" ? "Secure account setup" : "Passwordless signup"}
            </p>

            {urlError ? <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{urlError}</p> : null}

            {authMode === "password" ? (
              <form onSubmit={onPasswordSubmit} className="mt-3.5 space-y-3">
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
                  autoComplete="new-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  dir="ltr"
                  className="h-12 text-left [unicode-bidi:plaintext]"
                  required
                />
                {error ? <p className="text-sm font-medium text-red-400">{error}</p> : null}
                <Button className="w-full bg-gradient-to-r from-brand-green to-emerald-300 text-black hover:brightness-105" disabled={loading}>
                  {loading ? "Creating…" : "Sign up"}
                </Button>
              </form>
            ) : (
              <div className="mt-3.5 space-y-3">
                <p className="text-sm text-zinc-400">
                  {hostIntent
                    ? "We will email you a link to finish setup. After you open it, you may complete your organizer profile before publishing."
                    : "We will email you a link. No password to remember — you can add one later in account settings if you want."}
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
                    <p className="mt-2 text-zinc-300">Use the link on this device to activate your account.</p>
                  </div>
                ) : null}
                <Button
                  type="button"
                  className="w-full bg-gradient-to-r from-brand-green to-emerald-300 text-black hover:brightness-105"
                  disabled={loading || (magicSent && resendSecondsLeft > 0)}
                  onClick={() => void sendMagicLink()}
                >
                  {loading ? "Sending…" : magicSent ? `Resend link${resendSecondsLeft > 0 ? ` (${resendSecondsLeft}s)` : ""}` : "Email me a signup link"}
                </Button>
              </div>
            )}
          </div>
          <p className="mt-6 text-sm text-zinc-400">
            Already have an account?{" "}
            <Link className="font-bold text-zinc-100 underline underline-offset-4 hover:text-white" href={loginHref}>
              Log in
            </Link>
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-zinc-500">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            One account unlocks buyer tickets and host tools.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className="container-page min-w-0 py-16 sm:py-24">
          <p className="text-center text-sm text-muted">Loading…</p>
        </main>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
