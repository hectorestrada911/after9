"use client";

import { useEffect, useRef, useState } from "react";

const POSTER =
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&w=1600&q=75&fit=crop";

type Props = {
  className?: string;
};

/**
 * Defers loading ~10MB banner MP4 until the block is near the viewport.
 * Keeps a lightweight poster as LCP-friendly paint.
 */
export function HomeBannerVideo({ className }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        setActive(true);
        io.disconnect();
      },
      { rootMargin: "180px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {
      /* autoplay policies: muted still helps */
    });
  }, [active]);

  return (
    <div ref={root} className={className}>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        poster={POSTER}
        muted
        loop
        playsInline
        preload="none"
        controls={false}
        {...(active ? { src: "/a9-banner.mp4" } : {})}
      />
    </div>
  );
}
