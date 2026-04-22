import crypto from "crypto";
import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { TICKET_QR_TO_PNG_OPTIONS } from "@/lib/qr-ticket";
import { getStripe } from "@/lib/stripe";
import { getSupabaseServiceRoleClient } from "@/lib/supabase-service";

export async function POST(req: Request) {
  const stripe = getStripe();
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    const eventId = session.metadata?.eventId;
    if (!orderId || !eventId) return NextResponse.json({ ok: true });

    let supabase;
    try {
      supabase = getSupabaseServiceRoleClient();
    } catch {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const { data: order } = await supabase.from("orders").select("id, quantity").eq("id", orderId).single();
    if (order) {
      await supabase.from("orders").update({ payment_status: "paid" }).eq("id", orderId);

      // Idempotency: Stripe may retry this webhook. Only create missing tickets.
      const { count: existingCount } = await supabase
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .eq("order_id", orderId);
      const alreadyCreated = existingCount ?? 0;
      const expected = Math.max(order.quantity ?? 0, 0);
      const missing = Math.max(expected - alreadyCreated, 0);
      if (missing === 0) {
        return NextResponse.json({ received: true, idempotent: true });
      }

      const tickets = await Promise.all(
        Array.from({ length: missing }).map(async () => {
          const ticketCode = `TK-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
          const qrCodeUrl = await QRCode.toDataURL(ticketCode, TICKET_QR_TO_PNG_OPTIONS);
          return {
            order_id: orderId,
            event_id: eventId,
            ticket_code: ticketCode,
            qr_code_url: qrCodeUrl,
            status: "active" as const,
          };
        }),
      );
      await supabase.from("tickets").insert(tickets);
    }
  }

  return NextResponse.json({ received: true });
}
