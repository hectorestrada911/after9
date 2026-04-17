import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";
import { Card, EmptyState, StatCard } from "@/components/ui";
import { centsToDollars } from "@/lib/utils";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import CopyEventLink from "@/components/copy-event-link";
import SalesChart from "@/components/sales-chart";

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) {
    return (
      <main className="container-page py-16 sm:py-24">
        <div className="mx-auto max-w-md text-center">
          <h1 className="display-section text-5xl">Login required</h1>
          <p className="mt-4 text-base text-muted">Sign in to access your host dashboard.</p>
          <Link href="/login" className="mt-6 inline-flex pill-dark h-12 px-7 text-sm">GO TO LOGIN</Link>
        </div>
      </main>
    );
  }

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (!profile) {
    return (
      <main className="container-page py-16 sm:py-24">
        <div className="mx-auto max-w-md text-center">
          <h1 className="display-section text-5xl">Finish onboarding</h1>
          <p className="mt-4 text-base text-muted">Set up your organizer profile before creating events.</p>
          <Link href="/onboarding" className="mt-6 inline-flex pill-dark h-12 px-7 text-sm">CONTINUE</Link>
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
  const salesData = (events ?? []).map((event) => ({
    name: event.title.length > 16 ? `${event.title.slice(0, 16)}…` : event.title,
    sold: (orders ?? []).filter((o) => o.event_id === event.id).reduce((sum, o) => sum + o.quantity, 0),
  }));

  return (
    <main className="container-page py-10 sm:py-14">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Host workspace</p>
          <h1 className="mt-3 display-section text-5xl sm:text-6xl">Dashboard</h1>
        </div>
        <Link href="/dashboard/events/new" className="inline-flex pill-dark h-12 px-6 text-sm">
          CREATE EVENT <ArrowUpRight size={16} />
        </Link>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total revenue" value={`$${centsToDollars(revenue)}`} />
        <StatCard label="Tickets sold" value={ticketsSold} />
        <StatCard label="Upcoming events" value={events?.length ?? 0} />
        <StatCard label="Checked-in guests" value={checkedIn ?? 0} />
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted">Your events</h2>
        {(events ?? []).length === 0 ? (
          <EmptyState title="No events yet" subtitle="Create your first event to start selling tickets." />
        ) : (
          (events ?? []).map((event) => {
            const sold = (orders ?? []).filter((o) => o.event_id === event.id).reduce((s, o) => s + o.quantity, 0);
            const pct = Math.min(Math.round((sold / Math.max(event.tickets_available, 1)) * 100), 100);
            return (
              <Card key={event.id} className="transition hover:border-black">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-bold tracking-tight">{event.title}</p>
                    <p className="text-sm text-muted">{event.date}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link className="inline-flex h-10 items-center rounded-full border border-line px-4 text-xs font-bold uppercase tracking-wide hover:border-black transition" href={`/events/${event.slug}`}>View</Link>
                    <Link className="inline-flex h-10 items-center rounded-full border border-line px-4 text-xs font-bold uppercase tracking-wide hover:border-black transition" href={`/dashboard/events/${event.id}/check-in`}>Check-in</Link>
                    <CopyEventLink slug={event.slug} />
                  </div>
                </div>
                <div className="mt-5">
                  <div className="mb-1.5 flex justify-between text-xs font-medium text-muted">
                    <span>Sales progress</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-offwhite overflow-hidden">
                    <div className="h-full bg-black" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </section>

      <section className="mt-12 space-y-4">
        <Card>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted">Sales analytics</h2>
          <SalesChart data={salesData} />
        </Card>
        <Card>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted">Recent attendees</h2>
            <Link className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line px-4 text-xs font-bold uppercase tracking-wide hover:border-black transition" href="/api/attendees/csv">
              <Download size={14} /> Download CSV
            </Link>
          </div>
          {attendeeRows.length === 0 ? (
            <p className="text-sm text-muted">No ticket purchases yet.</p>
          ) : (
            <div className="space-y-2">
              {attendeeRows.map((order) => (
                <div key={order.id} className="flex flex-col gap-2 rounded-xl border border-line p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold">{order.buyer_name}</p>
                    <p className="break-all text-muted">{order.buyer_email}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="font-bold">{order.quantity} ticket{order.quantity > 1 ? "s" : ""}</p>
                    <p className="text-muted">${centsToDollars(order.total_amount)}</p>
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
