import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase-service";

export async function GET(req: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const eventId = (url.searchParams.get("eventId") ?? "").trim();
  if (!eventId) return NextResponse.json({ error: "Missing eventId." }, { status: 400 });

  const service = getSupabaseServiceRoleClient();
  const { data: event } = await service.from("events").select("id,host_id").eq("id", eventId).eq("host_id", user.id).maybeSingle();
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const [{ data: invites, error: invitesError }, { data: members, error: membersError }] = await Promise.all([
    service
      .from("event_team_invites")
      .select("id,invited_email,role,created_at,accepted_at,expires_at")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false }),
    service
      .from("event_team_members")
      .select("id,user_id,role,created_at")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false }),
  ]);

  if (invitesError) return NextResponse.json({ error: invitesError.message }, { status: 500 });
  if (membersError) return NextResponse.json({ error: membersError.message }, { status: 500 });
  const membersWithOwner = [
    { id: `owner-${event.host_id}`, user_id: event.host_id, role: "owner", created_at: new Date(0).toISOString() },
    ...((members ?? []) as { id: string; user_id: string; role: "owner" | "manager" | "scanner"; created_at: string }[]),
  ];
  return NextResponse.json({ invites: invites ?? [], members: membersWithOwner });
}
