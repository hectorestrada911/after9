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
      .select("stripe_connect_account_id,stripe_connect_onboarded")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.stripe_connect_account_id) {
      return NextResponse.json({ error: "Finish payout setup first." }, { status: 409 });
    }
    if (!profile.stripe_connect_onboarded) {
      return NextResponse.json({ error: "Complete Stripe onboarding first." }, { status: 409 });
    }

    const stripe = getStripe();
    const loginLink = await stripe.accounts.createLoginLink(profile.stripe_connect_account_id);
    return NextResponse.json({
      ok: true,
      url: loginLink.url,
      message: "Open Stripe dashboard to withdraw. Automatic in-app transfers are the next phase.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown withdrawal error";
    const lower = message.toLowerCase();
    if (lower.includes("managing losses") || lower.includes("platform-profile")) {
      return NextResponse.json(
        {
          error: "Finish your Stripe platform profile to unlock dashboard withdrawals.",
          actionUrl: "https://dashboard.stripe.com/settings/connect/platform-profile",
          actionLabel: "Open Stripe platform profile",
        },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
