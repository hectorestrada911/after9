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
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Get started</p>
        <h1 className="mt-3 heading-display-fluid">
          Create<br />account
        </h1>
        <p className="mt-4 text-base text-muted">
          Launch trusted event pages and monetize your community.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-3">
          <Input name="email" type="email" placeholder="you@school.edu" required />
          <Input name="password" type="password" placeholder="Password" required />
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <Button className="w-full" disabled={loading}>
            {loading ? "Creating…" : "Sign up"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted">
          Already have an account?{" "}
          <Link className="font-bold text-zinc-100 underline underline-offset-4 hover:text-white" href={loginHref}>
            Log in
          </Link>
        </p>
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
