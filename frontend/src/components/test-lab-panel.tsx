"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Camera, QrCode, Ticket } from "lucide-react";

export function TestLabPanel() {
  const [eventId, setEventId] = useState("");
  const [ticketCode, setTicketCode] = useState("rage_8f2c_k19m");
  const payload = useMemo(() => `ticket:${ticketCode.trim() || "rage_8f2c_k19m"}`, [ticketCode]);
  const qrUrl = useMemo(
    () => `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(payload)}`,
    [payload],
  );
  const scannerHref = eventId.trim() ? `/dashboard/events/${eventId.trim()}/check-in` : "/dashboard";

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/demo" className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition hover:bg-white/[0.05]">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Flow preview</p>
          <p className="mt-1 text-lg font-black text-white">Guest demo</p>
          <p className="mt-1 text-sm text-zinc-400">Flyer, payment, ticket, and scan states.</p>
        </Link>
        <a href="#host-dashboard-preview" className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition hover:bg-white/[0.05]">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">No-login preview</p>
          <p className="mt-1 text-lg font-black text-white">Host dashboard design</p>
          <p className="mt-1 text-sm text-zinc-400">Iterate cards, layout, and attendee rows before auth.</p>
        </a>
        <a href="#flyer-preview" className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition hover:bg-white/[0.05] sm:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">No-login preview</p>
          <p className="mt-1 text-lg font-black text-white">Flyer design studio</p>
          <p className="mt-1 text-sm text-zinc-400">Edit event copy and check how the ticket card feels instantly.</p>
        </a>
        <Link href="/dashboard" className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition hover:bg-white/[0.05] sm:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Authenticated app</p>
          <p className="mt-1 text-lg font-black text-white">Open real host dashboard</p>
          <p className="mt-1 text-sm text-zinc-400">Use this once designs are approved and we wire data/auth.</p>
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">QR test code</p>
            <p className="mt-1 text-lg font-black text-white">Generate scan payload</p>
          </div>
          <QrCode className="h-5 w-5 text-brand-green" aria-hidden />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
              Ticket code
              <input
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/12 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                placeholder="rage_8f2c_k19m"
              />
            </label>
            <p className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-zinc-300">{payload}</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrUrl} alt="QR test payload" className="h-28 w-28 rounded-lg border border-white/12 bg-white p-1.5" />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Camera check-in</p>
            <p className="mt-1 text-lg font-black text-white">Open scanner for event</p>
          </div>
          <Camera className="h-5 w-5 text-cyan-300" aria-hidden />
        </div>
        <label className="mt-3 block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
          Event ID (optional)
          <input
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/12 bg-black/40 px-3 py-2 text-sm text-white outline-none"
            placeholder="Paste event id to jump to scanner"
          />
        </label>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Link href={scannerHref} className="pill-dark inline-flex h-11 items-center justify-center gap-2 px-6 text-[11px] font-semibold uppercase tracking-[0.14em]">
            Open camera scanner <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <Link href="/create-event" className="pill-light inline-flex h-11 items-center justify-center gap-2 px-6 text-[11px] font-semibold uppercase tracking-[0.14em]">
            Create test event <Ticket className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
