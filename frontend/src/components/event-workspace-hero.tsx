import Link from "next/link";
import { ArrowUpRight, CalendarRange, MapPin, Pencil } from "lucide-react";
import CopyEventLink from "@/components/copy-event-link";
import { EventDeleteButton } from "@/components/event-delete-button";
import { EventShareActions } from "@/components/event-share-actions";
import { eventVisibilityLabel } from "@/lib/event-visibility";

function formatEventDate(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

export function EventWorkspaceHero({
  event,
  eventId,
  publicBaseUrl,
}: {
  event: {
    title: string;
    slug: string;
    date: string;
    location: string;
    image_url: string | null;
    visibility: string;
  };
  eventId: string;
  publicBaseUrl: string;
}) {
  const vis = eventVisibilityLabel(event.visibility);
  const publicPath = `/events/${event.slug}`;
  const fullUrl = publicBaseUrl ? `${publicBaseUrl.replace(/\/$/, "")}${publicPath}` : publicPath;

  return (
    <section className="relative overflow-hidden border-b border-white/[0.08]">
      {event.image_url ? (
        <div
          className="pointer-events-none absolute inset-0 scale-110 opacity-25"
          style={{ backgroundImage: `url(${event.image_url})`, backgroundSize: "cover", backgroundPosition: "center" }}
          aria-hidden
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-zinc-800/40 to-black" aria-hidden />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/85 to-[#030303]/40" aria-hidden />
      <div className="relative container-page py-8 sm:py-10">
        <Link
          href="/dashboard"
          className="inline-flex text-xs font-semibold uppercase tracking-wider text-zinc-500 transition hover:text-white"
        >
          ← All events
        </Link>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 gap-5 sm:gap-6">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-zinc-900 shadow-2xl ring-1 ring-white/10 sm:h-36 sm:w-36">
              {event.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element -- Supabase storage URLs vary per deploy
                <img src={event.image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-600">
                  <CalendarRange className="h-12 w-12" aria-hidden />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-amber-500/35 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200">
                  {vis}
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-4xl sm:tracking-tighter">{event.title}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-400">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarRange className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
                  {formatEventDate(event.date)}
                </span>
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <MapPin className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
                  <span className="truncate">{event.location}</span>
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Link
              href={`/dashboard/events/${eventId}/edit`}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/25 bg-white/[0.06] px-5 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/45 hover:bg-white/10"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              Edit details
            </Link>
            <Link
              href={publicPath}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/25 px-5 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/45"
            >
              View guest page
              <ArrowUpRight className="h-3.5 w-3.5 opacity-80" aria-hidden />
            </Link>
            <CopyEventLink slug={event.slug} variant="dark" />
            <EventShareActions slug={event.slug} shareTitle={event.title} shareText={`${event.title}: tickets on RAGE`} />
            <Link
              href={`/dashboard/events/${eventId}/check-in?focusScanner=1#scanner`}
              className="inline-flex h-11 items-center rounded-full border border-white/25 bg-white/[0.06] px-5 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/45 hover:bg-white/10"
            >
              Scan QR
            </Link>
            <EventDeleteButton eventId={eventId} eventTitle={event.title} />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-white/[0.1] bg-black/35 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="min-w-0 truncate font-mono text-xs text-zinc-400 sm:text-sm">{fullUrl}</p>
          <p className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Guests open this link · Share or copy</p>
        </div>
      </div>
    </section>
  );
}
