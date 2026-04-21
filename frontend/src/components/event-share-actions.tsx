"use client";

import { useCallback, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

function eventUrl(slug: string) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/events/${slug}`;
}

export function EventShareActions({
  slug,
  shareTitle,
  shareText,
  className,
}: {
  slug: string;
  shareTitle?: string;
  shareText?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    const url = eventUrl(slug);
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }, [slug]);

  const share = useCallback(async () => {
    const url = eventUrl(slug);
    if (!url) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle ?? "Event on RAGE",
          text: shareText ?? "Grab your ticket — link below.",
          url,
        });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    await copy();
  }, [copy, shareText, shareTitle, slug]);

  const btnBase =
    "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-5 text-xs font-bold uppercase tracking-wide transition";

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <button
        type="button"
        onClick={() => void share()}
        className={cn(
          btnBase,
          "bg-gradient-to-r from-[#4BFA94] to-emerald-300 text-black shadow-[0_0_28px_-8px_rgba(75,250,148,0.65)] hover:brightness-110 active:scale-[0.98]",
        )}
      >
        <Share2 className="h-3.5 w-3.5" aria-hidden />
        Share drop
      </button>
      <button
        type="button"
        onClick={() => void copy()}
        className={cn(
          btnBase,
          "border border-white/25 bg-white/[0.06] text-white hover:border-white/45 hover:bg-white/10",
        )}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-brand-green" aria-hidden /> : <Link2 className="h-3.5 w-3.5" aria-hidden />}
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}
