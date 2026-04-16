import { Card } from "@/components/ui";
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
    <main className="container-page py-10">
      <Card className="mx-auto max-w-xl text-center animate-fadeUp">
        <p className="mx-auto mb-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Payment successful</p>
        <h1 className="text-2xl font-bold">Purchase confirmed</h1>
        <p className="mt-2 text-slate-600">Your tickets are ready. Save your order code for entry.</p>
        <p className="mt-4 rounded-lg bg-slate-100 p-2 text-sm">Order: {params.order_id || "Pending"}</p>
        {order && <p className="mt-2 text-sm text-slate-600">Buyer: {order.buyer_name} ({order.quantity} ticket{order.quantity > 1 ? "s" : ""})</p>}
        {tickets && tickets.length > 0 && (
          <div className="mt-4 grid gap-3 text-left">
            {tickets.map((ticket) => (
              <div key={ticket.ticket_code} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-semibold">Code: {ticket.ticket_code}</p>
                {ticket.qr_code_url && <img src={ticket.qr_code_url} alt={ticket.ticket_code} className="mt-2 h-28 w-28" />}
              </div>
            ))}
          </div>
        )}
      </Card>
    </main>
  );
}
