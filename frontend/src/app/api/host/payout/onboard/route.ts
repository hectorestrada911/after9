import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase-service";

export async function POST() {
  try {
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const account = await stripe.accounts.retrieve(accountId);
    const onboarded = Boolean(account.details_submitted && account.charges_enabled);

    if (onboarded) {
      const loginLink = await stripe.accounts.createLoginLink(accountId);
      return NextResponse.json({ mode: "dashboard", url: loginLink.url });
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      type: "account_onboarding",
      refresh_url: `${appUrl}/account?payout=refresh`,
      return_url: `${appUrl}/account?payout=return`,
    });
    return NextResponse.json({ mode: "onboarding", url: accountLink.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown payout setup error";
    const lower = message.toLowerCase();

    if (
      lower.includes("managing losses") ||
      lower.includes("platform-profile") ||
      lower.includes("connect/platform-profile")
    ) {
      return NextResponse.json(
        {
          error: "Finish your Stripe platform profile to unlock connected account setup.",
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
          error: "Stripe requires a one-time Connect questionnaire before live connected accounts can be created.",
          actionUrl: "https://dashboard.stripe.com/connect/accounts/overview",
          actionLabel: "Open Stripe Connect overview",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
