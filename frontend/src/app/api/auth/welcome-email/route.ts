import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { sendHostWelcomeEmail } from "@/lib/transactional-email";

/**
 * Sends a one-time “Welcome to RAGE” email after host onboarding.
 * Idempotent via `profiles.welcome_email_sent_at` (see migration `005_profiles_welcome_email_sent_at.sql`).
 */
export async function POST() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, organizer_name, full_name, welcome_email_sent_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  if (profile.welcome_email_sent_at) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const displayName = (profile.organizer_name || profile.full_name || "there").trim();
  const sent = await sendHostWelcomeEmail({ to: user.email, displayName });
  if (!sent.ok) {
    if (sent.reason === "config") {
      return NextResponse.json({ error: "Email is not configured on the server." }, { status: 503 });
    }
    return NextResponse.json({ error: sent.message ?? "Send failed" }, { status: 502 });
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ welcome_email_sent_at: new Date().toISOString() })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
