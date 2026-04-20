"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Eye,
  MousePointerClick,
  ScanLine,
  Ticket,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

export function TestDesignLab() {
  const [title, setTitle] = useState("Sunset Pier Nights");
  const [venue, setVenue] = useState("Santa Monica Pier");
  const [date, setDate] = useState("May 16 · doors 9pm");
  const [price, setPrice] = useState("25");

  const sold = 184;
  const capacity = 300;
  const checkedIn = 71;
  const pct = Math.min(Math.round((sold / capacity) * 100), 100);
  const gross = 4600;
  const fees = 230;
  const net = gross - fees;
  const pendingPayout = 1820;
  const nextPayout = "Apr 22";
  const views = 8420;
  const checkoutStarted = 612;
  const paid = sold;

  const priceLabel = useMemo(() => {
    const parsed = Number(price);
    if (Number.isFinite(parsed) && parsed > 0) return `$${parsed.toFixed(0)}`;
    return "$25";
  }, [price]);

  return (
    <div className="grid gap-4">
      <section id="flyer-preview" className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">No-login design</p>
        <h2 className="mt-1 text-xl font-black text-white">Flyer studio</h2>
        <p className="mt-1 text-sm text-zinc-400">Adjust copy and see the flyer card update instantly.</p>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-2.5">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
              Event title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/12 bg-black/40 px-3 py-2 text-sm text-white outline-none"
              />
            </label>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
              Venue
              <input
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/12 bg-black/40 px-3 py-2 text-sm text-white outline-none"
              />
            </label>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
              Date / doors
              <input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/12 bg-black/40 px-3 py-2 text-sm text-white outline-none"
              />
            </label>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
              Ticket price
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/12 bg-black/40 px-3 py-2 text-sm text-white outline-none"
              />
            </label>
          </div>

          <article className="overflow-hidden rounded-2xl border border-white/12 bg-black/40">
            <div className="relative aspect-[16/10] border-b border-white/10 bg-[url('https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center">
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-300">Featured flyer</p>
                <p className="mt-1 text-2xl font-black text-white">{title || "Event title"}</p>
                <p className="mt-1 text-sm text-zinc-300">{date || "Date info"} · {venue || "Venue"}</p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-2.5">
                <p className="text-xs text-zinc-400">General admission</p>
                <p className="text-xl font-black text-white">{priceLabel}</p>
              </div>
              <button type="button" className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full bg-white text-[10px] font-bold uppercase tracking-[0.14em] text-black">
                Buy ticket
              </button>
            </div>
          </article>
        </div>
      </section>

      <section id="host-dashboard-preview" className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">No-login design</p>
        <h2 className="mt-1 text-xl font-black text-white">Host dashboard preview</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Spec layout: money clarity first, then movement, then door risk. This is static mock data until we wire Supabase.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-black/40 p-3">
            <p className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-zinc-500">
              <DollarSign className="h-3.5 w-3.5" aria-hidden /> Net sales
            </p>
            <p className="mt-1 text-2xl font-black text-white">${net.toLocaleString()}</p>
            <p className="mt-1 text-[11px] text-zinc-500">After fees · gross ${gross.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 p-3">
            <p className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-zinc-500">
              <Wallet className="h-3.5 w-3.5" aria-hidden /> Payout
            </p>
            <p className="mt-1 text-2xl font-black text-white">${pendingPayout.toLocaleString()}</p>
            <p className="mt-1 text-[11px] text-zinc-500">Next deposit {nextPayout}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 p-3">
            <p className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-zinc-500">
              <Ticket className="h-3.5 w-3.5" aria-hidden /> Tickets sold
            </p>
            <p className="mt-1 text-2xl font-black text-white">{sold}</p>
            <p className="mt-1 text-[11px] text-zinc-500">of {capacity} capacity</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 p-3">
            <p className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-zinc-500">
              <ScanLine className="h-3.5 w-3.5" aria-hidden /> Check-ins
            </p>
            <p className="mt-1 text-2xl font-black text-white">{checkedIn}</p>
            <p className="mt-1 text-[11px] text-zinc-500">{Math.round((checkedIn / Math.max(sold, 1)) * 100)}% of sold</p>
          </div>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/35 p-3 lg:col-span-2">
            <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden /> Sales progress
              </span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-brand-green" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-[11px] text-zinc-500">Hosts read this as “how close to sellout” at a glance.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/35 p-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">Fees snapshot</p>
            <div className="mt-2 space-y-1.5 text-sm">
              <div className="flex justify-between text-zinc-300">
                <span>Gross</span>
                <span className="font-semibold text-white">${gross.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="inline-flex items-center gap-1">
                  <ArrowDownRight className="h-3.5 w-3.5 text-zinc-500" aria-hidden /> Fees
                </span>
                <span className="font-semibold text-white">-${fees.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 text-zinc-200">
                <span className="font-semibold">Net</span>
                <span className="font-black text-brand-green">${net.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/35 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">Conversion funnel</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                <span className="inline-flex items-center gap-2 text-xs text-zinc-300">
                  <Eye className="h-3.5 w-3.5" aria-hidden /> Page views
                </span>
                <span className="text-sm font-bold text-white">{views.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                <span className="inline-flex items-center gap-2 text-xs text-zinc-300">
                  <MousePointerClick className="h-3.5 w-3.5" aria-hidden /> Checkout started
                </span>
                <span className="text-sm font-bold text-white">{checkoutStarted.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-brand-green/30 bg-brand-green/[0.08] px-3 py-2">
                <span className="inline-flex items-center gap-2 text-xs text-zinc-200">
                  <CreditCard className="h-3.5 w-3.5" aria-hidden /> Paid tickets
                </span>
                <span className="text-sm font-black text-brand-green">{paid}</span>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-zinc-500">Later: source breakdown (IG, link-in-bio, SMS blast).</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/35 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">Door scan feed</p>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-start justify-between gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                <span className="text-zinc-300">Valid scan</span>
                <span className="shrink-0 text-xs font-mono text-zinc-400">rage_8f2c_k19m</span>
              </li>
              <li className="flex items-start justify-between gap-2 rounded-lg border border-amber-400/25 bg-amber-400/[0.06] px-3 py-2">
                <span className="inline-flex items-center gap-1 text-amber-200">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> Duplicate
                </span>
                <span className="shrink-0 text-xs font-mono text-zinc-400">rage_7a91_q02x</span>
              </li>
              <li className="flex items-start justify-between gap-2 rounded-lg border border-brand-green/25 bg-brand-green/[0.06] px-3 py-2">
                <span className="inline-flex items-center gap-1 text-brand-green">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> VIP fast lane
                </span>
                <span className="shrink-0 text-xs font-mono text-zinc-400">rage_3c11_p88z</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-black/35 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">Recent orders</p>
            <button type="button" className="inline-flex items-center gap-1 self-start rounded-full border border-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-300">
              Export CSV <ArrowUpRight className="h-3 w-3" aria-hidden />
            </button>
          </div>
          <div className="mt-2 overflow-hidden rounded-lg border border-white/10">
            <div className="grid grid-cols-[1.2fr_1fr_0.6fr_0.7fr] gap-2 border-b border-white/10 bg-black/40 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
              <span>Buyer</span>
              <span>Email</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Total</span>
            </div>
            <div className="divide-y divide-white/10">
              {[
                { name: "Sienna Del Rey", email: "sienna@coastmail.com", qty: 2, total: 50 },
                { name: "Noah Kim", email: "noah.kim@mail.com", qty: 1, total: 25 },
                { name: "Maya Ortiz", email: "maya.o@mail.com", qty: 4, total: 100 },
              ].map((row) => (
                <div key={row.email} className="grid grid-cols-[1.2fr_1fr_0.6fr_0.7fr] gap-2 px-3 py-2 text-xs text-zinc-300">
                  <span className="font-semibold text-white">{row.name}</span>
                  <span className="truncate">{row.email}</span>
                  <span className="text-right font-semibold text-white">{row.qty}</span>
                  <span className="text-right font-semibold text-white">${row.total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="rounded-xl border border-white/10 bg-black/35 p-3">
            <p className="text-sm font-bold text-white">{title}</p>
            <p className="mt-0.5 text-xs text-zinc-400">{date} · {venue}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/35 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" aria-hidden /> Sienna Del Rey</p>
                <p className="text-xs text-zinc-400">sienna@coastmail.com</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-green/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-black">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> In
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
