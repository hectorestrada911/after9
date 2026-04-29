"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const row1 = [
  "NYU", "UCLA", "USC", "UMich", "Cornell", "Georgetown", "Duke", "Vanderbilt",
  "Emory", "Northwestern", "Notre Dame", "Tulane", "Fordham", "BU", "Northeastern",
  "NYU", "UCLA", "USC", "UMich", "Cornell", "Georgetown", "Duke", "Vanderbilt",
];

const row2 = [
  "UVA", "Dartmouth", "Princeton", "Yale", "SMU", "Wake Forest", "Rice", "Howard",
  "Tufts", "GWU", "American U", "Miami", "Pepperdine", "TCU", "Indiana",
  "UVA", "Dartmouth", "Princeton", "Yale", "SMU", "Wake Forest", "Rice", "Howard",
];

function MarqueeRow({ schools, reverse }: { schools: string[]; reverse?: boolean }) {
  return (
    <div className="relative overflow-hidden">
      <div
        className="flex gap-10 whitespace-nowrap"
        style={{
          animation: `${reverse ? "marquee-rev" : "marquee"} ${reverse ? 40 : 34}s linear infinite`,
          willChange: "transform",
        }}
      >
        {schools.map((s, i) => (
          <span
            key={i}
            className="text-3xl font-black uppercase tracking-tighter text-white/20 sm:text-4xl lg:text-5xl"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

export function HomeSchoolsCta() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden min-h-screen">
      <style>{`
        @keyframes marquee     { from { transform: translateX(0); }    to { transform: translateX(-50%); } }
        @keyframes marquee-rev { from { transform: translateX(-50%); } to { transform: translateX(0); }    }
      `}</style>

      {/* Video background */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/a9-banner.mp4"
        poster="/host-review-scene.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />

      {/* Dark overlay — heavier at edges, lighter in center so video breathes */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.88) 100%)",
        }}
      />

      {/* Green atmospheric glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-0 h-[600px] -translate-y-1/2"
        style={{
          background: "radial-gradient(ellipse 55% 70% at 50% 50%, rgba(75,250,148,0.12), transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 py-24 sm:py-32">
        {/* Marquee rows */}
        <div className={`space-y-6 ${reduceMotion ? "opacity-30" : "opacity-100"}`}>
          <MarqueeRow schools={row1} />
          <MarqueeRow schools={row2} reverse />
        </div>

        {/* Center CTA */}
        <div className="mx-auto max-w-3xl px-6 pt-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#4BFA94]">
              Join the movement
            </p>
            <h2 className="mt-4 text-6xl font-black uppercase leading-[0.88] tracking-[-0.04em] text-white sm:text-7xl lg:text-8xl">
              500+ campuses<br />
              <span className="bg-gradient-to-r from-[#4BFA94] to-emerald-300 bg-clip-text text-transparent">
                already raging.
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-zinc-400">
              RAGE is live at universities across the country. Verify your .edu and see every party, show, and event happening at your school.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex h-13 items-center rounded-full bg-white px-9 text-[11px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-zinc-200"
                style={{ height: 52 }}
              >
                Find your school
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center rounded-full border border-white/20 px-9 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:border-white/40"
                style={{ height: 52 }}
              >
                Sample event →
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom marquee */}
        <div className={`mt-16 space-y-6 ${reduceMotion ? "opacity-30" : "opacity-100"}`}>
          <MarqueeRow schools={row1} reverse />
        </div>
      </div>
    </section>
  );
}
