"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

/** Same-origin poster: avoids extra DNS + competes less with hero text for bandwidth. */
const POSTER = "/host-review-scene.jpg";

type Props = {
  className?: string;
};

function getNetworkHints() {
  if (typeof navigator === "undefined") return { saveData: false, slow: false, reduceMotion: false };
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  const saveData = Boolean(conn?.saveData);
  const et = conn?.effectiveType;
  const slow = et === "slow-2g" || et === "2g" || et === "3g";
  const reduceMotion =
    typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return { saveData, slow, reduceMotion };
}

/**
 * Banner video: `public/a9-banner.mp4` is large (~10MB) — biggest win is re-encoding (720p H.264 + `faststart`, target ≤3MB) and/or a short WebM.
 * - Below `lg` (1024px): tap-to-play only so phones/tablets never download the file until the user asks.
 * - Wide desktop: in-view + idle (or timeout) before setting `src` so critical JS/CSS/fonts go first.
 * - Save-data, reduced motion, or slow network: same tap gate as mobile.
 */
export function HomeBannerVideo({ className }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [shouldLoadSrc, setShouldLoadSrc] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const { saveData, slow, reduceMotion } = getNetworkHints();
      const compactViewport =
        typeof window.matchMedia === "function" && window.matchMedia("(max-width: 1023px)").matches;
      setNeedsTap(saveData || slow || reduceMotion || compactViewport);
    });
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        setInView(true);
        io.disconnect();
      },
      { rootMargin: "120px", threshold: 0.06 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    if (needsTap) return;

    let cancelled = false;
    const start = () => {
      if (!cancelled) setShouldLoadSrc(true);
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 2800 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }
    const t = window.setTimeout(start, 1100);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [inView, needsTap]);

  useEffect(() => {
    if (!shouldLoadSrc) return;
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {
      /* autoplay policies */
    });
  }, [shouldLoadSrc]);

  function onTapPlay() {
    setNeedsTap(false);
    setShouldLoadSrc(true);
  }

  const showVideo = shouldLoadSrc;

  return (
    <div ref={root} className={`relative ${className ?? ""}`}>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        poster={POSTER}
        muted
        loop
        playsInline
        preload="none"
        controls={false}
        {...(showVideo ? { src: "/a9-banner.mp4" } : {})}
        {...({ fetchPriority: "low" } as Record<string, string>)}
      />

      {inView && !showVideo && needsTap && (
        <button
          type="button"
          onClick={onTapPlay}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/35 text-white backdrop-blur-[2px] transition hover:bg-black/45"
          aria-label="Play background video"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-black shadow-lg ring-2 ring-white/40">
            <Play className="ml-1 h-6 w-6" fill="currentColor" strokeWidth={0} />
          </span>
          <span className="rounded-full bg-black/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/95">
            Play reel
          </span>
        </button>
      )}
    </div>
  );
}
