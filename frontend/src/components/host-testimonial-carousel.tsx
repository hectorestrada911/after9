"use client";

import { useCallback, useEffect, useId, useState } from "react";
import Image from "next/image";

export type HostReview = {
  id: string;
  quote: string;
};

const DEFAULT_REVIEWS: HostReview[] = [
  {
    id: "a",
    quote: "Live page and ticket link in a couple minutes. Dropped it in the chat and people actually checked out.",
  },
  {
    id: "b",
    quote: "One link replaced our Venmo DM mess. Everyone got a QR for the door.",
  },
  {
    id: "c",
    quote: "Search-by-name at check-in when the line was staring. Felt usable, not scary.",
  },
];

type Props = {
  reviews?: HostReview[];
  autoAdvanceMs?: number;
};

/**
 * Dark testimonial strip: rotating quotes, dot nav, static image below.
 */
export function HostTestimonialCarousel({ reviews = DEFAULT_REVIEWS, autoAdvanceMs = 8000 }: Props) {
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const regionId = useId();
  const labelId = `${regionId}-label`;
  const n = reviews.length;
  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => (i + dir + n) % n);
    },
    [n],
  );

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    queueMicrotask(() => setReducedMotion(mq.matches));
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion || autoAdvanceMs <= 0 || n <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % n);
    }, autoAdvanceMs);
    return () => clearInterval(id);
  }, [autoAdvanceMs, n, reducedMotion, index]);

  return (
    <div className="mx-auto w-full max-w-2xl px-1 sm:max-w-3xl sm:px-2">
      <p id={labelId} className="sr-only">
        Host testimonials, slide {index + 1} of {n}
      </p>

      <div
        role="region"
        aria-roledescription="carousel"
        aria-labelledby={labelId}
        aria-label="What hosts say about RAGE"
        className="text-center outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(-1);
          }
          if (e.key === "ArrowRight") {
            e.preventDefault();
            go(1);
          }
        }}
        tabIndex={0}
      >
        <div className="relative min-h-[11rem] sm:min-h-[10rem] md:min-h-[9.5rem]">
          {reviews.map((r, i) => (
            <figure
              key={r.id}
              className={
                i === index
                  ? "relative z-10 px-1 opacity-100 transition-opacity duration-300 sm:px-4"
                  : "pointer-events-none absolute inset-0 z-0 px-1 opacity-0 transition-opacity duration-300 sm:px-4"
              }
              aria-hidden={i !== index}
            >
              <blockquote className="text-pretty text-xl font-medium leading-relaxed tracking-tight text-white sm:text-2xl sm:leading-relaxed md:text-[1.65rem] md:leading-relaxed">
                &ldquo;{r.quote}&rdquo;
              </blockquote>
            </figure>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-2 sm:mt-10" role="tablist" aria-label="Choose testimonial">
          {reviews.map((r, i) => (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Testimonial ${i + 1} of ${n}`}
              onClick={() => setIndex(i)}
              className={
                i === index
                  ? "h-2 w-7 rounded-full bg-white transition-[width,background-color]"
                  : "h-2 w-2 rounded-full bg-zinc-600 transition-[width,background-color] hover:bg-zinc-500"
              }
            />
          ))}
        </div>
      </div>

      <div className="relative mt-12 aspect-[5/4] w-full overflow-hidden rounded-2xl border border-white/[0.1] bg-zinc-900 sm:mt-14">
        <Image
          src="/host-review-scene.jpg"
          alt="Night out, crowd and lights"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 48rem"
          priority={false}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-left sm:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">The listing</p>
          <p className="mt-2 max-w-[22rem] text-lg font-semibold leading-snug text-white sm:text-xl">
            When time, place, and price read clearly, guests pay without guesswork or back-and-forth DMs.
          </p>
        </div>
      </div>
    </div>
  );
}
