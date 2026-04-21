"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Sparkles } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { readEventDraft, safeNextPath } from "@/lib/event-draft";
import { Button, Input } from "@/components/ui";

function LoginForm() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const hasEventDraft = Boolean(readEventDraft());
  const effectiveNext = searchParams.get("next") ? next : hasEventDraft ? "/dashboard/events/new" : next;
  const justSignedUp = searchParams.get("justSignedUp") === "1";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      return setError(error.message);
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
            Account<br />login
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            Access tickets, orders, and host tools in one place.
          </p>
          {hasEventDraft ? (
            <p className="mt-3 rounded-xl border border-brand-green/25 bg-brand-green/10 px-3 py-2 text-sm text-zinc-100">
              Draft found. Logging in will take you back to event publishing.
            </p>
          ) : null}
          <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            <span className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-2 py-1.5">Buyer</span>
            <span className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-2 py-1.5">Host</span>
            <span className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-2 py-1.5">One account</span>
          </div>
          <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5 sm:p-4">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Secure sign in
            </p>
            <form onSubmit={onSubmit} className="mt-3.5 space-y-3">
          {justSignedUp ? (
            <p className="rounded-xl border border-brand-green/30 bg-brand-green/10 px-3 py-2 text-sm text-zinc-100">
              Account created. If confirmation email is required, verify it first, then log in.
            </p>
          ) : null}
          <Input
            name="email"
            type="email"
            placeholder="you@school.edu"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="email"
            dir="ltr"
            className="h-12 text-left [unicode-bidi:plaintext]"
            required
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
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <Button className="w-full bg-gradient-to-r from-brand-green to-emerald-300 text-black hover:brightness-105" disabled={loading}>
            {loading ? "Logging in…" : "Login"}
          </Button>
            </form>
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
