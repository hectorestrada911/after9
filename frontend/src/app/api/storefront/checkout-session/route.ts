import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";

const schema = z.object({
  accountId: z.string().startsWith("acct_"),
  priceId: z.string().startsWith("price_"),
  productName: z.string().min(1),
  quantity: z.number().int().min(1).max(10).default(1),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    const { accountId, priceId, productName, quantity } = parsed.data;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const stripe = getStripe();

    // Simple monetization: direct charge to connected account with small app fee.
    const applicationFeeAmount = 100;

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: [{ price: priceId, quantity }],
        payment_intent_data: { application_fee_amount: applicationFeeAmount },
        success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/storefront/${accountId}`,
        custom_text: {
          submit: { message: `Secure checkout for ${productName}` },
        },
      },
      { stripeAccount: accountId },
    );

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown checkout error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
