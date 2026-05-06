"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, KeyRound, Lock, Mail, Shield, UserRound } from "lucide-react";
import {
  AuthDivider,
  AuthPageSkeleton,
  GoogleAuthButton,
  authGreenFieldClass,
  useAuthMotion,
} from "@/components/auth-shell";
import { EduVerifyShieldIcon } from "@/components/edu-verify-shield-icon";
import { mapAuthActionError, mapAuthCallbackError } from "@/lib/auth-errors";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { readEventDraft, safeNextPath } from "@/lib/event-draft";
import { flushUi } from "@/lib/flush-ui";
import { cn } from "@/lib/utils";

function LoginForm() {
  const { reduceMotion, panelTransition } = useAuthMotion();
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const [hasEventDraft, setHasEventDraft] = useState(false);
  const effectiveNext = searchParams.get("next") ? next : hasEventDraft ? "/dashboard/events/new" : next;
  const justSignedUp = searchParams.get("justSignedUp") === "1";
  const verified = searchParams.get("verified") === "1";
  const urlError = mapAuthCallbackError(searchParams.get("error"));

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordResetSent, setPasswordResetSent] = useState(false);

  useEffect(() => {
    setHasEventDraft(Boolean(readEventDraft()));
  }, []);

  async function signInWithGoogle() {
    flushUi(() => {
      setLoading(true);
      setError(null);
    });
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(effectiveNext)}`;
    const { error: oauthErr } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    if (oauthErr) {
      setLoading(false);
      setError(mapAuthActionError(oauthErr.message, "login"));
    }
  }

  async function onPasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    flushUi(() => {
      setLoading(true);
      setError(null);
    });
    const formData = new FormData(e.currentTarget);
    const formEmail = String(formData.get("email"));
    const password = String(formData.get("password"));
    const { error: signErr } = await supabase.auth.signInWithPassword({ email: formEmail, password });
    if (signErr) {
      setLoading(false);
      return setError(mapAuthActionError(signErr.message, "login"));
    }
    try {
      const shouldAutoRoute = !searchParams.get("next");
      if (!shouldAutoRoute) {
        setLoading(false);
        router.push(next);
        return;
      }
      if (hasEventDraft) {
        setLoading(false);
        router.push("/dashboard/events/new");
        return;
      }
      const res = await fetch("/api/auth/post-login", { method: "GET" });
      const payload = (await res.json()) as { path?: string };
      setLoading(false);
      router.push(payload.path || "/account");
    } catch {
      setLoading(false);
      router.push(effectiveNext);
    }
  }

  async function sendPasswordReset() {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email first so we know where to send reset instructions.");
      return;
    }
    flushUi(() => {
      setLoading(true);
      setError(null);
    });
    const redirectTo = `${window.location.origin}/auth/callback?type=recovery`;
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(trimmed, { redirectTo });
    setLoading(false);
    if (resetErr) {
      return setError(mapAuthActionError(resetErr.message, "reset"));
    }
    setPasswordResetSent(true);
  }

  async function resendVerificationEmail() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Enter your email first, then resend verification.");
      return;
    }
    flushUi(() => {
      setLoading(true);
      setError(null);
    });
    const nextAfterVerify = searchParams.get("next") ? next : hasEventDraft ? "/dashboard/events/new" : "/account";
    const emailRedirectTo = `${window.location.origin}/auth/callback?type=signup&next=${encodeURIComponent(nextAfterVerify)}`;
    const { error: resendErr } = await supabase.auth.resend({
      type: "signup",
      email: trimmed,
      options: { emailRedirectTo },
    });
    setLoading(false);
    if (resendErr) {
      setError(mapAuthActionError(resendErr.message, "signup"));
      return;
    }
    setPasswordResetSent(false);
    setError(null);
    setPasswordResetSent(true);
    void fetch("/api/auth/verification-resend-nudge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmed }),
    }).catch(() => {});
  }

  const signupHref = `/signup?next=${encodeURIComponent(effectiveNext)}`;
  const verifyEduHref = `/verify-edu?next=${encodeURIComponent(effectiveNext)}`;

  const inputInnerClass =
    "min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-white outline-none ring-0 placeholder:text-zinc-600";

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
              Encrypted session
            </span>
            <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
              Google or password
            </span>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-3xl border border-brand-green/30 bg-brand-green/[0.08] shadow-[0_0_32px_rgba(75,250,148,0.2)]">
              <EduVerifyShieldIcon size={52} />
            </div>
          </div>

          <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-brand-green">Secure access</p>
          <h1 className="mt-2 text-center text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">
            Log in to your <span className="bg-gradient-to-r from-brand-green via-emerald-200 to-teal-200 bg-clip-text text-transparent">account</span>
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-relaxed text-zinc-400">
            Tickets, host tools, and check-in in one place.
          </p>

          {urlError ? (
            <p className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200">{urlError}</p>
          ) : null}

          {hasEventDraft ? (
            <p className="mt-6 rounded-2xl border border-brand-green/25 bg-brand-green/[0.08] px-4 py-3 text-center text-sm leading-relaxed text-zinc-200">
              Draft found. After you sign in, we&apos;ll take you back to finish publishing your event.
            </p>
          ) : null}

          <div className="mt-10 space-y-3">
            <GoogleAuthButton
              onClick={() => void signInWithGoogle()}
              loading={loading}
              className="rounded-xl border border-white/15 bg-white/[0.04] py-3.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
            />
            <AuthDivider />
          </div>

          <motion.form
            initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={panelTransition}
            onSubmit={onPasswordSubmit}
            className="mt-6 space-y-4"
          >
            {justSignedUp ? (
              <p className="rounded-2xl border border-brand-green/25 bg-brand-green/[0.08] px-4 py-3 text-sm leading-relaxed text-zinc-100">
                {verified
                  ? "Email confirmed. Log in now and we will continue to your prefilled event."
                  : "Account created. Check your inbox, verify your email, then log in to continue to your prefilled event."}
              </p>
            ) : null}

            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-xs font-semibold text-zinc-400">
                Email
              </label>
              <div className={cn(authGreenFieldClass, "cursor-text")}>
                <Mail className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputInnerClass}
                  required
                />
              </div>
              <p className="mt-2 flex gap-2 text-xs leading-relaxed text-zinc-500">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden />
                <span>We use your email only for sign-in and account notices—no spam.</span>
              </p>
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-xs font-semibold text-zinc-400">
                Password
              </label>
              <div className={cn(authGreenFieldClass, "cursor-text")}>
                <Lock className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="••••••••"
                  className={inputInnerClass}
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {error ? (
                <motion.p
                  key={error}
                  initial={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2 }}
                  className="text-sm font-medium text-red-400"
                >
                  {error}
                </motion.p>
              ) : null}
            </AnimatePresence>

            {error?.includes("Email not verified yet") ? (
              <button
                type="button"
                onClick={() => void resendVerificationEmail()}
                className="w-full rounded-xl border border-brand-green/35 bg-brand-green/10 py-2.5 text-center text-xs font-bold uppercase tracking-[0.1em] text-brand-green transition hover:bg-brand-green/20"
                disabled={loading}
              >
                Resend verification email
              </button>
            ) : null}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-brand-green via-[#7dffc0] to-emerald-400 px-4 py-3.5 text-sm font-extrabold text-black shadow-[0_14px_40px_-14px_rgba(75,250,148,0.65)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in…" : "Log in"}
              </button>
              <p className="mt-2 text-center text-xs text-zinc-500">Same account for buyers, hosts, and door check-in.</p>
            </div>

            <button
              type="button"
              onClick={() => void sendPasswordReset()}
              className="w-full rounded-full py-2 text-center text-xs font-semibold uppercase tracking-wide text-zinc-400 underline-offset-4 transition hover:text-zinc-200 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/35"
              disabled={loading}
            >
              Forgot password?
            </button>

            {passwordResetSent ? (
              <p className="rounded-2xl border border-brand-green/25 bg-brand-green/[0.08] px-4 py-3 text-sm leading-relaxed text-zinc-100">
                Email sent. Check your inbox for the next step.
              </p>
            ) : null}
          </motion.form>

          <div className="mt-12">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">Why sign in</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <ul className="mt-6 space-y-5">
              <li className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-green/25 bg-brand-green/[0.06]">
                  <Shield className="h-4 w-4 text-brand-green" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">Trusted access</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">Modern auth and encrypted transport for every session.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-green/25 bg-brand-green/[0.06]">
                  <KeyRound className="h-4 w-4 text-brand-green" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">One login</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">Tickets, payouts, and host tools share a single account.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-green/25 bg-brand-green/[0.06]">
                  <UserRound className="h-4 w-4 text-brand-green" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">Your privacy</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">We never sell your email. Control notifications anytime.</p>
                </div>
              </li>
            </ul>
          </div>

          <p className="mt-10 text-center text-sm text-zinc-400">
            New here?{" "}
            <Link
              href={signupHref}
              className="font-bold text-white underline decoration-brand-green/50 underline-offset-4 transition hover:decoration-brand-green"
            >
              Create account
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-zinc-500">
            Student?{" "}
            <Link href={verifyEduHref} className="font-semibold text-brand-green underline-offset-2 hover:underline">
              Verify your .edu email
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-zinc-500">
            Questions?{" "}
            <Link href="/faq" className="font-semibold text-zinc-300 underline-offset-2 hover:text-white hover:underline">
              Read the FAQ
            </Link>
            .
          </p>

          <p className="mt-6 text-center text-xs leading-relaxed text-zinc-500">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2 transition hover:text-zinc-300">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-2 transition hover:text-zinc-300">
              Privacy Policy
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
