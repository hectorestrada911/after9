"use client";

import { useEffect, useRef, useState } from "react";
import { loadConnectAndInitialize } from "@stripe/connect-js";

type Props = {
  onClose: () => void;
};

export default function EmbeddedStripeOnboarding({ onClose }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let cleanup: (() => void) | undefined;

    async function init() {
      try {
        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (!publishableKey) {
          throw new Error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
        }

        const connect = loadConnectAndInitialize({
          publishableKey,
          fetchClientSecret: async () => {
            const res = await fetch("/api/host/payout/account-session", { method: "POST" });
            const json = (await res.json().catch(() => null)) as { clientSecret?: string; error?: string } | null;
            if (!res.ok || !json?.clientSecret) {
              throw new Error(json?.error ?? "Could not start Stripe onboarding.");
            }
            return json.clientSecret;
          },
        });

        const onboarding = connect.create("account-onboarding");
        if (mounted && containerRef.current) {
          containerRef.current.innerHTML = "";
          containerRef.current.appendChild(onboarding as unknown as Node);
          setLoading(false);
        }

        cleanup = () => {
          onboarding.remove();
        };
      } catch (err) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : "Could not load embedded onboarding.";
        setError(message);
        setLoading(false);
      }
    }

    void init();

    return () => {
      mounted = false;
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[90] flex items-end bg-black/85 p-2 sm:items-center sm:justify-center sm:p-6">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 shadow-[0_40px_120px_-45px_rgba(0,0,0,0.9)]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Stripe Connect</p>
            <p className="text-sm font-semibold text-white">Secure payout onboarding</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-zinc-300 transition hover:border-white/45 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto bg-white">
          {loading ? (
            <div className="px-4 py-8 text-sm text-zinc-700">Loading onboarding...</div>
          ) : error ? (
            <div className="space-y-4 px-4 py-8 text-sm text-zinc-700">
              <p className="font-semibold text-red-600">{error}</p>
              <p>If embedded onboarding is unavailable, use the hosted Stripe flow instead.</p>
              <a
                href="/account"
                className="inline-flex h-10 items-center rounded-full bg-zinc-900 px-4 text-xs font-bold uppercase tracking-wide text-white"
              >
                Back to account
              </a>
            </div>
          ) : (
            <div ref={containerRef} className="min-h-[620px]" />
          )}
        </div>
      </div>
    </div>
  );
}
