import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import { Badge, Card } from "@/components/ui";

const chapters = [
  {
    eyebrow: "Chapter 01",
    title: "Create an event page that looks trusted in seconds.",
    copy: "Use premium typography, clear structure, and high-signal details so guests immediately understand value and legitimacy.",
    points: ["Clean structure and hierarchy", "Professional visual confidence", "Share-ready from day one"],
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80",
  },
  {
    eyebrow: "Chapter 02",
    title: "Convert faster with low-friction checkout psychology.",
    copy: "Strong trust cues, simple quantity decisions, and familiar payment flow remove hesitation and improve completed orders.",
    points: ["Secure checkout messaging", "Mobile-first purchase flow", "Cleaner decision path"],
    icon: CircleDollarSign,
    image: "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1600&q=80",
  },
  {
    eyebrow: "Chapter 03",
    title: "Run doors smoothly with real-time control.",
    copy: "Attendee search, duplicate prevention, and check-in clarity let your team move confidently when lines get long.",
    points: ["Fast code and name lookup", "Duplicate entry prevention", "Live attendance visibility"],
    icon: ScanLine,
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80",
  },
];

const trustStats = [
  ["4.8/5", "Host satisfaction"],
  ["+31%", "Average conversion lift"],
  ["<2 min", "Launch time"],
  ["99.9%", "Checkout uptime"],
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-black pb-20 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.2),transparent_38%),radial-gradient(circle_at_90%_8%,rgba(34,211,238,0.16),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.35),rgba(2,6,23,0.95))]" />

      <section className="relative border-b border-slate-900/90">
        <div className="container-page grid min-h-[78vh] items-center gap-10 py-16 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="space-y-6">
            <Badge className="gap-1.5 border-brand/35 bg-brand/10 text-slate-100">
              <Sparkles size={14} /> Built for serious college hosts
            </Badge>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">
              Turn your event
              <span className="block bg-gradient-to-r from-slate-100 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
                into income.
              </span>
            </h1>
            <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
              Apple-level clarity. Resend-level polish. Palantir-level authority.
              One platform to create, sell, and operate event nights with confidence.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-brand-dark"
              >
                Create an Event <ArrowRight size={15} />
              </Link>
              <Link
                href="/demo-flow"
                className="inline-flex items-center rounded-full border border-slate-700 bg-slate-950 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
              >
                See Demo Event
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="gap-1.5"><ShieldCheck size={13} /> Secure checkout</Badge>
              <Badge className="gap-1.5"><Ticket size={13} /> Mobile tickets</Badge>
              <Badge className="gap-1.5"><Users size={13} /> Fast team entry flow</Badge>
            </div>
          </div>

          <Card className="relative overflow-hidden rounded-3xl border-slate-800/80 bg-slate-950/80 p-0 backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,rgba(99,102,241,0.16),transparent_40%)]" />
            <div className="relative">
              <div className="relative h-56 w-full sm:h-64">
                <Image
                  src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80"
                  alt="Crowd at a modern night event"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              </div>
              <div className="p-5">
                <p className="text-sm font-semibold text-slate-100">Live host pulse</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {[
                    ["Revenue", "$2,430"],
                    ["Tickets sold", "81"],
                    ["Checked in", "67"],
                    ["Upcoming", "4"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="relative border-b border-slate-900 py-14">
        <div className="container-page">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">Performance signals</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {trustStats.map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-5">
                <p className="text-3xl font-semibold tracking-tight text-slate-100">{value}</p>
                <p className="mt-1 text-sm text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16">
        <div className="container-page space-y-20">
          {chapters.map((chapter, index) => {
            const Icon = chapter.icon;
            const reverse = index % 2 === 1;

            return (
              <div
                key={chapter.title}
                className={`grid items-start gap-8 lg:grid-cols-2 ${reverse ? "lg:[&>div:first-child]:order-2" : ""}`}
              >
                <div className="lg:sticky lg:top-24">
                  <div className="rounded-3xl border border-slate-800 bg-slate-950/85 p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{chapter.eyebrow}</p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{chapter.title}</h2>
                    <p className="mt-4 text-slate-300">{chapter.copy}</p>
                    <ul className="mt-6 space-y-3">
                      {chapter.points.map((point) => (
                        <li key={point} className="flex items-center gap-2 text-sm text-slate-200">
                          <CheckCircle2 size={16} className="text-brand" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-4 shadow-[0_40px_80px_rgba(2,6,23,0.7)]">
                  <div className="overflow-hidden rounded-2xl border border-slate-800 bg-black/70">
                    <div className="relative h-60 w-full">
                      <Image src={chapter.image} alt={chapter.title} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-200">After9 control panel</p>
                        <Icon size={16} className="text-brand" />
                      </div>
                      <div className="mt-4 h-2 w-full rounded-full bg-slate-800">
                        <div className="h-2 w-2/3 rounded-full bg-brand" />
                      </div>
                      <p className="mt-3 text-sm text-slate-300">
                        Event momentum and operational signals update in real time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative border-y border-slate-900 bg-slate-950/70 py-20">
        <div className="container-page">
          <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Built to sell. Built to operate.</p>
              <h3 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                Everything your host team needs for event night.
              </h3>
              <p className="mt-4 max-w-2xl text-slate-300">
                The landing experience now mirrors high-end product storytelling:
                cinematic framing, chapter flow, authority tone, and clear conversion pathways.
              </p>
            </div>
            <div className="space-y-3">
              {[
                "Premium event page presentation",
                "High-trust checkout flow",
                "Real-time attendee operations",
                "Clear host decision intelligence",
              ].map((item) => (
                <div key={item} className="rounded-xl border border-slate-800 bg-black/50 px-4 py-3 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
