"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { safeNextPath } from "@/lib/event-draft";
import { Button, Input } from "@/components/ui";

function SignupForm() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const next = safeNextPath(nextParam);
  const hostIntent = next.startsWith("/dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    if (!data.session) {
      const loginTarget = hostIntent ? next : "/account";
      router.push(`/login?next=${encodeURIComponent(loginTarget)}&justSignedUp=1`);
      return;
    }
    if (hostIntent) {
      router.push(`/onboarding?next=${encodeURIComponent(next)}`);
      return;
    }
    router.push("/account");
  }

  const loginHref = `/login?next=${encodeURIComponent(next)}`;

  return (
    <main className="container-page min-w-0 py-16 sm:py-24">
      <div className="mx-auto max-w-md min-w-0">
        <div className="rounded-3xl border border-white/[0.1] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5 shadow-[0_30px_80px_-45px_rgba(0,0,0,0.9)] backdrop-blur sm:p-7">
          <p className="inline-flex rounded-full border border-white/[0.14] bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
            Get started
          </p>
          <h1 className="mt-4 heading-display-fluid text-zinc-50">
            Create<br />account
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            Launch trusted event pages and monetize your community.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            <span className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-2 py-1.5">One login</span>
            <span className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-2 py-1.5">My tickets</span>
            <span className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-2 py-1.5">Host tools</span>
          </div>

          <form onSubmit={onSubmit} className="mt-7 space-y-3">
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
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            dir="ltr"
            className="text-left [unicode-bidi:plaintext]"
            required
          />
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <Button className="w-full bg-gradient-to-r from-white to-zinc-200 text-black hover:brightness-95" disabled={loading}>
            {loading ? "Creating…" : "Sign up"}
          </Button>
          </form>
          <p className="mt-6 text-sm text-zinc-400">
            Already have an account?{" "}
            <Link className="font-bold text-zinc-100 underline underline-offset-4 hover:text-white" href={loginHref}>
              Log in
            </Link>
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
