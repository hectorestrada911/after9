"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Button, Input } from "@/components/ui";

export default function LoginPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
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
    router.push("/dashboard");
  }

  return (
    <main className="container-page py-16 sm:py-24">
      <div className="mx-auto max-w-md">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Welcome back</p>
        <h1 className="mt-3 text-5xl sm:text-6xl font-black tracking-tighter leading-[0.9]">
          Host<br />login
        </h1>
        <p className="mt-4 text-base text-muted">
          Access event analytics, ticket sales, and check-in tools.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-3">
          <Input name="email" type="email" placeholder="you@school.edu" required />
          <Input name="password" type="password" placeholder="Password" required />
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <Button className="w-full" disabled={loading}>{loading ? "Logging in…" : "Login"}</Button>
        </form>
        <p className="mt-6 text-sm text-muted">
          New host?{" "}
          <Link className="font-bold text-black underline underline-offset-4" href="/signup">
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}
