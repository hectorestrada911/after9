"use client";

import { useState } from "react";

export default function CopyEventLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    const url = `${window.location.origin}/events/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <button
      onClick={onCopy}
      className="inline-flex h-10 items-center justify-center rounded-full border border-line bg-white px-4 text-xs font-bold uppercase tracking-wide text-black transition hover:border-black"
    >
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
