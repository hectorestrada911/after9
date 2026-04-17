import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, Clock3, MapPin, ShieldCheck, Ticket, Users } from "lucide-react";
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
    <main className="min-w-0 bg-white">
      <section className="container-page py-8 sm:py-12">
        <div className="grid min-w-0 gap-8 lg:grid-cols-[1.15fr,0.85fr]">
          <div className="min-w-0">
            <div className="relative aspect-[4/3] w-full min-w-0 overflow-hidden rounded-2xl bg-offwhite">
              <Image
                src={event.image_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"}
                alt={event.title}
                fill
                priority
                className="object-cover"
              />
            </div>

            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-widest text-muted">
                Hosted by {event.profiles?.organizer_name ?? "Host"}
              </p>
              <h1 className="mt-3 heading-display-fluid">
                {event.title}
              </h1>
              <p className="mt-5 text-base sm:text-lg text-black/80 leading-relaxed max-w-2xl">
                {event.description}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 max-w-2xl">
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="mt-1 shrink-0" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">Date</p>
                    <p className="text-base font-semibold">{event.date}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock3 size={18} className="mt-1 shrink-0" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">Time</p>
                    <p className="text-base font-semibold">{event.start_time} – {event.end_time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-1 shrink-0" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">Location</p>
                    <p className="text-base font-semibold">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users size={18} className="mt-1 shrink-0" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">Age</p>
                    <p className="text-base font-semibold">{event.age_restriction?.replaceAll("_", " ") ?? "All ages"}</p>
                  </div>
                </div>
              </div>

              {(event.dress_code || event.instructions || event.location_note) && (
                <div className="mt-10 border-t border-line pt-8 space-y-5 max-w-2xl">
                  {event.dress_code && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted">Dress code</p>
                      <p className="mt-1 text-base">{event.dress_code}</p>
                    </div>
                  )}
                  {event.instructions && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted">Instructions</p>
                      <p className="mt-1 text-base">{event.instructions}</p>
                    </div>
                  )}
                  {event.location_note && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted">Location note</p>
                      <p className="mt-1 text-base">{event.location_note}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <aside className="min-w-0 self-start lg:sticky lg:top-24">
            <div className="rounded-2xl border border-line bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Price</p>
              <p className="mt-1 text-balance text-4xl font-black tracking-tighter sm:text-5xl">${centsToDollars(event.ticket_price)}</p>
              <p className="mt-2 text-sm text-muted inline-flex items-center gap-1.5">
                <Ticket size={14} /> {remaining} tickets remaining
              </p>

              <div className="mt-5">
                <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted">
                  <span>Demand</span>
                  <span>{soldPercent}% sold</span>
                </div>
                <div className="h-1.5 rounded-full bg-offwhite overflow-hidden">
                  <div className="h-full bg-black" style={{ width: `${soldPercent}%` }} />
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-offwhite p-3 text-xs text-black/70 inline-flex items-center gap-2 w-full">
                <ShieldCheck size={14} className="shrink-0" />
                Secure checkout · Mobile delivery · Instant confirmation
              </div>

              {remaining <= 0 && (
                <div className="mt-4 rounded-xl bg-black text-white p-3 text-sm font-semibold">
                  Sold out · Email host for waitlist
                </div>
              )}

              <div className="mt-5">
                <PurchaseForm eventId={event.id} price={event.ticket_price} title={event.title} slug={slug} soldOut={remaining <= 0} />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
