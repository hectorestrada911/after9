"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

const faqItems = [
  {
    q: "How do I get into RAGE events?",
    a: "Sign up, verify your .edu email, and buy tickets in-app. Your QR ticket appears instantly in My tickets for door scan.",
  },
  {
    q: "Do I need a school email?",
    a: "For student-gated events, yes. .edu verification helps keep private campus events student-only.",
  },
  {
    q: "Where do I find my ticket after checkout?",
    a: "Open My tickets. Every ticket is attached to your account and includes a scannable QR code.",
  },
  {
    q: "What about refunds?",
    a: "Refund terms are set by each host. Check the event policy first, then contact support if you need help.",
  },
  {
    q: "I'm hosting. How do payouts work?",
    a: "Connect Stripe in your host dashboard, track orders in real-time, and withdraw available funds there.",
  },
];

export function HomeFaqSection() {
  const [openIdx, setOpenIdx] = useState<number>(0);

  return (
    <section id="faq" className="relative overflow-hidden border-y border-white/[0.06] bg-black py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 15% 30%, rgba(75,250,148,0.11), transparent 38%), radial-gradient(circle at 85% 70%, rgba(40,80,255,0.11), transparent 42%)",
        }}
      />

      <div className="container-page relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-4xl text-left"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#4BFA94]">FAQ</p>
          <h2 className="mt-3 text-4xl font-black uppercase leading-[0.9] tracking-[-0.04em] text-white sm:text-6xl">
            Frequently asked
            <br />
            questions
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Tickets", "Access", "Refunds", "Hosts", "Support"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/[0.12] bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="mx-auto mt-10 max-w-3xl space-y-3">
          {faqItems.map((item, idx) => {
            const open = openIdx === idx;
            return (
              <div
                key={item.q}
                className={`rounded-2xl border px-5 py-4 transition ${
                  open
                    ? "border-[#4BFA94]/40 bg-[#4BFA94]/[0.06]"
                    : "border-white/[0.10] bg-white/[0.02] hover:border-white/[0.22]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(open ? -1 : idx)}
                  className="flex w-full items-start justify-between gap-4 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4BFA94]/60"
                >
                  <span className="text-sm font-semibold text-white sm:text-base">{item.q}</span>
                  <span className={`mt-0.5 text-lg leading-none transition ${open ? "rotate-45 text-[#4BFA94]" : "text-zinc-500"}`}>+</span>
                </button>
                {open ? <p className="mt-3 text-sm leading-relaxed text-zinc-300">{item.a}</p> : null}
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/create-event"
            className="inline-flex h-12 items-center rounded-full bg-[#4BFA94] px-8 text-[11px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-emerald-300"
          >
            Create event
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-12 items-center rounded-full border border-white/[0.18] px-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:border-white/40"
          >
            Register
          </Link>
        </div>
      </div>
    </section>
  );
}
