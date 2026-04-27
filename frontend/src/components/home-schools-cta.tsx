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
        className="flex gap-8 whitespace-nowrap"
        style={{
          animation: `${reverse ? "marquee-rev" : "marquee"} ${reverse ? 38 : 32}s linear infinite`,
          willChange: "transform",
        }}
      >
        {schools.map((s, i) => (
          <span key={i} className="text-2xl font-black uppercase tracking-tighter text-zinc-700 sm:text-3xl">
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
    <section className="relative overflow-hidden border-t border-white/[0.06] bg-black pb-24 pt-12">
      <style>{`
        @keyframes marquee     { from { transform: translateX(0); }    to { transform: translateX(-50%); } }
        @keyframes marquee-rev { from { transform: translateX(-50%); } to { transform: translateX(0); }    }
      `}</style>

      {/* Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-0 h-96 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(75,250,148,0.08), transparent 70%)",
        }}
      />

      {/* Marquee rows */}
      <div className={`space-y-5 ${reduceMotion ? "opacity-30" : "opacity-100"}`}>
        <MarqueeRow schools={row1} />
        <MarqueeRow schools={row2} reverse />
      </div>

      {/* Center CTA */}
      <div className="relative z-10 mx-auto max-w-2xl px-6 pt-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#4BFA94]">
            Join the movement
          </p>
          <h2 className="mt-3 text-4xl font-black uppercase leading-[0.9] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
            500+ campuses<br />
            <span className="bg-gradient-to-r from-[#4BFA94] to-emerald-300 bg-clip-text text-transparent">
              already raging.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-zinc-500">
            RAGE is live at universities across the country. Verify your .edu and see every party, show, and event happening at your school.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href="/#browse-events"
              className="inline-flex h-12 items-center rounded-full bg-white px-8 text-[11px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-zinc-200"
            >
              Find your school
            </Link>
            <Link
              href="/#browse-events"
              className="inline-flex h-12 items-center rounded-full border border-white/[0.18] px-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:border-white/40"
            >
              Browse events →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
