import { NextRequest, NextResponse } from "next/server";
import { sendContactSubmission } from "@/lib/contact-mail";
import { contactFormSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = contactFormSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your name, email, and message." }, { status: 400 });
  }

  const { name, email, message, company } = parsed.data;
  if (company && company.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const result = await sendContactSubmission({ name, email, message });
  if (!result.ok && result.reason === "config") {
    return NextResponse.json(
      { error: "Email is not configured on the server yet." },
      { status: 503 },
    );
  }
  if (!result.ok && result.reason === "send") {
    return NextResponse.json({ error: "Could not send your message right now. Please try again in a minute." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
