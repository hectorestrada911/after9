import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { CalendarRange, Ticket, UserRound } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export default async function AccountPage() {
  const supabase = await getSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return (
      <main className="container-page py-16 sm:py-24">
        <div className="mx-auto max-w-md text-center">
          <h1 className="display-section-fluid">Login required</h1>
          <p className="mt-4 text-base text-muted">Log in to manage your tickets and host tools.</p>
          <Link href="/login?next=/account" className="mt-6 inline-flex h-12 items-center rounded-full bg-white px-7 text-sm font-bold uppercase tracking-wide text-black">
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  const { data: profile } = await supabase.from("profiles").select("id,full_name").eq("id", user.id).maybeSingle();
  const isHost = Boolean(profile);

  let purchasedCount = 0;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceRole && user.email) {
    const service = createClient(supabaseUrl, serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { count } = await service
      .from("orders")
      .select("id", { count: "exact", head: true })
      .ilike("buyer_email", user.email);
    purchasedCount = count ?? 0;
  }

  return (
    <main className="container-page py-10 sm:py-14">
      <p className="text-xs font-bold uppercase tracking-widest text-muted">Account hub</p>
      <h1 className="mt-3 display-section-fluid">Welcome back</h1>
      <p className="mt-3 text-sm text-zinc-400">Use one account for buying tickets and hosting events.</p>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.12] bg-zinc-950 p-5">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
            <Ticket className="h-4 w-4" /> Buyer view
          </p>
          <p className="mt-2 text-2xl font-black tracking-tight text-white">{purchasedCount}</p>
          <p className="text-sm text-zinc-500">Orders found for {user.email}</p>
          <Link href="/my-tickets" className="mt-4 inline-flex h-10 items-center rounded-full bg-white px-4 text-xs font-bold uppercase tracking-wide text-black">
            Open my tickets
          </Link>
        </div>

        <div className="rounded-2xl border border-white/[0.12] bg-zinc-950 p-5">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
            <CalendarRange className="h-4 w-4" /> Host view
          </p>
          <p className="mt-2 text-2xl font-black tracking-tight text-white">{isHost ? "Ready" : "Not set"}</p>
          <p className="text-sm text-zinc-500">{isHost ? "Organizer profile active." : "Create a host profile to publish events."}</p>
          {isHost ? (
            <Link href="/dashboard" className="mt-4 inline-flex h-10 items-center rounded-full bg-white px-4 text-xs font-bold uppercase tracking-wide text-black">
              Open dashboard
            </Link>
          ) : (
            <Link href="/onboarding?next=/dashboard" className="mt-4 inline-flex h-10 items-center rounded-full bg-white px-4 text-xs font-bold uppercase tracking-wide text-black">
              Become a host
            </Link>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-white/[0.12] bg-zinc-950 p-5">
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
          <UserRound className="h-4 w-4" /> Account
        </p>
        <p className="mt-2 text-sm text-zinc-300">{profile?.full_name ?? user.email}</p>
      </section>
    </main>
  );
}
