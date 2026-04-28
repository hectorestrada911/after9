import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase-service";

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default(""),
  priceInCents: z.number().int().min(50),
  currency: z.string().min(3).max(3).default("usd"),
});

async function resolveConnectedAccountId() {
  const supabase = await getSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) return { error: "Unauthorized", status: 401 as const };

  const service = getSupabaseServiceRoleClient();
  const { data: profile, error } = await service
    .from("profiles")
    .select("stripe_connect_account_id")
    .eq("id", userId)
    .maybeSingle();

  if (error) return { error: error.message, status: 500 as const };
  if (!profile?.stripe_connect_account_id) {
    return { error: "Connect payouts first to create products.", status: 409 as const };
  }

  return { accountId: profile.stripe_connect_account_id };
}

export async function GET() {
  try {
    const resolved = await resolveConnectedAccountId();
    if ("error" in resolved) return NextResponse.json({ error: resolved.error }, { status: resolved.status });

    const stripe = getStripe();
    const products = await stripe.products.list(
      {
        limit: 25,
        active: true,
        expand: ["data.default_price"],
      },
      { stripeAccount: resolved.accountId },
    );

    return NextResponse.json({ products: products.data, accountId: resolved.accountId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown product list error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const resolved = await resolveConnectedAccountId();
    if ("error" in resolved) return NextResponse.json({ error: resolved.error }, { status: resolved.status });

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    const stripe = getStripe();
    const product = await stripe.products.create(
      {
        name: parsed.data.name.trim(),
        description: parsed.data.description.trim() || undefined,
        default_price_data: {
          unit_amount: parsed.data.priceInCents,
          currency: parsed.data.currency.toLowerCase(),
        },
      },
      { stripeAccount: resolved.accountId },
    );

    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown product create error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
