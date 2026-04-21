"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export default function CopyEventLink({
  slug,
  variant = "light",
}: {
  slug: string;
  variant?: "light" | "dark";
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    const url = `${window.location.origin}/events/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-full px-5 text-xs font-bold uppercase tracking-wide transition",
        variant === "light" &&
          "border border-line bg-white text-black hover:border-black",
        variant === "dark" && "border border-white/25 bg-white/[0.06] text-white hover:border-white/45 hover:bg-white/10",
      )}
    >
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
