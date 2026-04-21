import { cache } from "react";
import { redirect, notFound } from "next/navigation";
import type { HostEventRow, OrderRow, WorkspaceBundle } from "@/lib/event-workspace-types";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export type { HostEventRow, OrderRow, WorkspaceBundle };

export const getEventWorkspaceBundle = cache(async (eventId: string): Promise<WorkspaceBundle> => {
  const supabase = await getSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) return { kind: "unauth" };

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (!profile) return { kind: "no_profile" };

  const { data: event, error } = await supabase
    .from("events")
    .select(
      "id,slug,title,description,image_url,date,start_time,end_time,location,capacity,ticket_price,tickets_available,visibility,age_restriction,dress_code,instructions,location_note",
    )
    .eq("id", eventId)
    .eq("host_id", userId)
    .maybeSingle();

  if (error || !event) return { kind: "missing" };

  const [{ data: orders }, { count: ticketsTotal }, { count: ticketsCheckedIn }] = await Promise.all([
    supabase
      .from("orders")
      .select("id,buyer_name,buyer_email,quantity,total_amount,payment_status,created_at")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false }),
    supabase.from("tickets").select("id", { count: "exact", head: true }).eq("event_id", eventId),
    supabase.from("tickets").select("id", { count: "exact", head: true }).eq("event_id", eventId).eq("status", "checked_in"),
  ]);

  return {
    kind: "ok",
    event: event as HostEventRow,
    orders: (orders ?? []) as OrderRow[],
    ticketsTotal: ticketsTotal ?? 0,
    ticketsCheckedIn: ticketsCheckedIn ?? 0,
  };
});

export async function resolveEventWorkspace(eventId: string) {
  const bundle = await getEventWorkspaceBundle(eventId);
  if (bundle.kind === "unauth") {
    redirect(`/login?next=${encodeURIComponent(`/dashboard/events/${eventId}`)}`);
  }
  if (bundle.kind === "no_profile") {
    redirect(`/onboarding?next=${encodeURIComponent(`/dashboard/events/${eventId}`)}`);
  }
  if (bundle.kind === "missing") {
    notFound();
  }
  return bundle;
}
