import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { hostNetFromGrossCents, platformFeeFromGrossCents, resolvePlatformFeePercent } from "@/lib/platform-fees";

export async function POST(req: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!stripeKey || !supabaseUrl || !serviceRole) {
      return NextResponse.json({ error: "Checkout is not configured." }, { status: 503 });
    }
    const stripe = new Stripe(stripeKey);
    const supabase = createClient(supabaseUrl, serviceRole);

    const { eventId, title, slug, buyerName, buyerEmail, quantity } = await req.json();

    if (!eventId || !title || !slug || !buyerName || !buyerEmail || !quantity) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(eventId));
    let resolvedEvent:
      | { id: string; ticket_price: number; tickets_available: number | null; archived_at?: string | null }
      | null = null;

    if (isUuid) {
      const { data } = await supabase
        .from("events")
        .select("id, ticket_price, tickets_available, archived_at")
        .eq("id", eventId)
        .maybeSingle();
      resolvedEvent = data ?? null;
    }

    if (!resolvedEvent) {
      const { data } = await supabase
        .from("events")
        .select("id, ticket_price, tickets_available, archived_at")
        .eq("slug", slug)
        .maybeSingle();
      resolvedEvent = data ?? null;
    }

    if (!resolvedEvent) {
      return NextResponse.json({ error: "Event not found. Please refresh and try again." }, { status: 404 });
    }
    if (resolvedEvent.archived_at) {
      return NextResponse.json({ error: "This event is archived and no longer accepts purchases." }, { status: 409 });
    }

    const { count: soldCount } = await supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("event_id", resolvedEvent.id);

    const remaining = Math.max((resolvedEvent.tickets_available ?? 0) - (soldCount ?? 0), 0);
    if (remaining < quantity) {
      return NextResponse.json({ error: "Not enough tickets remaining." }, { status: 409 });
    }

    const feePercent = resolvePlatformFeePercent(process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENT);
    const totalAmount = resolvedEvent.ticket_price * quantity;
    const platformFeeAmount = platformFeeFromGrossCents(totalAmount, feePercent);
    const hostNetAmount = hostNetFromGrossCents(totalAmount, feePercent);
    const { data: orderRow, error: orderErr } = await supabase
      .from("orders")
      .insert({
        event_id: resolvedEvent.id,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        quantity,
        total_amount: totalAmount,
        payment_status: "pending",
      })
      .select("id")
      .single();

    if (orderErr || !orderRow) {
      return NextResponse.json({ error: orderErr?.message ?? "Could not create order." }, { status: 500 });
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
            unit_amount: resolvedEvent.ticket_price,
            product_data: {
              name: title,
              description: "Mobile ticket + QR · Instant confirmation",
            },
          },
        },
      ],
      branding_settings: {
        display_name: "RAGE",
        font_family: "inter",
        border_style: "rounded",
        background_color: "#030303",
        button_color: "#4BFA94",
      },
      custom_text: {
        submit: { message: "Secure checkout · Tickets emailed instantly" },
      },
      metadata: {
        orderId: orderRow.id,
        eventId: resolvedEvent.id,
        slug,
        buyerName,
        buyerEmail,
        quantity: String(quantity),
        platformFeePercent: String(feePercent),
        grossAmount: String(totalAmount),
        platformFeeAmount: String(platformFeeAmount),
        hostNetAmount: String(hostNetAmount),
      },
      payment_intent_data: {
        metadata: {
          orderId: orderRow.id,
          eventId: resolvedEvent.id,
          slug,
          buyerName,
          buyerEmail,
          quantity: String(quantity),
        },
      },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderRow.id}`,
      cancel_url: `${appUrl}/events/${slug}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
