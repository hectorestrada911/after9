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
    <section className="relative overflow-hidden border-t border-white/[0.06] bg-black py-24 text-white sm:py-32">
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[480px]"
        style={{ background: "radial-gradient(ellipse 70% 70% at 50% 0%, rgba(75,250,148,0.07), transparent 70%)" }}
      />

      <div className="container-page relative z-10">
        {/* ── hero: Turn your event into income ── */}
        <motion.div
          className="grid min-w-0 gap-12 lg:grid-cols-[1.2fr,0.8fr] lg:items-center"
          initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: authEase }}
        >
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#4BFA94]">For hosts</p>
            <h3 className="mt-4 text-5xl font-black uppercase leading-[0.88] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              Turn your event
              <br />
              <span className="bg-gradient-to-r from-[#4BFA94] via-emerald-200 to-teal-200 bg-clip-text text-transparent">
                into income.
              </span>
            </h3>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              One platform to create, sell, and operate event nights with confidence. No paperwork, no spreadsheets, no surprises at the door.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
                <Link
                  href="/create-event"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-8 text-[11px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-zinc-200"
                >
                  Create event <ArrowRight size={14} strokeWidth={2.5} />
                </Link>
              </motion.div>
              <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center rounded-full border border-white/[0.18] px-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:border-white/40"
                >
                  Host login
                </Link>
              </motion.div>
            </div>
          </div>
          <motion.div
            className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: reduceMotion ? 0 : 0.08, delayChildren: reduceMotion ? 0 : 0.05 },
              },
            }}
          >
            {tiles.map(([v, l]) => (
              <motion.div
                key={l}
                variants={tile}
                whileHover={reduceMotion ? undefined : { y: -3, borderColor: "rgba(75,250,148,0.4)" }}
                transition={{ type: "spring", stiffness: 400, damping: 26 }}
                className={cn(
                  "rounded-2xl border border-white/[0.08] bg-white/[0.015] p-5 backdrop-blur sm:p-6",
                  "transition-colors",
                )}
              >
                <p className="text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl">{v}</p>
                <p className="mt-2 text-[10px] font-semibold uppercase leading-snug tracking-[0.16em] text-zinc-500">{l}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── A page that looks worth the ticket ── */}
        <motion.div
          className="mt-24 flex flex-col gap-10 border-t border-white/[0.05] pt-16 lg:flex-row lg:items-start lg:gap-16 lg:pt-20"
          initial={reduceMotion ? undefined : { opacity: 0, y: 28 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: authEase }}
        >
          <div className="min-w-0 shrink-0 lg:max-w-[18rem] lg:pt-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#4BFA94]">What guests open</p>
            <h3 className="mt-4 text-3xl font-black uppercase leading-[0.92] tracking-[-0.035em] text-white sm:text-4xl">
              A page<br />that looks<br />
              <span className="bg-gradient-to-r from-[#4BFA94] to-emerald-300 bg-clip-text text-transparent">worth the ticket.</span>
            </h3>
            <p className="mt-5 text-sm leading-relaxed text-zinc-500">
              Cover, details, price, checkout: the same bones every public event uses. Below is a static mock, not a live event.
            </p>
          </div>
          <div className="mx-auto w-full max-w-md flex-1 lg:mx-0 lg:max-w-lg">
            <HostProductSnapshot />
          </div>
        </motion.div>

        {/* ── Launch, collect, and scan in one clean flow ── */}
        <motion.div
          className="mt-24 border-t border-white/[0.05] pt-16 sm:mt-28 sm:pt-20"
          initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: authEase }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#4BFA94]">How it feels to host</p>
          <h3 className="mt-4 max-w-3xl text-balance text-4xl font-black uppercase leading-[0.92] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
            Launch, collect,<br />
            and scan in{" "}
            <span className="bg-gradient-to-r from-[#4BFA94] to-emerald-300 bg-clip-text text-transparent">one clean flow.</span>
          </h3>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400">
            Three steps: publish, get paid, scan at door. Nothing else to learn.
          </p>
          <div className="mt-10">
            <HostWorkflowHighlight />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
