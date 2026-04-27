import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCircle2, Download, ShoppingBag, Sparkles, Ticket, Zap } from "lucide-react";
import { Card, EmptyState, StatCard } from "@/components/ui";
import { centsToDollars } from "@/lib/utils";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import CopyEventLink from "@/components/copy-event-link";
import SalesChart from "@/components/sales-chart";
import DashboardAuthFallback from "@/components/dashboard-auth-fallback";
import HostPayoutCta from "@/components/host-payout-cta";

function formatEventDate(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) {
    return <DashboardAuthFallback />;
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (profileError) {
    return <DashboardAuthFallback />;
  }
  if (!profile) {
    return (
      <main className="container-page min-w-0 py-16 sm:py-24">
        <div className="mx-auto max-w-md text-center">
          <h1 className="display-section-fluid">Finish onboarding</h1>
          <p className="mt-4 text-base text-muted">Set up your organizer profile before creating events.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/onboarding?next=/dashboard" className="inline-flex pill-dark h-12 px-7 text-sm">CONTINUE</Link>
            <Link href="/account" className="inline-flex h-12 items-center rounded-full border border-white/20 px-6 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/40">
              ACCOUNT HOME
            </Link>
          </div>
        </div>
      </main>
    );
  }

  type EventRowBase = {
    id: string;
    slug: string;
    title: string;
    date: string;
    ticket_price: number;
    tickets_available: number;
  };
  type EventRowWithArchive = EventRowBase & { archived_at: string | null };

  const eventsWithArchive = await supabase
    .from("events")
    .select("id,slug,title,date,ticket_price,tickets_available,archived_at")
    .eq("host_id", userId)
    .order("date", { ascending: true });

  // Backward-compatible fallback for projects where archived_at is not migrated yet.
  const eventsWithoutArchive =
    eventsWithArchive.error && eventsWithArchive.error.message.toLowerCase().includes("archived_at")
      ? await supabase
          .from("events")
          .select("id,slug,title,date,ticket_price,tickets_available")
          .eq("host_id", userId)
          .order("date", { ascending: true })
      : null;

  const events = (eventsWithoutArchive?.data ?? eventsWithArchive.data ?? []) as Array<EventRowBase | EventRowWithArchive>;
  const hasArchiveColumn = !eventsWithoutArchive;
  const activeEvents: EventRowBase[] = hasArchiveColumn
    ? (events as EventRowWithArchive[]).filter((e) => !e.archived_at)
    : (events as EventRowBase[]);
  const archivedEvents: EventRowBase[] = hasArchiveColumn
    ? (events as EventRowWithArchive[]).filter((e) => Boolean(e.archived_at))
    : [];
  const eventIds = activeEvents.map((e) => e.id);

  const [ordersRes, checkInsRes] = await Promise.all([
    eventIds.length > 0
      ? supabase.from("orders").select("id,event_id,buyer_name,buyer_email,total_amount,quantity,created_at").in("event_id", eventIds)
      : Promise.resolve({ data: [] as { id: string; event_id: string; buyer_name: string; buyer_email: string; total_amount: number; quantity: number; created_at: string }[], error: null }),
    eventIds.length > 0
      ? supabase.from("check_ins").select("*", { count: "exact", head: true }).in("event_id", eventIds)
      : Promise.resolve({ count: 0, error: null }),
  ]);
  const orders = ordersRes.data;
  const checkedIn = checkInsRes.count;

  const revenue = (orders ?? []).reduce((sum, o) => sum + (o.total_amount ?? 0), 0);
  const ticketsSold = (orders ?? []).reduce((sum, o) => sum + (o.quantity ?? 0), 0);
  const attendeeRows = (orders ?? []).slice().sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 10);
  const recentOrders = (orders ?? []).slice().sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 12);
  const salesData = activeEvents.map((event) => ({
    name: event.title.length > 16 ? `${event.title.slice(0, 16)}…` : event.title,
    sold: (orders ?? []).filter((o) => o.event_id === event.id).reduce((sum, o) => sum + o.quantity, 0),
  }));
  const scannerHref = activeEvents[0] ? `/dashboard/events/${activeEvents[0].id}/check-in` : "/dashboard/events/new";
  const isFirstHostView = activeEvents.length === 0 && (orders?.length ?? 0) === 0;

  return (
    <main className="container-page min-w-0 py-10 sm:py-14">
      <Link href="/account" className="inline-flex text-xs font-semibold uppercase tracking-wider text-zinc-500 transition hover:text-white">
        ← Account hub
      </Link>
      <div className="mb-10 mt-4 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Host workspace</p>
          <h1 className="mt-3 display-section-fluid">{"Events & analytics"}</h1>
        </div>
        <Link href="/dashboard/events/new" className="inline-flex pill-dark h-12 px-6 text-sm">
          CREATE EVENT <ArrowUpRight size={16} />
        </Link>
      </div>

      <section id="scan-qr" className="mb-8 rounded-2xl border border-white/[0.1] bg-zinc-950/60 p-4 scroll-mt-28">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Quick access</p>
            <p className="mt-1 text-sm text-zinc-300">At the door? Open your scanner in one tap, or jump to your event list.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={scannerHref}
              className="inline-flex h-10 items-center rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-4 text-xs font-bold uppercase tracking-wide text-black shadow-[0_0_22px_-12px_rgba(75,250,148,0.7)] transition hover:brightness-110"
            >
              Start scanner now
            </Link>
            <Link
              href="#my-events"
              className="inline-flex h-10 items-center rounded-full border border-white/20 bg-white/[0.06] px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/45 hover:bg-white/10"
            >
              My events
            </Link>
          </div>
        </div>
      </section>

      <HostPayoutCta />

      {isFirstHostView ? (
        <section className="mt-8 space-y-6">
          <div className="overflow-hidden rounded-3xl border border-brand-green/30 bg-gradient-to-br from-brand-green/20 via-brand-green/10 to-transparent">
            <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1.15fr,0.85fr] lg:items-end">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-brand-green/35 bg-black/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-green">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  First event setup
                </p>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">Let&apos;s launch your first night</h2>
                <p className="mt-2 max-w-2xl text-sm text-zinc-300 sm:text-base">
                  You&apos;ll go from blank page to ticket link in minutes. Start with event basics, then share your link and track orders here.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href="/dashboard/events/new"
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-5 text-xs font-bold uppercase tracking-wide text-black transition hover:brightness-110"
                  >
                    Start first event <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <Link
                    href="/create-event"
                    className="inline-flex h-11 items-center rounded-full border border-white/20 bg-white/[0.06] px-5 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/45 hover:bg-white/10"
                  >
                    Open guided builder
                  </Link>
                </div>
              </div>
              <div className="rounded-2xl border border-white/[0.12] bg-black/35 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Guest page preview</p>
                <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.12] bg-zinc-900">
                  <div
                    className="h-24 w-full bg-cover bg-center"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80')" }}
                  />
                  <div className="space-y-2 p-3">
                    <p className="text-sm font-bold text-white">Friday Rooftop Session</p>
                    <p className="text-xs text-zinc-400">Hosted by you · Public event page</p>
                    <div className="flex items-center justify-between rounded-lg border border-white/[0.1] bg-black/30 px-2.5 py-2">
                      <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                        <Ticket className="h-3.5 w-3.5 text-brand-green" aria-hidden />
                        From $15
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-brand-green">
                        <Zap className="h-3.5 w-3.5" aria-hidden />
                        Mobile QR
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-zinc-500">This is the style guests see before checkout.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { title: "Create", body: "Add flyer, date, location, and ticket details." },
              { title: "Share", body: "Copy one guest link and post it anywhere." },
              { title: "Scan", body: "Use Scan QR at the door for fast check-in." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/[0.1] bg-zinc-950/60 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">{item.title}</p>
                <p className="mt-2 text-sm text-zinc-200">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/[0.1] bg-zinc-950/60 p-5">
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Go-live checklist</h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              {[
                "Create your first event",
                "Open the guest page and test checkout",
                "Confirm ticket email + QR arrives",
                "Pin the scanner link for event night",
              ].map((task) => (
                <li key={task} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-green" aria-hidden />
                  {task}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={`$${centsToDollars(revenue)}`}
          className="border-white/[0.1] bg-zinc-950/60"
          valueClassName="text-white"
        />
        <StatCard
          label="Tickets sold"
          value={ticketsSold}
          className="border-white/[0.1] bg-zinc-950/60"
          valueClassName="text-white"
        />
        <StatCard
          label="Upcoming events"
          value={activeEvents.length}
          className="border-white/[0.1] bg-zinc-950/60"
          valueClassName="text-white"
        />
        <StatCard
          label="Checked-in guests"
          value={checkedIn ?? 0}
          className="border-white/[0.1] bg-zinc-950/60"
          valueClassName="text-white"
        />
      </section>

      <section className="mt-10">
        <Card className="border-zinc-800 bg-zinc-950 p-6 text-white">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Recent orders</h2>
            <p className="text-xs text-zinc-500">Every completed checkout appears here.</p>
          </div>
          {recentOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 py-14 text-center">
              <ShoppingBag className="mx-auto h-10 w-10 text-zinc-600" aria-hidden />
              <p className="mt-4 text-lg font-bold text-white">No orders yet</p>
              <p className="mt-1 text-sm text-zinc-500">When someone buys a ticket, it will show up here.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex flex-col gap-1 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-bold text-white">{order.buyer_name}</p>
                    <p className="text-xs text-zinc-500">{order.buyer_email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:text-right">
                    <span className="text-zinc-400">{order.quantity} ticket{order.quantity > 1 ? "s" : ""}</span>
                    <span className="font-bold text-white">${centsToDollars(order.total_amount)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section id="my-events" className="mt-10 space-y-3 scroll-mt-28">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted">Your events</h2>
        {activeEvents.length === 0 ? (
          <EmptyState
            title="No events yet"
            subtitle="Create your first event to start selling tickets."
            className="border-white/[0.16] bg-zinc-950/50"
            titleClassName="text-white"
            subtitleClassName="text-zinc-400"
          />
        ) : (
          activeEvents.map((event) => {
            const sold = (orders ?? []).filter((o) => o.event_id === event.id).reduce((s, o) => s + o.quantity, 0);
            const pct = Math.min(Math.round((sold / Math.max(event.tickets_available, 1)) * 100), 100);
            return (
              <Card key={event.id} className="border-white/[0.1] bg-zinc-950/60 text-white transition hover:border-white/25">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Link href={`/dashboard/events/${event.id}`} className="text-lg font-bold tracking-tight transition hover:text-brand-green">
                      {event.title}
                    </Link>
                    <p className="text-sm text-zinc-400">{formatEventDate(event.date)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      className="inline-flex h-10 items-center rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-4 text-xs font-bold uppercase tracking-wide text-black shadow-[0_0_24px_-12px_rgba(75,250,148,0.75)] transition hover:brightness-110"
                      href={`/dashboard/events/${event.id}`}
                    >
                      Event hub
                    </Link>
                    <Link
                      className="inline-flex h-10 items-center rounded-full border border-white/20 bg-white/[0.03] px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/45 hover:bg-white/[0.08]"
                      href={`/events/${event.slug}`}
                    >
                      View
                    </Link>
                    <Link
                      className="inline-flex h-10 items-center rounded-full border border-white/20 bg-white/[0.03] px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/45 hover:bg-white/[0.08]"
                      href={`/dashboard/events/${event.id}/check-in`}
                    >
                      Scan QR
                    </Link>
                    <CopyEventLink slug={event.slug} variant="dark" />
                  </div>
                </div>
                <div className="mt-5">
                  <div className="mb-1.5 flex justify-between text-xs font-medium text-zinc-400">
                    <span>Sales progress</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                    <div className="h-full bg-gradient-to-r from-brand-green via-emerald-300 to-cyan-300" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </section>

      {archivedEvents.length > 0 ? (
        <section className="mt-8 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Archived events</h2>
          {archivedEvents.map((event) => (
            <Card key={event.id} className="border-white/[0.08] bg-zinc-950/40 text-white">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link href={`/dashboard/events/${event.id}`} className="text-base font-bold tracking-tight transition hover:text-brand-green">
                    {event.title}
                  </Link>
                  <p className="text-xs text-zinc-500">{formatEventDate(event.date)}</p>
                </div>
                <span className="inline-flex rounded-full border border-zinc-500/30 bg-zinc-700/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                  Archived
                </span>
              </div>
            </Card>
          ))}
        </section>
      ) : null}

      <section className="mt-12 space-y-4">
        <Card className="border-white/[0.1] bg-zinc-950/60 text-white">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-400">Sales analytics</h2>
          <SalesChart data={salesData} />
        </Card>
        <Card className="border-white/[0.1] bg-zinc-950/60 text-white">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Recent attendees</h2>
            <Link
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.03] px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/45 hover:bg-white/[0.08]"
              href="/api/attendees/csv"
            >
              <Download size={14} /> Download CSV
            </Link>
          </div>
          {attendeeRows.length === 0 ? (
            <p className="text-sm text-zinc-400">No ticket purchases yet.</p>
          ) : (
            <div className="space-y-2">
              {attendeeRows.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-2 rounded-xl border border-white/[0.1] bg-zinc-900/50 p-4 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-bold text-white">{order.buyer_name}</p>
                    <p className="break-all text-zinc-400">{order.buyer_email}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="font-bold text-white">{order.quantity} ticket{order.quantity > 1 ? "s" : ""}</p>
                    <p className="text-zinc-400">${centsToDollars(order.total_amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </main>
  );
}
