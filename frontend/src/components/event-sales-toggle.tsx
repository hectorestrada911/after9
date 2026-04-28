"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PauseCircle, PlayCircle } from "lucide-react";

export function EventSalesToggle({
  eventId,
  eventTitle,
  salesEnabled,
}: {
  eventId: string;
  eventTitle: string;
  salesEnabled: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleSales(nextSalesEnabled: boolean) {
    const ok = window.confirm(
      nextSalesEnabled
        ? `Turn sales ON for "${eventTitle}"?\n\nGuests will be able to purchase tickets immediately.`
        : `Turn sales OFF for "${eventTitle}"?\n\nGuests will still see the page, but checkout will be paused.`,
    );
    if (!ok) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/host/events/${eventId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ salesEnabled: nextSalesEnabled }),
      });
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(payload?.error ?? "Could not update sales state.");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Network error updating sales state.");
      setBusy(false);
      return;
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => void toggleSales(!salesEnabled)}
        disabled={busy}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-white/25 bg-white/[0.06] px-5 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/45 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {salesEnabled ? <PauseCircle className="h-3.5 w-3.5" aria-hidden /> : <PlayCircle className="h-3.5 w-3.5" aria-hidden />}
        {busy ? "Updating..." : salesEnabled ? "Stop sales" : "Start sales"}
      </button>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
