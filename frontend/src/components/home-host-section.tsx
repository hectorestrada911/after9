"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { authEase } from "@/components/auth-shell";
import { HostProductSnapshot } from "@/components/host-product-snapshot";
import { HostWorkflowHighlight } from "@/components/host-workflow-highlight";
import { cn } from "@/lib/utils";

const tile: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: authEase } },
};

const tiles = [
  ["Minutes", "From blank form to live page"],
  ["One link", "Sell tickets & share anywhere"],
  ["QR + email", "What guests get after buying"],
  ["Search + scan", "How you run the door"],
] as const;

export function HomeHostSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="border-t border-white/[0.08] bg-black py-20 text-white sm:py-28">
      <div className="container-page">
        <motion.div
          className="grid min-w-0 gap-10 lg:grid-cols-[1.2fr,0.8fr] lg:items-center"
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: authEase }}
        >
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">For hosts</p>
            <h3 className="mt-4 display-section-fluid">
              Turn your event
              <br />
              <span className="bg-gradient-to-r from-brand-green via-emerald-200 to-teal-200 bg-clip-text text-transparent">into income.</span>
            </h3>
            <p className="mt-5 max-w-2xl text-lg text-white/70">One platform to create, sell, and operate event nights with confidence.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
                <Link
                  href="/create-event"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-7 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-950 shadow-[0_14px_40px_-16px_rgba(255,255,255,0.35)] transition hover:bg-neutral-200 sm:h-12"
                >
                  Create event <ArrowRight size={14} strokeWidth={2} />
                </Link>
              </motion.div>
              <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center rounded-full border border-white/25 px-7 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:border-white/50 sm:h-12"
                >
                  Login
                </Link>
              </motion.div>
            </div>
          </div>
          <motion.div
            className="grid min-w-0 grid-cols-2 gap-2 sm:gap-3"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: reduceMotion ? 0 : 0.07, delayChildren: reduceMotion ? 0 : 0.05 },
              },
            }}
          >
            {tiles.map(([v, l]) => (
              <motion.div
                key={l}
                variants={tile}
                whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 26 }}
                className={cn(
                  "rounded-2xl border border-white/15 bg-white/[0.02] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-5",
                  "transition-colors hover:border-brand-green/35",
                )}
              >
                <p className="text-2xl font-black tracking-tighter sm:text-3xl">{v}</p>
                <p className="mt-1 text-[10px] uppercase leading-snug tracking-wider text-white/60 sm:text-xs">{l}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-14 flex flex-col gap-8 border-t border-white/[0.08] pt-14 lg:mt-16 lg:flex-row lg:items-start lg:gap-14 lg:pt-16"
          initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: authEase }}
        >
          <div className="min-w-0 shrink-0 lg:max-w-[14rem] lg:pt-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">What guests open</p>
            <p className="mt-3 text-lg font-bold leading-snug text-white sm:text-xl">A page that looks worth the ticket.</p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              Cover, details, price, checkout: the same bones every public event uses. Below is a static mock, not a live event.
            </p>
          </div>
          <div className="mx-auto w-full max-w-md flex-1 lg:mx-0 lg:max-w-lg">
            <HostProductSnapshot />
          </div>
        </motion.div>

        <motion.div
          className="mt-14 border-t border-white/[0.08] pt-14 sm:mt-20 sm:pt-20"
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, ease: authEase }}
        >
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-white/45 sm:text-left">How it feels to host</p>
          <h3 className="mt-3 text-balance text-center text-2xl font-black tracking-tight text-white sm:text-left sm:text-3xl">
            Launch, collect, and scan in one clean flow.
          </h3>
          <p className="mt-3 max-w-2xl text-center text-sm text-zinc-400 sm:text-left">Three steps: publish, get paid, scan at door.</p>
          <div className="mt-6">
            <HostWorkflowHighlight />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
