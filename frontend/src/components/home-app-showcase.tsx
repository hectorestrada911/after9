"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { PhoneShell } from "@/components/home-top-section";

/* ─── mini screen mockups ────────────────────────────────────────── */
function CreateScreen() {
  const coverImage =
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=700&q=80";
  return (
    <div style={{ position: "absolute", inset: 0, background: "#000", paddingTop: 56, padding: "56px 14px 14px" }}>
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
  const tabs = ["Trending", "Near Me", ".edu Only", "Music", "Sports"];
  const cards = [
    {
      tag: "EVENT",
      tc: "#4BFA94",
      tagBg: "rgba(75,250,148,0.22)",
      title: "Campus Lights Fest",
      meta: "Tonight · Main Stage",
      going: 156,
      img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=70",
    },
    {
      tag: "PARTY",
      tc: "#facc15",
      tagBg: "rgba(250,204,21,0.18)",
      title: "Pre-game @ Theta 🏠",
      meta: "9PM · 2.3 mi away",
      going: 47,
      img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=70",
    },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, background: "#000", paddingTop: 56, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 12px 8px" }}>
        <span style={{ fontSize: 19, fontWeight: 900, letterSpacing: "-0.03em", color: "#fff" }}>Discover</span>
        <div style={{ position: "relative", width: 28, height: 28, borderRadius: 999, border: "1px solid rgba(255,255,255,0.14)", overflow: "hidden", background: "linear-gradient(145deg,#3f3f46,#18181b)" }}>
          <span
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: "#4BFA94",
              border: "2px solid #000",
            }}
          />
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, padding: "0 12px 8px" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#2c2c2e",
            borderRadius: 20,
            padding: "7px 10px",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#737373" strokeWidth={2.4}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <span style={{ fontSize: 10, color: "#737373" }}>Search events near you...</span>
        </div>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 11,
            background: "#2c2c2e",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
          aria-hidden
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth={2}>
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
        </div>
      </div>
      <div className="no-scrollbar" style={{ display: "flex", gap: 14, padding: "0 12px 6px", overflowX: "auto", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {tabs.map((t, i) => (
          <span
            key={t}
            style={{
              flexShrink: 0,
              fontSize: 10,
              fontWeight: i === 0 ? 700 : 500,
              color: i === 0 ? "#4BFA94" : "#52525b",
              borderBottom: i === 0 ? "2px solid #4BFA94" : "2px solid transparent",
              paddingBottom: 5,
            }}
          >
            {t}
          </span>
        ))}
      </div>
      <div className="no-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "7px 12px 46px", display: "flex", flexDirection: "column", gap: 7 }}>
        {cards.map((item, i) => (
          <div
            key={i}
            style={{
              background: "#1c1c1e",
              borderRadius: 14,
              padding: "8px 8px 8px 7px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                flexShrink: 0,
                backgroundImage: `linear-gradient(160deg, rgba(0,0,0,0.12), rgba(0,0,0,0.42)), url(${item.img})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
            <div style={{ flex: 1, minWidth: 0, position: "relative", paddingRight: 18 }}>
              <div style={{ position: "absolute", top: -1, right: 0, color: "#52525b" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
              </div>
              <span
                style={{
                  display: "inline-block",
                  background: item.tagBg,
                  color: item.tc,
                  fontSize: 7,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  borderRadius: 5,
                  padding: "2px 5px",
                }}
              >
                {item.tag}
              </span>
              <p style={{ margin: "3px 0 1px", fontSize: 11, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{item.title}</p>
              <p style={{ fontSize: 9, color: "#737373" }}>{item.meta}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0, gap: 1 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#4BFA94" }}>{item.going}</span>
              <span style={{ fontSize: 7, fontWeight: 600, color: "#52525b" }}>Going</span>
              <span style={{ color: "#3f3f46", fontSize: 10 }} aria-hidden>
                ›
              </span>
            </div>
          </div>
        ))}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(75,250,148,0.12) 0%, rgba(24,24,27,0.95) 55%)",
            borderRadius: 14,
            padding: "9px 10px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid rgba(75,250,148,0.22)",
          }}
        >
          <div style={{ fontSize: 18, flexShrink: 0 }} aria-hidden>
            🎓
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: "#fff" }}>.edu only events</p>
            <p style={{ margin: "2px 0 0", fontSize: 8, color: "#a1a1aa", lineHeight: 1.35 }}>Verify your .edu to unlock exclusive drops.</p>
          </div>
          <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: "#000", background: "#4BFA94", borderRadius: 8, padding: "7px 8px", flexShrink: 0 }}>
            Verify
          </span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 6, right: 6, bottom: 20, pointerEvents: "none" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            background: "rgba(10,10,10,0.94)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.07)",
            padding: "6px 2px 8px",
          }}
        >
          {[
            { label: "Discover", icon: "◎", active: true },
            { label: "Saved", icon: "♡", active: false },
            { label: "Events", icon: "▦", active: false },
            { label: "Msgs", icon: "✉", active: false },
            { label: "You", icon: "◉", active: false },
          ].map((tab) => (
            <div key={tab.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 36 }}>
              <span style={{ fontSize: 11, color: tab.active ? "#4BFA94" : "#52525b" }} aria-hidden>
                {tab.icon}
              </span>
              <span style={{ fontSize: 7, fontWeight: tab.active ? 700 : 500, color: tab.active ? "#4BFA94" : "#52525b" }}>{tab.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InviteScreen() {
  const inviteImage =
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=700&q=80";
  return (
    <div style={{ position: "absolute", inset: 0, background: "#000", padding: "56px 12px 12px" }}>
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
              href="/login"
              className="inline-flex h-12 items-center rounded-full border border-white/[0.18] px-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:border-white/40"
            >
              Login →
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
