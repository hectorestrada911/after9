import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ path: "/login" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (profile) return NextResponse.json({ path: "/dashboard" });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRole || !user.email) {
    return NextResponse.json({ path: "/account" });
  }

  const service = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { count } = await service
    .from("orders")
    .select("id", { count: "exact", head: true })
    .ilike("buyer_email", user.email);

  if ((count ?? 0) > 0) return NextResponse.json({ path: "/my-tickets" });
  return NextResponse.json({ path: "/account" });
}
