import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ order_id?: string }> }) {
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();
  const orderId = params.order_id;
  const { data: order } = orderId
    ? await supabase.from("orders").select("id,buyer_name,quantity,event_id").eq("id", orderId).maybeSingle()
    : { data: null };
  const { data: tickets } = orderId
    ? await supabase.from("tickets").select("ticket_code,qr_code_url").eq("order_id", orderId).limit(5)
    : { data: null };

  return (
    <main className="container-page min-w-0 py-16 sm:py-24">
      <div className="mx-auto max-w-xl min-w-0 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-green/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
          <CheckCircle2 size={14} /> Payment successful
        </div>
        <h1 className="mt-5 heading-display-fluid">
          You&rsquo;re in.
        </h1>
        <p className="mt-4 text-base text-muted">
          Tickets are ready. Save your order code for entry.
        </p>
        <p className="mt-6 inline-block rounded-xl bg-offwhite px-4 py-2 text-sm font-mono">
          Order: {params.order_id || "Pending"}
        </p>
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
                {ticket.qr_code_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ticket.qr_code_url} alt={ticket.ticket_code} className="mt-3 h-32 w-32 rounded-md" />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-10">
          <Link href="/" className="pill-dark h-12 px-7 text-sm">
            BACK TO EVENTS
          </Link>
        </div>
      </div>
    </main>
  );
}
