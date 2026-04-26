"use client";

import { motion, useReducedMotion } from "framer-motion";
import { authEase } from "@/components/auth-shell";
import { HomeScrollSplitVisual } from "@/components/home-scroll-split-visual";

export function HomeHowSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-t border-white/[0.06] bg-zinc-950">
      {/* glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[420px]"
        style={{ background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(75,250,148,0.06), transparent 70%)" }}
      />
      <div className="container-page relative z-10 pt-20 sm:pt-24 lg:pt-28">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: authEase }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#4BFA94]">How RAGE works</p>
          <h2 className="mt-4 max-w-3xl text-balance text-4xl font-black uppercase leading-[0.9] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
            Room and door,<br />
            <span className="bg-gradient-to-r from-[#4BFA94] to-emerald-300 bg-clip-text text-transparent">same story.</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400">
            What guests see and what hosts run — built from the same bones. No mismatched UI, no surprises.
          </p>
        </motion.div>
      </div>
      <HomeScrollSplitVisual />
    </section>
  );
}
