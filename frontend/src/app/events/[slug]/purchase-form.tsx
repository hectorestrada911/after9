"use client";

import { FormEvent, useState } from "react";
import { Button, Input } from "@/components/ui";

export default function PurchaseForm({
  eventId,
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
      quantity: Number(form.get("quantity")),
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
      <Input name="quantity" type="number" defaultValue={1} min={1} max={10} required />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-slate-500">Tickets are delivered to email with QR and entry code.</p>
      <Button className="w-full" disabled={loading || soldOut}>{soldOut ? "Sold out" : loading ? "Redirecting..." : "Buy ticket"}</Button>
    </form>
  );
}
