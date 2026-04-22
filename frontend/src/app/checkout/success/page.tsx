import Image from "next/image";
import Link from "next/link";
import { Calendar, CheckCircle2, MapPin, Ticket } from "lucide-react";
import { getSupabaseServiceRoleClient } from "@/lib/supabase-service";

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ order_id?: string }> }) {
  const params = await searchParams;
  const orderId = params.order_id;

  let order: { id: string; buyer_name: string; quantity: number; event_id: string } | null = null;
  let tickets: { ticket_code: string; qr_code_url: string | null }[] | null = null;
  let event: { title: string; date: string; location: string; image_url: string | null; slug: string } | null = null;

  if (orderId) {
    try {
      const supabase = getSupabaseServiceRoleClient();
      const { data: o } = await supabase.from("orders").select("id,buyer_name,quantity,event_id").eq("id", orderId).maybeSingle();
      order = o;
      const { data: t } = await supabase.from("tickets").select("ticket_code,qr_code_url").eq("order_id", orderId).limit(20);
      tickets = t ?? [];
      if (o?.event_id) {
        const { data: e } = await supabase.from("events").select("title,date,location,image_url,slug").eq("id", o.event_id).maybeSingle();
        event = e;
      }
    } catch {
      order = null;
      tickets = null;
      event = null;
    }
  }

  const primaryTicket = tickets?.[0] ?? null;
  const extraTickets = tickets?.slice(1) ?? [];

  return (
    <main className="container-page min-w-0 py-10 sm:py-14">
      <div className="mx-auto max-w-4xl min-w-0">
        <section className="overflow-hidden rounded-3xl border border-white/[0.12] bg-gradient-to-b from-zinc-950/95 via-zinc-950/90 to-black p-5 sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[1fr,330px] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-green/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-green">
                <CheckCircle2 size={14} /> Payment successful
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">You&rsquo;re in.</h1>
              <p className="mt-3 max-w-xl text-sm text-zinc-300 sm:text-base">
                Your ticket is live. Keep this QR ready at the door, or find it anytime in <span className="font-semibold text-white">My tickets</span>.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span className="rounded-full border border-white/15 px-3 py-1 font-mono">Order {params.order_id || "Pending"}</span>
                {order ? (
                  <span className="rounded-full border border-white/15 px-3 py-1">
                    {order.buyer_name} · {order.quantity} ticket{order.quantity > 1 ? "s" : ""}
                  </span>
                ) : null}
              </div>
              {event ? (
                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-zinc-300">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1">
                    <Calendar size={13} />
                    {new Date(`${event.date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1">
                    <MapPin size={13} />
                    {event.location}
                  </span>
                </div>
              ) : null}
            </div>
            <div className="rounded-2xl border border-white/[0.1] bg-black/35 p-3">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-white/[0.1] bg-zinc-900">
                {event?.image_url ? (
                  <Image src={event.image_url} alt={event.title} fill className="object-cover" sizes="330px" unoptimized />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-wider text-zinc-500">Event flyer</div>
                )}
              </div>
              <p className="mt-3 truncate text-sm font-bold text-white">{event?.title ?? "Your event"}</p>
              <p className="text-xs text-zinc-400">Ready for entry</p>
            </div>
          </div>
        </section>

        {primaryTicket ? (
          <section className="mt-6 rounded-3xl border border-white/[0.12] bg-zinc-950/70 p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[1fr,280px] lg:items-center">
              <div>
                <p className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <Ticket size={12} />
                  Primary entry QR
                </p>
                <p className="mt-3 font-mono text-sm font-bold text-white">{primaryTicket.ticket_code}</p>
                <p className="mt-2 text-sm text-zinc-400">Screenshot this now for faster check-in if your signal is weak at the venue.</p>
                {extraTickets.length > 0 ? (
                  <p className="mt-3 text-xs text-zinc-500">
                    + {extraTickets.length} more ticket{extraTickets.length > 1 ? "s" : ""} below in My tickets.
                  </p>
                ) : null}
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href="/my-tickets" className="pill-dark h-12 px-7 text-sm">
                    MY TICKETS
                  </Link>
                  <Link href={event?.slug ? `/events/${event.slug}` : "/"} className="pill-dark h-12 px-7 text-sm">
                    BACK TO EVENTS
                  </Link>
                </div>
              </div>
              <div className="justify-self-start rounded-2xl border border-white/[0.15] bg-black p-4 sm:justify-self-center">
                {primaryTicket.qr_code_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={primaryTicket.qr_code_url}
                    alt={`QR for ${primaryTicket.ticket_code}`}
                    width={240}
                    height={240}
                    className="h-[220px] w-[220px] object-contain sm:h-[240px] sm:w-[240px]"
                  />
                ) : (
                  <div className="flex h-[220px] w-[220px] items-center justify-center rounded-xl border border-white/10 text-sm text-zinc-500 sm:h-[240px] sm:w-[240px]">
                    QR generating...
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : null}

        {orderId && tickets && tickets.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/[0.15] bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
            Payment confirmed. Tickets are still generating — open My tickets in a few seconds.
          </div>
        ) : null}

        <section className="mt-6 rounded-2xl border border-white/[0.12] bg-zinc-100 p-4 text-left sm:p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-600">Help / common questions</h2>
          <div className="mt-3 space-y-3 text-sm text-zinc-600">
            <p>
              <span className="font-semibold text-zinc-900">Where are my tickets later?</span> Open{" "}
              <Link href="/my-tickets" className="underline underline-offset-2">
                My tickets
              </Link>{" "}
              from your account.
            </p>
            <p>
              <span className="font-semibold text-zinc-900">Should I save this QR?</span> Yes — screenshot it now for quicker entry.
            </p>
            <p>
              <span className="font-semibold text-zinc-900">Need support?</span> Email{" "}
              <a className="underline underline-offset-2" href="mailto:ragesupportpage@gmail.com">
                ragesupportpage@gmail.com
              </a>{" "}
              and we usually reply within 24 hours.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
