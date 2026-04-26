"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";

export function EventDeleteButton({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  async function onDelete() {
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
      setOpen(false);
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error while deleting event.");
      setBusy(false);
    }
  }

  function closeDialog() {
    if (busy) return;
    setOpen(false);
    setConfirmText("");
  }

  const canDelete = confirmText.trim().toUpperCase() === "DELETE" && !busy;

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        disabled={busy}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-red-400/40 bg-red-500/10 px-5 text-xs font-bold uppercase tracking-wide text-red-200 transition hover:border-red-300/65 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        Delete event
      </button>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/70 p-4 backdrop-blur-sm">
          <div className="mx-auto mt-20 w-full max-w-md rounded-3xl border border-white/[0.14] bg-[#070707] p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-300">Danger zone</p>
              <button
                type="button"
                onClick={closeDialog}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-zinc-300 transition hover:border-white/35 hover:text-white disabled:opacity-60"
                disabled={busy}
                aria-label="Close delete confirmation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <h3 className="text-lg font-semibold text-zinc-100">Delete this event?</h3>
            <p className="mt-2 text-sm text-zinc-400">
              This permanently removes <span className="font-semibold text-zinc-200">{eventTitle}</span> and cannot be undone.
            </p>
            <p className="mt-4 text-xs text-zinc-500">
              Type <span className="font-bold text-zinc-300">DELETE</span> to confirm.
            </p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="mt-2 h-11 w-full rounded-xl border border-white/[0.14] bg-white/[0.06] px-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-red-400/60 focus:outline-none focus:ring-2 focus:ring-red-400/20"
            />
            {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={closeDialog}
                disabled={busy}
                className="h-11 rounded-full border border-white/20 text-xs font-semibold uppercase tracking-wide text-zinc-200 transition hover:border-white/40 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void onDelete()}
                disabled={!canDelete}
                className="h-11 rounded-full bg-red-500/85 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "Deleting..." : "Delete forever"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
