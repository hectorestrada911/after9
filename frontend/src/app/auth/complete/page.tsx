import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { safeNextPath } from "@/lib/event-draft";

/** After magic link sets cookies in `/auth/callback`, choose onboarding vs dashboard vs account. */
export default async function AuthCompletePage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=session");
  }

  const next = safeNextPath(params.next);

  if (next.startsWith("/dashboard")) {
    const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
    if (!profile) {
      redirect(`/onboarding?next=${encodeURIComponent(next)}`);
    }
  }

  redirect(next);
}
