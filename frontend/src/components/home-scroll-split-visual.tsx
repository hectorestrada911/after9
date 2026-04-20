"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const LEFT =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1100&q=80";
const RIGHT =
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1100&q=80";

function smoothstep(x: number) {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
}

/**
 * Scroll-scrubbed pair: photos start wide on the viewport and ease inward until they almost stack.
 * Taller driver = more scroll “budget” (feels closer to Apple-style scrub sections).
 */
export function HomeScrollSplitVisual() {
  const driverRef = useRef<HTMLDivElement>(null);
  const [t, setT] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    queueMicrotask(() => setReducedMotion(mq.matches));
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const sync = () => setIsCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    let ticking = false;
    const tick = () => {
      ticking = false;
      const el = driverRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const travel = el.offsetHeight - window.innerHeight;
      if (travel <= 0) {
        queueMicrotask(() => setT(1));
        return;
      }
      const raw = (-rect.top / travel) * 1.08;
      queueMicrotask(() => setT(smoothstep(Math.max(0, Math.min(1, raw)))));
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          tick();
        });
      }
    };

    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reducedMotion]);

  const progress = reducedMotion ? 1 : t;
  const nearSpread = isCompact ? 2.5 : 5;
  const farSpread = isCompact ? 13 : 21;
  const leftX = -nearSpread - farSpread * (1 - progress);
  const rightX = nearSpread + farSpread * (1 - progress);
  const lift = 10 * (1 - progress);
  const leftRot = -3 * (1 - progress);
  const rightRot = 3 * (1 - progress);
  const scale = 0.92 + 0.08 * progress;
  const copyOpacity = 0.25 + 0.75 * smoothstep((progress - 0.12) / 0.55);
  const pillsOpacity = 0.2 + 0.8 * smoothstep((progress - 0.45) / 0.45);

  return (
    <div ref={driverRef} className="relative min-h-[190vh] w-full sm:min-h-[240vh] lg:min-h-[280vh]">
      <div className="sticky top-0 flex min-h-[92dvh] flex-col items-center justify-center py-8 sm:min-h-[100dvh] sm:py-12">
        <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-3 sm:px-5 lg:grid-cols-12 lg:gap-6">
          <div
            className="order-2 flex flex-col justify-center px-1 lg:order-1 lg:col-span-4 lg:pr-4"
            style={{ opacity: reducedMotion ? 1 : copyOpacity }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">While you scroll</p>
            <h3 className="mt-3 text-2xl font-black leading-[1.05] tracking-tighter text-white sm:text-3xl">
              Room and door, same story.
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
              The closer these two frames get, the closer you are to a night that is published, sold, and ready at the
              door. No PNG mockups required, just motion and contrast.
            </p>
          </div>

          <div className="relative order-1 flex h-[min(68dvh,520px)] w-full items-center justify-center lg:col-span-8">
            <div
              className="absolute left-1/2 top-1/2 z-10 w-[min(80vw,360px)] will-change-transform sm:w-[min(40vw,400px)]"
              style={{
                transform: `translate(calc(-50% + ${leftX}vw), calc(-50% - ${lift}px)) rotate(${leftRot}deg) scale(${scale})`,
              }}
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/[0.12] bg-zinc-900 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)]">
                <Image src={LEFT} alt="Crowd in the room" fill className="object-cover" sizes="400px" priority={false} unoptimized />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/55 via-transparent to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">Sell this</p>
                  <p className="mt-1 text-sm font-semibold text-white">Crowd energy on the page.</p>
                </div>
              </div>
            </div>

            <div
              className="absolute left-1/2 top-1/2 z-20 w-[min(80vw,360px)] will-change-transform sm:w-[min(40vw,400px)]"
              style={{
                transform: `translate(calc(-50% + ${rightX}vw), calc(-50% + ${lift}px)) rotate(${rightRot}deg) scale(${scale})`,
              }}
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/[0.12] bg-zinc-900 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)]">
                <Image src={RIGHT} alt="Energy at the decks" fill className="object-cover" sizes="400px" priority={false} unoptimized />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tl from-black/55 via-transparent to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-right sm:p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">Run this</p>
                  <p className="mt-1 text-sm font-semibold text-white">Checkout + check-in on one stack.</p>
                </div>
              </div>
            </div>

            <div
              className="pointer-events-none absolute bottom-2 left-1/2 h-0.5 w-28 max-w-[40%] -translate-x-1/2 overflow-hidden rounded-full bg-white/12 sm:bottom-4"
              aria-hidden
            >
              <div className="h-full rounded-full bg-white/70" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          </div>
        </div>

        <div
          className="mt-8 grid max-w-3xl grid-cols-1 gap-4 px-4 text-center sm:mt-10 sm:grid-cols-3 sm:gap-6 sm:text-left lg:mt-12"
          style={{ opacity: reducedMotion ? 1 : pillsOpacity }}
        >
          {[
            ["Publish", "A clear page guests trust before they buy."],
            ["Checkout", "One link, mobile wallets, tickets in inbox."],
            ["Door", "Search and scan when the line gets loud."],
          ].map(([k, v]) => (
            <div key={k} className="border-t border-white/10 pt-4 sm:border-t-0 sm:border-none sm:pt-0">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{k}</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
