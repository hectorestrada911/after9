"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Calendar, CheckCircle2, Link2, MapPin, QrCode, ScanLine, Share2 } from "lucide-react";
import { Button, Input, Select } from "@/components/ui";
import { LocationAutocompleteInput } from "@/components/location-autocomplete-input";
import { eventSchema } from "@/lib/validations";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { clearEventDraft, dataUrlToFile, readEventDraft } from "@/lib/event-draft";

type FormState = {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: string;
  ticketPrice: string;
  ticketsAvailable: string;
  visibility: "public" | "private";
  ageRestriction: "all_ages" | "age_18_plus" | "age_21_plus";
  dressCode: string;
  instructions: string;
  locationNote: string;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  location: "",
  capacity: "",
  ticketPrice: "",
  ticketsAvailable: "",
  visibility: "public",
  ageRestriction: "all_ages",
  dressCode: "",
  instructions: "",
  locationNote: "",
};

export default function NewEventPage() {
  const supabase = getSupabaseBrowserClient();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isFreeEvent, setIsFreeEvent] = useState(false);
  const [pickedLocationHint, setPickedLocationHint] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverHint, setCoverHint] = useState<string | null>(null);
  const [fromDraft, setFromDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const draft = readEventDraft();
    if (!draft) return;
    setFromDraft(true);
    setForm({
      title: draft.title,
      description: draft.description,
      date: draft.date,
      startTime: draft.startTime,
      endTime: draft.endTime,
      location: draft.location,
      capacity: String(draft.capacity),
      ticketPrice: String(draft.ticketPrice),
      ticketsAvailable: String(draft.ticketsAvailable),
      visibility: draft.visibility,
      ageRestriction: draft.ageRestriction,
      dressCode: draft.dressCode ?? "",
      instructions: draft.instructions ?? "",
      locationNote: draft.locationNote ?? "",
    });
    setIsFreeEvent(Number(draft.ticketPrice) === 0);
    if (draft.coverMode === "upload" && draft.imageDataUrl) {
      setCoverHint("Flyer from your draft will upload when you publish.");
      void dataUrlToFile(draft.imageDataUrl, "flyer.jpg")
        .then((f) => setCoverFile(f))
        .catch(() => setCoverHint("Could not restore uploaded flyer; add an image again."));
    } else {
      setCoverHint(`Stock flyer from draft will be used unless you upload a new image.`);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function generateQr() {
      if (!createdLink) {
        setQrCodeUrl(null);
        return;
      }
      const { toDataURL } = await import("qrcode");
      const qr = await toDataURL(createdLink, { width: 220, margin: 1 });
      if (!ignore) setQrCodeUrl(qr);
    }
    generateQr().catch(() => setQrCodeUrl(null));
    return () => {
      ignore = true;
    };
  }, [createdLink]);

  async function copyCreatedLink() {
    if (!createdLink) return;
    await navigator.clipboard.writeText(createdLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCreatedLink(null);
    setCreatedSlug(null);
    setCreatedEventId(null);
    setQrCodeUrl(null);
    setCopied(false);

    const draft = readEventDraft();
    const fallbackImageUrl =
      draft?.imageUrl ?? "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80";

    const parsed = eventSchema.safeParse({
      ...form,
      capacity: form.capacity,
      ticketPrice: form.ticketPrice,
      ticketsAvailable: form.ticketsAvailable,
      imageUrl: fallbackImageUrl,
    });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Invalid event data.");
    if (parsed.data.ticketsAvailable > parsed.data.capacity) {
      return setError("Tickets to sell cannot be greater than capacity.");
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return setError("Please login first.");

    const title = parsed.data.title;
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;
    let imageUrl = parsed.data.imageUrl;
    const fileToUpload = coverFile && coverFile.size > 0 ? coverFile : null;
    if (fileToUpload) {
      const extension = fileToUpload.name.split(".").pop() || "jpg";
      const path = `${userData.user.id}/${slug}-${Date.now()}.${extension}`;
      const upload = await supabase.storage.from("event-images").upload(path, fileToUpload, { upsert: true });
      if (upload.error) return setError(upload.error.message);
      imageUrl = supabase.storage.from("event-images").getPublicUrl(path).data.publicUrl;
    }

    const payload = {
      host_id: userData.user.id,
      title,
      description: parsed.data.description,
      image_url: imageUrl,
      date: parsed.data.date,
      start_time: parsed.data.startTime,
      end_time: parsed.data.endTime,
      location: parsed.data.location,
      capacity: parsed.data.capacity,
      ticket_price: Math.round(parsed.data.ticketPrice * 100),
      tickets_available: parsed.data.ticketsAvailable,
      visibility: parsed.data.visibility,
      age_restriction: parsed.data.ageRestriction,
      dress_code: parsed.data.dressCode || null,
      instructions: parsed.data.instructions || null,
      location_note: parsed.data.locationNote || null,
      slug,
    };

    const { data: created, error } = await supabase.from("events").insert(payload).select("id,slug").single();
    if (error) return setError(error.message);
    clearEventDraft();
    setFromDraft(false);
    setCoverHint(null);
    const link = `${window.location.origin}/events/${created.slug}`;
    setCreatedLink(link);
    setCreatedSlug(created.slug);
    setCreatedEventId(created.id);
  }

  return (
    <main className="container-page min-w-0 py-10 sm:py-14">
      <div className="mx-auto max-w-2xl min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Host tools</p>
        <h1 className="mt-3 display-section-fluid">Create event</h1>
        <p className="mt-4 text-base text-muted max-w-xl">
          Fill in the essentials and publish a professional ticket page.
        </p>

        {fromDraft && (
          <div className="mt-6 rounded-2xl border border-black bg-brand-green/20 px-4 py-3 text-sm font-medium text-black">
            You started this event before signing in. Review the details, then publish.
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-10 grid gap-3.5">
          <Input name="title" placeholder="Event title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Input
            name="description"
            placeholder="Event description"
            required
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">Cover image</label>
            {coverHint && <p className="mb-2 text-xs text-muted">{coverHint}</p>}
            <Input
              name="coverImage"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setCoverFile(f && f.size > 0 ? f : null);
                setCoverHint(f && f.size > 0 ? "New image selected; will upload when you publish." : null);
              }}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input name="date" type="date" required value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            <Input name="startTime" type="time" required value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
            <Input name="endTime" type="time" required value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">Location</label>
            <LocationAutocompleteInput
              name="location"
              required
              value={form.location}
              onChange={(value) => {
                setForm((f) => ({ ...f, location: value }));
                setPickedLocationHint(null);
              }}
              onSelectSuggestion={(suggestion) => {
                const coordinates =
                  typeof suggestion.lat === "number" && typeof suggestion.lng === "number"
                    ? ` (${suggestion.lat.toFixed(5)}, ${suggestion.lng.toFixed(5)})`
                    : "";
                setPickedLocationHint(`Verified location selected${coordinates}`);
              }}
            />
            <p className="mt-1 text-xs text-muted">Start typing a venue or full address to pick an exact real place.</p>
            {pickedLocationHint ? <p className="mt-1 text-xs font-medium text-emerald-700">{pickedLocationHint}</p> : null}
          </div>
          <div className="rounded-xl border border-line bg-offwhite p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Ticket setup</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setIsFreeEvent(false);
                  setForm((f) => ({ ...f, ticketPrice: f.ticketPrice === "0" ? "15" : f.ticketPrice }));
                }}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  !isFreeEvent ? "border-black bg-white text-black" : "border-line bg-white/60 text-muted hover:border-black/40"
                }`}
              >
                Paid event
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFreeEvent(true);
                  setForm((f) => ({ ...f, ticketPrice: "0" }));
                }}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  isFreeEvent ? "border-black bg-white text-black" : "border-line bg-white/60 text-muted hover:border-black/40"
                }`}
              >
                Free event
              </button>
            </div>
            {!isFreeEvent ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {["10", "20", "30", "50"].map((price) => (
                  <button
                    key={price}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, ticketPrice: price }))}
                    className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-black transition hover:border-black"
                  >
                    ${price}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              name="capacity"
              type="number"
              placeholder="Capacity"
              required
              value={form.capacity}
              onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
            />
            <Input
              name="ticketPrice"
              type="number"
              step="0.01"
              placeholder="Ticket price"
              required
              value={form.ticketPrice}
              disabled={isFreeEvent}
              onChange={(e) => setForm((f) => ({ ...f, ticketPrice: e.target.value }))}
            />
            <Input
              name="ticketsAvailable"
              type="number"
              placeholder="Tickets to sell"
              required
              value={form.ticketsAvailable}
              onChange={(e) => setForm((f) => ({ ...f, ticketsAvailable: e.target.value }))}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select name="visibility" value={form.visibility} onChange={(e) => setForm((f) => ({ ...f, visibility: e.target.value as FormState["visibility"] }))}>
              <option value="public">Public</option>
              <option value="private">Private link only</option>
            </Select>
            <Select
              name="ageRestriction"
              value={form.ageRestriction}
              onChange={(e) => setForm((f) => ({ ...f, ageRestriction: e.target.value as FormState["ageRestriction"] }))}
            >
              <option value="all_ages">All ages</option>
              <option value="age_18_plus">18+</option>
              <option value="age_21_plus">21+</option>
            </Select>
          </div>
          <Input name="dressCode" placeholder="Dress code (optional)" value={form.dressCode} onChange={(e) => setForm((f) => ({ ...f, dressCode: e.target.value }))} />
          <Input
            name="instructions"
            placeholder="Instructions (optional)"
            value={form.instructions}
            onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
          />
          <Input
            name="locationNote"
            placeholder="Approximate location note (optional)"
            value={form.locationNote}
            onChange={(e) => setForm((f) => ({ ...f, locationNote: e.target.value }))}
          />
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          {createdLink && (
            <div className="space-y-5 rounded-2xl border border-black bg-gradient-to-br from-offwhite to-zinc-100 p-5 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-1.5 rounded-full bg-brand-green/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-black">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Published
                  </p>
                  <h2 className="mt-2 text-xl font-black tracking-tight text-black sm:text-2xl">Your event is live</h2>
                  <p className="mt-1 max-w-md text-sm text-muted">
                    Share the guest page, then watch sales and check-ins from your dashboard. You can always edit details later.
                  </p>
                </div>
                {qrCodeUrl && (
                  <div className="rounded-xl border border-line bg-white p-2.5 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCodeUrl} alt="QR code for event link" className="h-24 w-24 rounded-md sm:h-28 sm:w-28" />
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-line bg-white/80 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">Guest link</p>
                <p className="mt-2 break-all rounded-lg border border-line bg-white px-3 py-2 font-mono text-[11px] text-black">{createdLink}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copyCreatedLink}
                    className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-white px-4 text-xs font-bold uppercase tracking-wide transition hover:border-black"
                  >
                    <Link2 className="h-3.5 w-3.5" aria-hidden />
                    {copied ? "Copied" : "Copy link"}
                  </button>
                  <Link
                    href={createdLink}
                    target="_blank"
                    className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-white px-4 text-xs font-bold uppercase tracking-wide transition hover:border-black"
                  >
                    <Share2 className="h-3.5 w-3.5" aria-hidden />
                    Preview guest page
                  </Link>
                  {createdSlug ? (
                    <Link
                      href={`/events/${createdSlug}`}
                      target="_blank"
                      className="inline-flex h-10 items-center gap-1.5 rounded-full bg-black px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-neutral-800"
                    >
                      Open event <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-line bg-white/80 p-4">
                  <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                    <Calendar className="h-3.5 w-3.5" aria-hidden /> Event snapshot
                  </p>
                  <p className="mt-2 text-base font-bold text-black">{form.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    {form.date} · {form.startTime}–{form.endTime}
                  </p>
                  <p className="mt-2 inline-flex items-start gap-1.5 text-sm text-muted">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span>{form.location}</span>
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-white/80 p-4">
                  <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                    <QrCode className="h-3.5 w-3.5" aria-hidden /> Next for door
                  </p>
                  <p className="mt-2 text-sm text-muted">Open check-in on your phone and scan tickets as guests arrive.</p>
                  {createdEventId ? (
                    <Link
                      href={`/dashboard/events/${createdEventId}/check-in`}
                      className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full border border-line bg-white text-xs font-bold uppercase tracking-wide transition hover:border-black"
                    >
                      <ScanLine className="h-3.5 w-3.5" aria-hidden />
                      Open check-in
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard"
                      className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full border border-line bg-white text-xs font-bold uppercase tracking-wide transition hover:border-black"
                    >
                      Open dashboard
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-black/5 pt-4">
                <Link
                  href="/dashboard"
                  className="inline-flex h-10 flex-1 min-w-[10rem] items-center justify-center rounded-full bg-black px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-neutral-800"
                >
                  Go to dashboard
                </Link>
                <Link
                  href="/create-event"
                  className="inline-flex h-10 flex-1 min-w-[10rem] items-center justify-center rounded-full border border-line bg-white px-4 text-xs font-bold uppercase tracking-wide transition hover:border-black"
                >
                  Create another
                </Link>
              </div>
            </div>
          )}

          <Button>Create event</Button>
        </form>
      </div>
    </main>
  );
}
