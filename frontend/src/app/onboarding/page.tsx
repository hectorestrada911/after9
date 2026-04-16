"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Button, Card, Input } from "@/components/ui";

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
    <main className="container-page py-12">
      <Card className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold">Host onboarding</h1>
        <p className="mt-1 text-sm text-slate-600">Set your profile so guests trust your event pages.</p>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <Input name="fullName" placeholder="Full name" required />
          <Input name="school" placeholder="School" required />
          <Input name="organizerName" placeholder="Organizer name" required />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button className="w-full">Continue</Button>
        </form>
      </Card>
    </main>
  );
}
