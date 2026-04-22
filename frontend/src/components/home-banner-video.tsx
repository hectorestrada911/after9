"use client";

import { useEffect, useRef, useState } from "react";

/** Same-origin poster: avoids extra DNS + competes less with hero text for bandwidth. */
const POSTER = "/host-review-scene.jpg";

type Props = {
  className?: string;
};

/**
 * Banner video: `public/a9-banner.mp4` is large (~10MB) — biggest win is re-encoding (720p H.264 + `faststart`, target ≤3MB) and/or a short WebM.
 * - Autoplay after it enters view and the browser is idle (or timeout) so critical JS/CSS/fonts go first.
 */
export function HomeBannerVideo({ className }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [shouldLoadSrc, setShouldLoadSrc] = useState(false);

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
  }, [inView]);

  useEffect(() => {
    if (!shouldLoadSrc) return;
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {
      /* autoplay policies */
    });
  }, [shouldLoadSrc]);

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

    </div>
  );
}
