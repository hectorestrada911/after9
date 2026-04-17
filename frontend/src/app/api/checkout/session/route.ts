import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { eventId, title, slug, buyerName, buyerEmail, quantity } = await req.json();

    if (!eventId || !title || !slug || !buyerName || !buyerEmail || !quantity) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("ticket_price, tickets_available")
      .eq("id", eventId)
      .single();

    if (eventErr || !event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const { count: soldCount } = await supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId);

    const remaining = Math.max((event.tickets_available ?? 0) - (soldCount ?? 0), 0);
    if (remaining < quantity) {
      return NextResponse.json({ error: "Not enough tickets remaining." }, { status: 409 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: buyerEmail,
      line_items: [
        {
          quantity,
          price_data: {
            currency: "usd",
            unit_amount: event.ticket_price,
            product_data: { name: title },
          },
        },
      ],
      metadata: { eventId, slug, buyerName, buyerEmail, quantity: String(quantity) },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/events/${slug}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
