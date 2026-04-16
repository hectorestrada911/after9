import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, CircleDollarSign, QrCode, ScanLine, WandSparkles } from "lucide-react";
import { Badge, Card } from "@/components/ui";

const flowSteps = [
  {
    id: "01",
    title: "Create Event",
    hint: "Host publishes",
    icon: WandSparkles,
    href: "/dashboard/events/new",
    cta: "Start creating",
  },
  {
    id: "02",
    title: "Get Link + QR",
    hint: "Share instantly",
    icon: QrCode,
    href: "/dashboard/events/new",
    cta: "See share output",
  },
  {
    id: "03",
    title: "Guest Buys",
    hint: "Fast checkout",
    icon: CircleDollarSign,
    href: "/events/campus-lights-fest",
    cta: "Open demo event",
  },
  {
    id: "04",
    title: "Check In",
    hint: "Scan or search",
    icon: ScanLine,
    href: "/dashboard",
    cta: "Open host tools",
  },
];

export default function DemoFlowPage() {
  return (
    <main className="container-page py-8 sm:py-10">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/85 p-5 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,rgba(249,115,22,0.24),transparent_40%),radial-gradient(circle_at_95%_10%,rgba(244,63,94,0.18),transparent_34%)]" />
        <div className="relative">
          <Badge className="gap-1.5 border-brand/40 bg-brand/10 text-slate-100">
            <WandSparkles size={13} /> Demo Flow
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-100 sm:text-5xl">
            4 steps from host setup to guest entry
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
            Tap any card below to jump into that part of the real product.
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {flowSteps.map((step) => {
          const Icon = step.icon;
          return (
            <Card key={step.id} className="group rounded-3xl border-slate-800 bg-slate-950/70 p-5 transition hover:-translate-y-1 hover:border-brand/50">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-300">
                  {step.id}
                </span>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-brand">
                  <Icon size={18} />
                </div>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-slate-100">{step.title}</h2>
              <p className="mt-1 text-sm text-slate-400">{step.hint}</p>
              <Link
                href={step.href}
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
              >
                {step.cta} <ArrowRight size={14} />
              </Link>
            </Card>
          );
        })}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
        <Card className="rounded-3xl border-slate-800 bg-slate-950/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Quick path</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-200">
            <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5">Create</span>
            <ArrowRight size={14} className="text-slate-500" />
            <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5">Share Link + QR</span>
            <ArrowRight size={14} className="text-slate-500" />
            <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5">Guest Buys</span>
            <ArrowRight size={14} className="text-slate-500" />
            <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5">Check In</span>
          </div>
        </Card>

        <Card className="rounded-3xl border-emerald-500/30 bg-emerald-500/10 p-5">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-300">
            <CheckCircle2 size={15} /> Easy to understand. Easy to run.
          </p>
          <p className="mt-2 text-sm text-slate-200">
            Hosts get a shareable page link and QR right after publishing, and guests use that same flow to enter events.
          </p>
        </Card>
      </section>

      <section className="mt-6">
        <Card className="overflow-hidden rounded-3xl border-slate-800 bg-slate-950/70 p-0">
          <div className="grid lg:grid-cols-[1.15fr,0.85fr]">
            <div className="relative h-64 w-full sm:h-80">
              <Image
                src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1800&q=80"
                alt="Students at an event venue"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
            </div>
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Real event feel</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-100">From promotion to entry in one clean flow</h3>
              <p className="mt-3 text-sm text-slate-300">
                Use the same modern journey every time: publish, share, sell, and check in.
                Fewer steps, better trust, faster execution on event night.
              </p>
              <Link
                href="/signup"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-dark"
              >
                Launch your first event <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
