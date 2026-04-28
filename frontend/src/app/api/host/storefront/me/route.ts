import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase-service";

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const service = getSupabaseServiceRoleClient();
    const { data: profile, error } = await service
      .from("profiles")
      .select("stripe_connect_account_id")
      .eq("id", userId)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const accountId = profile?.stripe_connect_account_id ?? null;
    if (!accountId) {
      return NextResponse.json({
        connected: false,
        accountId: null,
        onboardingComplete: false,
        payoutsEnabled: false,
      });
    }

    const stripe = getStripe();
    const account = await stripe.accounts.retrieve(accountId);
    const onboardingComplete = Boolean(account.details_submitted && account.charges_enabled);
    const payoutsEnabled = Boolean(account.payouts_enabled);

    return NextResponse.json({
      connected: true,
      accountId,
      onboardingComplete,
      payoutsEnabled,
      storefrontPath: `/storefront/${accountId}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown storefront status error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
