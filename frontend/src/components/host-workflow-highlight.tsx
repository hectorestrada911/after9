"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const outcomes = [
  {
    stat: "2 min",
    title: "Publish fast",
    body: "Create event, set price, go live.",
  },
  {
    stat: "Instant",
    title: "Get paid",
    body: "One link, phone checkout, money in.",
  },
  {
    stat: "1 tap",
    title: "Scan at door",
    body: "QR tickets in, line moves, duplicates blocked.",
  },
] as const;

const flowSteps = [
  "Host shares event link",
  "Guest fills payment details",
  "QR ticket is delivered",
  "Door scan confirms entry",
] as const;

export function HostWorkflowHighlight() {
  const [flowIndex, setFlowIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFlowIndex((i) => (i + 1) % flowSteps.length);
    }, 1650);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/70 p-5 shadow-[0_30px_120px_-60px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.04] sm:p-7">
      <div className="pointer-events-none absolute -left-16 top-12 h-40 w-40 rounded-full bg-brand-green/[0.08] blur-[90px]" aria-hidden />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-40 w-40 rounded-full bg-cyan-300/[0.06] blur-[90px]" aria-hidden />

      <div className="relative grid gap-3 md:grid-cols-3">
        {outcomes.map(({ stat, title, body }) => (
          <article
            key={title}
            className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 shadow-[0_18px_48px_-28px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:p-5"
          >
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-brand-green">{stat}</p>
            <h4 className="mt-2 text-xl font-black tracking-tight text-white">{title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">{body}</p>
          </article>
        ))}
      </div>

      <p className="relative mt-5 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm leading-relaxed text-zinc-300 sm:px-5">
        No dashboard noise. Just sell and run your door.
      </p>

      <div className="relative mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-start">
        <Link
          href="/create-event"
          className="pill-dark inline-flex h-12 min-h-12 items-center justify-center gap-2 px-8 text-[11px] font-semibold uppercase tracking-[0.16em] touch-manipulation"
        >
          Start selling <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </Link>
        <Link
          href="/demo"
          className="pill-light inline-flex h-12 min-h-12 items-center justify-center px-8 text-[11px] font-semibold uppercase tracking-[0.16em] touch-manipulation"
        >
          See live demo
        </Link>
        <Link
          href="/test"
          className="pill-light inline-flex h-12 min-h-12 items-center justify-center px-8 text-[11px] font-semibold uppercase tracking-[0.16em] touch-manipulation"
        >
          Open test lab
        </Link>
      </div>

      <Link
        href="/demo"
        className="group relative mt-3 inline-flex min-h-12 w-full items-center overflow-hidden rounded-full border border-white/20 bg-white/[0.02] px-5 py-3 text-left transition hover:bg-white/[0.05] sm:max-w-[28rem]"
      >
        <div className="flex w-full items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">Sample event flow</p>
            <p className="truncate text-xs font-semibold text-white">{flowSteps[flowIndex]}</p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-brand-green transition-transform group-hover:translate-x-0.5" aria-hidden />
        </div>
      </Link>

      <div className="mt-4 flex items-center gap-2" aria-hidden>
        {flowSteps.map((step, i) => (
          <div key={step} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-green to-cyan-300 transition-all duration-500"
              style={{ width: i <= flowIndex ? "100%" : "0%" }}
            />
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        <span>Link</span>
        <span>Payment</span>
        <span>QR</span>
        <span>Scan</span>
      </div>
    </div>
  );
}
