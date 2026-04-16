"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Item = { name: string; sold: number };

export default function SalesChart({ data }: { data: Item[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-600">No sales data yet.</p>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fill: "#64748B", fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="sold" fill="#4F46E5" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
