"use client";

import { motion, useReducedMotion } from "framer-motion";
import { authEase } from "@/components/auth-shell";
import { HomeScrollSplitVisual } from "@/components/home-scroll-split-visual";

export function HomeHowSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="border-t border-white/[0.08] bg-zinc-950">
      <div className="container-page pt-16 sm:pt-20 lg:pt-24">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: authEase }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">How RAGE works</p>
          <h2 className="mt-3 display-section-fluid text-white">
            Built to sell.
            <br />
            <span className="bg-gradient-to-r from-zinc-100 via-white to-brand-green bg-clip-text text-transparent">Built to operate.</span>
          </h2>
        </motion.div>
      </div>
      <HomeScrollSplitVisual />
    </section>
  );
}
