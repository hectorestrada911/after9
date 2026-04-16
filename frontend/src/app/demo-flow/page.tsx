import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  QrCode,
  ScanLine,
  Ticket,
  WandSparkles,
} from "lucide-react";
import { Badge, Card, SectionTitle } from "@/components/ui";

const stats = [
  { label: "Setup", value: "< 2 min" },
  { label: "Avg conversion", value: "+31%" },
  { label: "Check-in speed", value: "4.2s" },
];

const steps = [
  {
    title: "Create event",
    subtitle: "Host fills details and publishes",
    cta: { label: "Create now", href: "/dashboard/events/new" },
    icon: WandSparkles,
    accent: "from-indigo-500/20 to-sky-500/10",
  },
  {
    title: "Share link + QR",
    subtitle: "Guests open event by link or scan",
    cta: { label: "See share flow", href: "/dashboard/events/new" },
    icon: QrCode,
    accent: "from-fuchsia-500/20 to-indigo-500/10",
  },
  {
    title: "Buy tickets",
    subtitle: "Fast secure checkout experience",
    cta: { label: "Open demo event", href: "/events/campus-lights-fest" },
    icon: CircleDollarSign,
    accent: "from-cyan-500/20 to-indigo-500/10",
  },
  {
    title: "Check in at door",
    subtitle: "Prevent duplicates, scan or search",
    cta: { label: "Go to host dashboard", href: "/dashboard" },
    icon: ScanLine,
    accent: "from-emerald-500/20 to-cyan-500/10",
  },
];

export default function DemoFlowPage() {
  return (
    <main className="container-page py-8 sm:py-10">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/85 p-5 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,rgba(99,102,241,0.24),transparent_40%),radial-gradient(circle_at_95%_10%,rgba(34,211,238,0.18),transparent_34%)]" />
        <div className="relative">
          <Badge className="gap-1.5 border-brand/40 bg-brand/10 text-slate-100">
            <WandSparkles size={13} /> Interactive product flow demo
          </Badge>
          <SectionTitle
            eyebrow="Demo Event Flow"
            title="See the full host-to-guest experience"
            subtitle="A visual map of what happens from publish to entry."
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-100">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.3fr,0.7fr]">
        <Card className="rounded-3xl border-slate-800 bg-slate-950/70 p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-300">
            <Ticket size={15} className="text-brand" />
            Product flow map
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className={`relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br ${step.accent} p-4`}
                >
                  <div className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/80 text-xs font-semibold text-slate-300">
                    {index + 1}
                  </div>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/90">
                    <Icon size={18} className="text-brand" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-100">{step.title}</h3>
                  <p className="mt-1 text-sm text-slate-300">{step.subtitle}</p>
                  <Link
                    href={step.cta.href}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
                  >
                    {step.cta.label} <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="rounded-3xl border-slate-800 bg-slate-950/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Live preview</p>
          <div className="mt-3 space-y-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
              <p className="text-xs text-slate-400">Host action</p>
              <p className="text-sm text-slate-100">Publishes Campus Lights Fest</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
              <p className="text-xs text-slate-400">Share asset</p>
              <p className="text-sm text-slate-100">Link + QR generated instantly</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
              <p className="text-xs text-slate-400">Guest journey</p>
              <p className="text-sm text-slate-100">Opens page - buys - receives ticket</p>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
              <p className="inline-flex items-center gap-2 text-sm text-emerald-300">
                <CheckCircle2 size={14} /> Door check-in completed
              </p>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
