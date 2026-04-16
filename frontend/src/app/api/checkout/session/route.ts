import { NextResponse } from "next/server";
import { purchaseSchema } from "@/lib/validations";
import { getStripe } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    const body = await req.json();
    const parsed = purchaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid purchase info." }, { status: 400 });
    }

    const supabase = await getSupabaseServerClient();
    const { data: event } = await supabase
      .from("events")
      .select("id,title,ticket_price,tickets_available")
      .eq("id", body.eventId)
      .single();
    if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
    const { count: soldCount } = await supabase.from("tickets").select("id", { count: "exact", head: true }).eq("event_id", event.id);
    const remaining = Math.max((event.tickets_available ?? 0) - (soldCount ?? 0), 0);
    if (parsed.data.quantity > remaining) {
      return NextResponse.json({ error: "Not enough tickets remaining." }, { status: 400 });
    }

    const totalAmount = event.ticket_price * parsed.data.quantity;
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        event_id: event.id,
        buyer_name: parsed.data.buyerName,
        buyer_email: parsed.data.buyerEmail,
        quantity: parsed.data.quantity,
        total_amount: totalAmount,
        payment_status: "pending",
      })
      .select("id")
      .single();

    if (error || !order) return NextResponse.json({ error: "Unable to create order." }, { status: 500 });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order_id=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${body.slug ?? ""}`,
      line_items: [
        {
          quantity: parsed.data.quantity,
          price_data: {
            currency: "usd",
            unit_amount: event.ticket_price,
            product_data: { name: event.title },
          },
        },
      ],
      metadata: {
        orderId: order.id,
        eventId: event.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "Unexpected checkout error." }, { status: 500 });
  }
}
