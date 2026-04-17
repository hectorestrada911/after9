"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Button, Input } from "@/components/ui";

export default function OnboardingPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
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
    router.push("/dashboard");
  }

  return (
    <main className="container-page py-16 sm:py-24">
      <div className="mx-auto max-w-lg">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Step 1 of 1</p>
        <h1 className="mt-3 text-5xl sm:text-6xl font-black tracking-tighter leading-[0.9]">
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
