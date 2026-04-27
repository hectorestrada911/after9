import { EventOrdersClient } from "./event-orders-client";
import { resolveEventWorkspace } from "../_workspace";

export default async function EventOrdersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bundle = await resolveEventWorkspace(id);
  if (bundle.kind !== "ok") return null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Orders</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-white">Every checkout</h2>
        <p className="mt-1 text-sm text-zinc-500">Search by guest name or email. Includes ticket email delivery status per paid order.</p>
      </div>
      <EventOrdersClient orders={bundle.orders} />
    </div>
  );
}
