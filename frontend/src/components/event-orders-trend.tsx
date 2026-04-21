"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type TrendPoint = { day: string; revenue: number; tickets: number };

export function EventOrdersTrend({ data }: { data: TrendPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-zinc-950/50 text-center">
        <p className="text-sm font-semibold text-zinc-300">No paid orders yet</p>
        <p className="mt-1 max-w-sm px-4 text-xs text-zinc-500">When checkout completes, revenue and ticket volume will chart here by day.</p>
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="rageRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4bfa94" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#4bfa94" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 8" stroke="#27272a" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
            width={48}
          />
          <Tooltip
            contentStyle={{
              background: "#09090b",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, "Revenue"]}
          />
          <Area type="monotone" dataKey="revenue" stroke="#4bfa94" strokeWidth={2} fill="url(#rageRev)" dot={false} activeDot={{ r: 4, fill: "#fff" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
