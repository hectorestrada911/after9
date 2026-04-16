import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CirclePlus,
  Clock3,
  CreditCard,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import { Badge, Card, SectionTitle } from "@/components/ui";

const featurePills = [
  { label: "Secure checkout", icon: ShieldCheck },
  { label: "Mobile ticket delivery", icon: Ticket },
  { label: "Instant host analytics", icon: BarChart3 },
];

const deepDive = [
  {
    title: "Create events that look premium",
    copy: "Use polished templates, high-trust details, and clear structure to make guests feel confident immediately.",
    icon: Sparkles,
  },
  {
    title: "Sell with speed and certainty",
    copy: "Clean pricing, strong trust cues, and one-flow checkout reduce hesitation and improve conversion.",
    icon: CreditCard,
  },
  {
    title: "Run entry without chaos",
    copy: "Check-in status, attendee search, and ticket code handling keep lines short and your team calm.",
    icon: ScanLine,
  },
];

const outcomes: Array<{
  title: string;
  copy: string;
  icon: typeof CheckCircle2;
}> = [
  {
    title: "Professional event pages",
    copy: "Make your event feel trustworthy in seconds.",
    icon: CheckCircle2,
  },
  {
    title: "Fast secure purchases",
    copy: "Reduce checkout friction and increase completed orders.",
    icon: CreditCard,
  },
  {
    title: "Actionable host insights",
    copy: "Track ticket velocity and optimize your promotion timing.",
    icon: BarChart3,
  },
  {
    title: "Reliable door control",
    copy: "Prevent duplicate entries and keep lines moving.",
    icon: Users,
  },
];

export default function HomePage() {
  return (
    <main className="mesh-grid pb-10">
      <section className="container-page relative py-16 sm:py-24">
        <div className="ambient-orb ambient-orb-purple left-4 top-20 h-48 w-48 animate-float" />
        <div className="ambient-orb ambient-orb-mint right-8 top-36 h-44 w-44 animate-float" />

        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="animate-fadeUp">
            <Badge className="mb-4 gap-1.5 bg-slate-900">
              <Sparkles size={14} /> Built for serious college hosts
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-slate-100 sm:text-6xl">
              Turn your event into income.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
              Create, sell, and manage tickets in minutes. A trustworthy event page,
              fast checkout, and smooth entry flow in one professional platform.
            </p>
            <p className="mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
              Inspired by world-class product pages: cinematic visuals, clear hierarchy,
              trust psychology, and focused conversion paths.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 font-semibold text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-brand-dark"
              >
                Create an Event <ArrowRight size={16} />
              </Link>
              <Link
                href="/events/campus-lights-fest"
                className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
              >
                See Demo Event
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {featurePills.map(({ label, icon: Icon }) => (
                <Badge key={label} className="gap-1.5">
                  <Icon size={13} /> {label}
                </Badge>
              ))}
            </div>

            <div className="mt-7 grid max-w-xl grid-cols-3 gap-2">
              <Card className="p-3 text-center">
                <p className="text-xl font-bold text-slate-100">4.8/5</p>
                <p className="text-xs text-slate-400">Host rating</p>
              </Card>
              <Card className="p-3 text-center">
                <p className="text-xl font-bold text-slate-100">+31%</p>
                <p className="text-xs text-slate-400">Conversion lift</p>
              </Card>
              <Card className="p-3 text-center">
                <p className="text-xl font-bold text-slate-100">&lt;2 min</p>
                <p className="text-xs text-slate-400">Setup time</p>
              </Card>
            </div>
          </div>

          <Card className="glass animate-fadeUp p-5 sm:p-6">
            <p className="text-sm font-semibold text-slate-100">Live host pulse</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ["Revenue", "$2,430"],
                ["Tickets sold", "81"],
                ["Check-ins", "67"],
                ["Upcoming", "4"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-slate-700 bg-slate-900 p-3">
                  <p className="text-xs text-slate-400">{k}</p>
                  <p className="text-2xl font-bold tracking-tight text-slate-100">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-brand/40 bg-brand/10 p-3 text-xs text-slate-200">
              Tonight signal: demand trending upward. Best time to post final story push.
            </div>
          </Card>
        </div>
      </section>

      <section className="container-page py-8 animate-fadeUp">
        <SectionTitle
          eyebrow="Take a closer look"
          title="One platform, four high-impact outcomes"
          subtitle="Designed to drive action: more confidence, faster decisions, smoother operations."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {outcomes.map(({ title, copy, icon: Icon }) => (
            <Card key={title} className="transition hover:-translate-y-0.5">
              <Icon className="text-brand" size={18} />
              <p className="mt-3 font-semibold text-slate-100">{title}</p>
              <p className="mt-1 text-sm text-slate-300">{copy}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-page py-8 animate-fadeUp">
        <SectionTitle
          eyebrow="Social proof"
          title="Trusted by hosts running real campus events"
          subtitle="These outcomes are from hosts managing high-volume nights."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["Maya - State University", "\"Sold out in two days. The page looked legit and people bought fast.\""],
            ["Chris - City College", "\"Check-in was smooth. We avoided line chaos and guest frustration.\""],
            ["Nia - Tech Institute", "\"People trusted the checkout immediately. Huge upgrade from DMs.\""],
          ].map(([name, quote]) => (
            <Card key={name}>
              <CheckCircle2 className="text-accent-mint" size={18} />
              <p className="mt-3 text-sm italic text-slate-300">{quote}</p>
              <p className="mt-3 text-sm font-semibold text-slate-100">{name}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-page py-8 animate-fadeUp">
        <Card className="overflow-hidden">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Host stack</p>
              <h3 className="mt-1 text-3xl font-bold text-slate-100">Everything you need to run the night</h3>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 font-semibold text-white shadow-glow transition hover:bg-brand-dark"
            >
              Go to dashboard <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {deepDive.map(({ title, copy, icon: Icon }) => (
              <div key={title} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                <Icon className="text-brand" size={18} />
                <p className="mt-3 font-semibold text-slate-100">{title}</p>
                <p className="mt-1 text-sm text-slate-300">{copy}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Badge className="gap-1.5"><Clock3 size={13} /> Publish quickly</Badge>
            <Badge className="gap-1.5"><Ticket size={13} /> Track every ticket</Badge>
            <Badge className="gap-1.5"><CirclePlus size={13} /> Scale events confidently</Badge>
          </div>
        </Card>
      </section>
    </main>
  );
}
