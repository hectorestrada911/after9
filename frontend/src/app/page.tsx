import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, Play } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { centsToDollars } from "@/lib/utils";

type EventCard = {
  slug: string;
  title: string;
  date: string;
  location: string;
  ticket_price: number;
  image_url: string | null;
};

const fallbackEvents: EventCard[] = [
  { slug: "campus-lights-fest", title: "Campus Lights Fest", date: "2026-05-10", location: "Student Union Hall", ticket_price: 2500, image_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80" },
  { slug: "rooftop-sunset-social", title: "Rooftop Sunset Social", date: "2026-05-18", location: "Riverside Rooftop", ticket_price: 3500, image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80" },
  { slug: "campus-lights-fest", title: "Late Night DJ Set", date: "2026-06-02", location: "The Warehouse", ticket_price: 1800, image_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80" },
  { slug: "rooftop-sunset-social", title: "Indie Showcase", date: "2026-06-14", location: "Soda Bar", ticket_price: 2000, image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80" },
  { slug: "campus-lights-fest", title: "Sunrise Beach Rave", date: "2026-06-22", location: "Mission Beach", ticket_price: 2800, image_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=80" },
  { slug: "rooftop-sunset-social", title: "Comedy Night Live", date: "2026-07-01", location: "The Comedy Loft", ticket_price: 1500, image_url: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=900&q=80" },
];

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

export default async function HomePage() {
  let events: EventCard[] = fallbackEvents;
  try {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase
      .from("events")
      .select("slug,title,date,location,ticket_price,image_url")
      .eq("visibility", "public")
      .order("date", { ascending: true })
      .limit(12);
    if (data && data.length > 0) {
      events = data;
    }
  } catch {
    // fall through to fallback
  }

  return (
    <main className="min-w-0 bg-white text-black">
      <section className="container-page pb-16 pt-12 sm:pb-24 sm:pt-16">
        <div className="grid min-w-0 items-center gap-10 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="min-w-0">
            <h1 className="display-hero-fluid min-w-0">
              <span className="block">Welcome to the</span>
              <span className="block">alternative</span>
            </h1>
            <p className="mt-7 max-w-sm text-[15px] leading-relaxed text-neutral-500 sm:max-w-md sm:text-base">
              Incredible live shows. Upfront pricing. Mobile tickets. RAGE makes going out easy.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/create-event"
                className="inline-flex h-11 items-center rounded-full bg-neutral-950 px-7 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-neutral-800 sm:h-12 sm:px-8"
              >
                Create event
              </Link>
              <Link
                href="/demo-flow"
                className="inline-flex h-11 items-center rounded-full border border-neutral-300/90 bg-white px-7 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-900 transition hover:bg-neutral-50 sm:h-12 sm:px-8"
              >
                Browse events
              </Link>
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-full min-w-0 max-w-[560px] overflow-hidden rounded-2xl bg-black">
            <Image
              src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80"
              alt="RAGE events"
              fill
              priority
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-xs font-bold uppercase tracking-widest text-white/70">RAGE</p>
              <p className="mt-1 text-3xl font-black leading-none tracking-tighter text-white sm:text-4xl">
                Where the
                <br />
                night begins.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pb-16 sm:pb-20">
        <div className="relative aspect-video min-h-[200px] w-full overflow-hidden rounded-2xl bg-black sm:aspect-[21/9] sm:min-h-0">
          <video
            src="/a9-banner.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 max-w-md sm:bottom-10 sm:left-10 sm:right-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">RAGE</p>
            <p className="mt-2 text-balance text-2xl font-black leading-[0.95] tracking-tighter text-white sm:text-4xl lg:text-5xl">
              Real nights.
              <br />
              Real rooms.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-line py-14 sm:py-20">
        <div className="container-page">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-2xl font-black tracking-tighter sm:text-3xl">Trending now</h2>
              <p className="mt-2 max-w-xl text-base text-muted">
                Check out some of the most popular events coming up, from club nights and gigs to artist signings and comedy shows.
              </p>
            </div>
            <Link href="/demo-flow" className="pill-dark h-11 self-start px-6 text-xs sm:self-end">
              BROWSE EVENTS
            </Link>
          </div>
        </div>

        <div className="no-scrollbar overflow-x-auto pb-4">
          <div className="mx-auto flex max-w-[1400px] gap-4 px-4 sm:gap-5 sm:px-6">
            {events.map((event, i) => (
              <Link key={`${event.slug}-${i}`} href={`/events/${event.slug}`} className="group w-[260px] shrink-0 sm:w-[280px]">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-offwhite">
                  {event.image_url && (
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="280px"
                    />
                  )}
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur">
                      <Play size={14} fill="currentColor" />
                    </span>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur">
                      <Heart size={14} />
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="line-clamp-2 text-base font-bold leading-tight">{event.title}</p>
                  <p className="mt-1 text-sm text-muted">{formatDate(event.date)}</p>
                  <p className="text-sm text-muted">{event.location}</p>
                  <p className="mt-1 text-sm font-semibold">${centsToDollars(event.ticket_price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-offwhite py-20 sm:py-28">
        <div className="container-page">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">How RAGE works</p>
          <h2 className="mt-3 display-section-fluid">
            Built to sell.
            <br />
            Built to operate.
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                n: "01",
                title: "Publish a trusted page",
                body: "Premium typography, clear structure, and high-signal details so guests immediately understand value and legitimacy.",
              },
              {
                n: "02",
                title: "Convert with low-friction checkout",
                body: "Strong trust cues, simple quantity decisions, and familiar payment flow remove hesitation and improve completed orders.",
              },
              {
                n: "03",
                title: "Run doors smoothly",
                body: "Attendee search, duplicate prevention, and check-in clarity let your team move confidently when lines get long.",
              },
            ].map((step) => (
              <div key={step.n} className="border-t border-black pt-5">
                <p className="text-sm font-bold">{step.n}</p>
                <h3 className="mt-3 text-2xl font-black leading-tight tracking-tighter">{step.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-black py-20 text-white sm:py-28">
        <div className="container-page">
          <div className="grid min-w-0 gap-10 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-white/60">For hosts</p>
              <h3 className="mt-4 display-section-fluid">
                Turn your event
                <br />
                into income.
              </h3>
              <p className="mt-5 max-w-2xl text-lg text-white/70">One platform to create, sell, and operate event nights with confidence.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/create-event"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-7 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-950 transition hover:bg-neutral-200 sm:h-12"
                >
                  Create event <ArrowRight size={14} strokeWidth={2} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center rounded-full border border-white/25 px-7 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:border-white/50 sm:h-12"
                >
                  Host login
                </Link>
              </div>
            </div>
            <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-3">
              {[
                ["4.8/5", "Host satisfaction"],
                ["+31%", "Conversion lift"],
                ["<2 min", "Launch time"],
                ["99.9%", "Checkout uptime"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-2xl border border-white/15 p-4 sm:p-5">
                  <p className="text-2xl font-black tracking-tighter sm:text-3xl">{v}</p>
                  <p className="mt-1 text-[10px] uppercase leading-snug tracking-wider text-white/60 sm:text-xs">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
