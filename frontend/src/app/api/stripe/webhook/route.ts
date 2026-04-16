import crypto from "crypto";
import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase-server";

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

    const supabase = await getSupabaseServerClient();
    const { data: order } = await supabase.from("orders").select("id, quantity").eq("id", orderId).single();
    if (order) {
      await supabase.from("orders").update({ payment_status: "paid" }).eq("id", orderId);

      const tickets = await Promise.all(
        Array.from({ length: order.quantity }).map(async () => {
          const ticketCode = `TK-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
          const qrCodeUrl = await QRCode.toDataURL(ticketCode);
          return {
            order_id: orderId,
            event_id: eventId,
            ticket_code: ticketCode,
            qr_code_url: qrCodeUrl,
            status: "active",
          };
        }),
      );
      await supabase.from("tickets").insert(tickets);
    }
  }

  return NextResponse.json({ received: true });
}
