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

  const selectWithArchive =
    "id,slug,title,description,image_url,date,start_time,end_time,location,capacity,ticket_price,tickets_available,visibility,age_restriction,dress_code,instructions,location_note,archived_at";
  const selectWithoutArchive =
    "id,slug,title,description,image_url,date,start_time,end_time,location,capacity,ticket_price,tickets_available,visibility,age_restriction,dress_code,instructions,location_note";

  async function fetchEvent(selectClause: string, field: "id" | "slug") {
    return supabase.from("events").select(selectClause).eq(field, eventId).eq("host_id", userId).maybeSingle();
  }

  // Keep scanner/event workspace resilient across old links (slug-based) and older schemas (no archived_at).
  const candidates = [
    await fetchEvent(selectWithArchive, "id"),
    await fetchEvent(selectWithoutArchive, "id"),
    await fetchEvent(selectWithArchive, "slug"),
    await fetchEvent(selectWithoutArchive, "slug"),
  ];
  const event = (candidates.find((r) => r.data)?.data ?? null) as unknown as HostEventRow | null;
  if (!event) return { kind: "missing" };

  const [{ data: orders }, { count: ticketsTotal }, { count: ticketsCheckedIn }] = await Promise.all([
    supabase
      .from("orders")
      .select("id,buyer_name,buyer_email,quantity,total_amount,payment_status,confirmation_email_sent_at,created_at")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false }),
    supabase.from("tickets").select("id", { count: "exact", head: true }).eq("event_id", eventId),
    supabase.from("tickets").select("id", { count: "exact", head: true }).eq("event_id", eventId).eq("status", "checked_in"),
  ]);

  return {
    kind: "ok",
    event,
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
