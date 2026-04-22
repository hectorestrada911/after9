"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Play } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { authEase } from "@/components/auth-shell";
import { centsToDollars } from "@/lib/utils";

export type HomeTrendingEvent = {
  slug: string;
  title: string;
  date: string;
  location: string;
  ticket_price: number;
  image_url: string | null;
};

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

const cardSpring = { type: "spring" as const, stiffness: 380, damping: 28 };

export function HomeTrendingRail({ events }: { events: HomeTrendingEvent[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <section id="browse-events" className="border-t border-white/[0.08] py-16 sm:py-24">
      <div className="container-page">
        <motion.div
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, ease: authEase }}
        >
          <div className="min-w-0">
            <h2 className="text-2xl font-black tracking-tighter text-white sm:text-3xl">Trending now</h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-zinc-400">
              Fresh drops from rooms we love: club nights, live sets, comedy, and the kind of nights people actually talk about.
            </p>
          </div>
          <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
            <Link href="/#browse-events" className="pill-dark inline-flex h-11 items-center self-start px-6 text-xs sm:self-end">
              BROWSE EVENTS
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <div className="no-scrollbar overflow-x-auto pb-4">
        <div className="mx-auto flex max-w-[1400px] gap-4 px-4 sm:gap-5 sm:px-6">
          {events.map((event, i) => (
            <motion.div
              key={`${event.slug}-${i}`}
              initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.4, ease: authEase, delay: reduceMotion ? 0 : Math.min(i * 0.05, 0.35) }}
            >
              <Link href={`/events/${event.slug}`} className="group block w-[260px] shrink-0 sm:w-[280px]">
                <motion.div
                  whileHover={reduceMotion ? undefined : { y: -4 }}
                  transition={cardSpring}
                  className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/[0.1] bg-zinc-900 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.75)]"
                >
                  {event.image_url && (
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="280px"
                      unoptimized
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur">
                      <Play size={14} fill="currentColor" />
                    </span>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur">
                      <Heart size={14} />
                    </span>
                  </div>
                </motion.div>
                <div className="mt-3">
                  <p className="line-clamp-2 text-base font-bold leading-tight text-white">{event.title}</p>
                  <p className="mt-1 text-sm text-zinc-500">{formatDate(event.date)}</p>
                  <p className="text-sm text-zinc-500">{event.location}</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-200">${centsToDollars(event.ticket_price)}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
