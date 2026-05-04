"use client";

import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import AnimatedTextCycle from "@/components/ui/animated-text-cycle";
import { EduVerifyShieldIcon } from "@/components/edu-verify-shield-icon";

const cyclingPhrases = [
  "Your night.",
  "Your vibe.",
  "Your rage.",
  "Your scene.",
  "Your move.",
  "Your crowd.",
];

/* ─── scene data ─────────────────────────────────────────────────── */
const scenes = [
  {
    eyebrow: "Discover",
    line1: "Your campus.",
    line2: "Your night.",
    cycleWords: ["Your night.", "Your vibe.", "Your scene."],
    body: "Every party, show, and event near you, curated by students, for students.",
    leftTag: "BUILT FOR\nCOLLEGE NIGHTS",
    rightTag: "TRUSTED AT\n500+ CAMPUSES",
    cta: { label: "Sample event", href: "/demo" },
  },
  {
    eyebrow: ".edu verified",
    line1: "School email",
    line2: "only.",
    cycleWords: ["only.", "verified.", "protected."],
    body: "Only verified students see private events and buy tickets. Real community, no randos.",
    leftTag: "BOTS\nNOT WELCOME",
    rightTag: ".EDU GATED\nBY DEFAULT",
    cta: { label: "Verify your .edu", href: "/verify-edu" },
  },
  {
    eyebrow: "Door flow",
    line1: "Crowd in.",
    line2: "Friction out.",
    cycleWords: ["Friction out.", "Scan in.", "Go fast."],
    body: "QR tickets on your phone, scanned at the door in seconds. Zero paper, zero lines.",
    leftTag: "SCAN.\nGO. DONE.",
    rightTag: "OFFLINE\nREADY",
    cta: { label: "Create event", href: "/create-event" },
  },
];

/* Discover-style feed tokens (match product mock: black canvas, iOS-like cards, lime signal) */
const DISCOVER_BG = "#000000";
const DISCOVER_CARD = "#1c1c1e";
const DISCOVER_SEARCH = "#2c2c2e";
const SIGNAL = "#4BFA94";

