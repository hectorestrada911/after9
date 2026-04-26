"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { KeyRound, LayoutGrid, ShieldCheck, Sparkles, Ticket } from "lucide-react";
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

function SignupForm() {
  const { reduceMotion, panelTransition } = useAuthMotion();
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const next = safeNextPath(nextParam);
  const hasEventDraft = Boolean(readEventDraft());
  const hostIntent = next.startsWith("/dashboard") || hasEventDraft;
  const hostNext = next.startsWith("/dashboard") ? next : "/dashboard/events/new";
  const urlError = mapAuthCallbackError(searchParams.get("error"));

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <main className="container-page relative min-h-[100dvh] min-w-0 overflow-hidden py-16 sm:py-24">
      <AuthAmbient variant="signup" />
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
            Get started
          </motion.p>
          <motion.h1 variants={authHeroItem} className="mt-4 heading-display-fluid">
            <span className="block text-zinc-50">Create</span>
            <span className="mt-1 block bg-gradient-to-r from-brand-green via-emerald-200 to-teal-200 bg-clip-text text-transparent">account</span>
          </motion.h1>
          <motion.p variants={authHeroItem} className="mt-4 text-base leading-relaxed text-zinc-400">
            Launch trusted event pages and monetize your community without juggling five tools.
          </motion.p>
          {hasEventDraft ? (
            <motion.p
              variants={authHeroItem}
              className="mt-3 rounded-xl border border-brand-green/30 bg-brand-green/[0.12] px-3 py-2.5 text-sm leading-snug text-zinc-100 shadow-[0_0_0_1px_rgba(75,250,148,0.12)_inset]"
            >
              Draft found. After signup, we will return you to publish that event.
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
              { label: "One login" as const, Icon: KeyRound },
              { label: "My tickets" as const, Icon: Ticket },
              { label: "Host tools" as const, Icon: LayoutGrid },
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
              placeholder="Password (8+ characters)"
              autoComplete="new-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              dir="ltr"
              className={cn(authFieldClass, "text-left [unicode-bidi:plaintext]")}
              required
            />
            <Input
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              autoComplete="new-password"
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
            <AuthPrimaryButton type="submit" loading={loading} disabled={loading}>
              {loading ? "Creating…" : "Sign up"}
            </AuthPrimaryButton>
          </motion.form>
        </AuthFormPanel>
        <p className="mt-6 text-sm text-zinc-400">
          Already have an account?{" "}
          <Link
            className="font-bold text-zinc-100 underline decoration-brand-green/50 underline-offset-4 transition hover:text-white hover:decoration-brand-green"
            href={loginHref}
          >
            Log in
          </Link>
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-zinc-500">
          <Sparkles className="h-3.5 w-3.5 text-brand-green/80" aria-hidden />
          One account unlocks buyer tickets and host tools.
        </p>
        <p className="mt-3 text-xs leading-relaxed text-zinc-500">
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
      </AuthGradientFrame>
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
