"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Button, Input, Select } from "@/components/ui";
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
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverHint, setCoverHint] = useState<string | null>(null);
  const [fromDraft, setFromDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
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

    const { error } = await supabase.from("events").insert(payload);
    if (error) return setError(error.message);
    clearEventDraft();
    setFromDraft(false);
    setCoverHint(null);
    const link = `${window.location.origin}/events/${slug}`;
    setCreatedLink(link);
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
                setCoverHint(f && f.size > 0 ? "New image selected — will upload when you publish." : null);
              }}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input name="date" type="date" required value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            <Input name="startTime" type="time" required value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
            <Input name="endTime" type="time" required value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
          </div>
          <Input name="location" placeholder="Location" required value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
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
            <div className="space-y-4 rounded-2xl border border-black bg-offwhite p-5">
              <p className="text-sm font-bold">Event created. Share this link with guests:</p>
              <p className="break-all rounded-xl border border-line bg-white px-3 py-2 font-mono text-xs">{createdLink}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyCreatedLink}
                  className="inline-flex h-10 items-center rounded-full border border-line bg-white px-4 text-xs font-bold uppercase tracking-wide transition hover:border-black"
                >
                  {copied ? "Copied" : "Copy link"}
                </button>
                <Link
                  href={createdLink}
                  target="_blank"
                  className="inline-flex h-10 items-center rounded-full border border-line bg-white px-4 text-xs font-bold uppercase tracking-wide transition hover:border-black"
                >
                  Open page
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex h-10 items-center rounded-full bg-black px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-neutral-800"
                >
                  Dashboard
                </Link>
              </div>
              {qrCodeUrl && (
                <div className="w-fit rounded-xl border border-line bg-white p-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Guest entry QR</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCodeUrl} alt="Event QR code" className="h-40 w-40 rounded-md" />
                </div>
              )}
            </div>
          )}

          <Button>Create event</Button>
        </form>
      </div>
    </main>
  );
}
