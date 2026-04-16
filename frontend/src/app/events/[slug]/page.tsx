import { notFound } from "next/navigation";
import { Card } from "@/components/ui";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { centsToDollars } from "@/lib/utils";
import PurchaseForm from "./purchase-form";

export default async function PublicEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await getSupabaseServerClient();
  const { data: event } = await supabase.from("events").select("*, profiles(organizer_name)").eq("slug", slug).single();
  if (!event) return notFound();

  const { count: soldCount } = await supabase.from("tickets").select("id", { count: "exact", head: true }).eq("event_id", event.id);
  const remaining = Math.max((event.tickets_available ?? 0) - (soldCount ?? 0), 0);

  return (
    <main className="container-page py-8">
      <Card className="overflow-hidden p-0">
        <img src={event.image_url} alt={event.title} className="h-48 w-full object-cover" />
        <div className="space-y-3 p-4">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-sm text-slate-600">By {event.profiles?.organizer_name ?? "Host"}</p>
          <p className="text-sm text-slate-600">{event.date} {event.start_time} - {event.end_time}</p>
          <p className="text-lg font-semibold">${centsToDollars(event.ticket_price)}</p>
          <p className="text-sm text-slate-600">{remaining} tickets remaining</p>
          <p className="text-sm text-slate-700">{event.description}</p>
          <div className="rounded-xl bg-slate-100 p-3 text-xs text-slate-600">Secure checkout - Mobile ticket delivery</div>
          {remaining <= 0 && (
            <div className="rounded-xl bg-amber-50 p-3 text-xs font-medium text-amber-700">
              Sold out. Join waitlist by emailing the host.
            </div>
          )}
          <PurchaseForm eventId={event.id} price={event.ticket_price} title={event.title} slug={slug} soldOut={remaining <= 0} />
        </div>
      </Card>
    </main>
  );
}
