import Link from "next/link";
import { ArrowUpRight, LayoutGrid, Search, Sparkles, Ticket, TrendingUp, Users } from "lucide-react";

/** Marketing-only dashboard mock — static, no data wiring. */
export function HostDashboardPreview() {
  return (
    <div className="relative overflow-hidden rounded-[1.35rem] border border-white/[0.1] bg-[#0c0c0c] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_80px_-24px_rgba(0,0,0,0.85)]">
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.03] px-4 py-2.5 sm:px-5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        </div>
        <div className="ml-2 flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/[0.06] bg-black/40 px-3 py-1 text-[11px] text-zinc-500">
          <Search className="h-3 w-3 shrink-0 opacity-60" strokeWidth={2} />
          <span className="truncate font-mono text-zinc-600">rage.host</span>
          <span className="text-zinc-700">/</span>
          <span className="truncate text-zinc-500">dashboard</span>
        </div>
        <div className="hidden h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-brand-green/30 to-emerald-600/20 ring-1 ring-white/10 sm:block" aria-hidden />
      </div>

      <div className="grid gap-3 p-3 sm:gap-4 sm:p-5 lg:grid-cols-[1fr,min(42%,320px)]">
        <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {[
              { k: "$4,280", l: "Gross tonight", d: "+12% vs last Fri", up: true },
              { k: "186", l: "Tickets sold", d: "72% of cap", up: null },
              { k: "142", l: "Checked in", d: "Live door", up: null },
              { k: "3.2%", l: "Abandon rate", d: "Checkout", up: false },
            ].map((row) => (
              <div
                key={row.l}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-4 sm:py-3.5"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{row.l}</p>
                <p className="mt-1.5 text-xl font-black tracking-tight text-white sm:text-2xl">{row.k}</p>
                <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-zinc-600">
                  {row.up === true && <TrendingUp className="h-3 w-3 text-brand-green" strokeWidth={2} />}
                  {row.up === false && <span className="text-amber-400/90">·</span>}
                  <span className={row.up === true ? "text-brand-green/90" : row.up === false ? "text-amber-400/80" : "text-zinc-500"}>{row.d}</span>
                </p>
              </div>
            ))}
          </div>

          <div className="grid min-h-0 flex-1 gap-3 sm:grid-cols-[1.1fr_0.9fr] sm:gap-4">
            <div className="flex min-h-[200px] flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:min-h-[220px] sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Sales · 7 days</p>
                  <p className="mt-1 text-2xl font-black tracking-tight text-white">$18.4k</p>
                </div>
                <span className="rounded-full border border-brand-green/25 bg-brand-green/10 px-2.5 py-1 text-[10px] font-semibold text-brand-green">+24%</span>
              </div>
              <div className="mt-6 flex flex-1 items-end">
                <svg viewBox="0 0 400 120" className="h-28 w-full text-brand-green/80 sm:h-32" preserveAspectRatio="none" aria-hidden>
                  <defs>
                    <linearGradient id="dashFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,95 L40,88 L80,92 L120,70 L160,78 L200,45 L240,55 L280,38 L320,48 L360,22 L400,30 L400,120 L0,120 Z"
                    fill="url(#dashFill)"
                    className="text-brand-green"
                  />
                  <path
                    d="M0,95 L40,88 L80,92 L120,70 L160,78 L200,45 L240,55 L280,38 L320,48 L360,22 L400,30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-brand-green"
                  />
                </svg>
              </div>
              <div className="mt-2 flex justify-between text-[10px] font-medium text-zinc-600">
                <span>Mon</span>
                <span>Sun</span>
              </div>
            </div>

            <div className="flex flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Door pulse</p>
                <Users className="h-4 w-4 text-zinc-600" strokeWidth={1.75} />
              </div>
              <div className="mt-5 space-y-4">
                <div>
                  <div className="mb-1.5 flex justify-between text-[11px] text-zinc-400">
                    <span>Check-in rate</span>
                    <span className="font-mono text-white">76%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full w-[76%] rounded-full bg-gradient-to-r from-brand-green to-emerald-300" />
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-[11px] text-zinc-400">
                    <span>Remaining</span>
                    <span className="font-mono text-white">44</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full w-[28%] rounded-full bg-white/20" />
                  </div>
                </div>
              </div>
              <div className="mt-auto flex items-center gap-2 rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2.5 text-[11px] text-zinc-500">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-green/80" strokeWidth={2} />
                <span className="leading-snug">Duplicate scan blocked · 2 tonight</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col rounded-xl border border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-zinc-500" strokeWidth={1.75} />
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Your events</p>
            </div>
            <Ticket className="h-4 w-4 text-zinc-600" strokeWidth={1.75} />
          </div>
          <ul className="divide-y divide-white/[0.05]">
            {[
              { t: "Velvet Room · Friday", s: "On sale", sold: "142 / 200" },
              { t: "Rooftop Social", s: "Sold out", sold: "80 / 80" },
              { t: "Warehouse Rave", s: "Draft", sold: "—" },
            ].map((ev) => (
              <li key={ev.t} className="flex items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-white/[0.03]">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-zinc-100">{ev.t}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-600">{ev.sold} sold</p>
                </div>
                <span
                  className={
                    ev.s === "Sold out"
                      ? "shrink-0 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200/90"
                      : ev.s === "Draft"
                        ? "shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500"
                        : "shrink-0 rounded-full border border-brand-green/25 bg-brand-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-green"
                  }
                >
                  {ev.s}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-auto border-t border-white/[0.06] p-3">
            <Link
              href="/login?next=%2Fdashboard"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.05] py-2.5 text-[11px] font-semibold text-zinc-300 transition hover:border-white/15 hover:bg-white/[0.08] hover:text-white"
            >
              Open full dashboard
              <ArrowUpRight className="h-3.5 w-3.5 opacity-70" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
