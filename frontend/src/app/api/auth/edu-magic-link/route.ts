import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { parseEduEmail } from "@/lib/edu-email";
import { safeNextPath } from "@/lib/event-draft";

/**
 * Sends a Supabase magic link to a validated `.edu` address only.
 * Completes through `/auth/callback` → `/auth/complete` (or `next` when safe).
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const emailRaw = typeof body === "object" && body !== null && "email" in body ? String((body as { email: unknown }).email) : "";
  const nextRaw =
    typeof body === "object" && body !== null && "next" in body ? String((body as { next: unknown }).next ?? "") : "";

  const parsed = parseEduEmail(emailRaw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.message }, { status: 400 });
  }

  const next = safeNextPath(nextRaw || undefined);
  const origin = request.nextUrl.origin;
  const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.email,
    options: {
      emailRedirectTo,
      shouldCreateUser: true,
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("too many") || msg.includes("rate")) {
      return NextResponse.json({ error: "Too many requests. Wait a minute and try again." }, { status: 429 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
