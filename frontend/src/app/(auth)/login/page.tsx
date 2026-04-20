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
    setLoading(false);
    if (error) return setError(error.message);
    router.push(next);
  }

  const signupHref = `/signup?next=${encodeURIComponent(next)}`;

  return (
    <main className="container-page min-w-0 py-16 sm:py-24">
      <div className="mx-auto max-w-md min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Welcome back</p>
        <h1 className="mt-3 heading-display-fluid">
          Host<br />login
        </h1>
        <p className="mt-4 text-base text-muted">
          Access event analytics, ticket sales, and check-in tools.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-3">
          {justSignedUp ? (
            <p className="rounded-xl border border-brand-green/30 bg-brand-green/10 px-3 py-2 text-sm text-black">
              Account created. If confirmation email is required, verify it first, then log in.
            </p>
          ) : null}
          <Input name="email" type="email" placeholder="you@school.edu" required />
          <Input name="password" type="password" placeholder="Password" required />
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <Button className="w-full" disabled={loading}>
            {loading ? "Logging in…" : "Login"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted">
          New host?{" "}
          <Link className="font-bold text-black underline underline-offset-4" href={signupHref}>
            Create account
          </Link>
        </p>
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
