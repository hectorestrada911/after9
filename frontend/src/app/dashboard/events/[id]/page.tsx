import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { EventOrdersTrend, type TrendPoint } from "@/components/event-orders-trend";
import { centsToDollars } from "@/lib/utils";
import { resolveEventWorkspace } from "./_workspace";

export default async function EventOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bundle = await resolveEventWorkspace(id);
  const { event, orders, ticketsTotal, ticketsCheckedIn } = bundle;

  const paid = orders.filter((o) => o.payment_status === "paid");
  const revenueCents = paid.reduce((s, o) => s + o.total_amount, 0);
  const soldQty = paid.reduce((s, o) => s + o.quantity, 0);
  const scanPct = ticketsTotal > 0 ? Math.round((ticketsCheckedIn / ticketsTotal) * 100) : 0;
  const cap = Math.max(event.tickets_available, 1);
  const salesPct = Math.min(Math.round((ticketsTotal / cap) * 100), 100);
  const isUnlimited = event.tickets_available >= 5000;

  const byDay = new Map<string, { revenueCents: number; tickets: number }>();
  for (const o of paid) {
    const day = o.created_at.slice(0, 10);
    const cur = byDay.get(day) ?? { revenueCents: 0, tickets: 0 };
    cur.revenueCents += o.total_amount;
    cur.tickets += o.quantity;
    byDay.set(day, cur);
  }
  const sortedDays = [...byDay.keys()].sort();
  const trendData: TrendPoint[] = sortedDays.map((day) => ({
    day: new Date(`${day}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    revenue: (byDay.get(day)?.revenueCents ?? 0) / 100,
    tickets: byDay.get(day)?.tickets ?? 0,
  }));

  const recent = orders.slice(0, 8);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Overview</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-white">Performance snapshot</h2>
        <p className="mt-1 text-sm text-zinc-500">Paid checkouts, door progress, and daily revenue for this event.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.1] bg-gradient-to-br from-zinc-950 to-black p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Revenue (paid)</p>
          <p className="mt-2 text-3xl font-black tabular-nums tracking-tight text-white">${centsToDollars(revenueCents)}</p>
          <p className="mt-1 text-xs text-zinc-500">{paid.length} paid order{paid.length === 1 ? "" : "s"}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.1] bg-gradient-to-br from-zinc-950 to-black p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Tickets sold</p>
          <p className="mt-2 text-3xl font-black tabular-nums tracking-tight text-white">{soldQty}</p>
          <p className="mt-1 text-xs text-zinc-500">From completed checkouts</p>
        </div>
        <div className="rounded-2xl border border-white/[0.1] bg-gradient-to-br from-zinc-950 to-black p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Check-in rate</p>
          <p className="mt-2 text-3xl font-black tabular-nums tracking-tight text-white">{scanPct}%</p>
          <p className="mt-1 text-xs text-zinc-500">
            {ticketsCheckedIn} / {ticketsTotal} tickets scanned
          </p>
        </div>
        <div className="rounded-2xl border border-white/[0.1] bg-gradient-to-br from-zinc-950 to-black p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Inventory</p>
          <p className="mt-2 text-3xl font-black tabular-nums tracking-tight text-white">{ticketsTotal}</p>
          <p className="mt-1 text-xs text-zinc-500">Issued of {isUnlimited ? "Unlimited" : event.tickets_available} listed for sale</p>
        </div>
      </div>

      <section className="rounded-2xl border border-white/[0.1] bg-zinc-950/60 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Revenue by day</h3>
            <p className="mt-1 text-sm text-zinc-500">Paid orders only · excludes pending or failed payments</p>
          </div>
          <div className="flex gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">All time</span>
          </div>
        </div>
        <div className="mt-6">
          <EventOrdersTrend data={trendData} />
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.1] bg-zinc-950/60 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Recent orders</h3>
          <Link
            href={`/dashboard/events/${id}/orders`}
            className="inline-flex h-10 items-center rounded-full border border-white/20 px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/40"
          >
            View all orders
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-white/15 py-14 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-zinc-600" aria-hidden />
            <p className="mt-4 text-lg font-bold text-white">No orders yet</p>
            <p className="mt-1 text-sm text-zinc-500">When someone checks out, orders appear here and in the Orders tab.</p>
          </div>
        ) : (
          <ul className="mt-6 space-y-2">
            {recent.map((order) => (
              <li
                key={order.id}
                className="flex flex-col gap-2 rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-bold text-white">{order.buyer_name}</p>
                  <p className="truncate text-xs text-zinc-500">{order.buyer_email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      order.payment_status === "paid" ? "bg-brand-green/25 text-brand-green" : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {order.payment_status}
                  </span>
                  {order.payment_status === "paid" ? (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        order.confirmation_email_sent_at ? "bg-brand-green/25 text-brand-green" : "bg-amber-500/20 text-amber-200"
                      }`}
                    >
                      {order.confirmation_email_sent_at ? "Email sent" : "Email pending"}
                    </span>
                  ) : null}
                  <span className="text-sm text-zinc-400">{order.quantity} ticket{order.quantity === 1 ? "" : "s"}</span>
                  <span className="text-sm font-bold text-white">${centsToDollars(order.total_amount)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Capacity</p>
        <div className="mt-2 flex justify-between text-xs font-medium text-zinc-400">
          <span>Tickets issued vs listed for sale</span>
          <span className="tabular-nums">{salesPct}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-green to-emerald-300" style={{ width: `${salesPct}%` }} />
        </div>
      </section>
    </div>
  );
}
