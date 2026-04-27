import Image from "next/image";
import Link from "next/link";
import crypto from "crypto";
import QRCode from "qrcode";
import { createClient } from "@supabase/supabase-js";
import { Ticket } from "lucide-react";
import { TICKET_QR_TO_PNG_OPTIONS } from "@/lib/qr-ticket";
import { getStripe } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { centsToDollars } from "@/lib/utils";

type OrderRow = {
  id: string;
  event_id: string;
  buyer_name: string;
  buyer_email: string;
  quantity: number;
  total_amount: number;
  payment_status: "pending" | "paid" | "failed";
  created_at: string;
  events: { title: string; date: string; location: string; slug: string; image_url: string | null } | null;
};

type TicketRow = {
  id: string;
  order_id: string;
  event_id: string;
  ticket_code: string;
  qr_code_url: string | null;
  status: "active" | "checked_in" | "cancelled";
  created_at?: string;
};

type OrderWithTickets = Omit<OrderRow, "events"> & {
  events: OrderRow["events"];
  tickets: TicketRow[];
};

function formatDate(dateLike: string) {
  try {
    return new Date(dateLike).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateLike;
  }
}

function isEventSummary(
  value: unknown,
): value is { title: string; date: string; location: string; slug: string; image_url: string | null } {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.title === "string" &&
    typeof row.date === "string" &&
    typeof row.location === "string" &&
    typeof row.slug === "string" &&
    (typeof row.image_url === "string" || row.image_url === null)
  );
}

function normalizeEventRelation(value: unknown) {
  if (!value) return null;
  if (Array.isArray(value)) {
    const firstValid = value.find((item) => isEventSummary(item));
    return firstValid ?? null;
  }
  return isEventSummary(value) ? value : null;
}

function normalizeTickets(value: unknown): TicketRow[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as TicketRow[];
  return [value as TicketRow];
}

async function fetchOrdersWithTickets(service: any, email: string): Promise<OrderWithTickets[]> {
  const { data: rawOrders } = await service
    .from("orders")
    .select(
      "id,event_id,buyer_name,buyer_email,quantity,total_amount,payment_status,created_at,events(title,date,location,slug,image_url),tickets(id,order_id,event_id,ticket_code,qr_code_url,status,created_at)",
    )
    .ilike("buyer_email", email)
    .order("created_at", { ascending: false });

  return (rawOrders ?? []).map((raw: Record<string, unknown>) => {
    const row = raw as Record<string, unknown>;
    const tickets = normalizeTickets(row.tickets).sort((a, b) =>
      (b.created_at ?? "").localeCompare(a.created_at ?? ""),
    );
    return {
      ...(raw as Omit<OrderRow, "events">),
      events: normalizeEventRelation(row.events),
      tickets,
    };
  });
}

