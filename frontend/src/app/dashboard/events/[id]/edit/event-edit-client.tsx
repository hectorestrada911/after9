"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { HostEventRow } from "@/lib/event-workspace-types";
import type { Visibility } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Input, Select, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";

const inputDark =
  "min-h-12 w-full rounded-xl border border-white/[0.12] bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-brand-green/40 focus:ring-2 focus:ring-brand-green/15";

export function EventEditClient({ event }: { event: HostEventRow }) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [location, setLocation] = useState(event.location);
  const [date, setDate] = useState(event.date);
  const [startTime, setStartTime] = useState(() => (event.start_time?.length >= 5 ? event.start_time.slice(0, 5) : event.start_time));
  const [endTime, setEndTime] = useState(() => (event.end_time?.length >= 5 ? event.end_time.slice(0, 5) : event.end_time));
  const [visibility, setVisibility] = useState(event.visibility);
  const [ageRestriction, setAgeRestriction] = useState(event.age_restriction);
  const [dressCode, setDressCode] = useState(event.dress_code ?? "");
  const [instructions, setInstructions] = useState(event.instructions ?? "");
  const [locationNote, setLocationNote] = useState(event.location_note ?? "");
  const [capacity, setCapacity] = useState(String(event.capacity));
  const [ticketsAvailable, setTicketsAvailable] = useState(String(event.tickets_available));
  const [ticketPrice, setTicketPrice] = useState((event.ticket_price / 100).toFixed(2));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    const cap = Number.parseInt(capacity, 10);
    const inv = Number.parseInt(ticketsAvailable, 10);
    const price = Number.parseFloat(ticketPrice);
    if (!title.trim() || title.trim().length < 3) {
      setLoading(false);
      return setError("Title must be at least 3 characters.");
    }
    if (!description.trim() || description.trim().length < 10) {
      setLoading(false);
      return setError("Description must be at least 10 characters.");
    }
    if (!location.trim() || location.trim().length < 3) {
      setLoading(false);
      return setError("Location is required.");
    }
    if (!Number.isFinite(cap) || cap < 1) {
      setLoading(false);
      return setError("Capacity must be at least 1.");
    }
    if (!Number.isFinite(inv) || inv < 1) {
      setLoading(false);
      return setError("Tickets for sale must be at least 1.");
    }
    if (inv > cap) {
      setLoading(false);
      return setError("Tickets for sale cannot exceed capacity.");
    }
    if (!Number.isFinite(price) || price < 0) {
      setLoading(false);
      return setError("Ticket price must be zero or more.");
    }

    const padTime = (t: string) => (t.length === 5 ? `${t}:00` : t);

    const { error: upErr } = await supabase
      .from("events")
      .update({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        date,
        start_time: padTime(startTime),
        end_time: padTime(endTime),
        visibility,
        age_restriction: ageRestriction,
        dress_code: dressCode.trim() || null,
        instructions: instructions.trim() || null,
        location_note: locationNote.trim() || null,
        capacity: cap,
        tickets_available: inv,
        ticket_price: Math.round(price * 100),
      })
      .eq("id", event.id);

    setLoading(false);
    if (upErr) return setError(upErr.message);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Details</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-white">Edit event</h2>
        <p className="mt-1 text-sm text-zinc-500">Guest page link and slug stay the same. Save when you are done.</p>
      </div>

      {saved ? <p className="rounded-xl border border-brand-green/30 bg-brand-green/10 px-4 py-3 text-sm text-brand-green">Saved. Hero and guest page update on refresh.</p> : null}
      {error ? <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p> : null}

      <div className="space-y-4 rounded-2xl border border-white/[0.1] bg-zinc-950/50 p-5">
        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Title</span>
          <Input className={cn(inputDark)} value={title} onChange={(ev) => setTitle(ev.target.value)} required />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Description</span>
          <Textarea className={cn(inputDark, "min-h-[140px]")} value={description} onChange={(ev) => setDescription(ev.target.value)} required />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Location</span>
          <Input className={cn(inputDark)} value={location} onChange={(ev) => setLocation(ev.target.value)} required />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Location note</span>
          <Input className={cn(inputDark)} value={locationNote} onChange={(ev) => setLocationNote(ev.target.value)} placeholder="Door instructions, parking, etc." />
        </label>
      </div>

      <div className="grid gap-4 rounded-2xl border border-white/[0.1] bg-zinc-950/50 p-5 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Date</span>
          <Input className={cn(inputDark)} type="date" value={date} onChange={(ev) => setDate(ev.target.value)} required />
        </label>
        <div className="hidden sm:block" />
        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Start time</span>
          <Input className={cn(inputDark)} type="time" value={startTime} onChange={(ev) => setStartTime(ev.target.value)} required />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">End time</span>
          <Input className={cn(inputDark)} type="time" value={endTime} onChange={(ev) => setEndTime(ev.target.value)} required />
        </label>
      </div>

      <div className="grid gap-4 rounded-2xl border border-white/[0.1] bg-zinc-950/50 p-5 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Visibility</span>
          <Select className={cn(inputDark)} value={visibility} onChange={(ev) => setVisibility(ev.target.value as Visibility)}>
            <option value="public">Public (shown on home page)</option>
            <option value="unlisted">Unlisted (link only, not on home)</option>
            <option value="private">Private (guest page hidden)</option>
          </Select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Age policy</span>
          <Select className={cn(inputDark)} value={ageRestriction} onChange={(ev) => setAgeRestriction(ev.target.value as HostEventRow["age_restriction"])}>
            <option value="all_ages">All ages</option>
            <option value="age_18_plus">18+</option>
            <option value="age_21_plus">21+</option>
          </Select>
        </label>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/[0.1] bg-zinc-950/50 p-5">
        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Dress code</span>
          <Input className={cn(inputDark)} value={dressCode} onChange={(ev) => setDressCode(ev.target.value)} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Arrival instructions</span>
          <Textarea className={cn(inputDark, "min-h-[100px]")} value={instructions} onChange={(ev) => setInstructions(ev.target.value)} />
        </label>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/[0.1] bg-zinc-950/50 p-5">
        <p className="text-xs text-zinc-500">
          Ticket numbers affect checkout and the guest page. If you already sold tickets, avoid lowering inventory below what was issued.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Capacity</span>
            <Input className={cn(inputDark)} inputMode="numeric" value={capacity} onChange={(ev) => setCapacity(ev.target.value)} required />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Tickets for sale</span>
            <Input className={cn(inputDark)} inputMode="numeric" value={ticketsAvailable} onChange={(ev) => setTicketsAvailable(ev.target.value)} required />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Price (USD)</span>
            <Input className={cn(inputDark)} inputMode="decimal" value={ticketPrice} onChange={(ev) => setTicketPrice(ev.target.value)} required />
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white text-sm font-bold uppercase tracking-wide text-black transition hover:bg-zinc-200 disabled:opacity-50 sm:w-auto sm:min-w-[200px]"
      >
        {loading ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
