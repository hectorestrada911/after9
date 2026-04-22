import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, Play } from "lucide-react";
import { HomeBannerVideoLoader } from "@/components/home-banner-video-loader";
import { HomeScrollSplitVisual } from "@/components/home-scroll-split-visual";
import { HomeSocialProof } from "@/components/home-social-proof";
import { HostProductSnapshot } from "@/components/host-product-snapshot";
import { HostWorkflowHighlight } from "@/components/host-workflow-highlight";
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
    <main className="min-w-0 text-zinc-100">
      <section className="container-page pb-12 pt-12 sm:pb-16 sm:pt-16">
        <div className="flex min-w-0 flex-col gap-10 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-14 lg:gap-y-12">
          <div className="min-w-0 max-w-full lg:col-start-1 lg:row-start-1 lg:min-w-0 lg:overflow-hidden lg:pr-2">
            <h1 className="display-hero-fluid display-hero-contained min-w-0 text-balance text-white">
              <span className="block">The alternative</span>
              <span className="block">you can trust.</span>
            </h1>
            <p className="mt-7 max-w-sm text-[15px] leading-relaxed text-zinc-400 sm:max-w-md sm:text-base">
              Honest pricing on every page, tickets on the phone, and a door flow that stays human when the room peaks.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/create-event"
                className="inline-flex h-11 items-center rounded-full bg-white px-7 text-[11px] font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-zinc-200 sm:h-12 sm:px-8"
              >
                Create event
              </Link>
              <Link href="/#browse-events" className="pill-light h-11 px-7 text-[11px] sm:h-12 sm:px-8">
                Browse events
              </Link>
            </div>
          </div>

          {/* Mobile: video directly under headline. Desktop: full-width row under title + image. */}
          <div className="relative -mx-4 w-[calc(100%+2rem)] overflow-hidden rounded-2xl border border-white/[0.06] bg-black sm:mx-0 sm:w-full lg:col-span-2 lg:col-start-1 lg:row-start-2">
            <HomeBannerVideoLoader />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 max-w-lg sm:bottom-8 sm:left-8">
              <p className="text-xs font-bold uppercase tracking-widest text-white/70">RAGE</p>
              <p className="mt-2 text-balance text-2xl font-black leading-[0.95] tracking-tighter text-white sm:text-3xl lg:text-4xl">
                Crowd in.
                <br />
                Friction out.
              </p>
            </div>
          </div>

          {/* Still photo under the banner video on mobile; top-right tile on desktop */}
          <div className="relative mx-auto aspect-square w-full max-w-md min-w-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900 sm:max-w-lg lg:mx-0 lg:max-w-none lg:col-start-2 lg:row-start-1">
            <Image
              src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80"
              alt="RAGE, live energy"
              fill
              loading="lazy"
              unoptimized
              sizes="(max-width: 1023px) min(100vw, 32rem), min(50vw, 560px)"
              className="object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-xs font-bold uppercase tracking-widest text-white/70">RAGE</p>
              <p className="mt-1 text-3xl font-black leading-none tracking-tighter text-white sm:text-4xl">
                Where the
                <br />
                build hits.
              </p>
            </div>
          </div>
        </div>
      </section>

      <HomeSocialProof />

      <section id="browse-events" className="border-t border-white/[0.08] py-16 sm:py-24">
        <div className="container-page">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-2xl font-black tracking-tighter text-white sm:text-3xl">Trending now</h2>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-zinc-400">
                Fresh drops from rooms we love: club nights, live sets, comedy, and the kind of nights people actually talk about.
              </p>
            </div>
            <Link href="/#browse-events" className="pill-dark h-11 self-start px-6 text-xs sm:self-end">
              BROWSE EVENTS
            </Link>
          </div>
        </div>

        <div className="no-scrollbar overflow-x-auto pb-4">
          <div className="mx-auto flex max-w-[1400px] gap-4 px-4 sm:gap-5 sm:px-6">
            {events.map((event, i) => (
              <Link key={`${event.slug}-${i}`} href={`/events/${event.slug}`} className="group w-[260px] shrink-0 sm:w-[280px]">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900">
                  {event.image_url && (
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="280px"
                      unoptimized
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
                  <p className="line-clamp-2 text-base font-bold leading-tight text-white">{event.title}</p>
                  <p className="mt-1 text-sm text-zinc-500">{formatDate(event.date)}</p>
                  <p className="text-sm text-zinc-500">{event.location}</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-200">${centsToDollars(event.ticket_price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.08] bg-zinc-950">
        <div className="container-page pt-16 sm:pt-20 lg:pt-24">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">How RAGE works</p>
          <h2 className="mt-3 display-section-fluid text-white">
            Built to sell.
            <br />
            Built to operate.
          </h2>
        </div>
        <HomeScrollSplitVisual />
      </section>

      <section className="border-t border-white/[0.08] bg-black py-20 text-white sm:py-28">
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
                  Login
                </Link>
              </div>
            </div>
            <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-3">
              {[
                ["Minutes", "From blank form to live page"],
                ["One link", "Sell tickets & share anywhere"],
                ["QR + email", "What guests get after buying"],
                ["Search + scan", "How you run the door"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-2xl border border-white/15 p-4 sm:p-5">
                  <p className="text-2xl font-black tracking-tighter sm:text-3xl">{v}</p>
                  <p className="mt-1 text-[10px] uppercase leading-snug tracking-wider text-white/60 sm:text-xs">{l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-8 border-t border-white/[0.08] pt-14 lg:mt-16 lg:flex-row lg:items-start lg:gap-14 lg:pt-16">
            <div className="min-w-0 shrink-0 lg:max-w-[14rem] lg:pt-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">What guests open</p>
              <p className="mt-3 text-lg font-bold leading-snug text-white sm:text-xl">
                A page that looks worth the ticket.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                Cover, details, price, checkout: the same bones every public event uses. Below is a static mock, not a
                live event.
              </p>
            </div>
            <div className="mx-auto w-full max-w-md flex-1 lg:mx-0 lg:max-w-lg">
              <HostProductSnapshot />
            </div>
          </div>

          <div className="mt-14 border-t border-white/[0.08] pt-14 sm:mt-20 sm:pt-20">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-white/45 sm:text-left">
              How it feels to host
            </p>
            <h3 className="mt-3 text-balance text-center text-2xl font-black tracking-tight text-white sm:text-left sm:text-3xl">
              Launch, collect, and scan in one clean flow.
            </h3>
            <p className="mt-3 max-w-2xl text-center text-sm text-zinc-400 sm:text-left">
              Three steps: publish, get paid, scan at door.
            </p>
            <div className="mt-6">
              <HostWorkflowHighlight />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
