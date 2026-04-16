import Link from "next/link";
import { ArrowUpRight, Download, Sparkles } from "lucide-react";
import { Card, EmptyState, SectionTitle, StatCard } from "@/components/ui";
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
      <main className="container-page py-10">
        <Card className="mx-auto max-w-xl">
          <h1 className="text-xl font-bold">Login required</h1>
          <p className="mt-1 text-sm text-slate-600">Sign in to access your host dashboard.</p>
          <Link href="/login" className="mt-4 inline-block rounded-xl bg-brand px-4 py-2 font-semibold text-white">Go to login</Link>
        </Card>
      </main>
    );
  }

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (!profile) {
    return (
      <main className="container-page py-10">
        <Card className="mx-auto max-w-xl">
          <h1 className="text-xl font-bold">Finish onboarding</h1>
          <p className="mt-1 text-sm text-slate-600">Set up your organizer profile before creating events.</p>
          <Link href="/onboarding" className="mt-4 inline-block rounded-xl bg-brand px-4 py-2 font-semibold text-white">Continue onboarding</Link>
        </Card>
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
    name: event.title.length > 16 ? `${event.title.slice(0, 16)}...` : event.title,
    sold: (orders ?? []).filter((o) => o.event_id === event.id).reduce((sum, o) => sum + o.quantity, 0),
  }));

  return (
    <main className="container-page py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionTitle
          eyebrow="Host workspace"
          title="Host dashboard"
          subtitle="Track sales, attendance, and performance at a glance."
        />
        <Link href="/dashboard/events/new" className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 font-semibold text-white shadow-glow transition hover:bg-brand-dark">
          Create event <ArrowUpRight size={16} />
        </Link>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 animate-fadeUp">
        <StatCard label="Total revenue" value={`$${centsToDollars(revenue)}`} />
        <StatCard label="Tickets sold" value={ticketsSold} />
        <StatCard label="Upcoming events" value={events?.length ?? 0} />
        <StatCard label="Checked-in guests" value={checkedIn ?? 0} />
      </section>

      <section className="mt-6 space-y-3 animate-fadeUp">
        {(events ?? []).length === 0 ? (
          <EmptyState title="No events yet" subtitle="Create your first event to start selling tickets." />
        ) : (
          (events ?? []).map((event) => (
            <Card key={event.id} className="space-y-3 transition hover:-translate-y-0.5 hover:shadow-soft">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-100">{event.title}</p>
                  <p className="text-sm text-slate-400">{event.date}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Link className="rounded-lg border border-slate-700 px-3 py-1 text-slate-200 hover:bg-slate-800" href={`/events/${event.slug}`}>View</Link>
                  <Link className="rounded-lg border border-slate-700 px-3 py-1 text-slate-200 hover:bg-slate-800" href={`/dashboard/events/${event.id}/check-in`}>Check-in</Link>
                  <CopyEventLink slug={event.slug} />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs text-slate-400">
                  <span>Ticket sales progress</span>
                  <span>{Math.min(Math.round((((orders ?? []).filter((o) => o.event_id === event.id).reduce((s, o) => s + o.quantity, 0)) / event.tickets_available) * 100), 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-brand"
                    style={{
                      width: `${Math.min(Math.round((((orders ?? []).filter((o) => o.event_id === event.id).reduce((s, o) => s + o.quantity, 0)) / event.tickets_available) * 100), 100)}%`,
                    }}
                  />
                </div>
              </div>
            </Card>
          ))
        )}
      </section>

      <section className="mt-8 animate-fadeUp">
        <Card className="mb-4">
          <h2 className="mb-3 text-lg font-semibold">Sales analytics</h2>
          <SalesChart data={salesData} />
        </Card>
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Recent attendees</h2>
            <Link className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1 text-sm text-slate-200 hover:bg-slate-800" href="/api/attendees/csv"><Download size={14} /> Download CSV</Link>
          </div>
          {attendeeRows.length === 0 ? (
            <p className="text-sm text-slate-400">No ticket purchases yet.</p>
          ) : (
            <div className="space-y-2">
              {attendeeRows.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-xl border border-slate-700 p-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-100">{order.buyer_name}</p>
                    <p className="text-slate-400">{order.buyer_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-100">{order.quantity} tickets</p>
                    <p className="text-slate-400">${centsToDollars(order.total_amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card className="mt-4 border-brand/40 bg-brand/10">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand"><Sparkles size={14} /> Conversion tip</p>
          <p className="mt-1 text-sm text-slate-300">Events with a strong cover image + clear instructions typically convert better. Update your next event details before sharing.</p>
        </Card>
      </section>
    </main>
  );
}
