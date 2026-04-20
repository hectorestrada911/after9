"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function DashboardAuthFallback() {
  const supabase = getSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (ignore) return;
        setEmail(data.session?.user?.email ?? null);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [supabase.auth]);

  if (loading) {
    return (
      <main className="container-page min-w-0 py-16 sm:py-24">
        <div className="mx-auto max-w-md text-center">
          <h1 className="display-section-fluid">Checking session</h1>
          <p className="mt-4 text-base text-muted">One moment while we verify your account.</p>
        </div>
      </main>
    );
  }

  if (email) {
    return (
      <main className="container-page min-w-0 py-16 sm:py-24">
        <div className="mx-auto max-w-md text-center">
          <h1 className="display-section-fluid">You are signed in</h1>
          <p className="mt-4 text-base text-muted">
            Server auth check is temporarily unavailable. Continue to host tools as {email}.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/dashboard/events/new" className="inline-flex pill-dark h-12 px-7 text-sm">
              CREATE EVENT
            </Link>
            <Link
              href="/account"
              className="inline-flex h-12 items-center rounded-full border border-white/20 px-6 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/40"
            >
              ACCOUNT HOME
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container-page min-w-0 py-16 sm:py-24">
      <div className="mx-auto max-w-md text-center">
        <h1 className="display-section-fluid">Login required</h1>
        <p className="mt-4 text-base text-muted">Sign in to access your host dashboard.</p>
        <Link href="/login?next=/dashboard" className="mt-6 inline-flex pill-dark h-12 px-7 text-sm">
          GO TO LOGIN
        </Link>
      </div>
    </main>
  );
}
