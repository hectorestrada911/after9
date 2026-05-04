import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { CalendarRange, DollarSign, ExternalLink, ScanLine, Ticket, UserRound } from "lucide-react";
import { eventVisibilityLabel } from "@/lib/event-visibility";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { centsToDollars, cn } from "@/lib/utils";

function formatEventDate(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

const hubCtaClass =
  "flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-brand-green via-[#7dffc0] to-emerald-400 px-5 text-xs font-extrabold uppercase tracking-[0.12em] text-black shadow-[0_14px_40px_-14px_rgba(75,250,148,0.65)] transition hover:brightness-105";

const hubCardClass =
  "rounded-2xl border border-white/[0.1] bg-discover-card p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]";

const hubSecondaryCtaClass =
  "inline-flex h-11 w-full items-center justify-center rounded-full border border-white/20 px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/40 sm:w-auto";

export default async function AccountPage() {
  const supabase = await getSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;

  if (!user) {
    return (
      <main className="relative min-h-[100dvh] bg-discover-ink text-zinc-100">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(75,250,148,0.1), transparent 55%), radial-gradient(circle at 80% 90%, rgba(59,130,246,0.05), transparent 45%)",
          }}
        />
        <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center px-5 py-16 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-green">Account hub</p>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-white">Login required</h1>
          <p className="mt-4 text-sm text-zinc-400">Log in to manage your tickets and host tools.</p>
          <Link href="/login?next=/account" className={cn(hubCtaClass, "mt-8 max-w-xs")}>
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  const [{ data: profile }, { data: hostedEvents }] = await Promise.all([
    supabase.from("profiles").select("id,full_name").eq("id", user.id).maybeSingle(),
    supabase.from("events").select("id,slug,title,date,image_url,visibility,tickets_available").eq("host_id", user.id).order("date", { ascending: true }),
  ]);
  const hasHostProfile = Boolean(profile);

  const eventRows = hostedEvents ?? [];
  const eventIds = eventRows.map((e) => e.id);
  const eventCount = eventIds.length;

  const soldByEvent = new Map<string, number>();
  let hostGrossCents = 0;
  let hostTicketsSold = 0;
  let hostCheckIns = 0;
  if (eventIds.length > 0) {
    const [hostOrdersRes, checkInsRes] = await Promise.all([
      supabase.from("orders").select("event_id,total_amount,quantity").in("event_id", eventIds),
      supabase.from("check_ins").select("*", { count: "exact", head: true }).in("event_id", eventIds),
    ]);
    for (const o of hostOrdersRes.data ?? []) {
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

  const emailDisplay = user.email ?? "your account";
  const hostPrimaryHref = hasHostProfile ? "/dashboard" : "/onboarding?next=/dashboard";
  const hostPrimaryLabel = hasHostProfile ? "Open dashboard" : eventCount > 0 ? "Finish organizer profile" : "Become a host";

  return (
    <main className="relative min-h-[100dvh] bg-discover-ink text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(75,250,148,0.12), transparent 55%), radial-gradient(circle at 80% 90%, rgba(59,130,246,0.06), transparent 45%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-lg px-5 pb-16 pt-8 sm:px-6 sm:pt-10 lg:max-w-5xl">
        <header className="max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-green">Account hub</p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">Welcome back</h1>
          <p className="mt-3 text-sm font-medium text-zinc-200">Use one account for buying tickets and hosting events.</p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            <span className="font-semibold text-zinc-400">Where things live:</span> this page is your overview.{" "}
            <span className="text-zinc-400">My tickets</span> is everything you bought.{" "}
            <span className="text-zinc-400">Events & analytics</span> in the header is your host home: list, sales, check-in, and exports.
          </p>
        </header>

        {/* Primary paths first — matches how people scan on first land */}
        <div className="mt-10 grid gap-4 lg:mt-12 lg:grid-cols-2 lg:gap-5">
          <section
            className={cn(
              hubCardClass,
              purchasedCount > 0 ? "border-brand-green/25 shadow-[0_0_32px_-16px_rgba(75,250,148,0.25)]" : "",
            )}
          >
            <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              <Ticket className="h-4 w-4 text-brand-green/80" aria-hidden />
              Buyer view
            </p>
            <p className="mt-3 text-5xl font-black tabular-nums tracking-tight text-white sm:text-6xl">{purchasedCount}</p>
            <p className="mt-2 text-sm text-zinc-500">
              Orders found for{" "}
              <span className="font-medium text-zinc-300" title={emailDisplay}>
                {emailDisplay.length > 36 ? `${emailDisplay.slice(0, 34)}…` : emailDisplay}
              </span>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-600">
              {purchasedCount > 0
                ? "QR codes, receipts, and transfers live in My tickets."
                : "Buy something on RAGE and your orders show up here automatically."}
            </p>
            <Link href="/my-tickets" className={cn(hubCtaClass, "mt-5")}>
              Open my tickets
            </Link>
          </section>

          <section className={cn(hubCardClass, hasHostProfile ? "border-brand-green/20" : "")}>
            <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              <CalendarRange className="h-4 w-4 text-brand-green/80" aria-hidden />
              Host view
            </p>
            <p className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">{hostStatusLabel}</p>
            <p className="mt-2 text-sm text-zinc-500">{hostStatusDetail}</p>

            {showHostAnalytics ? (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/[0.08] bg-black/40 p-3">
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
                <p className="text-xs text-zinc-600">
                  Across {eventCount} event{eventCount === 1 ? "" : "s"}. Charts and CSV export are on the dashboard.
                </p>
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Link href={hostPrimaryHref} className={cn(hubCtaClass, "sm:min-w-[12rem] sm:flex-1")}>
                {hostPrimaryLabel}
              </Link>
              {hasHostProfile ? (
                <Link href="/dashboard/events/new" className={hubSecondaryCtaClass}>
                  New event
                </Link>
              ) : null}
            </div>
          </section>
        </div>

        {eventCount > 0 ? (
          <section id="my-events" className="mt-12 scroll-mt-28 border-t border-white/[0.08] pt-10 lg:mt-14 lg:pt-12">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Your events</p>
                <h2 className="mt-1 text-xl font-black uppercase tracking-tight text-white sm:text-2xl">Quick access</h2>
                <p className="mt-1 text-sm text-zinc-500">Jump back in — full analytics and exports live under Events & analytics.</p>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-white/20 px-5 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/40"
              >
                All events →
              </Link>
            </div>
            <ul className="mt-5 space-y-4">
              {eventRows.slice(0, 5).map((event) => {
                const sold = soldByEvent.get(event.id) ?? 0;
                const cap = Math.max(event.tickets_available ?? 0, 1);
                const pct = Math.min(Math.round((sold / cap) * 100), 100);
                const vis = eventVisibilityLabel(event.visibility);
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
            {eventCount > 5 ? (
              <p className="mt-4 text-center text-xs text-zinc-500">
                Showing 5 of {eventCount}.{" "}
                <Link href="/dashboard" className="font-semibold text-brand-green underline-offset-2 hover:underline">
                  Open dashboard for the full list
                </Link>
                .
              </p>
            ) : null}
          </section>
        ) : hasHostProfile ? (
          <section className="mt-10 rounded-2xl border border-dashed border-white/15 bg-discover-card/50 p-6 text-center lg:mt-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Hosting</p>
            <h2 className="mt-2 text-lg font-black uppercase tracking-tight text-white">No events yet</h2>
            <p className="mt-2 text-sm text-zinc-500">Create an event to get a public page, flyer, and sales tools.</p>
            <Link href="/dashboard/events/new" className={cn(hubCtaClass, "mx-auto mt-5 max-w-sm")}>
              Create your first event
            </Link>
          </section>
        ) : null}

        <footer className="mt-10 rounded-2xl border border-white/[0.08] bg-discover-card/40 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4 lg:mt-12">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
            <UserRound className="h-4 w-4 text-brand-green/70" aria-hidden />
            Account
          </p>
          <div className="mt-3 min-w-0 sm:mt-0 sm:text-right">
            <p className="truncate text-sm font-semibold text-zinc-200" title={profile?.full_name ?? user.email ?? undefined}>
              {profile?.full_name ?? user.email}
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              Need help?{" "}
              <a href="mailto:ragesupportpage@gmail.com" className="font-semibold text-brand-green underline underline-offset-2">
                Support
              </a>
              {" · "}
              <Link href="/faq" className="font-semibold text-zinc-400 underline-offset-2 hover:text-white hover:underline">
                FAQ
              </Link>
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
