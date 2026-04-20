"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    n: "01",
    title: "Publish in a few minutes",
    body: "Cover, story, ticket price, then a link you can drop anywhere.",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=82",
    imageAlt: "DJ and room energy",
  },
  {
    n: "02",
    title: "One link sells tickets",
    body: "Checkout on the phone. QR and receipt land in email, not screenshots.",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=82",
    imageAlt: "Hands up at a live show",
  },
  {
    n: "03",
    title: "Door tools that stay simple",
    body: "Search, scan, catch duplicates. Built for loud lines, not spreadsheets.",
    image:
      "https://images.unsplash.com/photo-1571266028363-e250f854c3e1?auto=format&fit=crop&w=900&q=82",
    imageAlt: "Neon club entrance",
  },
] as const;

function MarkLaunch() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9" aria-hidden>
      <defs>
        <linearGradient id="hwg1" x1="8" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4bfa94" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <path
        d="M20 4 L26 14 L38 16 L29 24 L31 36 L20 30 L9 36 L11 24 L2 16 L14 14 Z"
        stroke="url(#hwg1)"
        strokeWidth="1.4"
        strokeLinejoin="round"
        className="opacity-95"
      />
      <circle cx="20" cy="20" r="3" fill="url(#hwg1)" opacity="0.9" />
    </svg>
  );
}

function MarkLink() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9" aria-hidden>
      <defs>
        <linearGradient id="hwg2" x1="4" y1="10" x2="36" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4bfa94" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <path
        d="M14 18c-3.3 0-6 2.7-6 6s2.7 6 6 6h4M26 22c3.3 0 6-2.7 6-6s-2.7-6-6-6h-4"
        stroke="url(#hwg2)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M17 22h6" stroke="url(#hwg2)" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}

function MarkDoor() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9" aria-hidden>
      <defs>
        <linearGradient id="hwg3" x1="6" y1="34" x2="34" y2="6" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4bfa94" />
          <stop offset="1" stopColor="#f472b6" />
        </linearGradient>
      </defs>
      <rect x="10" y="8" width="20" height="26" rx="3" stroke="url(#hwg3)" strokeWidth="1.5" />
      <path d="M24 22v2" stroke="url(#hwg3)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="14" cy="15" r="1.2" fill="url(#hwg3)" opacity="0.85" />
      <circle cx="19" cy="15" r="1.2" fill="url(#hwg3)" opacity="0.65" />
      <circle cx="24" cy="15" r="1.2" fill="url(#hwg3)" opacity="0.45" />
      <circle cx="14" cy="21" r="1.2" fill="url(#hwg3)" opacity="0.55" />
      <circle cx="19" cy="21" r="1.2" fill="url(#hwg3)" opacity="0.75" />
    </svg>
  );
}

const marks = [MarkLaunch, MarkLink, MarkDoor] as const;

/** Full-bleed step cards with custom marks (no stock “conference” vibe). */
export function HostWorkflowHighlight() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    queueMicrotask(() => setReducedMotion(mq.matches));
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setVisible(true);
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reducedMotion]);

  const revealed = reducedMotion || visible;

  return (
    <div ref={rootRef} className="relative">
      <div className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-brand-green/[0.06] blur-[100px]" aria-hidden />
      <div className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-fuchsia-500/[0.05] blur-[90px]" aria-hidden />

      <div className="grid gap-4 md:grid-cols-3 md:gap-5">
        {steps.map(({ n, title, body, image, imageAlt }, i) => {
          const Mark = marks[i]!;
          return (
            <article
              key={n}
              className="group relative isolate min-h-[280px] overflow-hidden rounded-3xl border border-white/[0.1] bg-zinc-950 shadow-[0_32px_80px_-40px_rgba(0,0,0,0.95)] ring-1 ring-white/[0.04] transition-[transform,box-shadow] duration-500 ease-out will-change-transform hover:-translate-y-1 hover:shadow-[0_40px_100px_-36px_rgba(75,250,148,0.12)] sm:min-h-[300px]"
              style={{
                opacity: revealed ? 1 : 0,
                transform: revealed ? "translateY(0)" : "translateY(18px)",
                transitionDelay: reducedMotion ? "0ms" : `${60 + i * 90}ms`,
                transitionProperty: "opacity, transform",
                transitionDuration: "0.75s",
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <div className="absolute inset-0 scale-[1.02] transition-transform duration-700 ease-out group-hover:scale-105">
                <Image src={image} alt={imageAlt} fill className="object-cover object-center" sizes="(max-width:640px) 100vw, 33vw" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />
              <div className="absolute inset-0 bg-gradient-to-br from-brand-green/[0.12] via-transparent to-fuchsia-500/[0.08] mix-blend-soft-light" />

              <span className="pointer-events-none absolute left-4 top-3 select-none font-black leading-none tracking-tighter text-white/[0.08] sm:left-5 sm:top-4 sm:text-8xl">
                {n}
              </span>

              <div className="absolute right-4 top-4 flex items-center justify-center rounded-2xl border border-white/15 bg-black/35 p-2.5 shadow-lg backdrop-blur-md sm:right-5 sm:top-5">
                <Mark />
              </div>

              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <h4 className="text-lg font-black leading-tight tracking-tighter text-white sm:text-xl">{title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300/95">{body}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="relative mt-10 flex flex-col items-stretch justify-center gap-3 sm:mt-12 sm:flex-row sm:items-center sm:justify-center">
        <Link
          href="/create-event"
          className="pill-dark inline-flex h-12 min-h-12 items-center justify-center gap-2 px-8 text-[11px] font-semibold uppercase tracking-[0.16em] touch-manipulation"
        >
          Start selling <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </Link>
        <Link
          href="/login"
          className="pill-light inline-flex h-12 min-h-12 items-center justify-center px-8 text-[11px] font-semibold uppercase tracking-[0.16em] touch-manipulation"
        >
          Host login
        </Link>
      </div>
    </div>
  );
}
