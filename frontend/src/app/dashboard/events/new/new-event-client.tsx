"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Calendar, CheckCircle2, Link2, MapPin, QrCode, ScanLine, Share2 } from "lucide-react";
import { CreateEventFlow, type CreateEventPublishPayload } from "@/app/create-event/create-event-flow";
import { clearEventDraft, dataUrlToFile, readEventDraft } from "@/lib/event-draft";
import { eventSchema } from "@/lib/validations";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { centsToDollars } from "@/lib/utils";

export default function NewEventClient() {
  const supabase = getSupabaseBrowserClient();
  const [error, setError] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [publishedTitle, setPublishedTitle] = useState<string | null>(null);
  const [publishedImageUrl, setPublishedImageUrl] = useState<string | null>(null);
  const [publishedTicketPriceCents, setPublishedTicketPriceCents] = useState<number | null>(null);

  useEffect(() => {
    setDraftLoaded(Boolean(readEventDraft()));
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

  async function publishFromWizard(payload: CreateEventPublishPayload) {
    setError(null);
    setCreatedLink(null);
    setCreatedSlug(null);
    setCreatedEventId(null);
    setQrCodeUrl(null);
    setCopied(false);

    const parsed = eventSchema.safeParse({
      title: payload.title,
      description: payload.description,
      imageUrl: payload.imageUrl,
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      location: payload.location,
      capacity: payload.capacity,
      ticketPrice: payload.ticketPrice,
      ticketsAvailable: payload.ticketsAvailable,
      visibility: payload.visibility,
      ageRestriction: payload.ageRestriction,
      dressCode: payload.dressCode,
      instructions: payload.instructions,
      locationNote: payload.locationNote,
    });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Invalid event data.");
    if (parsed.data.ticketsAvailable > parsed.data.capacity) {
      return setError("Tickets to sell cannot be greater than capacity.");
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const authedUser = sessionData.session?.user;
    if (!authedUser) return setError("Please login first.");

    const title = parsed.data.title;
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;
    let imageUrl = parsed.data.imageUrl;

    let fileToUpload: File | null = null;
    if (payload.coverMode === "upload") {
      const draft = readEventDraft();
      if (draft?.imageDataUrl) {
        try {
          fileToUpload = await dataUrlToFile(draft.imageDataUrl, "flyer.jpg");
        } catch {
          return setError("Could not read your uploaded flyer. Re-upload on step 1 and try again.");
        }
      }
    }

    if (fileToUpload && fileToUpload.size > 0) {
      const extension = fileToUpload.name.split(".").pop() || "jpg";
      const path = `${authedUser.id}/${slug}-${Date.now()}.${extension}`;
      const upload = await supabase.storage.from("event-images").upload(path, fileToUpload, { upsert: true });
      if (upload.error) return setError(upload.error.message);
      imageUrl = supabase.storage.from("event-images").getPublicUrl(path).data.publicUrl;
    }

    const insertPayload = {
      host_id: authedUser.id,
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

    const { data: created, error: insertError } = await supabase.from("events").insert(insertPayload).select("id,slug").single();
    if (insertError) return setError(insertError.message);
    clearEventDraft();
    const link = `${window.location.origin}/events/${created.slug}`;
    setCreatedLink(link);
    setCreatedSlug(created.slug);
    setCreatedEventId(created.id);
    setPublishedTitle(title);
    setPublishedImageUrl(imageUrl);
    setPublishedTicketPriceCents(Math.round(parsed.data.ticketPrice * 100));
  }

  if (createdLink) {
    return (
      <main className="container-page min-w-0 py-10 sm:py-14">
        <div className="mx-auto max-w-2xl min-w-0">
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
                {publishedTitle ? <p className="mt-3 text-sm font-semibold text-black">{publishedTitle}</p> : null}
                {publishedTicketPriceCents !== null ? (
                  <p className="mt-1 text-sm text-muted">
                    Ticket price on the public page: <span className="font-semibold text-black">${centsToDollars(publishedTicketPriceCents)}</span>
                  </p>
                ) : null}
              </div>
              {qrCodeUrl && (
                <div className="rounded-xl border border-line bg-white p-2.5 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCodeUrl} alt="QR code for event link" className="h-24 w-24 rounded-md sm:h-28 sm:w-28" />
                </div>
              )}
            </div>

            {publishedImageUrl ? (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-line bg-offwhite">
                <Image src={publishedImageUrl} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 42rem" unoptimized />
              </div>
            ) : null}

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
                  <Calendar className="h-3.5 w-3.5" aria-hidden /> Next
                </p>
                <p className="mt-2 text-sm text-muted">Share the link, then open check-in when the line forms.</p>
              </div>
              <div className="rounded-xl border border-line bg-white/80 p-4">
                <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                  <QrCode className="h-3.5 w-3.5" aria-hidden /> Door
                </p>
                <p className="mt-2 text-sm text-muted">Scan tickets from your phone.</p>
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
        </div>
      </main>
    );
  }

  return (
    <main className="container-page min-w-0 py-10 sm:py-14">
      <div className="mx-auto max-w-2xl min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Host tools</p>
        <h1 className="mt-3 display-section-fluid">Create event</h1>
        <p className="mt-4 text-base text-muted max-w-xl">Same guided flow as the marketing builder — publish when you are ready.</p>
        {draftLoaded ? (
          <div className="mt-6 rounded-2xl border border-black bg-brand-green/20 px-4 py-3 text-sm font-medium text-black">
            We found a saved draft in this browser. Your wizard is prefilled from it.
          </div>
        ) : null}
        {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}
      </div>

      <CreateEventFlow flowMode="hostPublish" onPublish={publishFromWizard} />
    </main>
  );
}
