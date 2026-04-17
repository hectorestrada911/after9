"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, Upload } from "lucide-react";
import { eventSchema } from "@/lib/validations";
import { MAX_DRAFT_IMAGE_BYTES, placeholderCoverUrl, writeEventDraft, type EventDraftV1 } from "@/lib/event-draft";
import { FLYER_STOCK, filterFlyerStock } from "@/lib/flyer-stock";

const NEXT_AFTER_AUTH = "/dashboard/events/new";

const field =
  "h-11 w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3.5 text-[13px] font-normal text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-zinc-600 transition " +
  "focus:border-white/12 focus:bg-white/[0.045] focus:outline-none focus:ring-1 focus:ring-white/10";

const labelClass = "text-[10px] font-medium uppercase tracking-[0.26em] text-zinc-600";

export function CreateEventFlow() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [coverMode, setCoverMode] = useState<"stock" | "upload">("stock");
  const [selectedStockId, setSelectedStockId] = useState(FLYER_STOCK[0]!.id);
  const [uploadDataUrl, setUploadDataUrl] = useState<string | null>(null);
  const [uploadName, setUploadName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("120");
  const [ticketPrice, setTicketPrice] = useState("15");
  const [ticketsAvailable, setTicketsAvailable] = useState("120");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [ageRestriction, setAgeRestriction] = useState<EventDraftV1["ageRestriction"]>("all_ages");
  const [dressCode, setDressCode] = useState("");
  const [instructions, setInstructions] = useState("");
  const [locationNote, setLocationNote] = useState("");

  const filteredStock = useMemo(() => filterFlyerStock(search), [search]);
  const selectedStock = FLYER_STOCK.find((i) => i.id === selectedStockId) ?? FLYER_STOCK[0]!;

  function pickStock(id: string) {
    setCoverMode("stock");
    setSelectedStockId(id);
    setUploadDataUrl(null);
    setUploadName(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function onFileChange(f: File | null) {
    if (!f) return;
    setError(null);
    if (f.size > MAX_DRAFT_IMAGE_BYTES) {
      setError(`Image must be under ${Math.round(MAX_DRAFT_IMAGE_BYTES / 1e6)}MB for this step. Try a stock flyer or a smaller file.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") return;
      setCoverMode("upload");
      setUploadDataUrl(result);
      setUploadName(f.name);
    };
    reader.readAsDataURL(f);
  }

  function continueToAuth(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const imageUrl = coverMode === "upload" ? placeholderCoverUrl() : selectedStock.url;

    const parsed = eventSchema.safeParse({
      title,
      description,
      imageUrl,
      date,
      startTime,
      endTime,
      location,
      capacity,
      ticketPrice,
      ticketsAvailable,
      visibility,
      ageRestriction,
      dressCode: dressCode || undefined,
      instructions: instructions || undefined,
      locationNote: locationNote || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form and try again.");
      return;
    }

    const draft: EventDraftV1 = {
      v: 1,
      coverMode,
      imageUrl: coverMode === "stock" ? selectedStock.url : placeholderCoverUrl(),
      imageDataUrl: coverMode === "upload" ? uploadDataUrl : null,
      title: parsed.data.title,
      description: parsed.data.description,
      date: parsed.data.date,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      location: parsed.data.location,
      capacity: parsed.data.capacity,
      ticketPrice: parsed.data.ticketPrice,
      ticketsAvailable: parsed.data.ticketsAvailable,
      visibility: parsed.data.visibility,
      ageRestriction: parsed.data.ageRestriction,
      dressCode: parsed.data.dressCode,
      instructions: parsed.data.instructions,
      locationNote: parsed.data.locationNote,
    };

    if (coverMode === "upload" && !uploadDataUrl) {
      setError("Upload a flyer image or pick one from the gallery.");
      return;
    }

    try {
      writeEventDraft(draft);
    } catch {
      setError("Could not save your draft in the browser (storage may be full). Try a smaller image.");
      return;
    }

    const next = encodeURIComponent(NEXT_AFTER_AUTH);
    router.push(`/signup?next=${next}`);
  }

  const chevron =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2352525b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E";

  return (
    <main className="relative min-h-dvh bg-[#020202] text-zinc-300 antialiased">
      <div
        className="pointer-events-none fixed inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 45% at 50% -15%, rgba(255,255,255,0.06), transparent 55%), radial-gradient(circle at 100% 0%, rgba(255,255,255,0.03), transparent 40%)",
        }}
      />

      <div className="relative flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-zinc-500 transition hover:text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-[10px] font-bold text-white">
              A9
            </span>
            <span className="text-sm font-medium tracking-tight text-zinc-400">After9</span>
          </Link>
          <Link
            href={`/login?next=${encodeURIComponent(NEXT_AFTER_AUTH)}`}
            className="text-[12px] font-medium text-zinc-500 transition hover:text-white"
          >
            Log in
          </Link>
        </header>

        <div className="mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-4 sm:max-w-lg sm:px-6 sm:pb-24 sm:pt-6">
          <div className="mb-10">
            <p className={labelClass}>New event</p>
            <h1 className="mt-2 text-2xl font-medium tracking-[-0.02em] text-white sm:text-[1.65rem] sm:leading-snug">
              Create your event
            </h1>
            <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-zinc-600">
              Flyer, basics, then one sign-in to publish. Nothing is public until you finish.
            </p>
          </div>

          <form onSubmit={continueToAuth} className="space-y-0">
            <section className="border-b border-white/[0.05] pb-12">
              <h2 className={labelClass}>Flyer</h2>
              <p className="mt-2 text-[12px] leading-relaxed text-zinc-600">4:5 reads best in feeds. Other ratios are cropped.</p>

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="group mt-5 flex w-full items-center gap-3.5 rounded-lg border border-dashed border-white/[0.08] bg-white/[0.02] px-4 py-3.5 text-left transition hover:border-white/15 hover:bg-white/[0.03]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/[0.06] text-zinc-500 transition group-hover:text-zinc-300">
                  <Upload className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-zinc-200">Upload image</p>
                  <p className="mt-0.5 truncate text-[12px] text-zinc-600">
                    {uploadName ?? "PNG or JPG · ~1.4MB max for this step"}
                  </p>
                </div>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(ev) => {
                  const f = ev.target.files?.[0] ?? null;
                  if (f) onFileChange(f);
                }}
              />

              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" strokeWidth={1.5} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter gallery"
                  className={`${field} pl-9`}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2">
                {filteredStock.map((img) => {
                  const active = coverMode === "stock" && selectedStockId === img.id;
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => pickStock(img.id)}
                      className={`relative aspect-[4/5] overflow-hidden rounded-md transition ${
                        active ? "outline outline-1 outline-offset-1 outline-white/80" : "opacity-90 hover:opacity-100"
                      }`}
                    >
                      <Image src={img.thumb} alt={img.alt} fill className="object-cover" sizes="180px" />
                      {active && <span className="absolute inset-0 bg-white/[0.08]" aria-hidden />}
                    </button>
                  );
                })}
              </div>
              {filteredStock.length === 0 && <p className="mt-3 text-[12px] text-zinc-600">No matches.</p>}
            </section>

            <section className="pb-10 pt-12">
              <h2 className={labelClass}>Details</h2>
              <div className="mt-5 space-y-3">
                <input className={field} placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <textarea
                  className={`${field} min-h-[108px] resize-y py-2.5 leading-relaxed`}
                  placeholder="Description for guests"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                <div className="grid grid-cols-3 gap-2">
                  <input className={field} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                  <input className={field} type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                  <input className={field} type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                </div>
                <input className={field} placeholder="Venue or address" value={location} onChange={(e) => setLocation(e.target.value)} required />
                <div className="grid grid-cols-3 gap-2">
                  <input className={field} type="number" placeholder="Cap." value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
                  <input
                    className={field}
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(e.target.value)}
                    required
                  />
                  <input
                    className={field}
                    type="number"
                    placeholder="Qty"
                    value={ticketsAvailable}
                    onChange={(e) => setTicketsAvailable(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className={`${field} cursor-pointer appearance-none bg-[length:0.875rem] bg-[right_0.65rem_center] bg-no-repeat pr-8`}
                    style={{ backgroundImage: `url("${chevron}")` }}
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as "public" | "private")}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private link</option>
                  </select>
                  <select
                    className={`${field} cursor-pointer appearance-none bg-[length:0.875rem] bg-[right_0.65rem_center] bg-no-repeat pr-8`}
                    style={{ backgroundImage: `url("${chevron}")` }}
                    value={ageRestriction}
                    onChange={(e) => setAgeRestriction(e.target.value as EventDraftV1["ageRestriction"])}
                  >
                    <option value="all_ages">All ages</option>
                    <option value="age_18_plus">18+</option>
                    <option value="age_21_plus">21+</option>
                  </select>
                </div>
                <input className={field} placeholder="Dress code (optional)" value={dressCode} onChange={(e) => setDressCode(e.target.value)} />
                <input className={field} placeholder="Instructions (optional)" value={instructions} onChange={(e) => setInstructions(e.target.value)} />
                <input className={field} placeholder="Location note (optional)" value={locationNote} onChange={(e) => setLocationNote(e.target.value)} />
              </div>
            </section>

            {error && (
              <p className="mb-4 rounded-lg border border-red-500/15 bg-red-500/[0.07] px-3 py-2.5 text-[12px] text-red-300/95">{error}</p>
            )}

            <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/[0.05] bg-[#020202]/85 px-4 py-3 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#020202]/70 sm:static sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
              <button
                type="submit"
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-950 transition hover:bg-zinc-100"
              >
                Continue
                <ArrowRight className="h-3.5 w-3.5 opacity-70 transition group-hover:translate-x-0.5 group-hover:opacity-100" strokeWidth={2} />
              </button>
              <p className="mt-2.5 text-center text-[11px] leading-relaxed text-zinc-700 sm:mt-2">
                Draft stays in this browser until you publish.
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
