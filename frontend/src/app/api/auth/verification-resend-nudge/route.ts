import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendVerificationResendNudgeEmail } from "@/lib/transactional-email";
import { shouldSendVerificationResendNudge } from "@/lib/verification-resend-nudge";

const bodySchema = z.object({
  email: z.string().trim().email(),
});

/**
 * Best-effort companion email (via Resend) after the user resends Supabase signup verification.
 * Only sends when service role can confirm an unconfirmed user exists for that address.
 */
export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();

  const allowed = await shouldSendVerificationResendNudge(email);
  if (!allowed) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const sent = await sendVerificationResendNudgeEmail({ to: email });
  if (!sent.ok) {
    if (sent.reason === "config") {
      return NextResponse.json({ ok: true, skipped: true });
    }
    return NextResponse.json({ error: sent.message ?? "Send failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
