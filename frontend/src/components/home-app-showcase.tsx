"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { PhoneShell } from "@/components/home-top-section";

/* ─── mini screen mockups ────────────────────────────────────────── */
function CreateScreen() {
  const coverImage =
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=700&q=80";
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0a0a0a", paddingTop: 56, padding: "56px 14px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px 12px" }}>
        <span style={{ fontSize: 16, color: "#fff" }}>←</span>
        <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>Create Event</span>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: "#4BFA94", fontSize: 11, color: "#000", fontWeight: 800 }}>✓</span>
      </div>
      <div
        style={{
          width: "100%",
          aspectRatio: "1",
          borderRadius: 14,
          backgroundImage: `linear-gradient(145deg, rgba(42,10,90,0.58) 0%, rgba(60,15,36,0.48) 100%), url(${coverImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          marginTop: 4,
          boxShadow: "inset 0 -44px 70px rgba(0,0,0,0.5)",
        }}
      />
      <div style={{ marginTop: 12, padding: "10px 12px", background: "#141414", borderRadius: 10 }}>
        <p style={{ fontSize: 10, color: "#52525b", marginBottom: 2 }}>Title</p>
        <p style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>Birthday Party</p>
      </div>
      <div style={{ marginTop: 8, padding: "10px 12px", background: "#141414", borderRadius: 10 }}>
        <p style={{ fontSize: 10, color: "#52525b" }}>Add Host *</p>
      </div>
      <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
        <span style={{ fontSize: 8, color: "#4BFA94", background: "rgba(75,250,148,0.12)", border: "1px solid rgba(75,250,148,0.28)", borderRadius: 999, padding: "4px 8px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Draft saved
        </span>
        <span style={{ fontSize: 8, color: "#71717a", background: "#101010", border: "1px solid #222", borderRadius: 999, padding: "4px 8px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Step 2/4
        </span>
      </div>
    </div>
  );
}

function HomeFeedScreen() {
  const events = [
    {
      date: "21",
      title: "Campus Lights",
      image:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80",
      tint: "linear-gradient(165deg, rgba(48,0,130,0.52) 0%, rgba(18,76,166,0.45) 100%)",
    },
    {
      date: "21",
      title: "Theta Mixer",
      image:
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=700&q=80",
      tint: "linear-gradient(165deg, rgba(120,24,54,0.5) 0%, rgba(84,52,24,0.42) 100%)",
    },
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
          <div
            key={i}
            style={{
              aspectRatio: "1",
              borderRadius: 12,
              backgroundImage: `${e.tint}, url(${e.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              overflow: "hidden",
              padding: 8,
              boxShadow: "inset 0 -40px 60px rgba(0,0,0,0.35)",
            }}
          >
            <div style={{ display: "inline-block", background: "rgba(0,0,0,0.55)", borderRadius: 8, padding: "4px 7px", textAlign: "center" }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{e.date}</p>
              <p style={{ fontSize: 7, color: "#fff", letterSpacing: "0.1em", marginTop: 1 }}>TUE</p>
            </div>
            <p style={{ position: "absolute", left: 8, bottom: 7, fontSize: 8, color: "rgba(255,255,255,0.92)", letterSpacing: "0.03em", fontWeight: 700, textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>
              {e.title}
            </p>
            <p style={{ position: "absolute", right: 7, bottom: 7, fontSize: 7, color: "#d4d4d8", letterSpacing: "0.08em", fontWeight: 700 }}>LIVE</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 10, color: "#52525b", marginTop: 6 }}>Après-Ski Colorado</p>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>'80s in Aspen</p>
      <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
        <span style={{ fontSize: 8, color: "#4BFA94", background: "rgba(75,250,148,0.12)", border: "1px solid rgba(75,250,148,0.24)", borderRadius: 999, padding: "4px 7px", fontWeight: 700 }}>+18% RSVP</span>
        <span style={{ fontSize: 8, color: "#a1a1aa", background: "#111", border: "1px solid #252525", borderRadius: 999, padding: "4px 7px", fontWeight: 700 }}>2.1K views</span>
      </div>
    </div>
  );
}

function InviteScreen() {
  const inviteImage =
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=700&q=80";
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0a0a0a", padding: "56px 12px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 11 }}>↓</span>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 12 }}>···</span>
      </div>
      <div
        style={{
          width: "100%",
          aspectRatio: "1",
          borderRadius: 14,
          backgroundImage: `linear-gradient(150deg, rgba(96,22,22,0.56) 0%, rgba(32,8,8,0.5) 100%), url(${inviteImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          boxShadow: "inset 0 -50px 75px rgba(0,0,0,0.45)",
        }}
      >
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
      <div style={{ marginTop: 8, height: 4, borderRadius: 999, background: "#191919", overflow: "hidden" }}>
        <div style={{ width: "72%", height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #1ea85a 0%, #4BFA94 100%)" }} />
      </div>
      <div
        style={{
          marginTop: 8,
          padding: "8px 10px",
          borderRadius: 999,
          background: "rgba(75,250,148,0.12)",
          border: "1px solid rgba(75,250,148,0.24)",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4BFA94" }} />
        <p style={{ fontSize: 9, color: "#4BFA94", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Sent 24 invites
        </p>
      </div>
      <p style={{ marginTop: 5, fontSize: 8, color: "#71717a", letterSpacing: "0.04em" }}>17 opened · 6 accepted</p>
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
            Discover, create, and run your nights. All in one place. Built for students. Free to download.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/create-event"
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
      <div className="relative z-10 mt-16 hidden h-[640px] items-end justify-center overflow-visible min-[740px]:flex">
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
          className="-mr-4 md:-mr-8 lg:-mr-12"
        >
          <div className="origin-bottom-right scale-[0.62] md:scale-[0.7] lg:scale-[0.78]">
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
          className="-ml-4 md:-ml-8 lg:-ml-12"
        >
          <div className="origin-bottom-left scale-[0.62] md:scale-[0.7] lg:scale-[0.78]">
            <PhoneShell>
              <InviteScreen />
            </PhoneShell>
          </div>
        </motion.div>
      </div>

      {/* mobile: mirror desktop overlap ("sneaking out") */}
      <div className="relative z-10 mt-10 h-[440px] overflow-hidden min-[740px]:hidden">
        <div className="flex h-full items-end justify-center">
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 24, rotateZ: -8 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, rotateZ: -6 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="-mr-24 translate-y-9"
            style={{ zIndex: 1 }}
          >
          <div className="origin-bottom-right scale-[0.52]">
            <PhoneShell>
              <CreateScreen />
            </PhoneShell>
          </div>
          </motion.div>
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 28 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.03 }}
            className="relative"
            style={{ zIndex: 3 }}
          >
          <div className="origin-bottom scale-[0.62]">
            <PhoneShell>
              <HomeFeedScreen />
            </PhoneShell>
          </div>
          </motion.div>
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 24, rotateZ: 8 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, rotateZ: 6 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="-ml-24 translate-y-9"
            style={{ zIndex: 1 }}
          >
          <div className="origin-bottom-left scale-[0.52]">
            <PhoneShell>
              <InviteScreen />
            </PhoneShell>
          </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
