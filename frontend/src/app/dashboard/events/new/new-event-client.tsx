"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Calendar, CheckCircle2, Link2, QrCode, ScanLine, Share2 } from "lucide-react";
import { CreateEventFlow, type CreateEventPublishPayload } from "@/app/create-event/create-event-flow";
import { clearEventDraft, dataUrlToFile, readEventDraft } from "@/lib/event-draft";
import { hostNetFromGrossCents, resolvePlatformFeePercent } from "@/lib/platform-fees";
import { eventSchema } from "@/lib/validations";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { centsToDollars } from "@/lib/utils";

export default function NewEventClient() {
  const router = useRouter();
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
  const [publishedAgeRestriction, setPublishedAgeRestriction] = useState<"all_ages" | "age_18_plus" | "age_21_plus" | null>(null);
  const platformFeePercent = resolvePlatformFeePercent(process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENT);

  function formatAgeBadge(age: "all_ages" | "age_18_plus" | "age_21_plus" | null) {
    if (age === "age_18_plus") return "18+";
    if (age === "age_21_plus") return "21+";
    return "All ages";
  }

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
      showCapacityPublicly: payload.showCapacityPublicly,
    });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Invalid event data.");
    if (parsed.data.ticketsAvailable > parsed.data.capacity) {
      return setError("Tickets to sell cannot be greater than capacity.");
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const authedUser = sessionData.session?.user;
    if (!authedUser) return setError("Please login first.");
    const { data: profile } = await supabase.from("profiles").select("id").eq("id", authedUser.id).maybeSingle();
    if (!profile) {
      const next = encodeURIComponent("/dashboard/events/new");
      router.push(`/onboarding?next=${next}`);
      return;
    }

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
      show_capacity_publicly: parsed.data.showCapacityPublicly ?? false,
      slug,
    };

    let created: { id: string; slug: string } | null = null;
    let insertError: { message: string } | null = null;
    {
      const res = await supabase.from("events").insert(insertPayload).select("id,slug").single();
      created = res.data;
      insertError = res.error;
    }
    if (insertError?.message.toLowerCase().includes("show_capacity_publicly")) {
      const legacyPayload = { ...insertPayload } as Record<string, unknown>;
      delete legacyPayload.show_capacity_publicly;
      const legacy = await supabase.from("events").insert(legacyPayload).select("id,slug").single();
      created = legacy.data;
      insertError = legacy.error;
    }
    if (insertError || !created) return setError(insertError?.message ?? "Could not publish event.");
    clearEventDraft();
    const link = `${window.location.origin}/events/${created.slug}`;
    setCreatedLink(link);
    setCreatedSlug(created.slug);
    setCreatedEventId(created.id);
    setPublishedTitle(title);
    setPublishedImageUrl(imageUrl);
    setPublishedTicketPriceCents(Math.round(parsed.data.ticketPrice * 100));
    setPublishedAgeRestriction(parsed.data.ageRestriction);
  }

  if (createdLink) {
    return (
      <main className="container-page min-w-0 py-10 sm:py-14">
        <div className="mx-auto max-w-2xl min-w-0">
          <div className="space-y-5 rounded-2xl border border-white/[0.14] bg-gradient-to-br from-zinc-900 to-black p-5 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-1.5 rounded-full bg-brand-green/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-black">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Published
                </p>
                <h2 className="mt-2 text-xl font-black tracking-tight text-white sm:text-2xl">Your event is live</h2>
                <p className="mt-1 max-w-md text-sm text-muted">
                  Share the guest page, then watch sales and check-ins from your dashboard. You can always edit details later.
                </p>
                {publishedTitle ? <p className="mt-3 text-sm font-semibold text-white">{publishedTitle}</p> : null}
                {publishedTicketPriceCents !== null ? (
                  <div className="mt-1 space-y-1 text-sm text-muted">
                    <p>
                      Guest price (public): <span className="font-semibold text-white">${centsToDollars(publishedTicketPriceCents)}</span>
                    </p>
                    <p>
                      You receive (estimate):{" "}
                      <span className="font-semibold text-white">
                        ${centsToDollars(hostNetFromGrossCents(publishedTicketPriceCents, platformFeePercent))}
                      </span>
                    </p>
                  </div>
                ) : null}
              </div>
              {qrCodeUrl && (
                <div className="rounded-xl border border-white/20 bg-zinc-950 p-2.5 shadow-sm">
                  <p className="mb-1 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-500">Share QR</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCodeUrl} alt="QR code for guest event link" className="h-24 w-24 rounded-md sm:h-28 sm:w-28" />
                </div>
              )}
            </div>

            {publishedImageUrl ? (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-line bg-offwhite">
                <Image src={publishedImageUrl} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 42rem" unoptimized />
                <span className="absolute left-3 top-3 inline-flex rounded-full border border-white/20 bg-black/65 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                  {formatAgeBadge(publishedAgeRestriction)}
                </span>
              </div>
            ) : null}

            <div className="rounded-xl border border-white/[0.12] bg-white/[0.03] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Guest link</p>
              <p className="mt-2 break-all rounded-lg border border-white/[0.12] bg-black/30 px-3 py-2 font-mono text-[11px] text-zinc-200">{createdLink}</p>
              <p className="mt-2 text-xs text-muted">
                Share this exact link (or the QR above). Guests buy tickets from this page.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyCreatedLink}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-black px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-neutral-800"
                >
                  <Link2 className="h-3.5 w-3.5" aria-hidden />
                  {copied ? "Copied" : "Copy link"}
                </button>
                <Link
                  href={createdLink}
                  target="_blank"
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-4 text-xs font-bold uppercase tracking-wide text-black transition hover:brightness-105"
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
                {createdEventId ? (
                  <Link
                    href={`/dashboard/events/${createdEventId}`}
                    className="inline-flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-4 text-xs font-bold uppercase tracking-wide text-black transition hover:brightness-105"
                  >
                    Event hub
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/[0.12] bg-white/[0.03] p-4">
                <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                  <Calendar className="h-3.5 w-3.5" aria-hidden /> Next
                </p>
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-muted">
                  <li>Share the guest link or share QR so people can buy.</li>
                  <li>At the door, open check-in and scan attendee ticket QRs.</li>
                </ol>
              </div>
              <div className="rounded-xl border border-white/[0.12] bg-white/[0.03] p-4">
                <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                  <QrCode className="h-3.5 w-3.5" aria-hidden /> QR meaning
                </p>
                <p className="mt-2 text-sm text-muted">This QR opens your event page for guests. Ticket-entry QR codes are generated after each purchase.</p>
                {createdEventId ? (
                  <Link
                    href={`/dashboard/events/${createdEventId}/check-in`}
                    className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white text-xs font-bold uppercase tracking-wide text-black transition hover:border-white/40 hover:bg-zinc-100"
                  >
                    <ScanLine className="h-3.5 w-3.5" aria-hidden />
                    Open check-in
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white text-xs font-bold uppercase tracking-wide text-black transition hover:border-white/40 hover:bg-zinc-100"
                  >
                    Open dashboard
                  </Link>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-white/[0.08] pt-4">
              <Link
                href={createdEventId ? `/dashboard/events/${createdEventId}` : "/dashboard"}
                className="inline-flex h-10 flex-1 min-w-[10rem] items-center justify-center rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-4 text-xs font-bold uppercase tracking-wide text-black transition hover:brightness-105"
              >
                Go to event hub
              </Link>
              <Link
                href="/create-event"
                className="inline-flex h-10 flex-1 min-w-[10rem] items-center justify-center rounded-full border border-white/20 bg-white/[0.04] px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/40 hover:bg-white/[0.08]"
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
