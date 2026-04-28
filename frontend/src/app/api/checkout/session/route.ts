import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { fulfillFreeOrderIfNeeded } from "@/lib/free-order-fulfillment";
import { hostNetFromGrossCents, platformFeeFromGrossCents, resolvePlatformFeePercent } from "@/lib/platform-fees";
import { isUuidString, normalizeGuestEventSlug } from "@/lib/guest-event-slug";

const eventCheckoutSelect = "id, host_id, ticket_price, tickets_available, archived_at, sales_enabled" as const;

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

    const body = await req.json();
    const { eventId, title, slug: rawSlug, buyerName, buyerEmail, quantity, promoCode } = body;
    const slug = normalizeGuestEventSlug(rawSlug);

    if (!eventId || !title || !slug || !buyerName || !buyerEmail || !quantity) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    let resolvedEvent:
      | {
          id: string;
          host_id: string;
          ticket_price: number;
          tickets_available: number | null;
          archived_at?: string | null;
          sales_enabled?: boolean;
        }
      | null = null;

    // Slug-first: URL is the source of truth for shared links (avoids stale/wrong eventId edge cases).
    const { data: bySlug, error: slugErr } = await supabase
      .from("events")
      .select(eventCheckoutSelect)
      .eq("slug", slug)
      .maybeSingle();
    if (slugErr) {
      console.error("[checkout/session] slug lookup error", slugErr);
      return NextResponse.json(
        { error: "Ticket checkout is temporarily unavailable. Please try again in a moment." },
        { status: 503 },
      );
    }
    resolvedEvent = bySlug ?? null;

    // Case-only mismatch (rare): slugs are usually lowercase; ilike is safe when slug has no LIKE wildcards.
    if (!resolvedEvent && /^[a-z0-9-]+$/i.test(slug)) {
      const { data: bySlugI, error: slugIErr } = await supabase
        .from("events")
        .select(eventCheckoutSelect)
        .ilike("slug", slug)
        .maybeSingle();
      if (slugIErr) {
        console.error("[checkout/session] slug ilike lookup error", slugIErr);
        return NextResponse.json(
          { error: "Ticket checkout is temporarily unavailable. Please try again in a moment." },
          { status: 503 },
        );
      }
      resolvedEvent = bySlugI ?? null;
    }

    if (!resolvedEvent && isUuidString(eventId)) {
      const { data: byId, error: idErr } = await supabase
        .from("events")
        .select(eventCheckoutSelect)
        .eq("id", eventId)
        .maybeSingle();
      if (idErr) {
        console.error("[checkout/session] id lookup error", idErr);
        return NextResponse.json(
          { error: "Ticket checkout is temporarily unavailable. Please try again in a moment." },
          { status: 503 },
        );
      }
      resolvedEvent = byId ?? null;
    }

    if (!resolvedEvent) {
      return NextResponse.json({ error: "Event not found. Please refresh and try again." }, { status: 404 });
    }
    if (resolvedEvent.archived_at) {
      return NextResponse.json({ error: "This event is archived and no longer accepts purchases." }, { status: 409 });
    }
    if (resolvedEvent.sales_enabled === false) {
      return NextResponse.json({ error: "Ticket sales are currently paused by the host." }, { status: 409 });
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
    const grossTotalAmount = resolvedEvent.ticket_price * quantity;
    let discountCode = "";
    let discountPercent = 0;
    let discountAmount = 0;
    if (typeof promoCode === "string" && promoCode.trim()) {
      const normalizedCode = promoCode.trim().toUpperCase();
      const nowIso = new Date().toISOString();
      const { data: discount, error: discountErr } = await supabase
        .from("event_discount_codes")
        .select("id, code, percent_off, active, max_redemptions, redemption_count, starts_at, ends_at")
        .eq("event_id", resolvedEvent.id)
        .eq("code", normalizedCode)
        .maybeSingle();
      if (discountErr) {
        return NextResponse.json({ error: "Could not verify discount code right now." }, { status: 503 });
      }
      if (!discount || !discount.active) {
        return NextResponse.json({ error: "Invalid or inactive discount code." }, { status: 409 });
      }
      if (discount.starts_at && discount.starts_at > nowIso) {
        return NextResponse.json({ error: "This discount code is not active yet." }, { status: 409 });
      }
      if (discount.ends_at && discount.ends_at < nowIso) {
        return NextResponse.json({ error: "This discount code has expired." }, { status: 409 });
      }
      if (typeof discount.max_redemptions === "number" && discount.redemption_count >= discount.max_redemptions) {
        return NextResponse.json({ error: "This discount code has reached its redemption limit." }, { status: 409 });
      }
      discountCode = discount.code;
      discountPercent = Math.max(0, Math.min(100, Number(discount.percent_off) || 0));
      discountAmount = Math.round((grossTotalAmount * discountPercent) / 100);
    }
    const totalAmount = Math.max(0, grossTotalAmount - discountAmount);
    const platformFeeAmount = platformFeeFromGrossCents(totalAmount, feePercent);
    const hostNetAmount = hostNetFromGrossCents(totalAmount, feePercent);
    const hostProfileRes = await supabase
      .from("profiles")
      .select("stripe_connect_account_id")
      .eq("id", resolvedEvent.host_id)
      .maybeSingle();
    const hostProfile = hostProfileRes.data;
    if (hostProfileRes.error) {
      console.error("[checkout/session] host profile payout lookup error", hostProfileRes.error);
    }
    let destinationAccount: string | null = null;
    if (hostProfile?.stripe_connect_account_id) {
      try {
        // Use live Stripe account capabilities at checkout time; DB onboarding flags can be stale.
        const hostAccount = await stripe.accounts.retrieve(hostProfile.stripe_connect_account_id);
        if (hostAccount.charges_enabled) {
          destinationAccount = hostProfile.stripe_connect_account_id;
        }
      } catch (e) {
        console.error("[checkout/session] could not verify connected account capability", e);
      }
    }
    const { data: orderRow, error: orderErr } = await supabase
      .from("orders")
      .insert({
        event_id: resolvedEvent.id,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        quantity,
        total_amount: totalAmount,
        discount_code: discountCode || null,
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        payment_status: "pending",
      })
      .select("id")
      .single();

    if (orderErr || !orderRow) {
      return NextResponse.json({ error: orderErr?.message ?? "Could not create order." }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Free events: skip Stripe (Stripe Checkout requires a positive amount) and fulfill immediately.
    if (totalAmount <= 0) {
      await fulfillFreeOrderIfNeeded(supabase, orderRow.id);
      return NextResponse.json({ url: `${appUrl}/checkout/success?order_id=${orderRow.id}` });
    }

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
        grossBeforeDiscount: String(grossTotalAmount),
        discountCode,
        discountPercent: String(discountPercent),
        discountAmount: String(discountAmount),
        platformFeeAmount: String(platformFeeAmount),
        hostNetAmount: String(hostNetAmount),
        destinationAccount: destinationAccount ?? "",
      },
      payment_intent_data: {
        ...(destinationAccount
          ? {
              application_fee_amount: platformFeeAmount,
              transfer_data: {
                destination: destinationAccount,
              },
            }
          : {}),
        metadata: {
          orderId: orderRow.id,
          eventId: resolvedEvent.id,
          slug,
          buyerName,
          buyerEmail,
          quantity: String(quantity),
          destinationAccount: destinationAccount ?? "",
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
