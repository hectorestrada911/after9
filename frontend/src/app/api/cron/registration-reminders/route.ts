import { NextRequest, NextResponse } from "next/server";
import { runRegistrationReminders } from "@/lib/run-registration-reminders";

export const dynamic = "force-dynamic";

/**
 * Vercel Cron (GET) or manual run: Resend reminders to users who registered
 * but have not confirmed their email. Secured with CRON_SECRET.
 *
 * Configure in Vercel: add `CRON_SECRET`, enable cron from vercel.json.
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
    const result = await runRegistrationReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
