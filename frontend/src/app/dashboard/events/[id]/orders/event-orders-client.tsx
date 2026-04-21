"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { OrderRow } from "@/lib/event-workspace-types";
import { centsToDollars } from "@/lib/utils";

export function EventOrdersClient({ orders }: { orders: OrderRow[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return orders;
    return orders.filter(
      (o) =>
        o.buyer_name.toLowerCase().includes(s) ||
        o.buyer_email.toLowerCase().includes(s) ||
        o.id.toLowerCase().includes(s),
    );
  }, [orders, q]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email, or order id"
          className="h-12 w-full rounded-2xl border border-white/[0.12] bg-black/40 pl-11 pr-4 text-sm text-white outline-none ring-brand-green/0 transition placeholder:text-zinc-600 focus:border-brand-green/40 focus:ring-2 focus:ring-brand-green/20"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center text-sm text-zinc-500">
          {orders.length === 0 ? "No orders for this event yet." : "No matches for your search."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/[0.1]">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-white/[0.08] bg-black/40 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filtered.map((order) => (
                <tr key={order.id} className="bg-zinc-950/40 transition hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{order.buyer_name}</p>
                    <p className="break-all text-xs text-zinc-500">{order.buyer_email}</p>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-zinc-300">{order.quantity}</td>
                  <td className="px-4 py-3 font-bold tabular-nums text-white">${centsToDollars(order.total_amount)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        order.payment_status === "paid" ? "bg-brand-green/25 text-brand-green" : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{new Date(order.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-white/[0.06] bg-black/30 px-4 py-2 text-xs text-zinc-500">
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
            {q.trim() ? ` · filtered from ${orders.length}` : ""}
          </p>
        </div>
      )}
    </div>
  );
}
