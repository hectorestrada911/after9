"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { PhoneShell } from "@/components/home-top-section";

/* ─── mini screen mockups ────────────────────────────────────────── */
function CreateScreen() {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0a0a0a", paddingTop: 56, padding: "56px 14px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px 12px" }}>
        <span style={{ fontSize: 16, color: "#fff" }}>←</span>
        <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>Create Event</span>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: "#4BFA94", fontSize: 11, color: "#000", fontWeight: 800 }}>✓</span>
      </div>
      <div style={{ width: "100%", aspectRatio: "1", borderRadius: 14, background: "linear-gradient(135deg, #1a0a3a 0%, #3a0a1a 100%)", marginTop: 4, padding: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", color: "#000", padding: "16px 24px", fontWeight: 900, fontSize: 18, letterSpacing: "-0.02em", borderRadius: 4, transform: "rotate(-4deg)" }}>
          BIRTHDAY<br />PARTY
        </div>
      </div>
      <div style={{ marginTop: 12, padding: "10px 12px", background: "#141414", borderRadius: 10 }}>
        <p style={{ fontSize: 10, color: "#52525b", marginBottom: 2 }}>Title</p>
        <p style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>Birthday Party</p>
      </div>
      <div style={{ marginTop: 8, padding: "10px 12px", background: "#141414", borderRadius: 10 }}>
        <p style={{ fontSize: 10, color: "#52525b" }}>Add Host *</p>
      </div>
    </div>
  );
}

function HomeFeedScreen() {
  const events = [
    { date: "21", title: "Campus Lights", from: "linear-gradient(135deg, #4a1a8a 0%, #1a4a8a 100%)" },
    { date: "21", title: "Theta Mixer", from: "linear-gradient(135deg, #6a2a4a 0%, #4a3a1a 100%)" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0a0a0a", padding: "56px 12px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>RAGE</span>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.06)", color: "#fff" }}>
          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </span>
      </div>
      <p style={{ fontSize: 11, color: "#a1a1aa", fontWeight: 600, marginBottom: 8 }}>Your Events ›</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {events.map((e, i) => (
          <div key={i} style={{ aspectRatio: "1", borderRadius: 12, background: e.from, position: "relative", overflow: "hidden", padding: 8 }}>
            <div style={{ display: "inline-block", background: "rgba(0,0,0,0.55)", borderRadius: 8, padding: "4px 7px", textAlign: "center" }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{e.date}</p>
              <p style={{ fontSize: 7, color: "#fff", letterSpacing: "0.1em", marginTop: 1 }}>TUE</p>
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 10, color: "#52525b", marginTop: 6 }}>Après-Ski Colorado</p>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>'80s in Aspen</p>
    </div>
  );
}

function InviteScreen() {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0a0a0a", padding: "56px 12px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 11 }}>↓</span>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 12 }}>···</span>
      </div>
      <div style={{ width: "100%", aspectRatio: "1", borderRadius: 14, background: "linear-gradient(135deg, #5a1a1a 0%, #2a0a0a 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <p style={{ color: "#f2ef1d", fontWeight: 900, fontSize: 14, textAlign: "center", lineHeight: 1.1, letterSpacing: "0.02em" }}>
          CAMPUS<br />vs THETA<br /><span style={{ color: "#fff" }}>RAGE</span>
        </p>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
        {["#fff", "#22c55e", "#a855f7", "#fbbf24"].map((c, i) => (
          <div key={i} style={{ width: 28, height: 28, borderRadius: 7, background: c, opacity: 0.85 }} />
        ))}
      </div>
      <div style={{ marginTop: 10, padding: "8px 10px", background: "#141414", borderRadius: 10 }}>
        <p style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>Invite Guests</p>
      </div>
      <div style={{ marginTop: 6, padding: "8px 10px", background: "#141414", borderRadius: 10 }}>
        <p style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>Invite Groups</p>
      </div>
    </div>
  );
}

/* ─── main showcase ──────────────────────────────────────────────── */
export function HomeAppShowcase() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-t border-white/[0.06] bg-black pt-24 sm:pt-32">
      {/* glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[520px]"
        style={{ background: "radial-gradient(ellipse 70% 70% at 50% 0%, rgba(75,250,148,0.10), transparent 70%)" }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#4BFA94]">The app</p>
          <h2 className="mt-4 text-6xl font-black uppercase leading-[0.88] tracking-[-0.05em] text-white sm:text-7xl lg:text-8xl">
            RAGE
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-zinc-400">
            Discover, create, and run your nights — all in one place. Built for students. Free to download.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center rounded-full bg-white px-8 text-[11px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-zinc-200"
              style={{ boxShadow: "0 0 30px -6px rgba(255,255,255,0.35)" }}
            >
              Create an event
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-12 items-center rounded-full border border-white/[0.18] px-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:border-white/40"
            >
              Get the app →
            </Link>
          </div>
        </motion.div>
      </div>

      {/* 3-phone display */}
      <div className="relative z-10 mt-16 hidden h-[640px] items-end justify-center sm:flex">
        {/* LEFT phone */}
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 60, rotateZ: -8 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, rotateZ: -6 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.05 }}
          style={{
            transform: "translateY(48px)",
            transformOrigin: "bottom center",
            zIndex: 1,
          }}
          className="-mr-12"
        >
          <div style={{ transform: "scale(0.78)", transformOrigin: "bottom right" }}>
            <PhoneShell>
              <CreateScreen />
            </PhoneShell>
          </div>
        </motion.div>

        {/* CENTER phone — larger, in front */}
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 80 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ zIndex: 3 }}
          className="relative"
        >
          <PhoneShell>
            <HomeFeedScreen />
          </PhoneShell>
        </motion.div>

        {/* RIGHT phone */}
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 60, rotateZ: 8 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, rotateZ: 6 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.05 }}
          style={{
            transform: "translateY(48px)",
            transformOrigin: "bottom center",
            zIndex: 1,
          }}
          className="-ml-12"
        >
          <div style={{ transform: "scale(0.78)", transformOrigin: "bottom left" }}>
            <PhoneShell>
              <InviteScreen />
            </PhoneShell>
          </div>
        </motion.div>
      </div>

      {/* mobile: single phone */}
      <div className="relative z-10 mt-12 flex justify-center sm:hidden">
        <div style={{ transform: "scale(0.85)", transformOrigin: "top center" }}>
          <PhoneShell>
            <HomeFeedScreen />
          </PhoneShell>
        </div>
      </div>
    </section>
  );
}
