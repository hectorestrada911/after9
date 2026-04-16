"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Button, Card, Input } from "@/components/ui";

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
    <main className="container-page py-8 sm:py-12">
      <Card className="mx-auto max-w-md animate-fadeUp p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Welcome back</p>
        <h1 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">Host login</h1>
        <p className="mt-1 text-sm text-slate-300 sm:text-base">Access event analytics, ticket sales, and check-in tools.</p>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <Input name="email" type="email" placeholder="you@school.edu" required />
          <Input name="password" type="password" placeholder="Password" required />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button className="w-full text-base" disabled={loading}>{loading ? "Logging in..." : "Login"}</Button>
        </form>
        <p className="mt-3 text-center text-sm text-slate-300">
          New host? <Link className="font-semibold text-brand" href="/signup">Create account</Link>
        </p>
      </Card>
    </main>
  );
}
