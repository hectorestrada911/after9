"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowUpRight, CheckCircle2, Wallet } from "lucide-react";
import EmbeddedStripeOnboarding from "@/components/embedded-stripe-onboarding";
import { flushUi } from "@/lib/flush-ui";
import { cn } from "@/lib/utils";

type PayoutStatus = {
  hasAccount: boolean;
  onboarded: boolean;
  payoutsEnabled: boolean;
};

type PayoutActionError = {
  error?: string;
  actionUrl?: string;
  actionLabel?: string;
};

export default function HostPayoutCta() {
  const [status, setStatus] = useState<PayoutStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorAction, setErrorAction] = useState<{ url: string; label: string } | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showEmbeddedModal, setShowEmbeddedModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const res = await fetch("/api/host/payout/status", { cache: "no-store" });
      if (!res.ok || !mounted) return;
      const json = (await res.json()) as PayoutStatus;
      setStatus(json);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function beginPayoutSetup() {
    flushUi(() => {
      setLoading(true);
      setError(null);
      setErrorAction(null);
      setShowSetupModal(false);
    });
    const res = await fetch("/api/host/payout/onboard", { method: "POST" });
    const json = (await res.json().catch(() => null)) as ({ url?: string } & PayoutActionError) | null;
    setLoading(false);
    if (!res.ok || !json?.url) {
      setError(json?.error ?? "Could not start payout setup.");
      if (json?.actionUrl) {
        setErrorAction({ url: json.actionUrl, label: json.actionLabel ?? "Open fix" });
      }
      return;
    }
    window.location.href = json.url;
  }

  async function openPayoutSetup() {
    if (!ready) {
      setShowSetupModal(true);
      return;
    }
    await beginPayoutSetup();
  }

  async function launchEmbeddedOnboarding() {
    const hasPublishable = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    if (!hasPublishable) {
      await beginPayoutSetup();
      return;
    }
    setShowSetupModal(false);
    setShowEmbeddedModal(true);
  }

  async function withdrawNow() {
    flushUi(() => {
      setLoading(true);
      setError(null);
      setErrorAction(null);
    });
    const res = await fetch("/api/host/payout/withdraw", { method: "POST" });
    const json = (await res.json().catch(() => null)) as ({ url?: string } & PayoutActionError) | null;
    setLoading(false);
    if (!res.ok || !json?.url) {
      setError(json?.error ?? "Could not open withdrawals.");
      if (json?.actionUrl) {
        setErrorAction({ url: json.actionUrl, label: json.actionLabel ?? "Open fix" });
      }
      return;
    }
    window.location.href = json.url;
  }

  const ready = Boolean(status?.onboarded && status?.payoutsEnabled);

  return (
    <section
      id="host-payouts"
      className={cn(
        "mb-6 scroll-mt-28 overflow-hidden rounded-3xl border bg-gradient-to-br shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
        ready
          ? "border-brand-green/20 from-brand-green/[0.08] via-white/[0.02] to-transparent"
          : "border-white/[0.08] from-white/[0.04] via-white/[0.02] to-transparent",
      )}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3 sm:items-center">
          <span
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl border shadow-[0_0_20px_-10px_rgba(75,250,148,0.6)]",
              ready
                ? "border-brand-green/35 bg-brand-green/[0.1] text-brand-green"
                : "border-white/15 bg-white/[0.04] text-zinc-300",
            )}
          >
            <Wallet className="h-4 w-4" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className={cn("text-[10px] font-bold uppercase tracking-[0.18em]", ready ? "text-brand-green/80" : "text-zinc-500")}>
                Host payouts
              </p>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  ready
                    ? "border-brand-green/35 bg-brand-green/10 text-brand-green"
                    : "border-amber-400/30 bg-amber-400/10 text-amber-200",
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", ready ? "bg-brand-green" : "bg-amber-300")} />
                {ready ? "Ready" : status === null ? "Checking…" : "Action needed"}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-200">
              {ready ? "Withdraw your earnings to your linked bank — usually arrives in 1–2 business days." : "Set up Stripe Connect once to unlock withdrawals."}
            </p>
            {!ready ? (
              <p className="mt-1 text-xs text-zinc-500">
                One-time setup: Stripe verifies identity and payout details so we can send earnings securely.
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:shrink-0">
          <button
            type="button"
            disabled={loading}
            onClick={openPayoutSetup}
            className="inline-flex h-10 items-center rounded-full border border-white/15 bg-white/[0.04] px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition hover:border-white/35 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Opening…" : ready ? "Payout settings" : "Set up payouts"}
          </button>
          <button
            type="button"
            disabled={loading || !ready}
            onClick={withdrawNow}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-4 text-[11px] font-extrabold uppercase tracking-[0.12em] text-black shadow-[0_0_22px_-12px_rgba(75,250,148,0.7)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Withdraw <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
          </button>
        </div>
      </div>

      {ready ? (
        <div className="flex items-center gap-2 border-t border-white/[0.06] bg-black/20 px-5 py-3 text-[11px] text-zinc-400 sm:px-6">
          <CheckCircle2 className="h-3.5 w-3.5 text-brand-green" strokeWidth={2} aria-hidden />
          Stripe Connect verified. Earnings transfer securely to your linked account.
        </div>
      ) : null}

      {error ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-red-500/15 bg-red-500/[0.06] px-5 py-3 text-xs sm:px-6">
          <AlertTriangle className="h-3.5 w-3.5 text-red-400" strokeWidth={2} aria-hidden />
          <p className="font-medium text-red-300">{error}</p>
          {errorAction ? (
            <a
              href={errorAction.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-7 items-center rounded-full border border-red-300/40 px-2.5 text-[10px] font-bold uppercase tracking-wide text-red-200 transition hover:border-red-200/80 hover:text-red-100"
            >
              {errorAction.label}
            </a>
          ) : null}
        </div>
      ) : null}

      {showSetupModal ? (
        <div className="fixed inset-0 z-[70] flex items-end bg-black/85 p-2 backdrop-blur-[1px] sm:items-center sm:justify-center sm:p-6">
          <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-zinc-950 shadow-[0_35px_120px_-45px_rgba(0,0,0,0.95)]">
            <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(75,250,148,0.18),transparent_42%),linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent)] px-5 py-4 sm:px-7 sm:py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-brand-green/30 bg-brand-green/10 px-2.5 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-green">Payout setup</p>
                  </div>
                  <h3 className="mt-2 text-xl font-black tracking-tight text-white sm:text-3xl">Get paid in about 5 minutes</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-300">
                    We use Stripe Connect to verify identity and payout details one time, so your earnings can be transferred securely and in compliance with payment rules.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSetupModal(false)}
                  className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-zinc-300 transition hover:border-white/45 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-[1.2fr,0.8fr] sm:p-7">
              <div className="space-y-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-brand-green">1. Verify identity</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">Legal name, date of birth, address, and last 4 of SSN.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-brand-green">2. Upload ID</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">A government-issued ID may be requested for verification.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-brand-green">3. Add payout method</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">Connect your bank account to withdraw available balances.</p>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-black/35 p-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">Before you start</p>
                  <ul className="mt-2 space-y-2 text-sm text-zinc-300">
                    <li className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                      Use your legal info exactly as shown on your ID.
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                      Keep a photo ID handy for faster completion.
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                      You can finish now and withdraw right after approval.
                    </li>
                  </ul>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-zinc-500">Secure flow by Stripe. We do not store your SSN or ID documents.</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 bg-black/30 px-5 py-4 sm:px-7">
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="inline-flex h-10 items-center rounded-full border border-white/20 bg-white/[0.06] px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/45 hover:bg-white/10"
              >
                Do this later
              </button>
              <button
                type="button"
                onClick={() => void launchEmbeddedOnboarding()}
                disabled={loading}
                className="inline-flex h-10 items-center rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-5 text-xs font-bold uppercase tracking-wide text-black transition hover:brightness-110 disabled:opacity-60"
              >
                {loading ? "Opening..." : "Start onboarding"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showEmbeddedModal ? <EmbeddedStripeOnboarding onClose={() => setShowEmbeddedModal(false)} /> : null}
    </section>
  );
}
