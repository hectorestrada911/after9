import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase-service";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = (url.searchParams.get("token") ?? "").trim();
  if (!token) {
    return NextResponse.redirect(new URL("/dashboard?team=invalid", url.origin));
  }

  const supabase = await getSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(`/api/host/team/accept?token=${token}`)}`, url.origin));
  }

  const service = getSupabaseServiceRoleClient();
  const { data: invite } = await service
    .from("event_team_invites")
    .select("id,event_id,invited_email,role,expires_at,accepted_at,invited_by")
    .eq("token", token)
    .maybeSingle();

  if (!invite || invite.accepted_at || new Date(invite.expires_at).getTime() < Date.now()) {
    return NextResponse.redirect(new URL("/dashboard?team=expired", url.origin));
  }
  if ((user.email ?? "").toLowerCase() !== invite.invited_email.toLowerCase()) {
    return NextResponse.redirect(new URL("/dashboard?team=email-mismatch", url.origin));
  }

  const { error: memberError } = await service.from("event_team_members").upsert(
    {
      event_id: invite.event_id,
      user_id: user.id,
      role: invite.role,
      invited_by: invite.invited_by,
    },
    { onConflict: "event_id,user_id" },
  );
  if (memberError) {
    return NextResponse.redirect(new URL("/dashboard?team=error", url.origin));
  }

  await service
    .from("event_team_invites")
    .update({ accepted_by: user.id, accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  return NextResponse.redirect(new URL(`/dashboard/events/${invite.event_id}?team=joined`, url.origin));
}
