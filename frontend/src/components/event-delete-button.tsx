"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function EventDeleteButton({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    const ok = window.confirm(`Are you sure you want to delete "${eventTitle}"?\n\nThis action cannot be undone.`);
    if (!ok) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/host/events/${eventId}`, { method: "DELETE" });
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(payload?.error ?? "Could not delete event.");
        setBusy(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error while deleting event.");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => void onDelete()}
        disabled={busy}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-red-400/40 bg-red-500/10 px-5 text-xs font-bold uppercase tracking-wide text-red-200 transition hover:border-red-300/65 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        {busy ? "Deleting..." : "Delete event"}
      </button>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
