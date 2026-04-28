"use client";

import { useState } from "react";

type StripePrice = {
  id: string;
  unit_amount: number | null;
  currency: string;
};

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  defaultPrice: StripePrice | null;
};

function formatMoney(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format((cents || 0) / 100);
}

export default function StorefrontPublicClient({ accountId, products }: { accountId: string; products: ProductRow[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buyNow(product: ProductRow) {
    if (!product.defaultPrice) {
      setError("This product is missing a default price.");
      return;
    }

    setLoadingId(product.id);
    setError(null);

    const res = await fetch("/api/storefront/checkout-session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        accountId,
        priceId: product.defaultPrice.id,
        productName: product.name,
        quantity: 1,
      }),
    });
    const json = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;

    setLoadingId(null);
    if (!res.ok || !json?.url) {
      setError(json?.error ?? "Could not start checkout.");
      return;
    }
    window.location.href = json.url;
  }

  return (
    <main className="container-page py-10 sm:py-14">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Storefront</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Shop this host</h1>
      <p className="mt-2 text-sm text-zinc-400">Connected account: {accountId}</p>
      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

      {products.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-white/[0.1] bg-zinc-950/60 p-6 text-sm text-zinc-400">No active products yet.</div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.id} className="rounded-2xl border border-white/[0.1] bg-zinc-950/60 p-5">
              <p className="text-lg font-black tracking-tight text-white">{product.name}</p>
              {product.description ? <p className="mt-2 text-sm text-zinc-400">{product.description}</p> : null}
              <p className="mt-4 text-sm font-semibold text-brand-green">
                {product.defaultPrice ? formatMoney(product.defaultPrice.unit_amount ?? 0, product.defaultPrice.currency) : "No price"}
              </p>
              <button
                onClick={() => void buyNow(product)}
                disabled={loadingId === product.id || !product.defaultPrice}
                className="mt-4 inline-flex h-10 items-center rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-4 text-xs font-bold uppercase tracking-wide text-black transition hover:brightness-110 disabled:opacity-60"
              >
                {loadingId === product.id ? "Opening..." : "Buy now"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
