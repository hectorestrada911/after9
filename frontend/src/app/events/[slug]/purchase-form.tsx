"use client";

import { FormEvent, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function PurchaseForm({
  eventId,
  price,
  title,
  slug,
  soldOut,
  theme = "light",
}: {
  eventId: string;
  price: number;
  title: string;
  slug: string;
  soldOut: boolean;
  theme?: "light" | "dark";
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerEmailConfirm, setBuyerEmailConfirm] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const normalizedEmail = buyerEmail.trim().toLowerCase();
    const normalizedConfirm = buyerEmailConfirm.trim().toLowerCase();
    if (!normalizedEmail || normalizedEmail !== normalizedConfirm) {
      setError("Emails must match so we can deliver and recover your ticket.");
      return;
    }
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const body = {
      eventId,
      title,
      slug,
      buyerName: String(form.get("buyerName")),
      buyerEmail: normalizedEmail,
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

  const fieldLight =
    "min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-black placeholder:text-zinc-500 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10";
  const fieldDark =
    "min-h-12 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-base text-white placeholder:text-zinc-500 focus:border-brand-green/45 focus:outline-none focus:ring-2 focus:ring-brand-green/20";
  const fieldClass = theme === "dark" ? fieldDark : fieldLight;

  return (
    <form className={cn("space-y-4", theme === "dark" ? "text-zinc-100" : "text-zinc-950")} onSubmit={onSubmit}>
      <Input name="buyerName" placeholder="Full name" required className={fieldClass} />
      <Input
        name="buyerEmail"
        type="email"
        placeholder="Email"
        required
        className={fieldClass}
        value={buyerEmail}
        onChange={(e) => setBuyerEmail(e.target.value)}
      />
      <Input
        name="buyerEmailConfirm"
        type="email"
        placeholder="Confirm email"
        required
        className={fieldClass}
        value={buyerEmailConfirm}
        onChange={(e) => setBuyerEmailConfirm(e.target.value)}
      />
      <div>
        <p className={cn("mb-2 text-xs font-bold uppercase tracking-[0.14em]", theme === "dark" ? "text-zinc-500" : "text-zinc-600")}>
          Quantity
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl border transition",
              theme === "dark"
                ? "border-white/15 bg-white/[0.06] text-white hover:border-white/30 hover:bg-white/10"
                : "border-zinc-300 bg-white text-black hover:border-black hover:bg-zinc-50",
            )}
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            aria-label="Decrease"
          >
            <Minus size={16} className="mx-auto" />
          </button>
          <div
            className={cn(
              "flex h-12 min-w-14 items-center justify-center rounded-xl border px-4 text-base font-bold",
              theme === "dark" ? "border-white/15 bg-black/30 text-white" : "border-zinc-300 bg-zinc-50 text-black",
            )}
          >
            {quantity}
          </div>
          <button
            type="button"
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl border transition",
              theme === "dark"
                ? "border-white/15 bg-white/[0.06] text-white hover:border-white/30 hover:bg-white/10"
                : "border-zinc-300 bg-white text-black hover:border-black hover:bg-zinc-50",
            )}
            onClick={() => setQuantity((prev) => Math.min(10, prev + 1))}
            aria-label="Increase"
          >
            <Plus size={16} className="mx-auto" />
          </button>
        </div>
      </div>
      {error && <p className="text-sm font-semibold text-red-400">{error}</p>}
      <p className={cn("text-sm", theme === "dark" ? "text-zinc-400" : "text-zinc-800")}>
        Total:{" "}
        <span className={cn("font-black", theme === "dark" ? "text-white" : "text-black")}>${((price * quantity) / 100).toFixed(2)}</span>
      </p>
      <p className={cn("text-xs leading-relaxed", theme === "dark" ? "text-zinc-500" : "text-zinc-600")}>
        Tickets are sent to this email. Use the same email later in My tickets to recover access.
      </p>
      <p className={cn("text-xs leading-relaxed", theme === "dark" ? "text-zinc-500" : "text-zinc-600")}>
        Buying multiple tickets creates one unique QR code per ticket.
      </p>
      <Button
        className="w-full bg-gradient-to-r from-[#4BFA94] to-emerald-300 text-sm font-black uppercase tracking-wide text-black shadow-[0_12px_40px_-12px_rgba(75,250,148,0.55)] hover:brightness-105 disabled:opacity-50"
        disabled={loading || soldOut}
      >
        {soldOut ? "Sold out" : loading ? "Redirecting…" : "Get tickets"}
      </Button>
    </form>
  );
}
