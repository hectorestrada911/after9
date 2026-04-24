"use client";

import { useEffect, useState } from "react";

export function MobileBuyCta({ soldOut, label, targetId }: { soldOut: boolean; label: string; targetId: string }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setHidden(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.25 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  if (hidden) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] lg:hidden">
      <a
        href={`#${targetId}`}
        onClick={() => setHidden(true)}
        className="pointer-events-auto inline-flex h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-zinc-100 to-zinc-300 text-base font-black text-zinc-900 shadow-[0_18px_38px_-22px_rgba(0,0,0,0.8)] transition active:scale-[0.995]"
      >
        {soldOut ? "Sold out" : label}
      </a>
    </div>
  );
}
