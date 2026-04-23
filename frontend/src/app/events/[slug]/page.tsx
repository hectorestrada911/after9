import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, Clock3, Flame, MapPin, ShieldCheck, Sparkles, Ticket, Users, Zap } from "lucide-react";
import { EventShareActions } from "@/components/event-share-actions";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { centsToDollars } from "@/lib/utils";
import PurchaseForm from "./purchase-form";

function formatEventDate(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function formatTimeRange(start: string, end: string) {
  const parse = (raw: string) => {
    const parts = raw.split(":");
    const h = Number(parts[0]);
    const m = Number(parts[1] ?? 0);
    if (Number.isNaN(h)) return raw;
    return new Date(2000, 0, 1, h, m).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };
  return `${parse(start)} – ${parse(end)}`;
}

function formatAge(a: string | undefined) {
  if (!a || a === "all_ages") return "All ages";
  if (a === "age_18_plus") return "18+";
  if (a === "age_21_plus") return "21+";
  return a.replaceAll("_", " ");
}

function mapLinksForAddress(address: string) {
  const q = encodeURIComponent(address.trim());
  return {
    google: `https://www.google.com/maps/search/?api=1&query=${q}`,
    apple: `https://maps.apple.com/?q=${q}`,
  };
}

export default async function PublicEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await getSupabaseServerClient();
  const { data: event } = await supabase.from("events").select("*, profiles(organizer_name)").eq("slug", slug).single();
  if (!event) return notFound();

  const mapUrls = mapLinksForAddress(event.location);

  const { count: soldCount } = await supabase.from("tickets").select("id", { count: "exact", head: true }).eq("event_id", event.id);
  const sold = soldCount ?? 0;
  const remaining = Math.max((event.tickets_available ?? 0) - sold, 0);
  const soldPercent = Math.min(Math.round((sold / Math.max(event.tickets_available ?? 1, 1)) * 100), 100);
  const showCapacityPublicly = Boolean(event.show_capacity_publicly);
  const lowStock = remaining > 0 && remaining <= Math.max(12, Math.ceil((event.tickets_available ?? 0) * 0.15));
  const moving = sold >= 3;

  const organizer = event.profiles?.organizer_name ?? "Host";
  const imageSrc = event.image_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30";

  return (
    <main className="relative min-w-0 bg-[#030303] text-white antialiased [color-scheme:dark]">
      {/* Poster: in-flow min-height so the flyer always reserves space (no collapsed hero) */}
      <section className="w-full px-0 sm:px-6 sm:pt-6">
        <div className="relative mx-auto min-h-[min(72dvh,820px)] w-full max-w-[1400px] overflow-hidden sm:min-h-[min(58vh,720px)] sm:rounded-[2rem] sm:ring-1 sm:ring-white/10">
          <div className="absolute inset-0 overflow-hidden">
            <div className="motion-safe:animate-heroZoom h-full min-h-[min(72dvh,820px)] w-full will-change-transform sm:min-h-[min(58vh,720px)] motion-reduce:animate-none motion-reduce:transform-none">
              <Image src={imageSrc} alt={event.title} fill priority className="object-cover object-center" unoptimized />
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,rgba(75,250,148,0.18),transparent_50%)]" aria-hidden />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/78 to-black/25" aria-hidden />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black to-transparent" aria-hidden />

          <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-5 px-5 pb-8 pt-20 sm:px-10 sm:pb-10">
            <div className="flex flex-wrap items-center gap-2">
              {moving ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-green/35 bg-brand-green/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-green backdrop-blur-md">
                  <Zap className="h-3 w-3" aria-hidden />
                  {sold} {sold === 1 ? "person" : "people"} in
                </span>
              ) : null}
              {lowStock ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-100 backdrop-blur-md">
                  <Flame className="h-3 w-3" aria-hidden />
                  Only {remaining} left
                </span>
              ) : null}
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/85 backdrop-blur-md sm:text-[11px]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-60 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-green" />
                </span>
                Live on RAGE
              </span>
            </div>

            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur-md sm:text-[11px]">
              <Sparkles className="h-3.5 w-3.5 text-brand-green" aria-hidden />
              Hosted by <span className="text-white">{organizer}</span>
            </div>

            <h1 className="max-w-4xl text-[clamp(2rem,8.5vw,3.5rem)] font-black leading-[0.92] tracking-tighter text-white drop-shadow-[0_4px_36px_rgba(0,0,0,0.9)] sm:text-6xl lg:text-7xl">
              {event.title}
            </h1>
            <p className="max-w-2xl text-base font-medium leading-relaxed text-white/90 sm:text-lg">
              {formatEventDate(event.date)} · {formatTimeRange(event.start_time, event.end_time)}
            </p>

            <EventShareActions
              slug={slug}
              shareTitle={event.title}
              shareText={`${event.title}, ${formatEventDate(event.date)}. Get tickets:`}
              className="pt-1"
            />
          </div>
        </div>
      </section>

      <div className="relative z-20 -mt-4 sm:-mt-8">
        <div className="container-page pb-20 pt-4 sm:pb-24 sm:pt-2">
          <div className="grid gap-8 lg:grid-cols-[1fr,min(100%,420px)] lg:items-start lg:gap-10">
            <div className="motion-safe:animate-fadeUp min-w-0 space-y-8">
              <p className="text-lg leading-relaxed text-zinc-300 sm:text-xl">{event.description}</p>

              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="flex gap-4 rounded-2xl border border-white/[0.1] bg-white/[0.04] p-4 backdrop-blur-md sm:p-5">
                  <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" strokeWidth={2} aria-hidden />
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Date</dt>
                    <dd className="mt-1 text-base font-semibold text-white sm:text-lg">{formatEventDate(event.date)}</dd>
                  </div>
                </div>
                <div className="flex gap-4 rounded-2xl border border-white/[0.1] bg-white/[0.04] p-4 backdrop-blur-md sm:p-5">
                  <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" strokeWidth={2} aria-hidden />
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Time</dt>
                    <dd className="mt-1 text-base font-semibold text-white sm:text-lg">{formatTimeRange(event.start_time, event.end_time)}</dd>
                  </div>
                </div>
                <div className="flex gap-4 rounded-2xl border border-white/[0.1] bg-white/[0.04] p-4 backdrop-blur-md sm:col-span-2 sm:p-5">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" strokeWidth={2} aria-hidden />
                  <div className="min-w-0">
                    <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Location</dt>
                    <dd className="mt-1 text-base font-semibold text-white sm:text-lg">{event.location}</dd>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                      <a
                        href={mapUrls.google}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-brand-green underline decoration-brand-green/40 underline-offset-4 transition hover:decoration-brand-green"
                      >
                        Google Maps
                      </a>
                      <a
                        href={mapUrls.apple}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-brand-green underline decoration-brand-green/40 underline-offset-4 transition hover:decoration-brand-green"
                      >
                        Apple Maps
                      </a>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                      Opens in your browser; on your phone it can hand off to your installed maps app.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 rounded-2xl border border-white/[0.1] bg-white/[0.04] p-4 backdrop-blur-md sm:p-5">
                  <Users className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" strokeWidth={2} aria-hidden />
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Age</dt>
                    <dd className="mt-1 text-base font-semibold capitalize text-white sm:text-lg">{formatAge(event.age_restriction)}</dd>
                  </div>
                </div>
              </dl>

              {(event.dress_code || event.instructions || event.location_note) && (
                <div className="space-y-6 border-t border-white/[0.08] pt-8">
                  {event.dress_code && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Dress code</p>
                      <p className="mt-2 text-base leading-relaxed text-zinc-200 sm:text-lg">{event.dress_code}</p>
                    </div>
                  )}
                  {event.instructions && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Instructions</p>
                      <p className="mt-2 text-base leading-relaxed text-zinc-200 sm:text-lg">{event.instructions}</p>
                    </div>
                  )}
                  {event.location_note && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Getting there</p>
                      <p className="mt-2 text-base leading-relaxed text-zinc-200 sm:text-lg">{event.location_note}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <aside className="motion-safe:animate-fadeUp min-w-0 lg:sticky lg:top-24 lg:self-start">
              <div className="relative overflow-hidden rounded-3xl border border-brand-green/25 bg-zinc-950/85 p-6 shadow-[0_0_0_1px_rgba(75,250,148,0.12),0_40px_100px_-36px_rgba(0,0,0,0.9)] backdrop-blur-xl motion-safe:animate-ctaGlow sm:p-8 motion-reduce:animate-none motion-reduce:shadow-[0_40px_100px_-36px_rgba(0,0,0,0.9)]">
                <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-brand-green/30 blur-3xl" aria-hidden />
                <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-emerald-400/15 blur-3xl" aria-hidden />
                <div className="relative">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Lock yours in</p>
                  <p className="mt-2 text-balance text-4xl font-black tracking-tighter text-white sm:text-5xl">${centsToDollars(event.ticket_price)}</p>
                  <p className="mt-3 inline-flex flex-wrap items-center gap-2 text-sm font-medium text-zinc-400">
                    <Ticket className="h-4 w-4 text-brand-green" strokeWidth={2} aria-hidden />
                    {showCapacityPublicly ? (
                      <>
                        <span className="font-bold text-white">{remaining}</span>
                        <span>spots left</span>
                      </>
                    ) : (
                      <span className="font-bold text-white">Limited spots</span>
                    )}
                  </p>

                  {showCapacityPublicly ? (
                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-zinc-500">
                        <span>Energy</span>
                        <span className="tabular-nums text-white">{soldPercent}% claimed</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-green via-emerald-300 to-cyan-300 motion-safe:transition-[width] motion-safe:duration-700"
                          style={{ width: `${soldPercent}%` }}
                        />
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-white/[0.08] bg-black/40 px-4 py-3 text-xs leading-relaxed text-zinc-400">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2} aria-hidden />
                    <span>
                      <span className="font-semibold text-zinc-200">Secure checkout.</span> Mobile ticket + QR appears instantly in-app.
                    </span>
                  </div>

                  {remaining <= 0 && (
                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-bold text-white">
                      Sold out. Contact the host for a waitlist.
                    </div>
                  )}

                  <div id="buy-tickets" className="mt-6 scroll-mt-28">
                    <PurchaseForm
                      eventId={event.id}
                      price={event.ticket_price}
                      title={event.title}
                      slug={slug}
                      soldOut={remaining <= 0}
                      theme="dark"
                    />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] lg:hidden">
        <a
          href="#buy-tickets"
          className="pointer-events-auto inline-flex h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-zinc-100 to-zinc-300 text-base font-black text-zinc-900 shadow-[0_18px_38px_-22px_rgba(0,0,0,0.8)] transition active:scale-[0.995]"
        >
          {remaining <= 0 ? "Sold out" : `Buy tickets from $${centsToDollars(event.ticket_price)}`}
        </a>
      </div>
    </main>
  );
}
