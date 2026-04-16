import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge, Card, SectionTitle } from "@/components/ui";
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
        <div className="relative h-52 w-full sm:h-64">
          <Image src={event.image_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"} alt={event.title} fill className="object-cover" />
        </div>
        <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[1.15fr,0.85fr]">
          <div className="space-y-3">
            <Badge>Hosted by {event.profiles?.organizer_name ?? "Host"}</Badge>
            <SectionTitle title={event.title} subtitle={event.description} />
            <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <p><span className="font-medium text-slate-800">Date:</span> {event.date}</p>
              <p><span className="font-medium text-slate-800">Time:</span> {event.start_time} - {event.end_time}</p>
              <p><span className="font-medium text-slate-800">Location:</span> {event.location}</p>
              <p><span className="font-medium text-slate-800">Age:</span> {event.age_restriction?.replaceAll("_", " ")}</p>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-2xl font-bold">${centsToDollars(event.ticket_price)}</p>
            <p className="text-sm text-slate-600">{remaining} tickets remaining</p>
            <div className="rounded-xl bg-white p-3 text-xs text-slate-600">Secure checkout - Mobile ticket delivery - Instant confirmation</div>
            {remaining <= 0 && (
              <div className="rounded-xl bg-amber-50 p-3 text-xs font-medium text-amber-700">
                Sold out. Join waitlist by emailing the host.
              </div>
            )}
            <PurchaseForm eventId={event.id} price={event.ticket_price} title={event.title} slug={slug} soldOut={remaining <= 0} />
          </div>
        </div>
      </Card>
    </main>
  );
}
