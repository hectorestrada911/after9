"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

/** Lighter poster so first paint is not blocked by a huge remote image. */
const POSTER =
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&w=960&q=70&fit=crop";

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
 * Banner video: `public/a9-banner.mp4` is large (~10MB) — main cost after first paint.
 * - Waits until near viewport, then defers `src` until the browser is idle (or timeout) so JS/CSS/fonts win the race.
 * - On save-data, reduced motion, or slow network: poster only until the user taps Play.
 *
 * Long-term: re-encode to ≤3MB (720p H.264 + `faststart`) or host WebM; see comment in repo / deploy docs.
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
      setNeedsTap(saveData || slow || reduceMotion);
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
      const id = window.requestIdleCallback(start, { timeout: 1600 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }
    const t = window.setTimeout(start, 700);
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
        {...({ fetchPriority: "low" } as React.ComponentProps<"video">)}
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
