"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Button, Input, Select } from "@/components/ui";
import { eventSchema } from "@/lib/validations";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function NewEventPage() {
  const supabase = getSupabaseBrowserClient();
  const [error, setError] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
    const formData = new FormData(e.currentTarget);
    const coverImage = formData.get("coverImage");
    const file = coverImage instanceof File && coverImage.size > 0 ? coverImage : null;
    const parsed = eventSchema.safeParse({
      ...Object.fromEntries(formData),
      imageUrl: "https://placeholder.local/cover.jpg",
    });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Invalid event data.");

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return setError("Please login first.");

    const title = parsed.data.title;
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;
    let imageUrl = parsed.data.imageUrl;
    if (file) {
      const extension = file.name.split(".").pop() || "jpg";
      const path = `${userData.user.id}/${slug}-${Date.now()}.${extension}`;
      const upload = await supabase.storage.from("event-images").upload(path, file, { upsert: true });
      if (upload.error) return setError(upload.error.message);
      const publicUrl = supabase.storage.from("event-images").getPublicUrl(path).data.publicUrl;
      imageUrl = publicUrl;
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

        <form onSubmit={onSubmit} className="mt-10 grid gap-3.5">
          <Input name="title" placeholder="Event title" required />
          <Input name="description" placeholder="Event description" required />
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Cover image</label>
            <Input name="coverImage" type="file" accept="image/*" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input name="date" type="date" required />
            <Input name="startTime" type="time" required />
            <Input name="endTime" type="time" required />
          </div>
          <Input name="location" placeholder="Location" required />
          <div className="grid gap-3 sm:grid-cols-3">
            <Input name="capacity" type="number" placeholder="Capacity" required />
            <Input name="ticketPrice" type="number" step="0.01" placeholder="Ticket price" required />
            <Input name="ticketsAvailable" type="number" placeholder="Tickets to sell" required />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select name="visibility" defaultValue="public">
              <option value="public">Public</option>
              <option value="private">Private link only</option>
            </Select>
            <Select name="ageRestriction" defaultValue="all_ages">
              <option value="all_ages">All ages</option>
              <option value="age_18_plus">18+</option>
              <option value="age_21_plus">21+</option>
            </Select>
          </div>
          <Input name="dressCode" placeholder="Dress code (optional)" />
          <Input name="instructions" placeholder="Instructions (optional)" />
          <Input name="locationNote" placeholder="Approximate location note (optional)" />
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          {createdLink && (
            <div className="space-y-4 rounded-2xl border border-black bg-offwhite p-5">
              <p className="text-sm font-bold">Event created. Share this link with guests:</p>
              <p className="break-all rounded-xl bg-white border border-line px-3 py-2 text-xs font-mono">
                {createdLink}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyCreatedLink}
                  className="inline-flex h-10 items-center rounded-full border border-line bg-white px-4 text-xs font-bold uppercase tracking-wide hover:border-black transition"
                >
                  {copied ? "Copied" : "Copy link"}
                </button>
                <Link
                  href={createdLink}
                  target="_blank"
                  className="inline-flex h-10 items-center rounded-full border border-line bg-white px-4 text-xs font-bold uppercase tracking-wide hover:border-black transition"
                >
                  Open page
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex h-10 items-center rounded-full bg-black text-white px-4 text-xs font-bold uppercase tracking-wide hover:bg-neutral-800 transition"
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
