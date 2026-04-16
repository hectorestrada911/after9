import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { data: events } = await supabase.from("events").select("id,title").eq("host_id", userId);
  const eventMap = new Map((events ?? []).map((e) => [e.id, e.title]));
  const eventIds = Array.from(eventMap.keys());
  if (eventIds.length === 0) {
    return new NextResponse("name,email,quantity,event,total_amount\n", {
      headers: {
        "content-type": "text/csv",
        "content-disposition": "attachment; filename=attendees.csv",
      },
    });
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("buyer_name,buyer_email,quantity,total_amount,event_id")
    .in("event_id", eventIds)
    .order("created_at", { ascending: false });

  const lines = ["name,email,quantity,event,total_amount"];
  for (const order of orders ?? []) {
    const eventTitle = eventMap.get(order.event_id) ?? "Unknown";
    lines.push(
      [
        order.buyer_name,
        order.buyer_email,
        String(order.quantity),
        eventTitle,
        String(order.total_amount),
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );
  }

  return new NextResponse(`${lines.join("\n")}\n`, {
    headers: {
      "content-type": "text/csv",
      "content-disposition": "attachment; filename=attendees.csv",
    },
  });
}
