"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { authEase } from "@/components/auth-shell";
import { HomeBannerVideoLoader } from "@/components/home-banner-video-loader";
import { cn } from "@/lib/utils";

const heroLine = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: authEase } },
};

const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: authEase } },
};

export function HomeTopSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="container-page relative pb-12 pt-12 sm:pb-16 sm:pt-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[min(70vh,520px)] opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 20% -10%, rgba(75,250,148,0.16), transparent 55%), radial-gradient(circle at 90% 20%, rgba(255,255,255,0.06), transparent 42%)",
        }}
      />
      {!reduceMotion ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-24 -z-10 h-72 w-72 rounded-full bg-brand-green/15 blur-[100px]"
          animate={{ opacity: [0.45, 0.75, 0.45], scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}

      <div className="flex min-w-0 flex-col gap-10 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-14 lg:gap-y-12">
        <motion.div
          className="min-w-0 max-w-full lg:col-start-1 lg:row-start-1 lg:min-w-0 lg:overflow-hidden lg:pr-2"
          variants={heroContainer}
          initial={reduceMotion ? "show" : "hidden"}
          animate="show"
        >
          <motion.h1
            variants={heroLine}
            className="display-hero-fluid display-hero-contained min-w-0 text-balance text-white"
          >
            <span className="block">The alternative</span>
            <span className="block bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">you can trust.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-7 max-w-sm text-[15px] leading-relaxed text-zinc-400 sm:max-w-md sm:text-base">
            Honest pricing on every page, tickets on the phone, and a door flow that stays human when the room peaks.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-3">
            <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
              <Link
                href="/create-event"
                className={cn(
                  "inline-flex h-11 items-center rounded-full bg-white px-7 text-[11px] font-semibold uppercase tracking-[0.16em] text-black shadow-[0_14px_40px_-18px_rgba(255,255,255,0.35)] transition hover:bg-zinc-200 sm:h-12 sm:px-8",
                )}
              >
                Create event
              </Link>
            </motion.div>
            <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
              <Link href="/#browse-events" className="pill-light inline-flex h-11 items-center px-7 text-[11px] sm:h-12 sm:px-8">
                Browse events
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative -mx-4 w-[calc(100%+2rem)] overflow-hidden rounded-2xl border border-white/[0.08] bg-black shadow-[0_40px_100px_-50px_rgba(75,250,148,0.25)] sm:mx-0 sm:w-full lg:col-span-2 lg:col-start-1 lg:row-start-2"
          initial={reduceMotion ? undefined : { opacity: 0, y: 28 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: authEase }}
        >
          <HomeBannerVideoLoader />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 max-w-lg sm:bottom-8 sm:left-8">
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">RAGE</p>
            <p className="mt-2 text-balance text-2xl font-black leading-[0.95] tracking-tighter text-white sm:text-3xl lg:text-4xl">
              Crowd in.
              <br />
              Friction out.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="relative mx-auto aspect-square w-full max-w-md min-w-0 overflow-hidden rounded-2xl border border-white/[0.1] bg-zinc-900 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.85)] sm:max-w-lg lg:mx-0 lg:max-w-none lg:col-start-2 lg:row-start-1"
          initial={reduceMotion ? undefined : { opacity: 0, scale: 0.97 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: authEase, delay: reduceMotion ? 0 : 0.08 }}
        >
          <Image
            src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80"
            alt="RAGE, live energy"
            fill
            loading="lazy"
            unoptimized
            sizes="(max-width: 1023px) min(100vw, 32rem), min(50vw, 560px)"
            className="object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">RAGE</p>
            <p className="mt-1 text-3xl font-black leading-none tracking-tighter text-white sm:text-4xl">
              Where the
              <br />
              build hits.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
