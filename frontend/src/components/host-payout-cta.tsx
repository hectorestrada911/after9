"use client";

import { useEffect, useState } from "react";
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

  async function openPayoutSetup() {
    flushUi(() => {
      setLoading(true);
      setError(null);
      setErrorAction(null);
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
    </section>
  );
}