export default async function MyTicketsPage() {
  const supabase = await getSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) {
    return (
      <main className="container-page py-16 sm:py-24">
        <div className="mx-auto max-w-md text-center">
          <h1 className="display-section-fluid">Login required</h1>
          <p className="mt-4 text-base text-muted">Sign in to see your purchased tickets.</p>
          <Link href="/login?next=/my-tickets" className="mt-6 inline-flex h-12 items-center rounded-full bg-white px-7 text-sm font-bold uppercase tracking-wide text-black">
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRole) {
    return (
      <main className="container-page py-16 sm:py-24">
        <div className="mx-auto max-w-lg rounded-2xl border border-white/[0.08] bg-zinc-950 p-6">
          <h1 className="display-section-fluid">My tickets</h1>
          <p className="mt-4 text-sm text-zinc-400">Ticket lookup is not configured yet. Add `SUPABASE_SERVICE_ROLE_KEY` to enable account ticket history.</p>
        </div>
      </main>
    );
  }

  const service = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let orders: OrderWithTickets[] = await fetchOrdersWithTickets(service, user.email ?? "");

  const needsRepair = orders
    .filter((o) => o.payment_status !== "paid" && o.tickets.length === 0)
    .slice(0, 5);

  if (needsRepair.length > 0) {
    try {
      const stripe = getStripe();
      const sessions = await stripe.checkout.sessions.list({ limit: 100 });
      const paidByOrder = new Map(
        sessions.data
          .filter((s) => (s.payment_status === "paid" || s.status === "complete") && s.metadata?.orderId)
          .map((s) => [s.metadata?.orderId as string, true]),
      );

      for (const order of needsRepair) {
        if (!paidByOrder.get(order.id)) continue;
        await service.from("orders").update({ payment_status: "paid" }).eq("id", order.id);
        const { count: existingCount } = await service
          .from("tickets")
          .select("id", { count: "exact", head: true })
          .eq("order_id", order.id);
        const missing = Math.max((order.quantity ?? 0) - (existingCount ?? 0), 0);
        if (missing > 0) {
          const ticketsToInsert = await Promise.all(
            Array.from({ length: missing }).map(async () => {
              const ticketCode = `TK-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
              const qrCodeUrl = await QRCode.toDataURL(ticketCode, TICKET_QR_TO_PNG_OPTIONS);
              return {
                order_id: order.id,
                event_id: order.event_id,
                ticket_code: ticketCode,
                qr_code_url: qrCodeUrl,
                status: "active" as const,
              };
            }),
          );
          await service.from("tickets").insert(ticketsToInsert);
        }
      }

      orders = await fetchOrdersWithTickets(service, user.email ?? "");
    } catch {
      // If Stripe reconciliation fails, keep rendering existing state.
    }
  }

  return (
    <main className="container-page py-10 sm:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Account</p>
          <h1 className="mt-3 display-section-fluid">My tickets</h1>
        </div>
        <Link href="/account" className="inline-flex h-10 items-center rounded-full border border-white/20 px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white/40">
          Account home
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-zinc-950 p-10 text-center">
          <Ticket className="mx-auto h-10 w-10 text-zinc-500" />
          <p className="mt-4 text-lg font-bold text-white">No tickets yet</p>
          <p className="mt-1 text-sm text-zinc-500">When you buy tickets, they will appear here with QR codes.</p>
          <Link href="/" className="mt-6 inline-flex h-10 items-center rounded-full bg-white px-5 text-xs font-bold uppercase tracking-wide text-black">
            Browse events
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const orderTickets = order.tickets;
            return (
              <div key={order.id} className="overflow-hidden rounded-2xl border border-white/[0.1] bg-zinc-950">
                <div className="grid gap-4 p-4 sm:grid-cols-[120px,1fr] sm:p-5">
                  <div className="relative h-24 overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900 sm:h-28">
                    {order.events?.image_url ? (
                      <Image src={order.events.image_url} alt={order.events.title} fill className="object-cover" sizes="120px" unoptimized />
                    ) : null}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{formatDate(order.events?.date ?? order.created_at)}</p>
                    <p className="mt-1 text-lg font-bold text-white">{order.events?.title ?? "Event"}</p>
                    <p className="mt-1 text-sm text-zinc-400">{order.events?.location ?? "Location TBA"}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-white/15 px-2.5 py-1 text-zinc-300">{order.quantity} ticket{order.quantity > 1 ? "s" : ""}</span>
                      <span className="rounded-full border border-white/15 px-2.5 py-1 text-zinc-300">${centsToDollars(order.total_amount)}</span>
                      <span className="rounded-full border border-white/15 px-2.5 py-1 text-zinc-300">{order.payment_status}</span>
                    </div>
                    {order.events?.slug ? (
                      <Link
                        href={`/events/${order.events.slug}`}
                        className="mt-3 inline-flex h-9 items-center rounded-full border border-white/20 px-3 text-[11px] font-bold uppercase tracking-wide text-white transition hover:border-white/40"
                      >
                        View event page
                      </Link>
                    ) : null}
                  </div>
                </div>
                <div className="border-t border-white/[0.08] bg-black/30 p-4 sm:p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Ticket codes</p>
                  {orderTickets.length === 0 ? (
                    <p className="mt-2 text-sm text-zinc-500">Tickets are still processing. Refresh in a moment.</p>
                  ) : null}
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    {orderTickets.map((ticket) => (
                      <div key={ticket.id} className="rounded-xl border border-white/[0.12] bg-zinc-900/70 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Entry QR</p>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                              ticket.status === "checked_in"
                                ? "bg-brand-green/30 text-brand-green"
                                : ticket.status === "cancelled"
                                  ? "bg-red-500/20 text-red-300"
                                  : "bg-white/10 text-zinc-300"
                            }`}
                          >
                            {ticket.status === "checked_in" ? "Used" : ticket.status}
                          </span>
                        </div>
                        {ticket.qr_code_url ? (
                          <div className="mt-2 inline-block rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5">
                            {/* eslint-disable-next-line @next/next/no-img-element -- data URL from Stripe webhook */}
                            <img
                              src={ticket.qr_code_url}
                              alt={`QR for ${ticket.ticket_code}`}
                              width={200}
                              height={200}
                              className="h-[200px] w-[200px] max-w-full object-contain"
                            />
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-zinc-500">QR generating after payment…</p>
                        )}
                        <p className="mt-3 font-mono text-xs text-zinc-300">{ticket.ticket_code}</p>
                        <p className="mt-1 text-xs capitalize text-zinc-500">
                          {ticket.status === "checked_in" ? "Used at door and saved in your history." : ticket.status.replace("_", " ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
