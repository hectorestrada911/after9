import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import NewEventClient from "./new-event-client";

export const metadata: Metadata = {
  title: "Create event · Host tools · RAGE",
  description: "Publish a new event with the same guided builder flow used on the marketing site.",
};

export default async function NewEventPage() {
  const supabase = await getSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) {
    redirect(`/login?next=${encodeURIComponent("/dashboard/events/new")}`);
  }
  const { data: profile } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (!profile) {
    redirect(`/onboarding?next=${encodeURIComponent("/dashboard/events/new")}`);
  }
  return <NewEventClient />;
}