/* ─── phone screen 1: event feed (Discover) ─────────────────────── */
function FeedScreen({ progress }: { progress: MotionValue<number> }) {
  const tabs = ["Trending", "Near Me", ".edu Only", "Music", "Sports", "Art"];
  const items = [
    {
      tag: "EVENT",
      tc: SIGNAL,
      tagBg: "rgba(75,250,148,0.22)",
      title: "Campus Lights Fest",
      meta: "Tonight · Main Stage",
      going: 156,
      img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=70",
    },
    {
      tag: "PARTY",
      tc: "#facc15",
      tagBg: "rgba(250,204,21,0.18)",
      title: "Pre-game @ Theta 🏠",
      meta: "9PM · 2.3 mi away",
      going: 47,
      img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=300&q=70",
    },
    {
      tag: "RAVE",
      tc: "#c084fc",
      tagBg: "rgba(192,132,252,0.18)",
      title: "Rooftop DJ Set ✦",
      meta: "Fri · Riverside Deck",
      going: 89,
      img: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=300&q=70",
    },
    {
      tag: ".EDU",
      tc: SIGNAL,
      tagBg: "rgba(75,250,148,0.22)",
      title: "Sophomore Mixer",
      meta: "Sat · Student Union",
      going: 34,
      img: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=300&q=70",
    },
  ];
  const y0 = useTransform(progress, [0.020, 0.120], [22, 0]);
  const y1 = useTransform(progress, [0.045, 0.145], [22, 0]);
  const y2 = useTransform(progress, [0.070, 0.170], [22, 0]);
  const y3 = useTransform(progress, [0.095, 0.195], [22, 0]);
  const yEdu = useTransform(progress, [0.080, 0.180], [18, 0]);
  const oEdu = useTransform(progress, [0.080, 0.180], [0, 1]);
  const o0 = useTransform(progress, [0.020, 0.120], [0, 1]);
  const o1 = useTransform(progress, [0.045, 0.145], [0, 1]);
  const o2 = useTransform(progress, [0.070, 0.170], [0, 1]);
  const o3 = useTransform(progress, [0.095, 0.195], [0, 1]);
  const cardYs = [y0, y1, y2, y3];
  const cardOpacities = [o0, o1, o2, o3];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: DISCOVER_BG,
        paddingTop: 56,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* title row + avatar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 14px 10px" }}>
        <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em", color: "#fff" }}>Discover</span>
        <div style={{ position: "relative", width: 32, height: 32, borderRadius: 999, overflow: "hidden", border: "1px solid rgba(255,255,255,0.14)" }}>
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(145deg, #3f3f46 0%, #18181b 100%)",
            }}
          />
          <span
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: SIGNAL,
              border: "2px solid #000",
              boxShadow: "0 0 0 1px rgba(75,250,148,0.35)",
            }}
          />
        </div>
      </div>

      {/* search + filter */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px 10px" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: DISCOVER_SEARCH,
            borderRadius: 22,
            padding: "9px 12px",
            minWidth: 0,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#737373" strokeWidth={2.4}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <span style={{ fontSize: 11, color: "#737373", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Search events near you...
          </span>
        </div>
        <button
          type="button"
          aria-hidden
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.08)",
            background: DISCOVER_SEARCH,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth={2}>
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
        </button>
      </div>

      {/* scroll category tabs */}
      <div
        className="no-scrollbar"
        style={{
          display: "flex",
          gap: 18,
          padding: "0 12px 8px",
          overflowX: "auto",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {tabs.map((t, i) => (
          <span
            key={t}
            style={{
              flexShrink: 0,
              fontSize: 11,
              fontWeight: i === 0 ? 700 : 500,
              color: i === 0 ? SIGNAL : "#52525b",
              borderBottom: i === 0 ? `2px solid ${SIGNAL}` : "2px solid transparent",
              paddingBottom: 6,
            }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* scrollable list */}
      <div className="no-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "8px 12px 52px", display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => (
          <motion.div
            key={i}
            style={{
              y: cardYs[i],
              opacity: cardOpacities[i],
              background: DISCOVER_CARD,
              borderRadius: 16,
              padding: "9px 10px 9px 9px",
              display: "flex",
              alignItems: "center",
              gap: 9,
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 12px 28px -18px rgba(0,0,0,0.85)",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                flexShrink: 0,
                backgroundImage: `linear-gradient(160deg, rgba(0,0,0,0.12), rgba(0,0,0,0.42)), url(${item.img})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
            <div style={{ flex: 1, minWidth: 0, position: "relative", paddingRight: 22 }}>
              <div style={{ position: "absolute", top: -2, right: 0, color: "#52525b" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
              </div>
              <span
                style={{
                  display: "inline-block",
                  background: item.tagBg,
                  color: item.tc,
                  fontSize: 8,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  borderRadius: 6,
                  padding: "2px 6px",
                }}
              >
                {item.tag}
              </span>
              <p style={{ margin: "4px 0 2px", fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.25 }}>{item.title}</p>
              <p style={{ fontSize: 10, color: "#737373" }}>{item.meta}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0, paddingRight: 2 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: SIGNAL, letterSpacing: "-0.02em" }}>{item.going}</span>
              <span style={{ fontSize: 8, fontWeight: 600, color: "#52525b", textTransform: "capitalize", letterSpacing: "0.04em" }}>Going</span>
              <span style={{ marginTop: 2, color: "#3f3f46", fontSize: 11, lineHeight: 1 }} aria-hidden>
                ›
              </span>
            </div>
          </motion.div>
        ))}

        <motion.div
          style={{
            y: yEdu,
            opacity: oEdu,
            background: "linear-gradient(135deg, rgba(75,250,148,0.12) 0%, rgba(24,24,27,0.95) 55%)",
            borderRadius: 16,
            padding: "11px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: "1px solid rgba(75,250,148,0.22)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "rgba(75,250,148,0.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              flexShrink: 0,
            }}
            aria-hidden
          >
            🎓
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>.edu only events</p>
            <p style={{ margin: "3px 0 0", fontSize: 9, color: "#a1a1aa", lineHeight: 1.35 }}>
              Verify your .edu email to unlock exclusive events and access.
            </p>
          </div>
          <span
            style={{
              flexShrink: 0,
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#000",
              background: SIGNAL,
              borderRadius: 10,
              padding: "8px 10px",
              boxShadow: "0 8px 20px -8px rgba(75,250,148,0.55)",
            }}
          >
            Verify
          </span>
        </motion.div>
      </div>

      {/* bottom tab bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 22,
          padding: "0 8px",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            background: "rgba(10,10,10,0.92)",
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.07)",
            padding: "8px 4px 10px",
            boxShadow: "0 -16px 40px rgba(0,0,0,0.5)",
          }}
        >
          {[
            { label: "Discover", active: true, icon: "◎" },
            { label: "Saved", active: false, icon: "♡" },
            { label: "My Events", active: false, icon: "▦" },
            { label: "Messages", active: false, icon: "✉" },
            { label: "Profile", active: false, icon: "◉" },
          ].map((tab) => (
            <div key={tab.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 44 }}>
              <span style={{ fontSize: 13, color: tab.active ? SIGNAL : "#52525b", lineHeight: 1 }} aria-hidden>
                {tab.icon}
              </span>
              <span
                style={{
                  fontSize: 8,
                  fontWeight: tab.active ? 700 : 500,
                  color: tab.active ? SIGNAL : "#52525b",
                  letterSpacing: "0.02em",
                }}
              >
                {tab.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── phone screen 2: .edu verify (matches marketing verify mockups) ─ */
function VerifyScreen({ progress }: { progress: MotionValue<number> }) {
  const reduceMotion = useReducedMotion();
  const badgeScale = useTransform(progress, [0.32, 0.46], [0.6, 1]);
  const badgeOpacity = useTransform(progress, [0.32, 0.42], [0, 1]);
  const titleY = useTransform(progress, [0.36, 0.48], [14, 0]);
  const titleOpacity = useTransform(progress, [0.36, 0.46], [0, 1]);
  const formY = useTransform(progress, [0.42, 0.54], [18, 0]);
  const formOpacity = useTransform(progress, [0.42, 0.52], [0, 1]);
  const whyOpacity = useTransform(progress, [0.46, 0.58], [0, 1]);
  const whyY = useTransform(progress, [0.46, 0.58], [12, 0]);

  const muted = "#737373";
  const card = "#1c1c1e";

  return (
    <div style={{ position: "absolute", inset: 0, background: "#000", paddingTop: 56, display: "flex", flexDirection: "column" }}>
      <div style={{ flexShrink: 0, padding: "2px 14px 6px" }}>
        <span aria-hidden style={{ display: "inline-flex", color: "#a3a3a3", fontSize: 22, lineHeight: 1, fontWeight: 300 }}>
          ‹
        </span>
      </div>

      <div className="no-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 14px 20px" }}>
        <motion.div
          style={{
            display: "flex",
            justifyContent: "center",
            scale: badgeScale,
            opacity: badgeOpacity,
            marginBottom: 6,
            marginTop: 4,
          }}
        >
          <motion.div
            style={{
              width: 62,
              height: 62,
              borderRadius: 18,
              background: "rgba(75,250,148,0.08)",
              border: "1px solid rgba(75,250,148,0.28)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 24px rgba(75,250,148,0.16)",
            }}
            animate={reduceMotion ? undefined : { scale: [1, 1.03, 1] }}
            transition={reduceMotion ? undefined : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <EduVerifyShieldIcon size={40} />
          </motion.div>
        </motion.div>

        <motion.p style={{ opacity: titleOpacity, y: titleY, margin: 0, textAlign: "center", fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", color: "#4BFA94", textTransform: "uppercase" }}>
          .edu required
        </motion.p>
        <motion.h2
          style={{
            opacity: titleOpacity,
            y: titleY,
            margin: "8px 0 0",
            textAlign: "center",
            fontSize: 17,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            color: "#fff",
            lineHeight: 1.15,
          }}
        >
          Verify your .edu email
        </motion.h2>
        <motion.p style={{ opacity: titleOpacity, y: titleY, margin: "6px 0 0", textAlign: "center", fontSize: 10, color: "#9ca3af", lineHeight: 1.4 }}>
          Student-only events and perks.
        </motion.p>

        <motion.div style={{ opacity: formOpacity, y: formY, marginTop: 12, width: "100%" }}>
          <p style={{ margin: "0 0 5px", fontSize: 10, fontWeight: 600, color: "#a1a1aa" }}>Your .edu email</p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: card,
              border: "1px solid rgba(75,250,148,0.35)",
              borderRadius: 14,
              padding: "11px 12px",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04), 0 0 18px rgba(75,250,148,0.12)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" aria-hidden>
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>
            <span style={{ fontSize: 11, color: "#71717a" }}>name@school.edu</span>
          </div>
          <p style={{ margin: "6px 0 0", display: "flex", alignItems: "center", gap: 5, fontSize: 8, color: "#737373", lineHeight: 1.35 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2" style={{ flexShrink: 0 }} aria-hidden>
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>We&apos;ll email a link—no spam.</span>
          </p>

          <div style={{ position: "relative", marginTop: 10, borderRadius: 14, overflow: "hidden", background: "#4BFA94", boxShadow: "0 12px 28px rgba(75,250,148,0.28)" }}>
            <span
              style={{
                position: "relative",
                zIndex: 2,
                display: "block",
                padding: "11px 12px",
                textAlign: "center",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.02em",
                color: "#000",
              }}
            >
              Verify student email
            </span>
            <motion.div
              aria-hidden
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: 48,
                background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.28), rgba(255,255,255,0))",
                transform: "skewX(-16deg)",
              }}
              animate={reduceMotion ? undefined : { x: [-60, 220] }}
              transition={reduceMotion ? undefined : { duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            />
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 8, color: "#52525b", textAlign: "center" }}>.edu addresses only</p>
        </motion.div>

        <motion.div style={{ opacity: whyOpacity, y: whyY, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
            <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", color: "#737373", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              Why verify
            </span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          </div>
          {[
            {
              icon: (
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              ),
              title: "Trusted community",
              body: "Keeps bots and randos out.",
            },
            {
              icon: (
                <>
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </>
              ),
              title: "Exclusive access",
              body: "Campus events and perks.",
            },
          ].map((row) => (
            <div key={row.title} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4BFA94" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {row.icon}
                </svg>
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: "#fafafa" }}>{row.title}</p>
                <p style={{ margin: "2px 0 0", fontSize: 8, color: "#737373", lineHeight: 1.3 }}>{row.body}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/* ─── phone screen 3: QR ticket ─────────────────────────────────── */
function TicketScreen({ progress }: { progress: MotionValue<number> }) {
  const reduceMotion = useReducedMotion();
  const qrScale = useTransform(progress, [0.64, 0.78], [0.7, 1]);
  const qrOpacity = useTransform(progress, [0.64, 0.74], [0, 1]);
  const headY = useTransform(progress, [0.62, 0.74], [12, 0]);
  const headOpacity = useTransform(progress, [0.62, 0.72], [0, 1]);
  const badgeY = useTransform(progress, [0.72, 0.84], [14, 0]);
  const badgeOpacity = useTransform(progress, [0.72, 0.82], [0, 1]);
  const scanOpacity = useTransform(progress, [0.72, 0.78, 0.9, 1], [0, 1, 1, 0.3]);

  const qrRows = [
    "111111100001011111111",
    "100000101111010000001",
    "101110100010010111101",
    "101110101001010111101",
    "101110100111010111101",
    "100000101010010000001",
    "111111101010011111111",
    "000000000111000000000",
    "100101111010111010011",
    "011001001111010001110",
    "101110111001111000101",
    "001011000111001110100",
    "110100111000111011001",
    "000000001101000001000",
    "111111101001011111010",
    "100000101111010000111",
    "101110101001110111101",
    "101110100110010111001",
    "101110101010011011101",
    "100000100111001001001",
    "111111101001010111111",
  ];
  const qrModules = qrRows.join("").split("");
  return (
    <div style={{ position: "absolute", inset: 0, background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 24px 24px" }}>
      <motion.p style={{ opacity: headOpacity, y: headY, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#52525b" }}>
        Your ticket
      </motion.p>
      <motion.p style={{ opacity: headOpacity, y: headY, marginTop: 6, fontSize: 17, fontWeight: 900, color: "#fff", textAlign: "center", lineHeight: 1.2 }}>
        Campus Lights Fest
      </motion.p>
      <motion.p style={{ opacity: headOpacity, y: headY, fontSize: 11, color: "#52525b" }}>
        Tonight · Main Stage · GA
      </motion.p>
      <motion.div
        style={{
          opacity: qrOpacity,
          scale: qrScale,
          marginTop: 14,
          width: 152,
          height: 152,
          background: "linear-gradient(180deg, #090b12 0%, #05070d 100%)",
          borderRadius: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 12,
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 14px 28px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.035)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(21, 1fr)", gap: 1.2, width: "100%", height: "100%" }}>
          {qrModules.map((cell, i) => (
            <div key={i} style={{ background: cell === "1" ? "#f5f8ff" : "#0a1020", borderRadius: 0.8 }} />
          ))}
        </div>
        <motion.div
          aria-hidden
          style={{
            opacity: scanOpacity,
            position: "absolute",
            left: 12,
            right: 12,
            top: 12,
            height: 3,
            borderRadius: 999,
            background: "linear-gradient(90deg, rgba(75,250,148,0), rgba(75,250,148,0.95), rgba(75,250,148,0))",
            boxShadow: "0 0 10px rgba(75,250,148,0.7)",
          }}
          animate={reduceMotion ? undefined : { y: [0, 118, 0] }}
          transition={reduceMotion ? undefined : { duration: 3.1, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      <motion.div style={{ opacity: badgeOpacity, y: badgeY, marginTop: 14, display: "flex", alignItems: "center", gap: 7, background: "rgba(75,250,148,0.12)", borderRadius: 999, padding: "7px 16px" }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4BFA94" }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: "#4BFA94" }}>VALID · SCAN TO ENTER</span>
      </motion.div>
      <p style={{ marginTop: 14, fontSize: 10, color: "#3f3f46", textAlign: "center", lineHeight: 1.6 }}>Show this at the door.<br />Works offline.</p>
    </div>
  );
}

/* ─── titanium phone shell ──────────────────────────────────────── */
export function PhoneShell({ children, w = 300, h = 620 }: { children: ReactNode; w?: number; h?: number }) {
  const frameW = 7;
  const innerR = 50;
  const frameR = 58;

  const buttonGrad = "linear-gradient(to bottom, #2c2c2e 0%, #4d4d50 40%, #4d4d50 60%, #2c2c2e 100%)";

  return (
    <div style={{ position: "relative", width: w, height: h, flexShrink: 0 }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: frameR,
        background: "#0b0b0d",
        boxShadow: [
          "inset 0 0 0 1px rgba(255,255,255,0.10)",
          "inset 0 1.5px 0 rgba(255,255,255,0.06)",
          "0 30px 80px -24px rgba(0,0,0,0.85)",
        ].join(", "),
      }} />

      <div aria-hidden style={{
        position: "absolute", inset: 0, borderRadius: frameR, pointerEvents: "none",
        background: "linear-gradient(90deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 6%, rgba(255,255,255,0) 94%, rgba(255,255,255,0.07) 100%)",
      }} />

      {/* volume notches */}
      <div style={{ position: "absolute", left: -4, top: 100, width: 4, height: 26, borderRadius: 2, background: buttonGrad, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), -1px 0 1.5px rgba(0,0,0,0.6)" }} />
      <div style={{ position: "absolute", left: -4, top: 138, width: 4, height: 44, borderRadius: 2, background: buttonGrad, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), -1px 0 1.5px rgba(0,0,0,0.6)" }} />
      <div style={{ position: "absolute", left: -4, top: 192, width: 4, height: 44, borderRadius: 2, background: buttonGrad, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), -1px 0 1.5px rgba(0,0,0,0.6)" }} />
      <div style={{ position: "absolute", right: -4, top: 162, width: 4, height: 72, borderRadius: 2, background: buttonGrad, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), 1px 0 1.5px rgba(0,0,0,0.6)" }} />

      <div style={{
        position: "absolute",
        top: frameW, left: frameW,
        right: frameW, bottom: frameW,
        borderRadius: innerR,
        overflow: "hidden",
        background: "#000",
        boxShadow: "inset 0 0 0 1.5px #000, inset 0 0 22px rgba(0,0,0,0.6)",
      }}>
        {/* status bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 52, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px 0" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>9:41</span>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="16" height="11" viewBox="0 0 16 11" fill="white"><rect x="0" y="4" width="3" height="7" rx="1" /><rect x="4" y="2.5" width="3" height="8.5" rx="1" /><rect x="8" y="1" width="3" height="10" rx="1" /><rect x="12" y="0" width="3" height="11" rx="1" /></svg>
          </div>
        </div>

        {/* Dynamic island */}
        <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 118, height: 32, borderRadius: 20, background: "#000", zIndex: 30, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px" }}>
          <div style={{ position: "relative", width: 8, height: 8, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, #1a4a6e 0%, #0a1828 55%, #000 100%)", boxShadow: "inset 0 0 1px rgba(120,180,220,0.45)" }}>
            <div style={{ position: "absolute", top: 1, left: 1, width: 2.5, height: 2.5, borderRadius: "50%", background: "rgba(180,220,255,0.65)", filter: "blur(0.3px)" }} />
          </div>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #2a2a2c 0%, #050505 70%)", boxShadow: "inset 0 0 1px rgba(255,255,255,0.08)" }} />
        </div>

        {children}

        {/* Home bar */}
        <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", width: 120, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.95)", boxShadow: "0 0 8px rgba(255,255,255,0.3)" }} />
      </div>
    </div>
  );
}

/* ─── main component ─────────────────────────────────────────────── */
export function HomeTopSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setPhraseIdx(i => (i + 1) % cyclingPhrases.length), 2200);
    return () => clearInterval(id);
  }, [reduceMotion]);

  // Use a manual offsetTop-based calculation instead of useScroll({target,offset}).
  // useScroll with target can mis-measure on certain layouts (Framer warns
  // when the scroll container isn't non-static), so compute progress directly
  // from window scrollY against the section's measured top + scrollable range.
  const { scrollY } = useScroll();
  const [sectionTop, setSectionTop] = useState(0);
  const [sectionRange, setSectionRange] = useState(2400);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const recalc = () => {
      setSectionTop(el.offsetTop);
      setSectionRange(Math.max(1, el.offsetHeight - window.innerHeight));
    };
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);

  const progress = useTransform(
    scrollY,
    [sectionTop, sectionTop + sectionRange],
    [0, 1],
    { clamp: true }
  );

  /* scene fades */
  const s1 = useTransform(progress, [0, 0.20, 0.30], [1, 1, 0]);
  const s2 = useTransform(progress, [0.24, 0.34, 0.54, 0.64], [0, 1, 1, 0]);
  const s3 = useTransform(progress, [0.56, 0.66, 1], [0, 1, 1]);

  /* phone screens */
  const p1 = useTransform(progress, [0, 0.22, 0.32], [1, 1, 0]);
  const p2 = useTransform(progress, [0.26, 0.36, 0.56, 0.66], [0, 1, 1, 0]);
  const p3 = useTransform(progress, [0.58, 0.68, 1], [0, 1, 1]);

  /*
   * Phone is VISIBLE on initial load — angled at bottom of screen like doorlist.
   * Rises and straightens as user scrolls. rotateZ starts tilted, normalises.
   */
  const phoneY       = useTransform(progress, [0, 0.28, 1],   [320, 0, -16]);
  const phoneRotateX = useTransform(progress, [0, 0.28, 1],   [-10, 0, 2]);
  const phoneRotateY = useTransform(progress, [0, 0.28, 0.7, 1], [-8, 0, -5, -10]);
  const phoneRotateZ = useTransform(progress, [0, 0.28, 1],   [-6, 0, 3]);

  /* hero headline visible immediately, fades out as side text appears */
  const heroOpacity = useTransform(progress, [0, 0.22, 0.40], [1, 1, 0]);
  const heroY       = useTransform(progress, [0.22, 0.40], [0, -28]);

  /* side text slides in as phone settles */
  const sideOpacity = useTransform(progress, [0.24, 0.44], [0, 1]);
  const sideXL      = useTransform(progress, [0.24, 0.44], [-32, 0]);
  const sideXR      = useTransform(progress, [0.24, 0.44], [32, 0]);

  /* glow behind phone */
  const glowOpacity = useTransform(progress, [0, 0.30, 0.7, 1], [0.4, 0.9, 0.85, 0.5]);

  /* scroll hint */
  const hintOpacity = useTransform(progress, [0, 0.06], [1, 0]);

  /* Above phone: fill empty space after hero fades. On lg+, fade out as side columns take over. */
  const digestMount = useTransform(progress, [0.24, 0.36, 1], [0, 1, 1]);
  const digestDesktopOpacity = useTransform([digestMount, sideOpacity], ([m, s]) => {
    const mount = typeof m === "number" ? m : 0;
    const side = typeof s === "number" ? s : 0;
    return mount * (1 - Math.min(1, side * 1.05));
  });

  const sceneOps = [s1, s2, s3];
  const phoneOps = [p1, p2, p3];

  return (
    <div
      ref={containerRef}
      className="relative bg-black"
      style={{ minHeight: "320vh" }}
    >
      <div className="sticky top-0 h-screen" style={{ overflow: "clip" }}>

        {/* ambient glows — radial gradients (no `filter: blur`) so we don't repaint on scroll */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(circle at 12% 25%, rgba(75,250,148,0.06), transparent 38%), radial-gradient(circle at 88% 88%, rgba(0,0,254,0.05), transparent 40%)",
          }}
        />

        {/* ── MOBILE / TABLET: scene headline above phone (lg+ use side columns instead) ── */}
        <motion.div
          style={{ opacity: digestMount }}
          className="pointer-events-none absolute inset-x-0 top-[max(4.5rem,8svh)] z-[11] hidden max-lg:block"
        >
          <div className="relative mx-auto min-h-[7.5rem] w-full max-w-md px-5">
            {scenes.map((scene, i) => (
              <motion.div
                key={scene.eyebrow}
                className="pointer-events-auto absolute inset-x-0 top-0 flex flex-col items-center text-center"
                style={{ opacity: sceneOps[i] }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#4BFA94]">{scene.eyebrow}</p>
                <h2 className="mt-1.5 text-2xl font-black uppercase leading-[0.92] tracking-[-0.03em] text-white sm:text-3xl">
                  {scene.line1}
                  <br />
                  <span className="bg-gradient-to-r from-[#4BFA94] to-emerald-300 bg-clip-text text-transparent">{scene.line2}</span>
                </h2>
                <Link
                  href={scene.cta.href}
                  className="mt-3 inline-flex h-10 items-center rounded-full bg-[#4BFA94] px-6 text-[10px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-emerald-300"
                  style={{ boxShadow: "0 0 20px -4px rgba(75,250,148,0.45)" }}
                >
                  {scene.cta.label}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: digestDesktopOpacity }}
          className="pointer-events-none absolute inset-x-0 top-[max(3.5rem,7svh)] z-[11] hidden lg:block"
        >
          <div className="relative mx-auto min-h-[6rem] w-full max-w-lg px-8">
            {scenes.map((scene, i) => (
              <motion.div
                key={`dt-${scene.eyebrow}`}
                className="pointer-events-auto absolute inset-x-0 top-0 flex flex-col items-center text-center"
                style={{ opacity: sceneOps[i] }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#4BFA94]">{scene.eyebrow}</p>
                <h2 className="mt-1 text-xl font-black uppercase leading-[0.95] tracking-[-0.03em] text-white sm:text-2xl">
                  {scene.line1}{" "}
                  <span className="bg-gradient-to-r from-[#4BFA94] to-emerald-300 bg-clip-text text-transparent">{scene.line2}</span>
                </h2>
                <Link
                  href={scene.cta.href}
                  className="mt-2.5 inline-flex h-9 items-center rounded-full bg-[#4BFA94] px-5 text-[10px] font-bold uppercase tracking-[0.12em] text-black transition hover:bg-emerald-300"
                  style={{ boxShadow: "0 0 16px -4px rgba(75,250,148,0.4)" }}
                >
                  {scene.cta.label}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── HERO HEADLINE — visible on load, fades as side text takes over ── */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="absolute inset-x-0 top-0 z-10 flex flex-col items-center px-6 pt-[10vh] text-center"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#4BFA94]">
            Discover
          </p>
          <h1 className="mt-3 text-5xl font-black uppercase leading-[0.88] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            Your campus.<br />
            <span className="relative inline-block overflow-hidden" style={{ minWidth: "8ch" }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={phraseIdx}
                  className="inline-block bg-gradient-to-r from-[#4BFA94] to-emerald-300 bg-clip-text text-transparent"
                  initial={{ y: "60%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-60%", opacity: 0 }}
                  transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {cyclingPhrases[phraseIdx]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>
          <p className="mt-5 max-w-[280px] text-sm leading-relaxed text-zinc-500">
            Every party, show, and event near you, curated by students, for students.
          </p>
          <Link
            href="/create-event"
            className="mt-7 inline-flex h-12 items-center rounded-full bg-[#4BFA94] px-8 text-[11px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-emerald-300"
            style={{ boxShadow: "0 0 32px -6px rgba(75,250,148,0.6)" }}
          >
            Create event
          </Link>
        </motion.div>

        {/* ── LEFT SIDE TEXT ── */}
        <div className="absolute top-1/2 z-10 hidden -translate-y-[60%] lg:block" style={{ left: "5vw" }}>
          <motion.div style={{ opacity: sideOpacity, x: sideXL }}>
            {scenes.map((scene, i) => (
              <motion.div
                key={i}
                style={{
                  opacity: sceneOps[i],
                  position: i === 0 ? "relative" : "absolute",
                  top: i === 0 ? "auto" : 0,
                  left: i === 0 ? "auto" : 0,
                }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#4BFA94]">
                  {scene.eyebrow}
                </p>
                <h2 className="mt-2 w-[220px] text-2xl font-black uppercase leading-[0.92] tracking-[-0.03em] text-white lg:text-3xl">
                  {scene.line1}
                  <br />
                  <AnimatedTextCycle
                    words={scene.cycleWords ?? [scene.line2]}
                    interval={2200}
                    className="text-2xl font-black uppercase tracking-[-0.03em] text-white lg:text-3xl"
                  />
                </h2>
                <p className="mt-3 w-[200px] text-[12px] leading-relaxed text-zinc-500">
                  {scene.body}
                </p>
                <Link
                  href={scene.cta.href}
                  className="mt-5 inline-flex h-10 items-center rounded-full bg-[#4BFA94] px-6 text-[10px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-emerald-300"
                  style={{ boxShadow: "0 0 20px -4px rgba(75,250,148,0.45)" }}
                >
                  {scene.cta.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT SIDE TAGS ── */}
        <div className="absolute top-1/2 z-10 hidden -translate-y-[60%] text-right lg:block" style={{ right: "5vw" }}>
          <motion.div style={{ opacity: sideOpacity, x: sideXR }}>
            {scenes.map((scene, i) => (
              <motion.div
                key={i}
                style={{
                  opacity: sceneOps[i],
                  position: i === 0 ? "relative" : "absolute",
                  top: i === 0 ? "auto" : 0,
                  right: i === 0 ? "auto" : 0,
                }}
              >
                <p className="whitespace-pre text-right text-[10px] font-bold uppercase leading-[1.6] tracking-[0.22em] text-zinc-600">
                  {scene.rightTag}
                </p>
                <p className="mt-4 whitespace-pre text-right text-[10px] font-bold uppercase leading-[1.6] tracking-[0.22em] text-zinc-700">
                  {scene.leftTag}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── PHONE — visible on load at angle, rises and straightens on scroll ── */}
        <div className="absolute bottom-0 left-1/2 z-[5]" style={{ transform: "translateX(-50%)" }}>
          <motion.div
            aria-hidden
            style={{
              opacity: glowOpacity,
              position: "absolute",
              bottom: 0,
              left: "50%",
              width: 560, height: 560,
              translate: "-50% 20%",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(75,250,148,0.22), transparent 62%)",
              pointerEvents: "none",
              willChange: "opacity",
            }}
          />
          <div style={{ perspective: "1500px", transform: "translateZ(0)" }}>
            <motion.div
              style={
                reduceMotion
                  ? { transform: "translateZ(0)" }
                  : {
                      y: phoneY,
                      rotateX: phoneRotateX,
                      rotateY: phoneRotateY,
                      rotateZ: phoneRotateZ,
                      willChange: "transform",
                      backfaceVisibility: "hidden",
                      transformStyle: "preserve-3d",
                    }
              }
            >
              <PhoneShell>
                <motion.div style={{ opacity: phoneOps[0], position: "absolute", inset: 0, willChange: "opacity", transform: "translateZ(0)" }}>
                  <FeedScreen progress={progress} />
                </motion.div>
                <motion.div style={{ opacity: phoneOps[1], position: "absolute", inset: 0, willChange: "opacity", transform: "translateZ(0)" }}>
                  <VerifyScreen progress={progress} />
                </motion.div>
                <motion.div style={{ opacity: phoneOps[2], position: "absolute", inset: 0, willChange: "opacity", transform: "translateZ(0)" }}>
                  <TicketScreen progress={progress} />
                </motion.div>
              </PhoneShell>
            </motion.div>
          </div>
        </div>

        {/* progress dots */}
        <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-2">
          {phoneOps.map((op, i) => (
            <motion.div key={i} style={{ opacity: op }} className="h-1.5 w-1.5 rounded-full bg-[#4BFA94]" />
          ))}
        </div>

        {/* scroll hint */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
        >
          <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-600">
            Scroll
          </span>
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, 7, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="h-5 w-px rounded-full bg-zinc-600"
          />
        </motion.div>

      </div>
    </div>
  );
}
