"use client";

import { useEffect, useState } from "react";
import EmbeddedStripeOnboarding from "@/components/embedded-stripe-onboarding";
import { flushUi } from "@/lib/flush-ui";

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
    <section className="mb-8 rounded-2xl border border-white/[0.1] bg-zinc-950/60 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Host payouts</p>
          <p className="mt-1 text-sm text-zinc-300">
            {ready ? "Withdraw your funds from Stripe dashboard." : "Set up Stripe Connect once to unlock withdrawals."}
          </p>
          {!ready ? (
            <p className="mt-1 text-xs text-zinc-500">
              One-time setup: Stripe verifies identity and payout details so we can send earnings securely.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={openPayoutSetup}
            className="inline-flex h-10 items-center rounded-full border border-white/20 bg-white/[0.06] px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/45 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Opening..." : ready ? "Payout settings" : "Set up payouts"}
          </button>
          <button
            type="button"
            disabled={loading || !ready}
            onClick={withdrawNow}
            className="inline-flex h-10 items-center rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-4 text-xs font-bold uppercase tracking-wide text-black shadow-[0_0_22px_-12px_rgba(75,250,148,0.7)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Withdraw
          </button>
        </div>
      </div>
      {error ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className="text-xs font-medium text-red-400">{error}</p>
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
        <div className="fixed inset-0 z-[70] flex items-end bg-black/80 p-3 sm:items-center sm:justify-center sm:p-6">
          <div className="w-full max-w-3xl rounded-2xl border border-white/15 bg-zinc-950 p-5 shadow-[0_20px_80px_-30px_rgba(0,0,0,0.8)] sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Payout setup</p>
                <h3 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">
                  Complete your payout onboarding in about 5 minutes
                </h3>
                <p className="mt-2 text-sm text-zinc-300">
                  This one-time Stripe Connect flow verifies identity and payout details so we can send your ticket earnings securely and legally.
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

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-green">1. Verify identity</p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                  Enter legal name, date of birth, address, and last 4 of SSN.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-green">2. Upload ID</p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                  Stripe may ask for a government-issued ID to complete verification.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-green">3. Add payout method</p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                  Connect your bank account so available funds can be withdrawn.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
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
                className="inline-flex h-10 items-center rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-4 text-xs font-bold uppercase tracking-wide text-black transition hover:brightness-110 disabled:opacity-60"
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
