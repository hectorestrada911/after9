import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase-service";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = getSupabaseServiceRoleClient();
  const { data: profile, error } = await service
    .from("profiles")
    .select("stripe_connect_account_id,stripe_connect_onboarded")
    .eq("id", userId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!profile?.stripe_connect_account_id) {
    return NextResponse.json({ hasAccount: false, onboarded: false, payoutsEnabled: false });
  }

  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(profile.stripe_connect_account_id);
  const onboarded = Boolean(account.details_submitted && account.charges_enabled);
  const payoutsEnabled = Boolean(account.payouts_enabled);

  if (profile.stripe_connect_onboarded !== onboarded) {
    await service.from("profiles").update({ stripe_connect_onboarded: onboarded }).eq("id", userId);
  }

  return NextResponse.json({
    hasAccount: true,
    onboarded,
    payoutsEnabled,
    accountId: profile.stripe_connect_account_id,
  });
}
