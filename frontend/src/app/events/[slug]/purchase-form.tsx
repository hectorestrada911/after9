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
    <form className="space-y-3" onSubmit={onSubmit}>
      <Input name="buyerName" placeholder="Full name" required />
      <Input name="buyerEmail" type="email" placeholder="Email" required />
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Quantity</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-12 w-12 rounded-xl border border-line text-black hover:border-black transition"
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            aria-label="Decrease"
          >
            <Minus size={16} className="mx-auto" />
          </button>
          <div className="h-12 min-w-14 rounded-xl border border-line bg-offwhite px-4 flex items-center justify-center text-base font-bold">
            {quantity}
          </div>
          <button
            type="button"
            className="h-12 w-12 rounded-xl border border-line text-black hover:border-black transition"
            onClick={() => setQuantity((prev) => Math.min(10, prev + 1))}
            aria-label="Increase"
          >
            <Plus size={16} className="mx-auto" />
          </button>
        </div>
      </div>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <p className="text-sm">
        Total: <span className="font-bold">${((price * quantity) / 100).toFixed(2)}</span>
      </p>
      <p className="text-xs text-muted leading-relaxed">
        Tickets delivered to your email with QR code and entry code.
      </p>
      <Button className="w-full" disabled={loading || soldOut}>
        {soldOut ? "Sold out" : loading ? "Redirecting…" : "Buy ticket"}
      </Button>
    </form>
  );
}
