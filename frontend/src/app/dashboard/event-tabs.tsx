"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Card, EmptyState } from "@/components/ui";
import CopyEventLink from "@/components/copy-event-link";

export type DashboardEvent = {
  id: string;
  slug: string;
  title: string;
  date: string;
  ticket_price: number;
  tickets_available: number;
  sold: number;
  pct: number;
};

function formatEventDate(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function UpcomingList({ events }: { events: DashboardEvent[] }) {
  if (events.length === 0) {
    return (
      <EmptyState
        title="No upcoming events"
        subtitle="Create your first event to start selling tickets."
        className="border-white/[0.16] bg-zinc-950/50"
        titleClassName="text-white"
        subtitleClassName="text-zinc-400"
      />
    );
  }
  return (
    <div className="space-y-3">
      {events.map((event) => (
        <Card key={event.id} className="border-white/[0.1] bg-zinc-950/60 text-white transition hover:border-white/25">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <Link href={`/dashboard/events/${event.id}`} className="text-lg font-bold tracking-tight transition hover:text-brand-green">
                {event.title}
              </Link>
              <p className="text-sm text-zinc-400">{formatEventDate(event.date)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                className="inline-flex h-10 items-center rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-4 text-xs font-bold uppercase tracking-wide text-black shadow-[0_0_24px_-12px_rgba(75,250,148,0.75)] transition hover:brightness-110"
                href={`/dashboard/events/${event.id}`}
              >
                Event hub
              </Link>
              <Link
                className="inline-flex h-10 items-center rounded-full border border-white/20 bg-white/[0.03] px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/45 hover:bg-white/[0.08]"
                href={`/events/${event.slug}`}
              >
                View
              </Link>
              <Link
                className="inline-flex h-10 items-center rounded-full border border-white/20 bg-white/[0.03] px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/45 hover:bg-white/[0.08]"
                href={`/dashboard/events/${event.id}/check-in`}
              >
                Scan QR
              </Link>
              <CopyEventLink slug={event.slug} variant="dark" />
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-1.5 flex justify-between text-xs font-medium text-zinc-400">
              <span>Sales progress</span>
              <span>{event.pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full bg-gradient-to-r from-brand-green via-emerald-300 to-cyan-300" style={{ width: `${event.pct}%` }} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function PastList({ events }: { events: DashboardEvent[] }) {
  if (events.length === 0) {
    return (
      <EmptyState
        title="No past events"
        subtitle="Completed events will appear here."
        className="border-white/[0.16] bg-zinc-950/50"
        titleClassName="text-white"
        subtitleClassName="text-zinc-400"
      />
    );
  }
  return (
    <div className="space-y-3">
      {events.map((event) => (
        <Card key={event.id} className="border-white/[0.08] bg-zinc-950/40 text-white opacity-80">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/dashboard/events/${event.id}`} className="text-lg font-bold tracking-tight text-zinc-300 transition hover:text-white">
                  {event.title}
                </Link>
                <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <Clock className="h-2.5 w-2.5" aria-hidden />
                  Ended
                </span>
              </div>
              <p className="text-sm text-zinc-500">{formatEventDate(event.date)}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{event.sold} ticket{event.sold !== 1 ? "s" : ""} sold · {event.pct}% capacity</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                className="inline-flex h-10 items-center rounded-full border border-white/20 bg-white/[0.03] px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/45 hover:bg-white/[0.08]"
                href={`/dashboard/events/${event.id}`}
              >
                View stats
              </Link>
              <Link
                className="inline-flex h-10 items-center rounded-full border border-white/20 bg-white/[0.03] px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/45 hover:bg-white/[0.08]"
                href={`/events/${event.slug}`}
              >
                Public page
              </Link>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-1.5 flex justify-between text-xs font-medium text-zinc-500">
              <span>Final sales</span>
              <span>{event.pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full bg-zinc-600" style={{ width: `${event.pct}%` }} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function DashboardEventTabs({ upcoming, past }: { upcoming: DashboardEvent[]; past: DashboardEvent[] }) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  return (
    <section id="my-events" className="mt-10 space-y-4 scroll-mt-28">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted">Your events</h2>
        <div className="flex rounded-full border border-white/[0.1] bg-zinc-900/60 p-0.5 text-[11px] font-bold uppercase tracking-wide">
          <button
            type="button"
            onClick={() => setTab("upcoming")}
            className={`rounded-full px-4 py-1.5 transition ${tab === "upcoming" ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}
          >
            Upcoming{upcoming.length > 0 ? ` (${upcoming.length})` : ""}
          </button>
          <button
            type="button"
            onClick={() => setTab("past")}
            className={`rounded-full px-4 py-1.5 transition ${tab === "past" ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}
          >
            Past{past.length > 0 ? ` (${past.length})` : ""}
          </button>
        </div>
      </div>

      {tab === "upcoming" ? <UpcomingList events={upcoming} /> : <PastList events={past} />}
    </section>
  );
}
