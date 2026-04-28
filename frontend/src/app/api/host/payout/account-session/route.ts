import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase-service";

export async function POST() {
  try {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      return NextResponse.json({ error: "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" }, { status: 503 });
    }

    const supabase = await getSupabaseServerClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const service = getSupabaseServiceRoleClient();
    const { data: profile } = await service
      .from("profiles")
      .select("organizer_name,stripe_connect_account_id")
      .eq("id", user.id)
      .maybeSingle();

    const stripe = getStripe();
    let accountId = profile?.stripe_connect_account_id ?? null;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        email: user.email ?? undefined,
        business_type: "individual",
        metadata: { hostUserId: user.id },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: profile?.organizer_name ?? "RAGE host",
        },
      });
      accountId = account.id;
      await service.from("profiles").update({ stripe_connect_account_id: account.id }).eq("id", user.id);
    }

    const accountSession = await stripe.accountSessions.create({
      account: accountId,
      components: {
        account_onboarding: { enabled: true },
      },
    });

    return NextResponse.json({
      ok: true,
      clientSecret: accountSession.client_secret,
      publishableKey,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown account session error";
    const lower = message.toLowerCase();

    if (
      lower.includes("managing losses") ||
      lower.includes("platform-profile") ||
      lower.includes("connect/platform-profile")
    ) {
      return NextResponse.json(
        {
          error: "Platform owner action required: complete Stripe Connect platform profile for live payouts.",
          actionUrl: "https://dashboard.stripe.com/settings/connect/platform-profile",
          actionLabel: "Open Stripe platform profile",
        },
        { status: 409 },
      );
    }

    if (
      lower.includes("create live connected accounts") ||
      lower.includes("connect/accounts/overview") ||
      lower.includes("answer the questionnaire")
    ) {
      return NextResponse.json(
        {
          error: "Platform owner action required: complete the Stripe Connect live questionnaire.",
          actionUrl: "https://dashboard.stripe.com/connect/accounts/overview",
          actionLabel: "Open Stripe Connect overview",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
