import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock3, MapPin, ShieldCheck } from "lucide-react";
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
  const soldPercent = Math.min(Math.round(((soldCount ?? 0) / Math.max(event.tickets_available ?? 1, 1)) * 100), 100);

  return (
    <main className="container-page py-5 sm:py-8">
      <Card className="overflow-hidden p-0">
        <div className="relative h-48 w-full sm:h-64">
          <Image src={event.image_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"} alt={event.title} fill className="object-cover" />
        </div>
        <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[1.15fr,0.85fr]">
          <div className="space-y-3">
            <Badge className="w-fit">Hosted by {event.profiles?.organizer_name ?? "Host"}</Badge>
            <SectionTitle title={event.title} subtitle={event.description} />
            <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
              <p className="inline-flex items-center gap-2"><Clock3 size={14} className="text-brand" /><span><span className="font-medium text-slate-100">Date:</span> {event.date}</span></p>
              <p><span className="font-medium text-slate-100">Time:</span> {event.start_time} - {event.end_time}</p>
              <p className="inline-flex items-center gap-2"><MapPin size={14} className="text-accent-sky" /><span><span className="font-medium text-slate-100">Location:</span> {event.location}</span></p>
              <p><span className="font-medium text-slate-100">Age:</span> {event.age_restriction?.replaceAll("_", " ")}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span>Demand meter</span>
                <span>{soldPercent}% sold</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div className="h-2 rounded-full bg-brand" style={{ width: `${soldPercent}%` }} />
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-700 bg-slate-900/70 p-4 sm:sticky sm:top-4">
            <p className="text-2xl font-bold text-slate-100">${centsToDollars(event.ticket_price)}</p>
            <p className="text-sm text-slate-300">{remaining} tickets remaining</p>
            <div className="rounded-xl bg-slate-950 p-3 text-xs text-slate-300">
              <p className="inline-flex items-center gap-2"><ShieldCheck size={13} className="text-accent-mint" /> Secure checkout - Mobile ticket delivery - Instant confirmation</p>
            </div>
            {remaining <= 0 && (
              <div className="rounded-xl bg-amber-500/10 p-3 text-xs font-medium text-amber-300">
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
