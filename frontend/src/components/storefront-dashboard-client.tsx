"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type StorefrontMe = {
  connected: boolean;
  accountId: string | null;
  onboardingComplete: boolean;
  payoutsEnabled: boolean;
  storefrontPath?: string;
};

type StripePrice = {
  id: string;
  unit_amount: number | null;
  currency: string;
};

type StripeProduct = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  default_price?: StripePrice | string | null;
};

function formatMoney(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format((cents || 0) / 100);
}

export default function StorefrontDashboardClient() {
  const [me, setMe] = useState<StorefrontMe | null>(null);
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceInCents, setPriceInCents] = useState("1000");

  async function loadAll() {
    setLoading(true);
    setError(null);
    const [meRes, productsRes] = await Promise.all([
      fetch("/api/host/storefront/me", { cache: "no-store" }),
      fetch("/api/host/storefront/products", { cache: "no-store" }),
    ]);

    const meJson = (await meRes.json().catch(() => null)) as StorefrontMe | { error?: string } | null;
    const productsJson = (await productsRes.json().catch(() => null)) as { products?: StripeProduct[]; error?: string } | null;

    if (!meRes.ok) {
      setError((meJson as { error?: string } | null)?.error ?? "Could not load storefront status.");
      setLoading(false);
      return;
    }

    setMe(meJson as StorefrontMe);
    if (productsRes.ok) {
      setProducts(productsJson?.products ?? []);
    } else if (productsJson?.error) {
      setError(productsJson.error);
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadAll();
  }, []);

  const storefrontHref = useMemo(() => (me?.storefrontPath ? me.storefrontPath : me?.accountId ? `/storefront/${me.accountId}` : null), [me]);

  async function createProduct(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      name,
      description,
      priceInCents: Number.parseInt(priceInCents, 10),
      currency: "usd",
    };

    const res = await fetch("/api/host/storefront/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json().catch(() => null)) as { error?: string } | null;

    setSubmitting(false);
    if (!res.ok) {
      setError(json?.error ?? "Could not create product.");
      return;
    }

    setName("");
    setDescription("");
    setPriceInCents("1000");
    await loadAll();
  }

  if (loading) {
    return <p className="text-sm text-zinc-400">Loading storefront tools…</p>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/[0.1] bg-zinc-950/60 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Connected account</p>
        <p className="mt-2 text-sm text-zinc-300">{me?.accountId ?? "No connected account yet"}</p>
        <p className="mt-1 text-xs text-zinc-500">
          {me?.onboardingComplete ? "Onboarding complete." : "Finish payouts onboarding first to collect payments to your storefront."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/dashboard#host-payouts" className="inline-flex h-10 items-center rounded-full border border-white/20 bg-white/[0.06] px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/45 hover:bg-white/10">
            Open payouts setup
          </Link>
          {storefrontHref ? (
            <Link href={storefrontHref} target="_blank" className="inline-flex h-10 items-center rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-4 text-xs font-bold uppercase tracking-wide text-black transition hover:brightness-110">
              Open storefront
            </Link>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.1] bg-zinc-950/60 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Create product</p>
        <form className="mt-3 grid gap-3 sm:grid-cols-2" onSubmit={createProduct}>
          <input className="min-h-11 rounded-xl border border-white/15 bg-white/[0.04] px-3 text-sm text-white outline-none" placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="min-h-11 rounded-xl border border-white/15 bg-white/[0.04] px-3 text-sm text-white outline-none" placeholder="Price in cents (e.g. 1500)" type="number" min={50} value={priceInCents} onChange={(e) => setPriceInCents(e.target.value)} required />
          <textarea className="sm:col-span-2 min-h-24 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="sm:col-span-2">
            <button disabled={submitting} className="inline-flex h-10 items-center rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-4 text-xs font-bold uppercase tracking-wide text-black transition hover:brightness-110 disabled:opacity-60">
              {submitting ? "Creating…" : "Create product"}
            </button>
          </div>
        </form>
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
      </section>

      <section className="rounded-2xl border border-white/[0.1] bg-zinc-950/60 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Your products</p>
        {products.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-400">No products yet. Create your first one above.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {products.map((p) => {
              const price = typeof p.default_price === "object" && p.default_price ? p.default_price : null;
              return (
                <li key={p.id} className="rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3">
                  <p className="font-semibold text-white">{p.name}</p>
                  {p.description ? <p className="mt-1 text-sm text-zinc-400">{p.description}</p> : null}
                  <p className="mt-2 text-xs text-zinc-500">{price ? formatMoney(price.unit_amount ?? 0, price.currency) : "No default price"}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
