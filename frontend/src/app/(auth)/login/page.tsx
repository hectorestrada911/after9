"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { safeNextPath } from "@/lib/event-draft";
import { Button, Input } from "@/components/ui";

function LoginForm() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
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
      const res = await fetch("/api/auth/post-login", { method: "GET" });
      const payload = (await res.json()) as { path?: string };
      setLoading(false);
      router.push(payload.path || "/account");
    } catch {
      setLoading(false);
      router.push(next);
    }
  }

  const signupHref = `/signup?next=${encodeURIComponent(next)}`;

  return (
    <main className="container-page min-w-0 py-16 sm:py-24">
      <div className="mx-auto max-w-md min-w-0">
        <div className="rounded-3xl border border-white/[0.1] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5 shadow-[0_30px_80px_-45px_rgba(0,0,0,0.9)] backdrop-blur sm:p-7">
          <p className="inline-flex rounded-full border border-white/[0.14] bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
            Welcome back
          </p>
          <h1 className="mt-4 heading-display-fluid text-zinc-50">
            Account<br />login
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            Access tickets, orders, and host tools in one place.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            <span className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-2 py-1.5">Buyer</span>
            <span className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-2 py-1.5">Host</span>
            <span className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-2 py-1.5">One account</span>
          </div>
          <form onSubmit={onSubmit} className="mt-7 space-y-3">
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
            className="text-left [unicode-bidi:plaintext]"
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
            className="text-left [unicode-bidi:plaintext]"
            required
          />
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <Button className="w-full bg-gradient-to-r from-white to-zinc-200 text-black hover:brightness-95" disabled={loading}>
            {loading ? "Logging in…" : "Login"}
          </Button>
          </form>
          <p className="mt-6 text-sm text-zinc-400">
            New here?{" "}
            <Link className="font-bold text-zinc-100 underline underline-offset-4 hover:text-white" href={signupHref}>
              Create account
            </Link>
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
