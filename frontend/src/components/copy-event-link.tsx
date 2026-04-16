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
    <button onClick={onCopy} className="rounded-lg border border-slate-700 px-3 py-1 text-sm text-slate-200 transition hover:bg-slate-800">
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
