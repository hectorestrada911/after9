import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ count: paidOrders }, { count: checkIns }] = await Promise.all([
    supabase.from("orders").select("id", { head: true, count: "exact" }).eq("event_id", id).eq("payment_status", "paid"),
    supabase.from("check_ins").select("id", { head: true, count: "exact" }).eq("event_id", id),
  ]);
  if ((paidOrders ?? 0) > 0 || (checkIns ?? 0) > 0) {
    return NextResponse.json(
      {
        error:
          "This event has paid orders or check-ins and cannot be deleted automatically. Keep it archived and issue refunds manually if needed.",
      },
      { status: 409 },
    );
  }

  const { data: deleted, error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .eq("host_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!deleted?.id) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
