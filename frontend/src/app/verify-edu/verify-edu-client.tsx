"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, Lock, Mail, Shield, UserRound } from "lucide-react";
import { EduVerifyShieldIcon } from "@/components/edu-verify-shield-icon";
import { parseEduEmail } from "@/lib/edu-email";
import { safeNextPath } from "@/lib/event-draft";
import { mapAuthActionError } from "@/lib/auth-errors";
import { trackProductEvent } from "@/lib/product-analytics";
import { flushUi } from "@/lib/flush-ui";
import { cn } from "@/lib/utils";

const fieldClass =
  "flex w-full items-center gap-3 rounded-xl border border-brand-green/35 bg-discover-card px-3.5 py-3 text-left text-sm text-zinc-200 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),0_0_20px_rgba(75,250,148,0.1)] outline-none ring-0 transition placeholder:text-zinc-600 focus:border-brand-green/60 focus:shadow-[0_0_24px_rgba(75,250,148,0.18)]";

export function VerifyEduClient() {
  const reduceMotion = useReducedMotion();
  const searchParams = useSearchParams();
  const next = useMemo(() => safeNextPath(searchParams.get("next")), [searchParams]);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const parsed = parseEduEmail(email);
    if (!parsed.ok) {
      setError(parsed.message);
      trackProductEvent("verify_edu_client_invalid", { reason: "format" });
      return;
    }
    flushUi(() => setLoading(true));
    try {
      const res = await fetch("/api/auth/edu-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parsed.email, next }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        const raw = typeof data.error === "string" ? data.error : "Could not send the email right now.";
        setError(mapAuthActionError(raw, "signup"));
        trackProductEvent("verify_edu_request_error", { status: res.status });
        return;
      }
      setSent(true);
      trackProductEvent("verify_edu_link_requested", {});
    } finally {
      flushUi(() => setLoading(false));
    }
  }

  return (
    <main className="relative min-h-[100dvh] bg-discover-ink text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(75,250,148,0.12), transparent 55%), radial-gradient(circle at 80% 90%, rgba(59,130,246,0.06), transparent 45%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-md px-5 pb-16 pt-6 sm:px-6 sm:pt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 transition hover:text-zinc-300"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back
        </Link>

        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-8"
        >
          <div className="flex flex-wrap justify-center gap-2">
            <span className="rounded-full border border-brand-green/35 bg-brand-green/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-green">
              Campus verified
            </span>
            <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
              One-tap check
            </span>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-3xl border border-brand-green/30 bg-brand-green/[0.08] shadow-[0_0_32px_rgba(75,250,148,0.2)]">
              <EduVerifyShieldIcon size={52} />
            </div>
          </div>

          <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-brand-green">.edu required</p>
          <h1 className="mt-2 text-center text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">Verify your .edu email</h1>
          <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-relaxed text-zinc-400">
            Access student-only events and campus benefits.
          </p>

          {sent ? (
            <motion.div
              initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 rounded-2xl border border-brand-green/25 bg-brand-green/[0.08] px-5 py-6 text-center"
            >
              <p className="text-sm font-semibold text-white">Check your inbox</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                We sent a sign-in link to <span className="font-medium text-white">{email.trim().toLowerCase()}</span>. Open it on this device to finish.
              </p>
              <p className="mt-4 text-xs text-zinc-500">
                Wrong address?{" "}
                <button type="button" className="font-semibold text-brand-green underline-offset-2 hover:underline" onClick={() => { setSent(false); setError(null); }}>
                  Edit email
                </button>
              </p>
              <Link href="/login" className="mt-5 inline-block text-sm font-semibold text-zinc-300 underline-offset-4 hover:text-white hover:underline">
                Already verified? Log in
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={(e) => void onSubmit(e)} className="mt-10 space-y-4">
              <div>
                <label htmlFor="edu-email" className="mb-1.5 block text-xs font-semibold text-zinc-400">
                  Your .edu email
                </label>
                <div className={cn(fieldClass, "cursor-text")}>
                  <Mail className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
                  <input
                    id="edu-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="name@school.edu"
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                    className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-white outline-none ring-0 placeholder:text-zinc-600"
                    required
                  />
                </div>
                <p className="mt-2 flex gap-2 text-xs leading-relaxed text-zinc-500">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden />
                  <span>We&apos;ll email you a verification link. No spam. Used only for verification.</span>
                </p>
              </div>

              {error ? <p className="text-sm font-medium text-red-400">{error}</p> : null}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-brand-green via-[#7dffc0] to-emerald-400 px-4 py-3.5 text-sm font-extrabold text-black shadow-[0_14px_40px_-14px_rgba(75,250,148,0.65)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                  )}
                >
                  {loading ? "Sending link…" : "Verify student email"}
                </button>
                <p className="mt-2 text-center text-xs text-zinc-500">Only .edu email addresses allowed.</p>
                <p className="mt-2 text-center text-xs leading-relaxed text-zinc-500">
                  We&apos;ll send a link—tap it in your inbox and you&apos;re in.
                </p>
              </div>
            </form>
          )}

          <div className="mt-12">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">Why we verify</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <ul className="mt-6 space-y-5">
              <li className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                  <Shield className="h-4 w-4 text-brand-green" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">Trusted student community</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">Prevent spam and fake accounts.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                  <Lock className="h-4 w-4 text-brand-green" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">Exclusive access</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">Unlock events, deals, and campus perks.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                  <UserRound className="h-4 w-4 text-brand-green" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">Your privacy matters</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">We never share your email.</p>
                </div>
              </li>
            </ul>
          </div>

          <p className="mt-10 text-center text-xs text-zinc-500">
            Questions?{" "}
            <Link href="/faq#faq-edu-email" className="font-semibold text-zinc-300 underline-offset-2 hover:text-white hover:underline">
              Read the FAQ
            </Link>
            .
          </p>
          <p className="mt-6 flex justify-center">
            <span className="rounded-full border border-brand-green/30 bg-brand-green/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-green">
              Verified in 8s
            </span>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
