"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Link2, QrCode, Timer } from "lucide-react";

const steps = [
  {
    icon: Timer,
    title: "Publish in a few minutes",
    body: "Event details, cover image, and ticket price, then a public page you can drop in bios, stories, or chats.",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=78",
    imageAlt: "Crowd at a live night",
  },
  {
    icon: Link2,
    title: "One link sells tickets",
    body: "Guests check out on their phones. Confirmation + QR hits their inbox so nobody is screenshot-hunting at the door.",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=78",
    imageAlt: "Guests sharing a night out",
  },
  {
    icon: QrCode,
    title: "Door tools that stay simple",
    body: "Search names, scan codes, catch duplicate check-ins. Built for loud rooms and long lines, not finance cosplay.",
    image:
      "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=600&q=78",
    imageAlt: "Venue entry and lights",
  },
] as const;

/** Host workflow strip with thumbs + light scroll-in motion. */
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
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reducedMotion]);

  const revealed = reducedMotion || visible;

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.045] to-transparent p-6 sm:p-8 lg:p-10"
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-green/[0.07] blur-3xl"
        aria-hidden
      />

      <div className="relative grid gap-10 md:grid-cols-3 md:gap-6 lg:gap-8">
        {steps.map(({ icon: Icon, title, body, image, imageAlt }, i) => (
          <div
            key={title}
            className="flex flex-col transition-all duration-700 ease-out"
            style={{
              opacity: revealed ? 1 : 0,
              transform: revealed ? "translateY(0)" : "translateY(14px)",
              transitionDelay: reducedMotion ? "0ms" : `${80 + i * 100}ms`,
            }}
          >
            <div className="relative mb-4 aspect-[21/9] w-full overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900/80 sm:aspect-[2/1]">
              <Image src={image} alt={imageAlt} fill className="object-cover object-center" sizes="(max-width:768px) 100vw, 33vw" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-brand-green">
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </div>
            <h4 className="mt-4 text-lg font-black leading-tight tracking-tighter text-white">{title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p>
          </div>
        ))}
      </div>

      <div className="relative mt-10 flex flex-col items-stretch justify-center gap-3 border-t border-white/[0.08] pt-10 sm:flex-row sm:items-center sm:justify-center">
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
