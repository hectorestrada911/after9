import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { CalendarRange, DollarSign, ExternalLink, ScanLine, Ticket, UserRound } from "lucide-react";
import { eventVisibilityLabel } from "@/lib/event-visibility";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { centsToDollars } from "@/lib/utils";

function formatEventDate(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export default async function AccountPage() {
  const supabase = await getSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;

  if (!user) {
    return (
      <main className="container-page py-16 sm:py-24">
        <div className="mx-auto max-w-md text-center">
          <h1 className="display-section-fluid">Login required</h1>
          <p className="mt-4 text-base text-muted">Log in to manage your tickets and host tools.</p>
          <Link href="/login?next=/account" className="mt-6 inline-flex h-12 items-center rounded-full bg-white px-7 text-sm font-bold uppercase tracking-wide text-black">
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  const [{ data: profile }, { data: hostedEvents }] = await Promise.all([
    supabase.from("profiles").select("id,full_name").eq("id", user.id).maybeSingle(),
    supabase
      .from("events")
      .select("id,slug,title,date,image_url,visibility,tickets_available,archived_at")
      .eq("host_id", user.id)
      .order("date", { ascending: true }),
  ]);
  const hasHostProfile = Boolean(profile);

  const allEventRows = hostedEvents ?? [];
  const activeEventRows = allEventRows.filter((e) => !e.archived_at);
  const todayIso = new Date().toISOString().slice(0, 10);
  const pastEventCount = activeEventRows.filter((e) => (e.date ?? "") < todayIso).length;
  const archivedEventCount = allEventRows.filter((e) => Boolean(e.archived_at)).length;
  const eventIds = activeEventRows.map((e) => e.id);
  const eventCount = activeEventRows.length;
  const totalEventCount = allEventRows.length;

  const soldByEvent = new Map<string, number>();
  let hostGrossCents = 0;
  let hostTicketsSold = 0;
  let hostCheckIns = 0;
  if (eventIds.length > 0) {
    const [hostOrdersRes, checkInsRes] = await Promise.all([
      supabase.from("orders").select("event_id,total_amount,quantity,payment_status").in("event_id", eventIds),
      supabase.from("check_ins").select("*", { count: "exact", head: true }).in("event_id", eventIds),
    ]);
    for (const o of hostOrdersRes.data ?? []) {
      if (o.payment_status !== "paid") continue;
      const q = o.quantity ?? 0;
      hostGrossCents += o.total_amount ?? 0;
      hostTicketsSold += q;
      const eid = o.event_id as string;
      soldByEvent.set(eid, (soldByEvent.get(eid) ?? 0) + q);
    }
    hostCheckIns = checkInsRes.count ?? 0;
  }

  const showHostAnalytics = hasHostProfile || eventCount > 0;
  const hostStatusLabel = hasHostProfile ? "Ready" : eventCount > 0 ? "Live" : "Not set";
  const hostStatusDetail = hasHostProfile
    ? "Organizer profile active."
    : eventCount > 0
      ? "You have published events. Finish your organizer profile for the full dashboard."
      : "Create a host profile to publish events.";

  let purchasedCount = 0;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceRole && user.email) {
    const service = createClient(supabaseUrl, serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { count } = await service
      .from("orders")
      .select("id", { count: "exact", head: true })
      .ilike("buyer_email", user.email);
    purchasedCount = count ?? 0;
  }

  return (
    <main className="container-page py-10 sm:py-14">
      <p className="text-xs font-bold uppercase tracking-widest text-muted">Account hub</p>
      <h1 className="mt-3 display-section-fluid">Welcome back</h1>
      <p className="mt-3 text-sm text-zinc-400">Use one account for buying tickets and hosting events.</p>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-zinc-500">
        <span className="font-semibold text-zinc-400">Where things live:</span> this page is your overview.{" "}
        <span className="text-zinc-400">My tickets</span> is everything you bought.{" "}
        <span className="text-zinc-400">{"Events & analytics"}</span> in the header is your host home: event list, sales, check-in, and exports.
      </p>

      {purchasedCount > 0 ? (
        <section className="mt-8 rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.07] to-transparent p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/90">Your tickets</p>
            <h2 className="mt-2 text-lg font-black tracking-tight text-white">You have {purchasedCount} order{purchasedCount === 1 ? "" : "s"} on this email</h2>
            <p className="mt-1 text-sm text-zinc-400">Open My tickets for QR codes, receipts, and anything you bought.</p>
          </div>
          <Link
            href="/my-tickets"
            className="mt-4 inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-6 text-xs font-bold uppercase tracking-wide text-black shadow-[0_0_28px_-10px_rgba(75,250,148,0.7)] transition hover:brightness-110 sm:mt-0"
          >
            View my tickets
          </Link>
        </section>
      ) : null}

      {totalEventCount > 0 ? (
        <section id="my-events" className="mt-8 scroll-mt-28">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Hosting</p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">Your events</h2>
              <p className="mt-1 text-sm text-zinc-500">Flyer, public link, and host tools. Pick up where you left off.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="/account#my-events"
                  className="inline-flex h-8 items-center rounded-full border border-white/20 bg-white/[0.03] px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-200 transition hover:border-white/45 hover:text-white"
                >
                  All ({totalEventCount})
                </Link>
                <Link
                  href="/account#my-events"
                  className="inline-flex h-8 items-center rounded-full border border-white/20 bg-white/[0.03] px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-200 transition hover:border-white/45 hover:text-white"
                >
                  Past ({pastEventCount})
                </Link>
                <Link
                  href="/dashboard#archived-events"
                  className="inline-flex h-8 items-center rounded-full border border-white/20 bg-white/[0.03] px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-200 transition hover:border-white/45 hover:text-white"
                >
                  Archived ({archivedEventCount})
                </Link>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-4 text-xs font-bold uppercase tracking-wide text-black shadow-[0_0_24px_-12px_rgba(75,250,148,0.7)] transition hover:brightness-110"
            >
              {"All events & analytics →"}
            </Link>
          </div>
          <ul className="mt-4 space-y-4">
            {allEventRows.slice(0, 5).map((event) => {
              const sold = soldByEvent.get(event.id) ?? 0;
              const cap = Math.max(event.tickets_available ?? 0, 1);
              const pct = Math.min(Math.round((sold / cap) * 100), 100);
              const vis = eventVisibilityLabel(event.visibility);
              const isPast = (event.date ?? "") < todayIso;
              const isArchived = Boolean(event.archived_at);
              return (
                <li
                  key={event.id}
                  className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-zinc-950 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)]"
                >
                  {event.image_url ? (
                    <div
                      className="pointer-events-none absolute inset-0 scale-110 opacity-[0.18]"
                      style={{ backgroundImage: `url(${event.image_url})`, backgroundSize: "cover", backgroundPosition: "center" }}
                      aria-hidden
                    />
                  ) : null}
                  <div
                    className="pointer-events-none absolute inset-0 backdrop-blur-2xl"
                    style={{ WebkitBackdropFilter: "blur(24px)" }}
                    aria-hidden
                  />
                  <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-stretch">
                    <div className="flex shrink-0 gap-4 sm:items-center">
                      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-zinc-900 shadow-lg sm:h-32 sm:w-32">
                        {event.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element -- host-uploaded URLs vary per project
                          <img src={event.image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-600">
                            <CalendarRange className="h-10 w-10" aria-hidden />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black tracking-tight text-white sm:text-xl">{event.title}</h3>
                        <span className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          {vis}
                        </span>
                        {isArchived ? (
                          <span className="rounded-full border border-zinc-600/50 bg-zinc-700/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            Archived
                          </span>
                        ) : null}
                        {isPast ? (
                          <span className="rounded-full border border-zinc-600/50 bg-zinc-700/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            Past event
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-zinc-400">{formatEventDate(event.date)}</p>
                      <div className="mt-3">
                        <div className="mb-1 flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                          <span>Sales progress</span>
                          <span className="tabular-nums text-zinc-400">
                            {sold} / {event.tickets_available} · {pct}%
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                          <div className="h-full rounded-full bg-gradient-to-r from-brand-green to-emerald-300" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          href={`/dashboard/events/${event.id}`}
                          className="inline-flex h-10 items-center rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-4 text-xs font-bold uppercase tracking-wide text-black shadow-[0_0_24px_-12px_rgba(75,250,148,0.75)] transition hover:brightness-110"
                        >
                          Manage event
                        </Link>
                        <Link
                          href={`/events/${event.slug}`}
                          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/20 px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/40"
                        >
                          View event <ExternalLink className="h-3.5 w-3.5 opacity-80" aria-hidden />
                        </Link>
                        <Link
                          href={`/dashboard/events/${event.id}/check-in`}
                          className="inline-flex h-10 items-center rounded-full border border-white/20 px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/40"
                        >
                          Scan QR
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {totalEventCount > 5 ? (
            <p className="mt-3 text-center text-xs text-zinc-500">
              Showing 5 of {totalEventCount}.{" "}
              <Link href="/dashboard" className="font-semibold text-zinc-300 underline-offset-2 hover:text-white hover:underline">
                Open dashboard for the full list
              </Link>
              .
            </p>
          ) : null}
        </section>
      ) : hasHostProfile ? (
        <section className="mt-8 rounded-2xl border border-dashed border-white/20 bg-zinc-950/80 p-6 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Hosting</p>
          <h2 className="mt-2 text-lg font-black text-white">No events yet</h2>
          <p className="mt-1 text-sm text-zinc-500">Create an event to get a flyer, public page, and sales tools like the dashboard.</p>
          <Link
            href="/dashboard/events/new"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-6 text-xs font-bold uppercase tracking-wide text-black shadow-[0_0_24px_-12px_rgba(75,250,148,0.75)] transition hover:brightness-110"
          >
            Create your first event
          </Link>
        </section>
      ) : null}

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.12] bg-zinc-950 p-5">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
            <Ticket className="h-4 w-4" /> Buyer view
          </p>
          <p className="mt-2 text-2xl font-black tracking-tight text-white">{purchasedCount}</p>
          <p className="text-sm text-zinc-500">Orders found for {user.email}</p>
          <Link
            href="/my-tickets"
            className="mt-4 inline-flex h-10 items-center rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-4 text-xs font-bold uppercase tracking-wide text-black shadow-[0_0_22px_-12px_rgba(75,250,148,0.7)] transition hover:brightness-110"
          >
            Open my tickets
          </Link>
        </div>

        <div className="rounded-2xl border border-white/[0.12] bg-zinc-950 p-5">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
            <CalendarRange className="h-4 w-4" /> Host view
          </p>
          <p className="mt-2 text-2xl font-black tracking-tight text-white">{hostStatusLabel}</p>
          <p className="text-sm text-zinc-500">{hostStatusDetail}</p>

          {showHostAnalytics ? (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/[0.08] bg-black/30 p-3">
                <div>
                  <p className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    <DollarSign className="h-3 w-3 shrink-0" aria-hidden /> Gross
                  </p>
                  <p className="mt-1 text-lg font-black tabular-nums text-white">${centsToDollars(hostGrossCents)}</p>
                </div>
                <div>
                  <p className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    <Ticket className="h-3 w-3 shrink-0" aria-hidden /> Sold
                  </p>
                  <p className="mt-1 text-lg font-black tabular-nums text-white">{hostTicketsSold}</p>
                </div>
                <div>
                  <p className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    <ScanLine className="h-3 w-3 shrink-0" aria-hidden /> In
                  </p>
                  <p className="mt-1 text-lg font-black tabular-nums text-white">{hostCheckIns}</p>
                </div>
              </div>
              <p className="text-xs text-zinc-500">
                Across {eventCount} event{eventCount === 1 ? "" : "s"}. Charts, CSV export, and per-event progress live on the dashboard.
              </p>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {hasHostProfile ? (
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-4 text-xs font-bold uppercase tracking-wide text-black shadow-[0_0_22px_-12px_rgba(75,250,148,0.7)] transition hover:brightness-110"
              >
                Open dashboard
              </Link>
            ) : eventCount > 0 ? (
              <Link
                href="/onboarding?next=/dashboard"
                className="inline-flex h-10 items-center rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-4 text-xs font-bold uppercase tracking-wide text-black shadow-[0_0_22px_-12px_rgba(75,250,148,0.7)] transition hover:brightness-110"
              >
                Finish organizer profile
              </Link>
            ) : (
              <Link
                href="/onboarding?next=/dashboard"
                className="inline-flex h-10 items-center rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-4 text-xs font-bold uppercase tracking-wide text-black shadow-[0_0_22px_-12px_rgba(75,250,148,0.7)] transition hover:brightness-110"
              >
                Become a host
              </Link>
            )}
            {hasHostProfile ? (
              <Link
                href="/dashboard/events/new"
                className="inline-flex h-10 items-center rounded-full border border-white/20 px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/40"
              >
                New event
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-white/[0.12] bg-zinc-950 p-5">
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
          <UserRound className="h-4 w-4" /> Account
        </p>
        <p className="mt-2 text-sm text-zinc-300">{profile?.full_name ?? user.email}</p>
        <p className="mt-1 text-xs text-zinc-500">Signed in as {user.email ?? "unknown email"}</p>
        <div className="mt-4 rounded-xl border border-white/[0.12] bg-black/30 p-3 text-sm text-zinc-300">
          <p className="font-semibold text-zinc-200">Need help?</p>
          <p className="mt-1">
            Email{" "}
            <a href="mailto:ragesupportpage@gmail.com" className="font-semibold text-brand-green underline underline-offset-2">
              ragesupportpage@gmail.com
            </a>{" "}
            and we usually respond within 24 hours.
          </p>
        </div>
      </section>
    </main>
  );
}
