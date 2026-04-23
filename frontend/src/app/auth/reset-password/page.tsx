"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { mapAuthActionError } from "@/lib/auth-errors";
import { flushUi } from "@/lib/flush-ui";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") || "");
    const confirm = String(formData.get("confirmPassword") || "");

    if (!password || password.length < 8) {
      setError("Use at least 8 characters for your new password.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    flushUi(() => {
      setLoading(true);
      setError(null);
    });
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateErr) {
      setError(mapAuthActionError(updateErr.message, "reset"));
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/login"), 1200);
  }

  return (
    <main className="container-page py-16 sm:py-24">
      <div className="mx-auto max-w-md rounded-3xl border border-white/[0.14] bg-gradient-to-b from-zinc-900/95 to-black p-5 shadow-[0_40px_120px_-55px_rgba(75,250,148,0.35)] sm:p-7">
        <div className="mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-brand-green to-emerald-300" />
        <p className="inline-flex rounded-full border border-white/[0.14] bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
          Account security
        </p>
        <h1 className="mt-4 heading-display-fluid text-zinc-50">
          Set new
          <br />
          password
        </h1>
        <p className="mt-4 text-sm text-zinc-400">Choose a new password for your account. After saving, we will send you back to login.</p>

        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <Input
            name="password"
            type="password"
            placeholder="New password"
            autoComplete="new-password"
            className="h-12 text-left [unicode-bidi:plaintext]"
            required
          />
          <Input
            name="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            autoComplete="new-password"
            className="h-12 text-left [unicode-bidi:plaintext]"
            required
          />
          {error ? <p className="text-sm font-medium text-red-400">{error}</p> : null}
          {done ? <p className="text-sm font-medium text-brand-green">Password updated. Redirecting to login…</p> : null}
          <Button className="w-full bg-gradient-to-r from-brand-green to-emerald-300 text-black hover:brightness-105" disabled={loading}>
            {loading ? "Saving…" : "Save new password"}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-zinc-500">
          Or{" "}
          <Link href="/login" className="font-semibold text-zinc-200 underline underline-offset-4">
            go back to login
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
