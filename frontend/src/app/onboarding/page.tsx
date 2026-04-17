"use client";

import { FormEvent, Suspense, useState } from "react";
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

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return setError("Please login first.");
    const payload = {
      id: authData.user.id,
      full_name: String(formData.get("fullName")),
      school: String(formData.get("school")),
      organizer_name: String(formData.get("organizerName")),
    };
    const { error } = await supabase.from("profiles").upsert(payload);
    if (error) return setError(error.message);
    router.push(next);
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
          <Input name="fullName" placeholder="Full name" required />
          <Input name="school" placeholder="School" required />
          <Input name="organizerName" placeholder="Organizer name" required />
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
