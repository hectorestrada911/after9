"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Item = { name: string; sold: number };

export default function SalesChart({ data }: { data: Item[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted">No sales data yet.</p>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fill: "#71717a", fontSize: 12 }} />
          <Tooltip cursor={{ fill: "#f9f9f9" }} />
          <Bar dataKey="sold" fill="#000000" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
