"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

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
    body: "Every party, show, and event near you — curated by students, for students.",
    leftTag: "BUILT FOR\nCOLLEGE NIGHTS",
    rightTag: "TRUSTED AT\n500+ CAMPUSES",
    cta: { label: "Browse events", href: "/#browse-events" },
  },
  {
    eyebrow: ".edu verified",
    line1: "School email",
    line2: "only.",
    body: "Only verified students see private events and buy tickets. Real community — no randos.",
    leftTag: "BOTS\nNOT WELCOME",
    rightTag: ".EDU GATED\nBY DEFAULT",
    cta: { label: "Browse events", href: "/#browse-events" },
  },
  {
    eyebrow: "Door flow",
    line1: "Crowd in.",
    line2: "Friction out.",
    body: "QR tickets on your phone, scanned at the door in seconds. Zero paper, zero lines.",
    leftTag: "SCAN.\nGO. DONE.",
    rightTag: "OFFLINE\nREADY",
    cta: { label: "Create event", href: "/create-event" },
  },
];

/* ─── phone screen 1: event feed ────────────────────────────────── */
function FeedScreen({ progress }: { progress: MotionValue<number> }) {
  const items = [
    { tag: "EVENT", tc: "#4BFA94",  title: "Campus Lights Fest",  meta: "Tonight · Main Stage",   votes: 156 },
    { tag: "PARTY", tc: "#f2ef1d",  title: "Pre-game @ Theta 🏠", meta: "9PM · 2.3 mi away",      votes: 47  },
    { tag: "RAVE",  tc: "#a855f7",  title: "Rooftop DJ Set ✦",    meta: "Fri · Riverside Deck",   votes: 89  },
    { tag: ".EDU",  tc: "#4BFA94",  title: "Sophomore Mixer",     meta: "Sat · Student Union",    votes: 34  },
  ];
  const y0 = useTransform(progress, [0.020, 0.120], [22, 0]);
  const y1 = useTransform(progress, [0.045, 0.145], [22, 0]);
  const y2 = useTransform(progress, [0.070, 0.170], [22, 0]);
  const y3 = useTransform(progress, [0.095, 0.195], [22, 0]);
  const o0 = useTransform(progress, [0.020, 0.120], [0, 1]);
  const o1 = useTransform(progress, [0.045, 0.145], [0, 1]);
  const o2 = useTransform(progress, [0.070, 0.170], [0, 1]);
  const o3 = useTransform(progress, [0.095, 0.195], [0, 1]);
  const cardYs = [y0, y1, y2, y3];
  const cardOpacities = [o0, o1, o2, o3];

  return (
    <div style={{ position: "absolute", inset: 0, background: "#0a0a0a", paddingTop: 56 }}>
      <div style={{ padding: "0 12px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#1a1a1a", borderRadius: 20, padding: "8px 12px" }}>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#71717a" strokeWidth={2.5}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <span style={{ fontSize: 11, color: "#71717a" }}>Search events near you...</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, padding: "0 12px 8px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        {["Trending", "Near Me", ".edu Only"].map((t, i) => (
          <span key={t} style={{ fontSize: 11, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? "#4BFA94" : "#52525b", borderBottom: i === 0 ? "2px solid #4BFA94" : "2px solid transparent", paddingBottom: 4 }}>
            {t}
          </span>
        ))}
      </div>
      <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
        {items.map((item, i) => (
          <motion.div
            key={i}
            style={{
              y: cardYs[i],
              opacity: cardOpacities[i],
              background: "#141414",
              borderRadius: 14,
              padding: "10px 12px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "inline-block", background: item.tc + "22", color: item.tc, fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", borderRadius: 4, padding: "2px 5px" }}>
                {item.tag}
              </span>
              <p style={{ margin: "4px 0 2px", fontSize: 12, fontWeight: 600, color: "#fff", lineHeight: 1.25 }}>{item.title}</p>
              <p style={{ fontSize: 10, color: "#52525b" }}>{item.meta}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 }}>
              <span style={{ fontSize: 8, color: "#3f3f46", lineHeight: 1 }}>▲</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#4BFA94" }}>{item.votes}</span>
              <span style={{ fontSize: 8, color: "#3f3f46", lineHeight: 1 }}>▼</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── phone screen 2: .edu verify ───────────────────────────────── */
function VerifyScreen({ progress }: { progress: MotionValue<number> }) {
  const badgeScale = useTransform(progress, [0.32, 0.46], [0.6, 1]);
  const badgeOpacity = useTransform(progress, [0.32, 0.42], [0, 1]);
  const titleY = useTransform(progress, [0.36, 0.48], [16, 0]);
  const titleOpacity = useTransform(progress, [0.36, 0.46], [0, 1]);
  const formY = useTransform(progress, [0.42, 0.54], [20, 0]);
  const formOpacity = useTransform(progress, [0.42, 0.52], [0, 1]);

  return (
    <div style={{ position: "absolute", inset: 0, background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 24px 24px" }}>
      <motion.div
        style={{
          scale: badgeScale,
          opacity: badgeOpacity,
          width: 64, height: 64, borderRadius: 20,
          border: "1px solid rgba(75,250,148,0.3)",
          background: "rgba(75,250,148,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
        }}
      >
        🎓
      </motion.div>
      <motion.p style={{ opacity: titleOpacity, y: titleY, marginTop: 16, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#4BFA94", textAlign: "center" }}>
        .edu required
      </motion.p>
      <motion.p style={{ opacity: titleOpacity, y: titleY, marginTop: 8, fontSize: 18, fontWeight: 900, color: "#fff", textAlign: "center", lineHeight: 1.2 }}>
        Verify your<br />school email
      </motion.p>
      <motion.p style={{ opacity: titleOpacity, y: titleY, marginTop: 10, fontSize: 11, color: "#52525b", textAlign: "center", lineHeight: 1.5 }}>
        Only verified students can access<br />private events and buy tickets.
      </motion.p>
      <motion.div style={{ opacity: formOpacity, y: formY, marginTop: 20, width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ background: "#141414", border: "1px solid #262626", borderRadius: 16, padding: "12px 16px" }}>
          <span style={{ fontSize: 11, color: "#3f3f46" }}>you@university.edu</span>
        </div>
        <div style={{ background: "#4BFA94", borderRadius: 16, padding: "12px 16px", textAlign: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#000" }}>VERIFY &amp; GET IN</span>
        </div>
      </motion.div>
      <p style={{ marginTop: 14, fontSize: 10, color: "#3f3f46", textAlign: "center" }}>Any accredited .edu address works</p>
    </div>
  );
}

/* ─── phone screen 3: QR ticket ─────────────────────────────────── */
function TicketScreen({ progress }: { progress: MotionValue<number> }) {
  const qrScale = useTransform(progress, [0.64, 0.78], [0.7, 1]);
  const qrOpacity = useTransform(progress, [0.64, 0.74], [0, 1]);
  const headY = useTransform(progress, [0.62, 0.74], [12, 0]);
  const headOpacity = useTransform(progress, [0.62, 0.72], [0, 1]);
  const badgeY = useTransform(progress, [0.72, 0.84], [14, 0]);
  const badgeOpacity = useTransform(progress, [0.72, 0.82], [0, 1]);

  const qr = [
    1,1,1,0,1,1,1,
    1,0,1,0,1,0,1,
    1,1,1,1,0,1,1,
    0,1,0,0,1,0,0,
    1,0,1,0,1,1,1,
    0,0,1,0,0,1,0,
    1,1,1,0,1,0,1,
  ];
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 24px 24px" }}>
      <motion.p style={{ opacity: headOpacity, y: headY, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#52525b" }}>
        Your ticket
      </motion.p>
      <motion.p style={{ opacity: headOpacity, y: headY, marginTop: 6, fontSize: 17, fontWeight: 900, color: "#fff", textAlign: "center", lineHeight: 1.2 }}>
        Campus Lights Fest
      </motion.p>
      <motion.p style={{ opacity: headOpacity, y: headY, fontSize: 11, color: "#52525b" }}>
        Tonight · Main Stage · GA
      </motion.p>
      <motion.div style={{ opacity: qrOpacity, scale: qrScale, marginTop: 18, width: 140, height: 140, background: "#fff", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", padding: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, width: "100%", height: "100%" }}>
          {qr.map((c, i) => (
            <div key={i} style={{ background: c ? "#000" : "#fff", borderRadius: 1 }} />
          ))}
        </div>
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
export function PhoneShell({ children, w = 300, h = 620 }: { children: React.ReactNode; w?: number; h?: number }) {
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

  const { scrollY } = useScroll();
  const [top, setTop]     = useState(0);
  const [range, setRange] = useState(2800);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const recalc = () => {
      setTop(el.offsetTop);
      setRange(Math.max(1, el.offsetHeight - window.innerHeight));
    };
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);

  const progress = useTransform(scrollY, [top, top + range], [0, 1], { clamp: true });

  /* scene fades */
  const s1 = useTransform(progress, [0, 0.26, 0.36], [1, 1, 0]);
  const s2 = useTransform(progress, [0.30, 0.40, 0.58, 0.66], [0, 1, 1, 0]);
  const s3 = useTransform(progress, [0.60, 0.70, 1], [0, 1, 1]);

  /* phone screens */
  const p1 = useTransform(progress, [0, 0.28, 0.38], [1, 1, 0]);
  const p2 = useTransform(progress, [0.32, 0.42, 0.60, 0.68], [0, 1, 1, 0]);
  const p3 = useTransform(progress, [0.62, 0.72, 1], [0, 1, 1]);

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

  const sceneOps = [s1, s2, s3];
  const phoneOps = [p1, p2, p3];

  return (
    <div ref={containerRef} className="relative bg-black" style={{ minHeight: "320vh" }}>
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
            Every party, show, and event near you — curated by students, for students.
          </p>
          <Link
            href="/signup"
            className="mt-7 inline-flex h-12 items-center rounded-full bg-[#4BFA94] px-8 text-[11px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-emerald-300"
            style={{ boxShadow: "0 0 32px -6px rgba(75,250,148,0.6)" }}
          >
            Get the app
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
                  {scene.line1}<br />{scene.line2}
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
                <motion.div style={{ opacity: phoneOps[0], position: "absolute", inset: 0, willChange: "opacity" }}>
                  <FeedScreen progress={progress} />
                </motion.div>
                <motion.div style={{ opacity: phoneOps[1], position: "absolute", inset: 0, willChange: "opacity" }}>
                  <VerifyScreen progress={progress} />
                </motion.div>
                <motion.div style={{ opacity: phoneOps[2], position: "absolute", inset: 0, willChange: "opacity" }}>
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
