"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Fingerprint, Mic2, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import {
  AuthAmbient,
  AuthFormPanel,
  AuthGradientFrame,
  AuthPageSkeleton,
  AuthPrimaryButton,
  authFieldClass,
  authHeroContainer,
  authHeroItem,
  badgeContainer,
  badgeItem,
  useAuthMotion,
} from "@/components/auth-shell";
import { mapAuthActionError, mapAuthCallbackError } from "@/lib/auth-errors";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { readEventDraft, safeNextPath } from "@/lib/event-draft";
import { Input } from "@/components/ui";
import { flushUi } from "@/lib/flush-ui";
import { cn } from "@/lib/utils";

function LoginForm() {
  const { reduceMotion, panelTransition } = useAuthMotion();
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const hasEventDraft = Boolean(readEventDraft());
  const effectiveNext = searchParams.get("next") ? next : hasEventDraft ? "/dashboard/events/new" : next;
  const justSignedUp = searchParams.get("justSignedUp") === "1";
  const verified = searchParams.get("verified") === "1";
  const urlError = mapAuthCallbackError(searchParams.get("error"));

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordResetSent, setPasswordResetSent] = useState(false);

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
    const emailRedirectTo = `${window.location.origin}/auth/callback?type=signup`;
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
    // Reuse the success area style; this is intentionally explicit.
    setPasswordResetSent(true);
  }

  const signupHref = `/signup?next=${encodeURIComponent(effectiveNext)}`;

  return (
    <main className="container-page relative min-h-[100dvh] min-w-0 overflow-hidden py-16 sm:py-24">
      <AuthAmbient variant="login" />
      <AuthGradientFrame reduceMotion={reduceMotion}>
        <motion.div variants={authHeroContainer} initial={reduceMotion ? "show" : "hidden"} animate="show">
          <motion.div
            variants={authHeroItem}
            className="mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-brand-green to-emerald-300 shadow-[0_0_28px_-4px_rgba(75,250,148,0.65)]"
          />
          <motion.p
            variants={authHeroItem}
            className="inline-flex rounded-full border border-white/[0.14] bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            Welcome back
          </motion.p>
          <motion.h1 variants={authHeroItem} className="mt-4 heading-display-fluid">
            <span className="block text-zinc-50">Account</span>
            <span className="mt-1 block bg-gradient-to-r from-brand-green via-emerald-200 to-teal-200 bg-clip-text text-transparent">login</span>
          </motion.h1>
          <motion.p variants={authHeroItem} className="mt-4 text-base leading-relaxed text-zinc-400">
            Access tickets, orders, and host tools in one calm place.
          </motion.p>
          {hasEventDraft ? (
            <motion.p
              variants={authHeroItem}
              className="mt-3 rounded-xl border border-brand-green/30 bg-brand-green/[0.12] px-3 py-2.5 text-sm leading-snug text-zinc-100 shadow-[0_0_0_1px_rgba(75,250,148,0.12)_inset]"
            >
              Draft found. Logging in will take you back to event publishing.
            </motion.p>
          ) : null}
        </motion.div>

        <motion.div
          className="mt-5 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-400"
          variants={badgeContainer}
          initial={reduceMotion ? "show" : "hidden"}
          animate="show"
        >
          {(
            [
              { label: "Buyer" as const, Icon: ShoppingBag },
              { label: "Host" as const, Icon: Mic2 },
              { label: "One account" as const, Icon: Fingerprint },
            ] as const
          ).map(({ label, Icon }) => (
            <motion.span
              key={label}
              variants={badgeItem}
              className="flex flex-col items-center justify-center gap-1 rounded-xl border border-white/[0.1] bg-white/[0.03] px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:flex-row sm:gap-1.5"
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-brand-green/85" aria-hidden />
              {label}
            </motion.span>
          ))}
        </motion.div>

        <AuthFormPanel>
          {urlError ? <p className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{urlError}</p> : null}

          <motion.form
            initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={panelTransition}
            onSubmit={onPasswordSubmit}
            className="mt-1 space-y-3"
          >
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-green/70" aria-hidden />
              Email and password
            </p>
            {justSignedUp ? (
              <p className="rounded-xl border border-brand-green/30 bg-brand-green/10 px-3 py-2 text-sm text-zinc-100">
                {verified
                  ? "Email confirmed. You can log in now."
                  : "Account created. If confirmation email is required, verify it first, then log in."}
              </p>
            ) : null}
            <Input
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              inputMode="email"
              dir="ltr"
              className={cn(authFieldClass, "text-left [unicode-bidi:plaintext]")}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              dir="ltr"
              className={cn(authFieldClass, "text-left [unicode-bidi:plaintext]")}
              required
            />
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
                className="w-full rounded-full border border-brand-green/35 bg-brand-green/10 py-2 text-center text-xs font-semibold uppercase tracking-wide text-brand-green transition hover:bg-brand-green/20"
                disabled={loading}
              >
                Resend verification email
              </button>
            ) : null}
            <AuthPrimaryButton type="submit" loading={loading} disabled={loading}>
              {loading ? "Logging in…" : "Login"}
            </AuthPrimaryButton>
            <button
              type="button"
              onClick={() => void sendPasswordReset()}
              className="w-full rounded-full py-2 text-center text-xs font-semibold uppercase tracking-wide text-zinc-400 underline-offset-4 transition hover:text-zinc-200 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/35"
              disabled={loading}
            >
              Forgot password?
            </button>
            {passwordResetSent ? (
              <p className="rounded-xl border border-brand-green/30 bg-brand-green/10 px-3 py-2 text-sm text-zinc-100">
                Email sent. Check your inbox for the next step.
              </p>
            ) : null}
          </motion.form>
        </AuthFormPanel>

        <p className="mt-6 text-sm text-zinc-400">
          New here?{" "}
          <Link
            className="font-bold text-zinc-100 underline decoration-brand-green/50 underline-offset-4 transition hover:text-white hover:decoration-brand-green"
            href={signupHref}
          >
            Create account
          </Link>
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-zinc-500">
          <Sparkles className="h-3.5 w-3.5 text-brand-green/80" aria-hidden />
          One login for tickets, dashboard, and check-in tools.
        </p>
        <p className="mt-3 text-xs leading-relaxed text-zinc-500">
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
      </AuthGradientFrame>
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
