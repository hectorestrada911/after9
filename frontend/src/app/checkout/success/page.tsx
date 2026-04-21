import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getSupabaseServiceRoleClient } from "@/lib/supabase-service";

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ order_id?: string }> }) {
  const params = await searchParams;
  const orderId = params.order_id;

  let order: { id: string; buyer_name: string; quantity: number; event_id: string } | null = null;
  let tickets: { ticket_code: string; qr_code_url: string | null }[] | null = null;

  if (orderId) {
    try {
      const supabase = getSupabaseServiceRoleClient();
      const { data: o } = await supabase.from("orders").select("id,buyer_name,quantity,event_id").eq("id", orderId).maybeSingle();
      order = o;
      const { data: t } = await supabase.from("tickets").select("ticket_code,qr_code_url").eq("order_id", orderId).limit(20);
      tickets = t ?? [];
    } catch {
      order = null;
      tickets = null;
    }
  }

  return (
    <main className="container-page min-w-0 py-16 sm:py-24">
      <div className="mx-auto max-w-xl min-w-0 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-green/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
          <CheckCircle2 size={14} /> Payment successful
        </div>
        <h1 className="mt-5 heading-display-fluid">You&rsquo;re in.</h1>
        <p className="mt-4 text-base text-muted">Tickets are ready. Save this screen or check your email.</p>
        <p className="mt-6 inline-block rounded-xl bg-offwhite px-4 py-2 text-sm font-mono">Order: {params.order_id || "Pending"}</p>
        {order && (
          <p className="mt-3 text-sm text-muted">
            {order.buyer_name} · {order.quantity} ticket{order.quantity > 1 ? "s" : ""}
          </p>
        )}

        {tickets && tickets.length > 0 && (
          <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
            {tickets.map((ticket) => (
              <div key={ticket.ticket_code} className="rounded-2xl border border-line p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">Ticket code</p>
                <p className="mt-1 text-base font-mono font-bold">{ticket.ticket_code}</p>
                {ticket.qr_code_url ? (
                  <div className="mt-4 inline-block rounded-2xl bg-white p-3 ring-1 ring-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ticket.qr_code_url}
                      alt={`QR for ${ticket.ticket_code}`}
                      width={220}
                      height={220}
                      className="h-[220px] w-[220px] max-w-full object-contain"
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
        {orderId && tickets && tickets.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-line bg-offwhite px-4 py-3 text-sm text-muted">
            Payment is confirmed. Tickets are still generating — open My tickets in a few seconds.
          </div>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          <Link href="/my-tickets" className="pill-dark h-12 px-7 text-sm">
            MY TICKETS
          </Link>
          <Link href="/" className="pill-dark h-12 px-7 text-sm">
            BACK TO EVENTS
          </Link>
        </div>
      </div>
    </main>
  );
}
