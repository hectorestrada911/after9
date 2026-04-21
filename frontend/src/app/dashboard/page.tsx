import Link from "next/link";
import { ArrowUpRight, Download, ShoppingBag } from "lucide-react";
import { Card, EmptyState, StatCard } from "@/components/ui";
import { centsToDollars } from "@/lib/utils";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import CopyEventLink from "@/components/copy-event-link";
import SalesChart from "@/components/sales-chart";
import DashboardAuthFallback from "@/components/dashboard-auth-fallback";

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

  const { data: events } = await supabase
    .from("events")
    .select("id,slug,title,date,ticket_price,tickets_available")
    .eq("host_id", userId)
    .order("date", { ascending: true });
  const eventIds = (events ?? []).map((e) => e.id);
  const { data: orders } = await supabase
    .from("orders")
    .select("id,event_id,buyer_name,buyer_email,total_amount,quantity,created_at")
    .in("event_id", eventIds);
  const { count: checkedIn } = await supabase.from("check_ins").select("*", { count: "exact", head: true }).in("event_id", (events ?? []).map((e) => e.id));

  const revenue = (orders ?? []).reduce((sum, o) => sum + (o.total_amount ?? 0), 0);
  const ticketsSold = (orders ?? []).reduce((sum, o) => sum + (o.quantity ?? 0), 0);
  const attendeeRows = (orders ?? []).slice().sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 10);
  const recentOrders = (orders ?? []).slice().sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 12);
  const salesData = (events ?? []).map((event) => ({
    name: event.title.length > 16 ? `${event.title.slice(0, 16)}…` : event.title,
    sold: (orders ?? []).filter((o) => o.event_id === event.id).reduce((sum, o) => sum + o.quantity, 0),
  }));
  const scannerHref = events?.[0] ? `/dashboard/events/${events[0].id}/check-in` : "/dashboard/events/new";

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
          value={events?.length ?? 0}
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
        {(events ?? []).length === 0 ? (
          <EmptyState
            title="No events yet"
            subtitle="Create your first event to start selling tickets."
            className="border-white/[0.16] bg-zinc-950/50"
            titleClassName="text-white"
            subtitleClassName="text-zinc-400"
          />
        ) : (
          (events ?? []).map((event) => {
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
