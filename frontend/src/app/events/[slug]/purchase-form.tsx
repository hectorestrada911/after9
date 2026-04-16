"use client";

import { FormEvent, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button, Input } from "@/components/ui";

export default function PurchaseForm({
  eventId,
  price,
  title,
  slug,
  soldOut,
}: {
  eventId: string;
  price: number;
  title: string;
  slug: string;
  soldOut: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const body = {
      eventId,
      title,
      slug,
      buyerName: String(form.get("buyerName")),
      buyerEmail: String(form.get("buyerEmail")),
      quantity,
    };
    const res = await fetch("/api/checkout/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) return setError(json.error || "Checkout failed");
    window.location.href = json.url;
  }

  return (
    <form className="space-y-2" onSubmit={onSubmit}>
      <Input name="buyerName" placeholder="Full name" required />
      <Input name="buyerEmail" type="email" placeholder="Email" required />
      <div>
        <p className="mb-1 text-xs text-slate-400">Quantity</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-700 p-2 text-slate-200 hover:bg-slate-800"
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
          >
            <Minus size={14} />
          </button>
          <div className="min-w-10 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-center text-sm font-semibold text-slate-100">{quantity}</div>
          <button
            type="button"
            className="rounded-lg border border-slate-700 p-2 text-slate-200 hover:bg-slate-800"
            onClick={() => setQuantity((prev) => Math.min(10, prev + 1))}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-slate-400">Total due now: <span className="font-semibold text-slate-100">${((price * quantity) / 100).toFixed(2)}</span></p>
      <p className="text-xs text-slate-500">Tickets are delivered to email with QR and entry code. Fast entry lane for pre-paid guests.</p>
      <Button className="w-full" disabled={loading || soldOut}>{soldOut ? "Sold out" : loading ? "Redirecting..." : "Buy ticket"}</Button>
    </form>
  );
}
