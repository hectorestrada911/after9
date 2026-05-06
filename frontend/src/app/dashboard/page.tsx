import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  DollarSign,
  Download,
  ExternalLink,
  Plus,
  ScanLine,
  ShoppingBag,
  Sparkles,
  Ticket,
  TrendingUp,
  UserRound,
  Zap,
} from "lucide-react";
import { EmptyState } from "@/components/ui";
import { centsToDollars, cn } from "@/lib/utils";
import { coerceEventVisibility, eventVisibilityLabel } from "@/lib/event-visibility";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import CopyEventLink from "@/components/copy-event-link";
import SalesChart from "@/components/sales-chart";
import DashboardAuthFallback from "@/components/dashboard-auth-fallback";
import HostPayoutCta from "@/components/host-payout-cta";

/** Best-effort initials from a name or email. */
function initialsFor(name: string | null | undefined, email: string | null | undefined): string {
  const source = (name?.trim() || email?.split("@")[0] || "G").trim();
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "G";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}

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
    image_url: string | null;
    visibility: string | null;
    sales_enabled: boolean | null;
  };
  type EventRowWithArchive = EventRowBase & { archived_at: string | null };

  const eventsWithArchive = await supabase
    .from("events")
    .select("id,slug,title,date,ticket_price,tickets_available,image_url,visibility,sales_enabled,archived_at")
    .eq("host_id", userId)
    .order("date", { ascending: true });

  // Backward-compatible fallback for projects where archived_at is not migrated yet.
  const eventsWithoutArchive =
    eventsWithArchive.error && eventsWithArchive.error.message.toLowerCase().includes("archived_at")
      ? await supabase
          .from("events")
          .select("id,slug,title,date,ticket_price,tickets_available,image_url,visibility,sales_enabled")
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
      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 transition hover:text-white"
      >
        <span aria-hidden>←</span> Account hub
      </Link>

      {/* Hero zone — eyebrow + headline + subline + primary/secondary CTAs */}
      <header className="mb-10 mt-4 flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-green/80">Host workspace</p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white sm:text-[2.4rem]">
            Events &amp; <span className="bg-gradient-to-r from-brand-green via-emerald-200 to-teal-200 bg-clip-text text-transparent">analytics</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
            Sell tickets, scan at the door, and pay yourself — all in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:shrink-0">
          <Link
            href="/dashboard/storefront"
            className="inline-flex h-11 items-center rounded-full border border-white/15 bg-white/[0.04] px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-200 transition hover:border-white/35 hover:text-white"
          >
            Storefront
          </Link>
          <Link
            href="/dashboard/events/new"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-brand-green via-[#7dffc0] to-emerald-400 px-5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-black shadow-[0_14px_36px_-14px_rgba(75,250,148,0.65)] transition hover:brightness-105"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden /> Create event
          </Link>
        </div>
      </header>

      {/* Quick access — promoted with icon row + clearer button hierarchy */}
      <section
        id="scan-qr"
        className="mb-6 scroll-mt-28 overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
      >
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3 sm:items-center">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand-green/30 bg-brand-green/[0.08] text-brand-green shadow-[0_0_20px_-10px_rgba(75,250,148,0.6)]">
              <Zap className="h-4 w-4" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-green/80">Quick access</p>
              <p className="mt-0.5 text-sm text-zinc-200">
                At the door? Open your scanner in one tap, or jump to your event list.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:shrink-0">
            <Link
              href={scannerHref}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-4 text-[11px] font-extrabold uppercase tracking-[0.12em] text-black shadow-[0_0_22px_-12px_rgba(75,250,148,0.7)] transition hover:brightness-110"
            >
              <ScanLine className="h-4 w-4" strokeWidth={2} aria-hidden /> Start scanner
            </Link>
            <Link
              href="/dashboard/storefront"
              className="inline-flex h-10 items-center rounded-full border border-white/15 bg-white/[0.04] px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition hover:border-white/35 hover:bg-white/[0.08]"
            >
              Storefront
            </Link>
            <Link
              href="#my-events"
              className="inline-flex h-10 items-center rounded-full border border-white/15 bg-white/[0.04] px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition hover:border-white/35 hover:bg-white/[0.08]"
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

      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            {
              label: "Total revenue",
              value: `$${centsToDollars(revenue)}`,
              hint: ticketsSold > 0 ? `From ${ticketsSold} ticket${ticketsSold === 1 ? "" : "s"}` : "Awaiting first sale",
              Icon: DollarSign,
              accent: true,
            },
            {
              label: "Tickets sold",
              value: ticketsSold.toLocaleString(),
              hint: activeEvents.length > 0 ? `Across ${activeEvents.length} event${activeEvents.length === 1 ? "" : "s"}` : "No live events yet",
              Icon: Ticket,
              accent: false,
            },
            {
              label: "Upcoming events",
              value: activeEvents.length.toLocaleString(),
              hint: archivedEvents.length > 0 ? `${archivedEvents.length} archived` : "Live + scheduled",
              Icon: CalendarDays,
              accent: false,
            },
            {
              label: "Checked-in guests",
              value: (checkedIn ?? 0).toLocaleString(),
              hint: ticketsSold > 0 ? `${Math.min(100, Math.round(((checkedIn ?? 0) / Math.max(ticketsSold, 1)) * 100))}% of sold` : "Door scans appear here",
              Icon: ScanLine,
              accent: false,
            },
          ] as const
        ).map(({ label, value, hint, Icon, accent }) => (
          <div
            key={label}
            className={cn(
              "relative overflow-hidden rounded-2xl border bg-zinc-950/60 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
              accent ? "border-brand-green/25" : "border-white/[0.08]",
            )}
          >
            {accent ? (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(circle at 100% 0%, rgba(75,250,148,0.10), transparent 55%)" }}
              />
            ) : null}
            <div className="relative flex items-start justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">{label}</p>
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-lg border",
                  accent ? "border-brand-green/30 bg-brand-green/10 text-brand-green" : "border-white/[0.08] bg-white/[0.03] text-zinc-400",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </span>
            </div>
            <p
              className={cn(
                "relative mt-3 text-[2rem] font-black tabular-nums leading-none tracking-tight sm:text-[2.25rem]",
                accent ? "text-white" : "text-zinc-50",
              )}
            >
              {value}
            </p>
            {hint ? <p className="relative mt-2 text-[11px] leading-relaxed text-zinc-500">{hint}</p> : null}
          </div>
        ))}
      </section>

      <section className="mt-10">
        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-950/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <header className="flex flex-col gap-2 border-b border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-brand-green/70" strokeWidth={1.75} aria-hidden />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-300">Recent orders</h2>
              {recentOrders.length > 0 ? (
                <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold tabular-nums text-zinc-400">
                  {recentOrders.length}
                </span>
              ) : null}
            </div>
            <p className="text-[11px] text-zinc-500">Every completed checkout appears here.</p>
          </header>
          {recentOrders.length === 0 ? (
            <div className="px-5 py-14 text-center sm:px-6">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                <ShoppingBag className="h-6 w-6 text-zinc-500" strokeWidth={1.5} aria-hidden />
              </div>
              <p className="mt-4 text-base font-semibold text-white">No orders yet</p>
              <p className="mt-1 text-sm text-zinc-500">When someone buys a ticket, it will show up here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.05]">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-white/[0.02] sm:px-6">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/[0.1] bg-white/[0.04] text-[11px] font-bold uppercase tracking-wide text-zinc-300">
                    {initialsFor(order.buyer_name, order.buyer_email)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-white">{order.buyer_name || "Guest"}</p>
                    <p className="truncate text-[11px] text-zinc-500">{order.buyer_email}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-right">
                    <span className="hidden text-[11px] text-zinc-500 sm:inline">
                      {order.quantity} ticket{order.quantity === 1 ? "" : "s"}
                    </span>
                    <span className="text-[13px] font-bold tabular-nums text-white">${centsToDollars(order.total_amount)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section id="my-events" className="mt-10 scroll-mt-28">
        <header className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-brand-green/70" strokeWidth={1.75} aria-hidden />
            <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-300">Your events</h2>
            {activeEvents.length > 0 ? (
              <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold tabular-nums text-zinc-400">
                {activeEvents.length}
              </span>
            ) : null}
          </div>
        </header>
        {activeEvents.length === 0 ? (
          <EmptyState
            title="No events yet"
            subtitle="Create your first event to start selling tickets."
            className="border-white/[0.1] bg-zinc-950/40"
            titleClassName="text-white"
            subtitleClassName="text-zinc-400"
          />
        ) : (
          <ul className="space-y-3">
            {activeEvents.map((event) => {
              const sold = (orders ?? []).filter((o) => o.event_id === event.id).reduce((s, o) => s + o.quantity, 0);
              const cap = Math.max(event.tickets_available, 1);
              const pct = Math.min(Math.round((sold / cap) * 100), 100);
              const salesOn = event.sales_enabled !== false;
              const visLabel = eventVisibilityLabel(coerceEventVisibility(event.visibility));
              return (
                <li
                  key={event.id}
                  className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/[0.16]"
                >
                  {event.image_url ? (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.07]"
                      style={{ backgroundImage: `url(${event.image_url})` }}
                    />
                  ) : null}
                  <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                    <div className="flex shrink-0 items-center gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/[0.1] bg-zinc-900">
                        {event.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element -- host-uploaded URLs vary per project
                          <img src={event.image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-600">
                            <CalendarDays className="h-5 w-5" aria-hidden />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/dashboard/events/${event.id}`}
                          className="text-base font-bold tracking-tight text-white transition hover:text-brand-green sm:text-lg"
                        >
                          {event.title}
                        </Link>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            salesOn
                              ? "border-brand-green/35 bg-brand-green/10 text-brand-green"
                              : "border-zinc-500/30 bg-zinc-700/20 text-zinc-300",
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", salesOn ? "bg-brand-green" : "bg-zinc-400")} />
                          {salesOn ? "Sales on" : "Sales off"}
                        </span>
                        <span className="rounded-full border border-white/15 bg-white/[0.05] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          {visLabel}
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] text-zinc-400">{formatEventDate(event.date)}</p>
                      <div className="mt-3">
                        <div className="mb-1 flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                          <span>Sales progress</span>
                          <span className="tabular-nums text-zinc-400">
                            {sold} / {event.tickets_available} · {pct}%
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800/80">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-green via-emerald-300 to-cyan-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative flex flex-wrap items-center gap-2 border-t border-white/[0.06] bg-black/20 px-4 py-3 sm:px-5">
                    <Link
                      className="inline-flex h-9 items-center rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-3.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-black shadow-[0_0_22px_-12px_rgba(75,250,148,0.7)] transition hover:brightness-110"
                      href={`/dashboard/events/${event.id}`}
                    >
                      Event hub
                    </Link>
                    <Link
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition hover:border-white/35 hover:bg-white/[0.08]"
                      href={`/events/${event.slug}`}
                    >
                      View <ExternalLink className="h-3 w-3 opacity-80" strokeWidth={2} aria-hidden />
                    </Link>
                    <Link
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition hover:border-white/35 hover:bg-white/[0.08]"
                      href={`/dashboard/events/${event.id}/check-in`}
                    >
                      <ScanLine className="h-3.5 w-3.5" strokeWidth={2} aria-hidden /> Scan QR
                    </Link>
                    <CopyEventLink slug={event.slug} variant="dark" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {archivedEvents.length > 0 ? (
        <section className="mt-8">
          <header className="mb-3 flex items-center gap-2">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">Archived events</h2>
            <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold tabular-nums text-zinc-500">
              {archivedEvents.length}
            </span>
          </header>
          <ul className="space-y-2">
            {archivedEvents.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-zinc-950/40 px-4 py-3 opacity-90 transition-colors hover:border-white/[0.12]"
              >
                <div className="min-w-0">
                  <Link href={`/dashboard/events/${event.id}`} className="truncate text-[13px] font-bold text-white transition hover:text-brand-green">
                    {event.title}
                  </Link>
                  <p className="text-[11px] text-zinc-500">{formatEventDate(event.date)}</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-zinc-500/25 bg-zinc-700/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                  Archived
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-12 space-y-4">
        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-950/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <header className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-green/70" strokeWidth={1.75} aria-hidden />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-300">Sales analytics</h2>
            </div>
            <span className="text-[11px] text-zinc-500">Tickets sold per event</span>
          </header>
          <div className="p-5 sm:p-6">
            <SalesChart data={salesData} />
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-950/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <header className="flex flex-col gap-2 border-b border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-brand-green/70" strokeWidth={1.75} aria-hidden />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-300">Recent attendees</h2>
              {attendeeRows.length > 0 ? (
                <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold tabular-nums text-zinc-400">
                  {attendeeRows.length}
                </span>
              ) : null}
            </div>
            <Link
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition hover:border-white/35 hover:bg-white/[0.08]"
              href="/api/attendees/csv"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={2} aria-hidden /> Download CSV
            </Link>
          </header>
          {attendeeRows.length === 0 ? (
            <div className="px-5 py-12 text-center sm:px-6">
              <p className="text-sm text-zinc-500">No ticket purchases yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.05]">
              {attendeeRows.map((order) => (
                <li key={order.id} className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/[0.1] bg-white/[0.04] text-[11px] font-bold uppercase tracking-wide text-zinc-300">
                    {initialsFor(order.buyer_name, order.buyer_email)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-white">{order.buyer_name || "Guest"}</p>
                    <p className="truncate text-[11px] text-zinc-500">{order.buyer_email}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[13px] font-bold tabular-nums text-white">${centsToDollars(order.total_amount)}</p>
                    <p className="text-[11px] text-zinc-500">{order.quantity} ticket{order.quantity === 1 ? "" : "s"}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
