"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, KeyRound, LayoutGrid, Lock, Mail, Shield, Ticket } from "lucide-react";
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

function SignupForm() {
  const { reduceMotion, panelTransition } = useAuthMotion();
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const next = safeNextPath(nextParam);
  const [hasEventDraft, setHasEventDraft] = useState(false);
  const hostIntent = next.startsWith("/dashboard") || hasEventDraft;
  const hostNext = next.startsWith("/dashboard") ? next : "/dashboard/events/new";
  const urlError = mapAuthCallbackError(searchParams.get("error"));

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHasEventDraft(Boolean(readEventDraft()));
  }, []);

  async function signInWithGoogle() {
    flushUi(() => {
      setLoading(true);
      setError(null);
    });
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(hostIntent ? hostNext : next)}`;
    const { error: oauthErr } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    if (oauthErr) {
      setLoading(false);
      setError(mapAuthActionError(oauthErr.message, "signup"));
    }
  }

  async function onPasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const formEmail = String(formData.get("email"));
    const password = String(formData.get("password"));
    const confirmPassword = String(formData.get("confirmPassword"));
    if (password.length < 8) {
      return setError("Use at least 8 characters for your password.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    flushUi(() => setLoading(true));
    try {
      const nextAfterVerify = hostIntent ? hostNext : next;
      const emailRedirectTo = `${window.location.origin}/auth/callback?type=signup&next=${encodeURIComponent(nextAfterVerify)}`;
      const { data, error: signErr } = await supabase.auth.signUp({
        email: formEmail,
        password,
        options: { emailRedirectTo },
      });
      if (signErr) {
        setError(mapAuthActionError(signErr.message, "signup"));
        return;
      }
      if (!data.session) {
        const loginTarget = hostIntent ? hostNext : "/account";
        router.push(`/login?next=${encodeURIComponent(loginTarget)}&justSignedUp=1`);
        return;
      }
      if (hostIntent) {
        const { data: profile } = await supabase.from("profiles").select("id").eq("id", data.session.user.id).maybeSingle();
        if (profile) {
          router.push(hostNext);
          return;
        }
        router.push(`/onboarding?next=${encodeURIComponent(hostNext)}`);
        return;
      }
      router.push("/account");
    } finally {
      flushUi(() => setLoading(false));
    }
  }

  const loginHref = `/login?next=${encodeURIComponent(hostIntent ? hostNext : next)}`;
  const verifyEduHref = `/verify-edu?next=${encodeURIComponent(hostIntent ? hostNext : next)}`;

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
              Free to join
            </span>
            <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
              Buyer & host
            </span>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-3xl border border-brand-green/30 bg-brand-green/[0.08] shadow-[0_0_32px_rgba(75,250,148,0.2)]">
              <EduVerifyShieldIcon size={52} />
            </div>
          </div>

          <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-brand-green">Get started</p>
          <h1 className="mt-2 text-center text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">
            Create your <span className="bg-gradient-to-r from-brand-green via-emerald-200 to-teal-200 bg-clip-text text-transparent">account</span>
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-relaxed text-zinc-400">
            Launch trusted event pages and monetize your community without juggling five tools.
          </p>

          {urlError ? (
            <p className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200">{urlError}</p>
          ) : null}

          {hasEventDraft ? (
            <p className="mt-6 rounded-2xl border border-brand-green/25 bg-brand-green/[0.08] px-4 py-3 text-center text-sm leading-relaxed text-zinc-200">
              Draft found. We&apos;ll email a verification link to this inbox. After you verify and log in, we return you to your prefilled event to publish.
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
            <div>
              <label htmlFor="signup-email" className="mb-1.5 block text-xs font-semibold text-zinc-400">
                Email
              </label>
              <div className={cn(authGreenFieldClass, "cursor-text")}>
                <Mail className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
                <input
                  id="signup-email"
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
                <span>We&apos;ll send a short verification email—tap the link once, then you can log in.</span>
              </p>
            </div>

            <div>
              <label htmlFor="signup-password" className="mb-1.5 block text-xs font-semibold text-zinc-400">
                Password
              </label>
              <div className={cn(authGreenFieldClass, "cursor-text")}>
                <Lock className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="At least 8 characters"
                  className={inputInnerClass}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-confirm-password" className="mb-1.5 block text-xs font-semibold text-zinc-400">
                Confirm password
              </label>
              <div className={cn(authGreenFieldClass, "cursor-text")}>
                <KeyRound className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
                <input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="Repeat password"
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

            {hasEventDraft ? (
              <p className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-zinc-400">
                After signup, check your email for verification. Once verified, log in and we will take you back to your event draft automatically.
              </p>
            ) : null}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-brand-green via-[#7dffc0] to-emerald-400 px-4 py-3.5 text-sm font-extrabold text-black shadow-[0_14px_40px_-14px_rgba(75,250,148,0.65)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating…" : "Create account"}
              </button>
              <p className="mt-2 text-center text-xs text-zinc-500">8+ characters. Same account for tickets and hosting.</p>
            </div>
          </motion.form>

          <div className="mt-12">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">Why join</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <ul className="mt-6 space-y-5">
              <li className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-green/25 bg-brand-green/[0.06]">
                  <Ticket className="h-4 w-4 text-brand-green" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">Sell tickets fast</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">Checkout, receipts, and entry in one flow.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-green/25 bg-brand-green/[0.06]">
                  <LayoutGrid className="h-4 w-4 text-brand-green" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">Host from one dashboard</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">Publish events, payouts, and door tools together.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-green/25 bg-brand-green/[0.06]">
                  <Shield className="h-4 w-4 text-brand-green" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">Built for trust</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">Verification and clear policies for your community.</p>
                </div>
              </li>
            </ul>
          </div>

          <p className="mt-10 text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link
              href={loginHref}
              className="font-bold text-white underline decoration-brand-green/50 underline-offset-4 transition hover:decoration-brand-green"
            >
              Log in
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-zinc-500">
            Prefer a magic link with your school email?{" "}
            <Link href={verifyEduHref} className="font-semibold text-brand-green underline-offset-2 hover:underline">
              Verify with .edu
            </Link>
            .
          </p>

          <p className="mt-4 text-center text-xs text-zinc-500">
            Questions?{" "}
            <Link href="/faq" className="font-semibold text-zinc-300 underline-offset-2 hover:text-white hover:underline">
              Read the FAQ
            </Link>
            .
          </p>

          <p className="mt-6 text-center text-xs leading-relaxed text-zinc-500">
            By continuing, you agree to our{" "}
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

export default function SignupPage() {
  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <SignupForm />
    </Suspense>
  );
}
