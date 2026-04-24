"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { motion, useReducedMotion, type Transition, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

export const authEase = [0.22, 1, 0.36, 1] as const;

export const authFieldClass =
  "h-12 rounded-xl border border-white/[0.12] bg-white/[0.05] px-4 text-[15px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] placeholder:text-zinc-500 transition-[border-color,box-shadow] duration-200 focus:border-brand-green/50 focus:outline-none focus:ring-2 focus:ring-brand-green/20";

export const badgeContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

export const badgeItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: authEase } },
};

export const authHeroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
};

export const authHeroItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: authEase } },
};

export function useAuthMotion() {
  const reduceMotion = useReducedMotion();
  const panelTransition: Transition = reduceMotion ? { duration: 0 } : { duration: 0.26, ease: authEase };
  const tabSpring = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 460, damping: 36 };
  return { reduceMotion, panelTransition, tabSpring };
}

export function AuthAmbient({ variant }: { variant: "login" | "signup" }) {
  const reduceMotion = useReducedMotion();
  const isSignup = variant === "signup";

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: isSignup
            ? "radial-gradient(ellipse 90% 55% at 8% -5%, rgba(75,250,148,0.2), transparent 52%), radial-gradient(circle at 92% 8%, rgba(255,255,255,0.1), transparent 38%), #030303"
            : "radial-gradient(ellipse 90% 55% at 92% -5%, rgba(75,250,148,0.17), transparent 52%), radial-gradient(circle at 12% 12%, rgba(255,255,255,0.08), transparent 40%), #030303",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)] opacity-[0.55]"
      />
      {!reduceMotion ? (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -left-[18%] top-[18%] -z-10 h-[min(52vw,400px)] w-[min(52vw,400px)] rounded-full bg-brand-green/22 blur-[110px]"
            animate={{ x: [0, 36, 0], y: [0, -22, 0], scale: [1, 1.06, 1] }}
            transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-[12%] bottom-[12%] -z-10 h-[min(44vw,320px)] w-[min(44vw,320px)] rounded-full bg-emerald-400/16 blur-[95px]"
            animate={{ x: [0, -30, 0], y: [0, 20, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 23, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
          />
        </>
      ) : null}
    </>
  );
}

export function AuthGradientFrame({
  reduceMotion,
  children,
}: {
  reduceMotion: boolean | null;
  children: ReactNode;
}) {
  return (
    <div className="group relative mx-auto max-w-md min-w-0">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-[1.65rem] bg-gradient-to-br from-white/18 via-brand-green/28 to-white/[0.06] opacity-70 transition duration-500 group-hover:opacity-100"
      />
      <motion.div
        layout={false}
        initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.48, ease: authEase }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-b from-zinc-900/96 via-zinc-950/98 to-black p-5 shadow-[0_40px_120px_-50px_rgba(75,250,148,0.42),0_0_1px_rgba(255,255,255,0.06)_inset] backdrop-blur-xl sm:p-7"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,rgba(75,250,148,0.18),transparent_52%)]"
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.045),transparent_32%)]" />
        <div className="relative">{children}</div>
      </motion.div>
    </div>
  );
}

export type AuthMode = "password" | "magic";

export type AuthModeTabsProps = {
  mode: AuthMode;
  /** Called when the user switches auth method. */
  // eslint-disable-next-line no-unused-vars -- type-only parameter name for documentation
  onModeChange: (nextMode: AuthMode) => void;
  tabSpring: Transition;
};

export function AuthModeTabs({ mode, onModeChange, tabSpring }: AuthModeTabsProps) {
  return (
    <div className="relative mt-5 flex rounded-full border border-white/[0.12] bg-black/60 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <motion.div
        aria-hidden
        className="absolute bottom-1 top-1 rounded-full bg-white shadow-[0_2px_14px_-4px_rgba(0,0,0,0.45)]"
        initial={false}
        animate={{
          left: mode === "password" ? 4 : "50%",
          width: "calc(50% - 4px)",
        }}
        transition={tabSpring}
      />
      <button
        type="button"
        aria-pressed={mode === "password"}
        className={cn(
          "relative z-10 flex-1 rounded-full py-2.5 text-[11px] font-bold uppercase tracking-wide transition-colors duration-200",
          mode === "password" ? "text-black" : "text-zinc-500 hover:text-zinc-200",
        )}
        onClick={() => onModeChange("password")}
      >
        Password
      </button>
      <button
        type="button"
        aria-pressed={mode === "magic"}
        className={cn(
          "relative z-10 flex-1 rounded-full py-2.5 text-[11px] font-bold uppercase tracking-wide transition-colors duration-200",
          mode === "magic" ? "text-black" : "text-zinc-500 hover:text-zinc-200",
        )}
        onClick={() => onModeChange("magic")}
      >
        Email link
      </button>
    </div>
  );
}

export function AuthPrimaryButton({
  loading,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="w-full"
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      transition={{ type: "spring", stiffness: 520, damping: 38 }}
    >
      <Button
        className={cn(
          "relative w-full overflow-hidden border border-white/10 bg-gradient-to-r from-brand-green to-emerald-300 text-black shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_14px_44px_-20px_rgba(75,250,148,0.65)] transition-[filter,transform] hover:brightness-[1.06] active:brightness-[0.98]",
          className,
        )}
        {...props}
      >
        {loading && !reduceMotion ? (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-2/5 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/35 to-transparent"
            initial={{ x: "-120%" }}
            animate={{ x: "420%" }}
            transition={{ repeat: Infinity, duration: 1.15, ease: "linear" }}
          />
        ) : null}
        <span className="relative z-10 inline-flex items-center justify-center gap-2">{children}</span>
      </Button>
    </motion.div>
  );
}

export function AuthFormPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "mt-6 rounded-2xl border border-white/[0.08] bg-zinc-950/35 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm sm:p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function GoogleAuthButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="w-full"
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      transition={{ type: "spring", stiffness: 520, damping: 38 }}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-white/[0.12] bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg viewBox="0 0 48 48" className="h-4 w-4 shrink-0" aria-hidden>
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
        Continue with Google
      </button>
    </motion.div>
  );
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-white/[0.08]" />
      <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">or</span>
      <div className="h-px flex-1 bg-white/[0.08]" />
    </div>
  );
}

export function AuthPageSkeleton() {
  return (
    <main className="container-page relative min-h-[70vh] min-w-0 overflow-hidden py-16 sm:py-24">
      <AuthAmbient variant="login" />
      <div className="relative mx-auto max-w-md space-y-5 animate-pulse">
        <div className="h-2 w-24 rounded-full bg-white/10" />
        <div className="h-6 w-28 rounded-full bg-white/10" />
        <div className="h-14 w-full max-w-[280px] rounded-xl bg-white/10" />
        <div className="h-4 w-full rounded-lg bg-white/[0.07]" />
        <div className="h-4 w-[82%] rounded-lg bg-white/[0.06]" />
        <div className="h-12 w-full rounded-full bg-white/[0.08]" />
        <div className="h-40 w-full rounded-2xl bg-white/[0.06]" />
      </div>
    </main>
  );
}
