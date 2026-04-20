"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Sparkles } from "lucide-react";
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
    if (error) {
      setLoading(false);
      return setError(error.message);
    }
    if (!data.session) {
      setLoading(false);
      const loginTarget = hostIntent ? next : "/account";
      router.push(`/login?next=${encodeURIComponent(loginTarget)}&justSignedUp=1`);
      return;
    }
    if (hostIntent) {
      const { data: profile } = await supabase.from("profiles").select("id").eq("id", data.session.user.id).maybeSingle();
      setLoading(false);
      if (profile) {
        router.push(next);
        return;
      }
      router.push(`/onboarding?next=${encodeURIComponent(next)}`);
      return;
    }
    setLoading(false);
    router.push("/account");
  }

  const loginHref = `/login?next=${encodeURIComponent(next)}`;

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

          <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5 sm:p-4">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Secure account setup
            </p>
            <form onSubmit={onSubmit} className="mt-3.5 space-y-3">
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
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            dir="ltr"
            className="h-12 text-left [unicode-bidi:plaintext]"
            required
          />
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <Button className="w-full bg-gradient-to-r from-brand-green to-emerald-300 text-black hover:brightness-105" disabled={loading}>
            {loading ? "Creating…" : "Sign up"}
          </Button>
            </form>
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
