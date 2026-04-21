"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Item = { name: string; sold: number };

export default function SalesChart({ data }: { data: Item[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-zinc-500">No sales data yet.</p>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="4 8" stroke="#27272a" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              background: "#09090b",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              fontSize: 12,
              color: "#fafafa",
            }}
            labelStyle={{ color: "#a1a1aa" }}
          />
          <Bar dataKey="sold" fill="#4bfa94" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
