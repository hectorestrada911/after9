import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase-service";

type InviteRole = "manager" | "scanner";

function isInviteRole(value: string): value is InviteRole {
  return value === "manager" || value === "scanner";
}

export async function POST(req: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { eventId?: string; email?: string; role?: string } | null;
  const eventId = body?.eventId?.trim() ?? "";
  const email = body?.email?.trim().toLowerCase() ?? "";
  const role = body?.role?.trim() ?? "";

  if (!eventId || !email || !isInviteRole(role)) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const service = getSupabaseServiceRoleClient();
  const { data: event } = await service.from("events").select("id").eq("id", eventId).eq("host_id", user.id).maybeSingle();
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
  const { error: insertError } = await service.from("event_team_invites").insert({
    event_id: eventId,
    invited_email: email,
    role,
    token,
    invited_by: user.id,
    expires_at: expiresAt,
  });
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return NextResponse.json({
    ok: true,
    inviteUrl: `${appUrl}/api/host/team/accept?token=${token}`,
    expiresAt,
  });
}
