"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { safeNextPath } from "@/lib/event-draft";
import { Button, Input } from "@/components/ui";

function OnboardingForm() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (ignore) return;
      setHasSession(Boolean(data.session));
      setCheckingAuth(false);
    }
    checkSession().catch(() => {
      if (!ignore) {
        setHasSession(false);
        setCheckingAuth(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, [supabase.auth]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const { data: sessionData } = await supabase.auth.getSession();
    const authedUser = sessionData.session?.user;
    if (!authedUser) return setError("Please login first.");
    const organizerName = String(formData.get("organizerName")).trim();
    const legalNameRaw = String(formData.get("legalName") ?? "").trim();
    const fullName = legalNameRaw || organizerName;
    if (!organizerName) return setError("Add the name guests should see on your event pages.");

    const payload = {
      id: authedUser.id,
      full_name: fullName,
      school: null,
      organizer_name: organizerName,
    };
    const { error } = await supabase.from("profiles").upsert(payload);
    if (error) return setError(error.message);
    // Ensure server-rendered routes (dashboard) read the updated session/profile immediately.
    router.refresh();
    router.push(next);
  }

  if (checkingAuth) {
    return (
      <main className="container-page min-w-0 py-16 sm:py-24">
        <div className="mx-auto max-w-lg min-w-0">
          <p className="text-center text-sm text-muted">Checking your session…</p>
        </div>
      </main>
    );
  }

  if (!hasSession) {
    return (
      <main className="container-page min-w-0 py-16 sm:py-24">
        <div className="mx-auto max-w-lg min-w-0 rounded-2xl border border-line bg-white p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">One more step</p>
          <h1 className="mt-3 heading-display-fluid">Log in to continue</h1>
          <p className="mt-4 text-base text-muted">
            Your account was created, but this browser is not logged in yet. If email confirmation is enabled, confirm your email first, then log in.
          </p>
          <Link
            href={`/login?next=${encodeURIComponent(next)}&from=onboarding`}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-neutral-800"
          >
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container-page min-w-0 py-16 sm:py-24">
      <div className="mx-auto max-w-lg min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Step 1 of 1</p>
        <h1 className="mt-3 heading-display-fluid">
          Host<br />onboarding
        </h1>
        <p className="mt-4 text-base text-muted">
          Set your profile so guests trust your event pages.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-3">
          <Input name="organizerName" placeholder="Shown on events (e.g. RAGE / your collective)" required />
          <Input name="legalName" placeholder="Legal / account name (optional)" />
          <p className="text-xs leading-relaxed text-muted">
            <span className="font-semibold text-black">Shown on events</span> is what buyers see as “Hosted by …”.{" "}
            <span className="font-semibold text-black">Legal / account name</span> is only for your records; leave it blank
            to reuse the public name.
          </p>
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <Button className="w-full">Continue</Button>
        </form>
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <main className="container-page min-w-0 py-16 sm:py-24">
          <p className="text-center text-sm text-muted">Loading…</p>
        </main>
      }
    >
      <OnboardingForm />
    </Suspense>
  );
}
