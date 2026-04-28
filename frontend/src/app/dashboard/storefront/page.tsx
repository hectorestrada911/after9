import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import StorefrontDashboardClient from "@/components/storefront-dashboard-client";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Storefront · Host tools · RAGE",
  description: "Create products and share a connected-account storefront for direct purchases.",
};

export default async function DashboardStorefrontPage() {
  const supabase = await getSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) {
    redirect(`/login?next=${encodeURIComponent("/dashboard/storefront")}`);
  }

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (!profile) {
    redirect(`/onboarding?next=${encodeURIComponent("/dashboard/storefront")}`);
  }

  return (
    <main className="container-page py-10 sm:py-14">
      <Link href="/dashboard" className="inline-flex text-xs font-semibold uppercase tracking-wider text-zinc-500 transition hover:text-white">
        ← Back to dashboard
      </Link>
      <div className="mb-8 mt-4">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Storefront lab</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Products and checkout</h1>
        <p className="mt-2 text-sm text-zinc-400">Create products on your connected Stripe account and share a simple storefront link.</p>
      </div>
      <StorefrontDashboardClient />
    </main>
  );
}
