"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore } from "lucide-react";

export function EventArchiveToggle({
  eventId,
  eventTitle,
  isArchived,
}: {
  eventId: string;
  eventTitle: string;
  isArchived: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleArchive(nextArchived: boolean) {
    const ok = window.confirm(
      nextArchived
        ? `Archive "${eventTitle}"?\n\nArchived events are hidden from your active list and guest checkout.`
        : `Unarchive "${eventTitle}"?\n\nThis will make the event active again.`,
    );
    if (!ok) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/host/events/${eventId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ archived: nextArchived }),
      });
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(payload?.error ?? "Could not update archive state.");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Network error updating archive state.");
      setBusy(false);
      return;
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => void toggleArchive(!isArchived)}
        disabled={busy}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-white/25 bg-white/[0.06] px-5 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/45 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isArchived ? <ArchiveRestore className="h-3.5 w-3.5" aria-hidden /> : <Archive className="h-3.5 w-3.5" aria-hidden />}
        {busy ? "Updating..." : isArchived ? "Unarchive" : "Archive"}
      </button>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
