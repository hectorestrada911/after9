import { NextRequest, NextResponse } from "next/server";
import { runCreateEventReminders } from "@/lib/run-create-event-reminders";

export const dynamic = "force-dynamic";

/**
 * Vercel Cron (GET): Resend reminders to verified users with a profile and zero events.
 * Same UTC window as registration-reminders: `0 2 * * *` ≈ 7:00 PM America/Los_Angeles during PDT.
 * Same CRON_SECRET as other cron routes.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 503 });
  }

  const auth = request.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runCreateEventReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
